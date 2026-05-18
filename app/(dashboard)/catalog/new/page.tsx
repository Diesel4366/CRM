import { createCatalogItemAction } from '@/app/actions'
import Link from 'next/link'

export default function NewCatalogItemPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/catalog" className="text-sm text-gray-500 hover:text-gray-900">← Каталог</Link>
        <h1 className="mt-2 text-2xl font-bold">Новая позиция каталога</h1>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={createCatalogItemAction} className="space-y-4 max-w-lg">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Наименование *</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="Замена ФН-36"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Тип *</label>
            <select
              name="item_type"
              id="cat-type"
              required
              defaultValue="service"
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

          <div id="validity-block" className="space-y-1 hidden">
            <label className="block text-sm font-medium text-gray-700">Срок службы, месяцев</label>
            <input
              name="validity_months"
              id="cat-validity"
              type="number"
              min="1"
              step="1"
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
                defaultValue="0"
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
                defaultValue="0"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Единица измерения</label>
            <input
              name="unit"
              defaultValue="шт"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="шт, услуга, выезд..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="active" id="active" defaultChecked className="rounded border-gray-300" />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">Активна (видна в заказах)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
              Добавить позицию
            </button>
            <Link href="/catalog" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Отмена
            </Link>
          </div>
        </form>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        var sel = document.getElementById('cat-type');
        var block = document.getElementById('validity-block');
        var inp = document.getElementById('cat-validity');
        function toggleValidity() {
          var show = sel.value === 'fn' || sel.value === 'ofd';
          block.classList.toggle('hidden', !show);
          if (!show) inp.value = '';
        }
        sel.addEventListener('change', toggleValidity);
        toggleValidity();
      `}} />
    </div>
  )
}
