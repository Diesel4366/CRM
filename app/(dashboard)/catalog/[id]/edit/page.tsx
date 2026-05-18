import { createClient } from '@/lib/supabase/server'
import {
  updateCatalogItemAction, deleteCatalogItemAction,
  addBundleComponentAction, removeBundleComponentAction,
} from '@/app/actions'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CatalogItem, CatalogBundleItem } from '@/types/database'

const itemTypeLabel: Record<string, string> = {
  kkt: 'Касса', fn: 'ФН', ofd: 'ОФД', visit: 'Выезд',
  service: 'Услуга', other: 'Прочее', bundle: 'Комплект',
}

export default async function EditCatalogItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: item }, { data: bundleComponents }, { data: allItems }] = await Promise.all([
    supabase.from('catalog_items').select('*').eq('id', id).single(),
    (supabase as any).from('catalog_bundle_items').select('*, item:item_id(*)').eq('bundle_id', id),
    supabase.from('catalog_items').select('id, name, item_type, retail_price').eq('active', true).neq('item_type', 'bundle').order('name'),
  ])

  if (!item) notFound()
  const ci = item as CatalogItem
  const components = (bundleComponents ?? []) as CatalogBundleItem[]
  const isBundle = ci.item_type === 'bundle'
  const showValidity = ci.item_type === 'fn' || ci.item_type === 'ofd'

  // Available items to add (exclude already added)
  const addedIds = new Set(components.map(c => c.item_id))
  const availableItems = ((allItems ?? []) as CatalogItem[]).filter(i => !addedIds.has(i.id))

  return (
    <div className="space-y-6">
      <div>
        <Link href="/catalog" className="text-sm text-gray-500 hover:text-gray-900">← Каталог</Link>
        <h1 className="mt-2 text-2xl font-bold">Редактировать позицию</h1>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={updateCatalogItemAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="id" value={id} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Наименование *</label>
            <input
              name="name"
              required
              defaultValue={ci.name}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Тип *</label>
            <select
              name="item_type"
              id="cat-type"
              required
              defaultValue={ci.item_type}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
            >
              <option value="kkt">Касса</option>
              <option value="fn">Фискальный накопитель</option>
              <option value="ofd">ОФД</option>
              <option value="visit">Выезд</option>
              <option value="service">Услуга</option>
              <option value="other">Прочее</option>
              <option value="bundle">Комплект (несколько позиций)</option>
            </select>
          </div>

          <div id="validity-block" className={`space-y-1${showValidity ? '' : ' hidden'}`}>
            <label className="block text-sm font-medium text-gray-700">Срок службы, месяцев</label>
            <input
              name="validity_months"
              id="cat-validity"
              type="number"
              min="1"
              step="1"
              defaultValue={ci.validity_months ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="15, 36 для ФН / 12, 15 для ОФД"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Закупочная цена, ₽</label>
              <input
                name="cost_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={ci.cost_price}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Розничная цена, ₽</label>
              <input
                name="retail_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={ci.retail_price}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Единица измерения</label>
            <input
              name="unit"
              defaultValue={ci.unit}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="active" id="active" defaultChecked={ci.active} className="rounded border-gray-300" />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">Активна</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
              Сохранить
            </button>
            <Link href="/catalog" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Отмена
            </Link>
          </div>
        </form>

        <script dangerouslySetInnerHTML={{ __html: `
          var sel = document.getElementById('cat-type');
          var block = document.getElementById('validity-block');
          var inp = document.getElementById('cat-validity');
          function toggleValidity() {
            var t = sel.value;
            block.classList.toggle('hidden', t !== 'fn' && t !== 'ofd');
            if (t !== 'fn' && t !== 'ofd') inp.value = '';
          }
          sel.addEventListener('change', toggleValidity);
        `}} />
      </div>

      {/* Bundle composition */}
      {isBundle && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="border-b px-5 py-4">
            <h2 className="text-base font-semibold">Состав комплекта</h2>
            <p className="text-xs text-gray-400 mt-0.5">При добавлении в заказ каждая позиция добавляется отдельной строкой</p>
          </div>

          {/* Current components */}
          {components.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <th className="px-5 py-3">Позиция</th>
                  <th className="px-5 py-3 text-center">Тип</th>
                  <th className="px-5 py-3 text-center">Кол-во</th>
                  <th className="px-5 py-3 text-right">Цена</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {components.map(c => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium">{c.item?.name}</td>
                    <td className="px-5 py-3 text-center text-xs text-gray-500">{itemTypeLabel[c.item?.item_type ?? ''] ?? c.item?.item_type}</td>
                    <td className="px-5 py-3 text-center">{c.quantity}</td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {c.item?.retail_price != null ? `${Number(c.item.retail_price).toLocaleString('ru')} ₽` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <ConfirmDeleteButton
                        action={removeBundleComponentAction}
                        message={`Убрать «${c.item?.name}» из комплекта?`}
                        inputs={{ id: c.id, bundle_id: id }}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        ✕
                      </ConfirmDeleteButton>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-gray-50">
                  <td colSpan={3} className="px-5 py-2 text-xs text-gray-400 text-right">Итого по позициям:</td>
                  <td className="px-5 py-2 text-right text-sm font-medium">
                    {components.reduce((s, c) => s + (Number(c.item?.retail_price) || 0) * c.quantity, 0).toLocaleString('ru')} ₽
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="p-6 text-center text-sm text-gray-400">Комплект пуст — добавьте позиции</div>
          )}

          {/* Add component form */}
          {availableItems.length > 0 && (
            <div className="border-t p-5">
              <p className="mb-3 text-sm font-medium text-gray-700">Добавить позицию</p>
              <form action={addBundleComponentAction} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="bundle_id" value={id} />
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">Позиция каталога</label>
                  <select
                    name="item_id"
                    required
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
                  >
                    <option value="">Выберите…</option>
                    {availableItems.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({itemTypeLabel[i.item_type] ?? i.item_type}) — {Number(i.retail_price).toLocaleString('ru')} ₽
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">Кол-во</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Добавить
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Danger zone */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-3 text-sm font-medium text-red-600">Опасная зона</h3>
        <ConfirmDeleteButton
          action={deleteCatalogItemAction}
          message="Удалить позицию каталога?"
          inputs={{ id }}
          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Удалить позицию
        </ConfirmDeleteButton>
      </div>
    </div>
  )
}
