import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { CatalogItem, ItemType } from '@/types/database'

const typeLabel: Record<ItemType, string> = {
  kkt: 'Касса', fn: 'ФН', ofd: 'ОФД',
  visit: 'Выезд', service: 'Услуга', other: 'Прочее',
}

export default async function CatalogPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('catalog_items')
    .select('*')
    .order('item_type')
    .order('name')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Каталог</h1>
        
          <Link href="/catalog/new"><Plus className="mr-2 h-4 w-4" />Добавить</Link>
        
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
              <th className="px-4 py-3">Наименование</th>
              <th className="px-4 py-3">Тип</th>
              <th className="px-4 py-3 text-right">Закупочная</th>
              <th className="px-4 py-3 text-right">Розничная</th>
              <th className="px-4 py-3 text-right">Маржа</th>
              <th className="px-4 py-3 text-right">%</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!items?.length && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Каталог пуст</td></tr>
            )}
            {(items as CatalogItem[])?.map(item => {
              const margin = item.retail_price - item.cost_price
              const pct = item.retail_price > 0 ? Math.round((margin / item.retail_price) * 100) : 0
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{typeLabel[item.item_type]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{item.cost_price.toLocaleString('ru')} ₽</td>
                  <td className="px-4 py-3 text-right font-medium">{item.retail_price.toLocaleString('ru')} ₽</td>
                  <td className="px-4 py-3 text-right text-green-600">+{margin.toLocaleString('ru')} ₽</td>
                  <td className="px-4 py-3 text-right text-green-600">{pct}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
