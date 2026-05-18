'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { CatalogItem } from '@/types/database'

type OutletOption = { id: string; name: string; address: string | null; legal_entity_name: string }

type Props = {
  orderId: string
  catalogItems: CatalogItem[]
  outlets: OutletOption[]
  defaultOutletId?: string | null
  addOrderItemAction: (fd: FormData) => Promise<void>
  addBundleToOrderAction: (fd: FormData) => Promise<void>
}

const itemTypeOptions = [
  { value: 'kkt', label: 'Касса' },
  { value: 'fn', label: 'ФН' },
  { value: 'ofd', label: 'ОФД' },
  { value: 'visit', label: 'Выезд' },
  { value: 'service', label: 'Услуга' },
  { value: 'other', label: 'Прочее' },
]

export function AddItemForm({ orderId, catalogItems, outlets, defaultOutletId, addOrderItemAction, addBundleToOrderAction }: Props) {
  const [name, setName] = useState('')
  const [itemType, setItemType] = useState('service')
  const [unit, setUnit] = useState('шт')
  const [costPrice, setCostPrice] = useState('0')
  const [unitPrice, setUnitPrice] = useState('0')
  const [fuelConsumption, setFuelConsumption] = useState('')
  const [outletId, setOutletId] = useState(defaultOutletId ?? '')
  const [selectedBundle, setSelectedBundle] = useState<{ id: string; name: string } | null>(null)

  const regularItems = catalogItems.filter(c => c.item_type !== 'bundle')
  const bundleItems = catalogItems.filter(c => c.item_type === 'bundle')

  function handleCatalogChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const opt = e.target.options[e.target.selectedIndex]
    if (!opt.value) {
      setSelectedBundle(null)
      return
    }
    if ((opt as any).dataset.bundle === 'true') {
      setSelectedBundle({ id: opt.value, name: (opt as any).dataset.name || '' })
    } else {
      setSelectedBundle(null)
      setName((opt as any).dataset.name || '')
      setItemType((opt as any).dataset.type || 'service')
      setCostPrice((opt as any).dataset.cost || '0')
      setUnitPrice((opt as any).dataset.price || '0')
      setUnit((opt as any).dataset.unit || 'шт')
      setFuelConsumption((opt as any).dataset.fuel || '')
    }
  }

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
        <Plus className="h-4 w-4" />Добавить позицию
      </h2>

      {/* Catalog selector */}
      <div className="mb-3 space-y-1">
        <label className="block text-xs font-medium text-gray-600">Из каталога (заполнит поля)</label>
        <select
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
          onChange={handleCatalogChange}
          defaultValue=""
        >
          <option value="">Выберите из каталога или введите вручную</option>
          {regularItems.map(c => (
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
              {c.name} — {Number(c.retail_price).toLocaleString('ru')} ₽
            </option>
          ))}
          {bundleItems.length > 0 && <option disabled>── Комплекты ──</option>}
          {bundleItems.map(c => (
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

      {/* Bundle form */}
      {selectedBundle ? (
        <form action={addBundleToOrderAction} className="space-y-3">
          <input type="hidden" name="order_id" value={orderId} />
          <input type="hidden" name="bundle_id" value={selectedBundle.id} />
          {outletId && <input type="hidden" name="outlet_id" value={outletId} />}
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
            <p className="font-medium text-blue-800">{selectedBundle.name}</p>
            <p className="text-xs text-blue-600 mt-0.5">Все позиции комплекта будут добавлены в заказ</p>
          </div>
          {outlets.length > 0 && (
            <div className="space-y-1 max-w-sm">
              <label className="block text-xs font-medium text-gray-600">Торговая точка</label>
              <select
                name="outlet_id"
                value={outletId}
                onChange={e => setOutletId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
              >
                <option value="">— Не указана —</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name}{o.address ? ` (${o.address})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Добавить комплект
            </button>
            <button
              type="button"
              onClick={() => setSelectedBundle(null)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        /* Regular item form */
        <form action={addOrderItemAction} className="space-y-3">
          <input type="hidden" name="order_id" value={orderId} />
          <input type="hidden" name="fuel_consumption" value={fuelConsumption} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600">Наименование *</label>
              <input
                name="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                placeholder="Наименование услуги/товара"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Тип</label>
              <select
                name="item_type"
                value={itemType}
                onChange={e => setItemType(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
              >
                {itemTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Ед. изм.</label>
              <input
                name="unit"
                value={unit}
                onChange={e => setUnit(e.target.value)}
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
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
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
                value={unitPrice}
                onChange={e => setUnitPrice(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {outlets.length > 0 && (
            <div className="space-y-1 max-w-sm">
              <label className="block text-xs font-medium text-gray-600">Торговая точка</label>
              <select
                name="outlet_id"
                value={outletId}
                onChange={e => setOutletId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 bg-white"
              >
                <option value="">— Не указана —</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name}{o.address ? ` (${o.address})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Добавить позицию
          </button>
        </form>
      )}
    </div>
  )
}
