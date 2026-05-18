import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  updateOrderStatusAction, addOrderItemAction, deleteOrderItemAction,
  createDocumentAction, deleteOrderAction, updatePaymentStatusAction,
  addBundleToOrderAction, updateOdometerAction,
} from '@/app/actions'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import { Trash2, FileText, Plus } from 'lucide-react'
import type { OrderItem, CatalogItem } from '@/types/database'

const statusLabel: Record<string, string> = {
  draft: 'Черновик', confirmed: 'Подтверждён',
  in_progress: 'В работе', done: 'Выполнен', cancelled: 'Отменён',
}
const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary', confirmed: 'outline', in_progress: 'default',
  done: 'secondary', cancelled: 'destructive',
}
const paymentLabel: Record<string, string> = {
  unpaid: 'Не оплачен', invoiced: 'Счёт выставлен',
  paid: 'Оплачен', partially_paid: 'Частично оплачен',
}
const paymentVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  unpaid: 'destructive', invoiced: 'outline', paid: 'default', partially_paid: 'outline',
}
const itemTypeLabel: Record<string, string> = {
  kkt: 'Касса', fn: 'ФН', ofd: 'ОФД', visit: 'Выезд', service: 'Услуга', other: 'Прочее',
}
const docTypeLabel: Record<string, string> = { invoice: 'Счёт', act: 'Акт', upd: 'УПД' }

