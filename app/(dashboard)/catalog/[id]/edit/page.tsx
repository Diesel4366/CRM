import { createClient } from '@/lib/supabase/server'
import { updateCatalogItemAction, deleteCatalogItemAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CatalogItem } from '@/types/database'

export default async function EditCatalogItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: item } = await supabase.from('catalog_items').select('*').eq('id', id).single()
  if (!item) notFound()
  const ci = item as CatalogItem

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
            </select>
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
            <input
              type="checkbox"
              name="active"
              id="active"
              defaultChecked={ci.active}
              className="rounded border-gray-300"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">Активна</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Сохранить
            </button>
            <Link
              href="/catalog"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </Link>
          </div>
        </form>

        <div className="mt-8 border-t pt-6">
          <h3 className="mb-3 text-sm font-medium text-red-600">Опасная зона</h3>
          <form action={deleteCatalogItemAction}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              onClick={e => { if (!confirm('Удалить позицию каталога?')) e.preventDefault() }}
            >
              Удалить позицию
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
