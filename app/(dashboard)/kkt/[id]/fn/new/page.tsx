import { createClient } from '@/lib/supabase/server'
import { createFnAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addMonths, format } from 'date-fns'
import type { CatalogItem } from '@/types/database'

export default async function NewFnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: kkt }, { data: catalogItems }] = await Promise.all([
    supabase.from('kkt').select('brand, model, serial_number').eq('id', id).single(),
    supabase.from('catalog_items')
      .select('*')
      .eq('item_type', 'fn')
      .eq('active', true)
      .not('validity_months', 'is', null)
      .order('validity_months'),
  ])

  if (!kkt) notFound()

  const today = new Date().toISOString().split('T')[0]
  const defaultExpires = format(addMonths(new Date(), 36), 'yyyy-MM-dd')

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/kkt/${id}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← {(kkt as any).brand} {(kkt as any).model}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Замена / установка ФН</h1>
        <p className="mt-0.5 text-sm text-gray-500">КН: {(kkt as any).serial_number}</p>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={createFnAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="kkt_id" value={id} />

          {(catalogItems as CatalogItem[] ?? []).length > 0 && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Из каталога (заполнит поля)</label>
              <select
                id="fn-catalog"
                className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Выберите ФН из каталога…</option>
                {(catalogItems as CatalogItem[]).map(c => (
                  <option
                    key={c.id}
                    value={c.id}
                    data-validity={c.validity_months}
                    data-cost={c.cost_price}
                    data-price={c.retail_price}
                  >
                    {c.name} — {c.validity_months} мес. · {c.retail_price.toLocaleString('ru')} ₽
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Серийный номер ФН *</label>
            <input
              name="serial_number"
              required
              id="fn-serial"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="9999999999999999"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Тип ФН *</label>
              <select
                name="fn_type"
                id="fn-type"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
              >
                <option value="15m">15 месяцев</option>
                <option value="36m">36 месяцев</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Срок (мес.)</label>
              <input
                id="fn-validity"
                type="number"
                readOnly
                tabIndex={-1}
                className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-400"
                placeholder="из каталога"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Дата установки *</label>
              <input
                name="installed_at"
                id="fn-installed"
                type="date"
                required
                defaultValue={today}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Дата истечения *</label>
              <input
                name="expires_at"
                id="fn-expires"
                type="date"
                required
                defaultValue={defaultExpires}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Примечания</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 resize-none"
            />
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            Текущий активный ФН будет автоматически помечен как «Заменён».
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
              Установить ФН
            </button>
            <Link href={`/kkt/${id}`} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Отмена
            </Link>
          </div>
        </form>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        function addMonthsToDate(dateStr, months) {
          var d = new Date(dateStr);
          d.setMonth(d.getMonth() + months);
          return d.toISOString().split('T')[0];
        }
        function recalcExpires() {
          var validity = parseInt(document.getElementById('fn-validity').value, 10);
          var installed = document.getElementById('fn-installed').value;
          if (!validity || !installed) return;
          document.getElementById('fn-expires').value = addMonthsToDate(installed, validity);
        }
        var catalog = document.getElementById('fn-catalog');
        var typeEl = document.getElementById('fn-type');
        var validityEl = document.getElementById('fn-validity');
        if (catalog) {
          catalog.addEventListener('change', function() {
            var opt = this.options[this.selectedIndex];
            if (!opt.value) return;
            var months = parseInt(opt.dataset.validity, 10);
            validityEl.value = months || '';
            typeEl.value = months <= 15 ? '15m' : '36m';
            recalcExpires();
          });
        }
        document.getElementById('fn-installed').addEventListener('change', recalcExpires);
      `}} />
    </div>
  )
}