const nextStatus: Record<string, string> = {
  draft: 'confirmed', confirmed: 'in_progress', in_progress: 'done',
}
const nextStatusLabel: Record<string, string> = {
  draft: 'Подтвердить', confirmed: 'В работу', in_progress: 'Завершить',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: order },
    { data: catalogItems },
  ] = await Promise.all([
    supabase.from('orders').select('*, order_items(*), documents(*)').eq('id', id).single(),
    supabase.from('catalog_items').select('*').eq('active', true).order('name'),
  ])

  if (!order) notFound()

  const ordAny = order as any
  const [clientRes, legalRes, outletRes] = await Promise.all([
    ordAny.client_id
      ? supabase.from('clients').select('id, name, phone').eq('id', ordAny.client_id).single()
      : { data: null },
    ordAny.legal_entity_id
      ? supabase.from('legal_entities').select('name').eq('id', ordAny.legal_entity_id).single()
      : { data: null },
    ordAny.outlet_id
      ? supabase.from('outlets').select('name, address').eq('id', ordAny.outlet_id).single()
      : { data: null },
  ])

  const items = ((order as any).order_items ?? []) as OrderItem[]
  const docs = (order as any).documents ?? []
  const client = clientRes.data as any
  const legalEntity = legalRes.data as any
  const outlet = outletRes.data as any

  const totalPrice = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const totalCost = items.reduce((s, i) => s + i.cost_price * i.quantity, 0)
  const totalProfit = totalPrice - totalCost

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900">← Заказы</Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold">{(order as any).order_number}</h1>
            <Badge variant={statusVariant[(order as any).status]}>
              {statusLabel[(order as any).status]}
            </Badge>
            <Badge variant={paymentVariant[(order as any).payment_status]}>
              {paymentLabel[(order as any).payment_status]}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
            {client && (
              <Link href={`/clients/${client.id}`} className="hover:text-blue-600 hover:underline">
                {client.name}
              </Link>
            )}
            {legalEntity && <span>{legalEntity.name}</span>}
            {outlet && <span>{outlet.name}{outlet.address ? ` · ${outlet.address}` : ''}</span>}
            {(order as any).scheduled_at && (
              <span>
                {format(parseISO((order as any).scheduled_at), 'd MMM yyyy', { locale: ru })}
              </span>
            )}
          </div>
          {(order as any).notes && <p className="mt-1 text-sm text-gray-600">{(order as any).notes}</p>}
        </div>
        <div className="flex gap-2">
          {nextStatus[(order as any).status] && (
            <form action={updateOrderStatusAction}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value={nextStatus[(order as any).status]} />
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
              >
                {nextStatusLabel[(order as any).status]}
              </button>
            </form>
          )}
          {(order as any).status === 'draft' && (
            <ConfirmDeleteButton
              action={deleteOrderAction}
              message="Удалить заказ?"
              inputs={{ id }}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" /> Удалить
            </ConfirmDeleteButton>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="text-base font-semibold">Позиции заказа</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
              <th className="px-5 py-3">Наименование</th>
              <th className="px-5 py-3 text-center">Кол-во</th>
              <th className="px-5 py-3 text-right">Цена</th>
              <th className="px-5 py-3 text-right">Сумма</th>
              <th className="px-5 py-3 text-right">Прибыль</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!items.length && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Нет позиций</td></tr>
            )}
            {items.map(item => {
              const itemTotal = item.unit_price * item.quantity
              const itemProfit = (item.unit_price - item.cost_price) * item.quantity
              const hasFuelData = item.item_type === 'visit' && item.odometer_start != null && item.odometer_end != null && item.odometer_end > item.odometer_start
              return (
                <React.Fragment key={item.id}>
                  <tr>
                    <td className="px-5 py-3">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-400">{itemTypeLabel[item.item_type]} · {item.unit}</p>
                      {hasFuelData && (
                        <p className="text-xs text-amber-600">
                          ⛽ {item.odometer_end! - item.odometer_start!} км · ГСМ: {item.cost_price.toLocaleString('ru')} ₽
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">{item.quantity}</td>
                    <td className="px-5 py-3 text-right">{item.unit_price.toLocaleString('ru')} ₽</td>
                    <td className="px-5 py-3 text-right font-medium">{itemTotal.toLocaleString('ru')} ₽</td>
                    <td className="px-5 py-3 text-right text-green-600">+{itemProfit.toLocaleString('ru')} ₽</td>
                    <td className="px-5 py-3">
                      <ConfirmDeleteButton
                        action={deleteOrderItemAction}
                        message="Удалить позицию?"
                        inputs={{ id: item.id, order_id: id }}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </ConfirmDeleteButton>
                    </td>
                  </tr>
                  {item.item_type === 'visit' && (
                    <tr className="bg-amber-50 border-b">
                      <td colSpan={6} className="px-5 py-2">
                        <form action={updateOdometerAction} className="flex flex-wrap items-end gap-3">
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="order_id" value={id} />
                          <div className="space-y-0.5">
                            <label className="block text-xs text-gray-500">Пробег нач., км</label>
                            <input
                              name="odometer_start"
                              type="number"
                              min="0"
                              defaultValue={item.odometer_start ?? ''}
                              className="w-28 rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-amber-400"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="block text-xs text-gray-500">Пробег кон., км</label>
                            <input
                              name="odometer_end"
                              type="number"
                              min="0"
                              defaultValue={item.odometer_end ?? ''}
                              className="w-28 rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-amber-400"
                              placeholder="0"
                            />
                          </div>
                          <button
                            type="submit"
                            className="rounded border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                          >
                            Сохранить пробег
                          </button>
                          {item.fuel_consumption != null && (
                            <span className="text-xs text-gray-400">расход {item.fuel_consumption} л/100 км</span>
                          )}
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr className="border-t bg-gray-50 font-medium">
                <td colSpan={3} className="px-5 py-3 text-right text-sm text-gray-500">Итого:</td>
                <td className="px-5 py-3 text-right text-base">{totalPrice.toLocaleString('ru')} ₽</td>
                <td className="px-5 py-3 text-right text-green-600">
                  +{totalProfit.toLocaleString('ru')} ₽
                  {totalPrice > 0 && (
                    <span className="text-xs ml-1">({Math.round((totalProfit / totalPrice) * 100)}%)</span>
                  )}
                </td>
                <td></td>
              </tr>
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-5 pb-3 text-right text-xs text-gray-400">Себестоимость:</td>
                <td colSpan={3} className="px-5 pb-3 text-right text-xs text-gray-400">{totalCost.toLocaleString('ru')} ₽</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add item form */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-base font-semibold flex items-center gap-2"><Plus className="h-4 w-4" />Добавить позицию</h2>
        <form action={addOrderItemAction} className="space-y-3">
          <input type="hidden" name="order_id" value={id} />
          <input type="hidden" name="fuel_consumption" id="item-fuel" value="" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600">Из каталога (заполнит поля)</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
                onChange={() => {}}
                id="catalog-select"
              >
                <option value="">Выберите из каталога или введите вручную</option>
                {(catalogItems as CatalogItem[] ?? []).filter(c => c.item_type !== 'bundle').map(c => (
                  <option
                    key={c.id}
                    value={c.id}
                    data-name={c.name}
                    data-type={c.item_type}
                    data-cost={c.cost_price}
                    data-price={c.retail_price}
                    data-unit={c.unit}
                    data-fuel={c.fuel_consumption ?? ''}
                  >
                    {c.name} — {c.retail_price.toLocaleString('ru')} ₽
                  </option>
                ))}
                {(catalogItems as CatalogItem[] ?? []).some(c => c.item_type === 'bundle') && (
                  <option disabled>── Комплекты ──</option>
                )}
                {(catalogItems as CatalogItem[] ?? []).filter(c => c.item_type === 'bundle').map(c => (
                  <option
                    key={c.id}
                    value={c.id}
                    data-bundle="true"
                    data-name={c.name}
                  >
                    📦 {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div id="manual-fields">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600">Наименование *</label>
              <input
                name="name"
                required
                id="item-name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                placeholder="Наименование услуги/товара"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Тип</label>
              <select
                name="item_type"
                id="item-type"
                defaultValue="service"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
              >
                <option value="kkt">Касса</option>
                <option value="fn">ФН</option>
                <option value="ofd">ОФД</option>
                <option value="visit">Выезд</option>
                <option value="service">Услуга</option>
                <option value="other">Прочее</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Ед. изм.</label>
              <input
                name="unit"
                id="item-unit"
                defaultValue="шт"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Кол-во *</label>
              <input
                name="quantity"
                type="number"
                min="1"
                step="1"
                defaultValue="1"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Себестоимость, ₽</label>
              <input
                name="cost_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                id="item-cost"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Цена продажи, ₽ *</label>
              <input
                name="unit_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                required
                id="item-price"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
          </div>
          </div>{/* end manual-fields */}
          <button
            id="item-submit-btn"
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Добавить позицию
          </button>
        </form>

        {/* Bundle add form (hidden until bundle selected) */}
        <form id="bundle-form" action={addBundleToOrderAction} className="hidden mt-3">
          <input type="hidden" name="order_id" value={id} />
          <input type="hidden" name="bundle_id" id="bundle-id-input" />
          <div id="bundle-info" className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
            <p className="font-medium text-blue-800" id="bundle-name-label"></p>
            <p className="text-xs text-blue-600 mt-0.5">Все позиции комплекта будут добавлены в заказ</p>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
              Добавить комплект
            </button>
            <button type="button" id="bundle-cancel" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Отмена
            </button>
          </div>
        </form>

        {/* Client-side catalog fill script */}
        <script dangerouslySetInnerHTML={{ __html: `
          var manualFields = document.getElementById('manual-fields');
          var bundleForm = document.getElementById('bundle-form');
          var submitBtn = document.getElementById('item-submit-btn');

          document.getElementById('catalog-select')?.addEventListener('change', function() {
            var opt = this.options[this.selectedIndex];
            if (!opt.value) {
              if (manualFields) manualFields.style.display = '';
              if (bundleForm) bundleForm.classList.add('hidden');
              if (submitBtn) submitBtn.style.display = '';
              return;
            }
            if (opt.dataset.bundle === 'true') {
              if (manualFields) manualFields.style.display = 'none';
              if (submitBtn) submitBtn.style.display = 'none';
              if (bundleForm) {
                bundleForm.classList.remove('hidden');
                document.getElementById('bundle-id-input').value = opt.value;
                document.getElementById('bundle-name-label').textContent = opt.dataset.name || '';
              }
            } else {
              if (manualFields) manualFields.style.display = '';
              if (bundleForm) bundleForm.classList.add('hidden');
              if (submitBtn) submitBtn.style.display = '';
              var n = document.getElementById('item-name');
              var t = document.getElementById('item-type');
              var c = document.getElementById('item-cost');
              var p = document.getElementById('item-price');
              var u = document.getElementById('item-unit');
              var f = document.getElementById('item-fuel');
              if (n) n.value = opt.dataset.name || '';
              if (t) t.value = opt.dataset.type || 'service';
              if (c) c.value = opt.dataset.cost || '0';
              if (p) p.value = opt.dataset.price || '0';
              if (u) u.value = opt.dataset.unit || 'шт';
              if (f) f.value = opt.dataset.fuel || '';
            }
          });

          document.getElementById('bundle-cancel')?.addEventListener('click', function() {
            document.getElementById('catalog-select').value = '';
            if (bundleForm) bundleForm.classList.add('hidden');
            if (manualFields) manualFields.style.display = '';
            if (submitBtn) submitBtn.style.display = '';
          });
        `}} />
      </div>

      {/* Payment */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-base font-semibold">Оплата</h2>
        <form action={updatePaymentStatusAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={id} />
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">Статус оплаты</label>
            <select
              name="payment_status"
              defaultValue={(order as any).payment_status}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
            >
              <option value="unpaid">Не оплачен</option>
              <option value="invoiced">Счёт выставлен</option>
              <option value="paid">Оплачен</option>
              <option value="partially_paid">Частично оплачен</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">Способ оплаты</label>
            <select
              name="payment_method"
              defaultValue={(order as any).payment_method ?? ''}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
            >
              <option value="">Не выбран</option>
              <option value="cash">Наличные</option>
              <option value="bank_transfer">Банковский перевод</option>
              <option value="tinkoff">ТБанк</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Обновить
          </button>
        </form>
      </div>

      {/* Documents */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2"><FileText className="h-4 w-4" />Документы</h2>
          <div className="flex gap-2">
            <form action={createDocumentAction}>
              <input type="hidden" name="order_id" value={id} />
              <input type="hidden" name="doc_type" value="invoice" />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                + Счёт
              </button>
            </form>
            <form action={createDocumentAction}>
              <input type="hidden" name="order_id" value={id} />
              <input type="hidden" name="doc_type" value="act" />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                + Акт
              </button>
            </form>
          </div>
        </div>
        {!docs.length ? (
          <div className="p-6 text-center text-sm text-gray-400">Документов нет</div>
        ) : (
          <div className="divide-y">
            {docs.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <span className="font-medium">{doc.doc_number}</span>
                  <span className="ml-2 text-gray-500">{docTypeLabel[doc.doc_type]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {format(parseISO(doc.issued_at), 'd MMM yyyy', { locale: ru })}
                  </span>
                  <a
                    href={`/api/pdf/${doc.doc_type}/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Печать
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
