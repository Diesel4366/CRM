import { createClient } from '@/lib/supabase/server'
import { createOfdSubscriptionAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addMonths, format } from 'date-fns'
import type { CatalogItem } from '@/types/database'

export default async function NewOfdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: kkt }, { data: catalogItems }] = await Promise.all([
    supabase.from('kkt').select('brand, model, serial_number').eq('id', id).single(),
    supabase.from('catalog_items')
      .select('*')
      .eq('item_type', 'ofd')
      .eq('active', true)
      .not('validity_months', 'is', null)
      .order('name'),
  ])

  if (!kkt) notFound()

  const today = new Date().toISOString().split('T')[0]
  const defaultExpires = format(addMonths(new Date(), 12), 'yyyy-MM-dd')

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/kkt/${id}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← {(kkt as any).brand} {(kkt as any).model}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Добавить подписку ОФД</h1>
        <p className="mt-0.5 text-sm text-gray-500">КН: {(kkt as any).serial_number}</p>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={createOfdSubscriptionAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="kkt_id" value={id} />

          {(catalogItems as CatalogItem[] ?? []).length > 0 && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Из каталога (заполнит поля)</label>
              <select
                id="ofd-catalog"
                className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Выберите тариф ОФД из каталога…</option>
                {(catalogItems as CatalogItem[]).map(c => (
                  <option
                    key={c.id}
                    value={c.id}
                    data-name={c.name}
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
            <label className="block text-sm font-medium text-gray-700">Провайдер ОФД *</label>
            <input
              name="provider"
              id="ofd-provider"
              required
              list="ofd-providers-list"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="ОФД.ру, Платформа ОФД…"
            />
            <datalist id="ofd-providers-list">
              <option value="ОФД.ру" />
              <option value="Платформа ОФД" />
              <option value="Первый ОФД" />
              <option value="Taxcom" />
              <option value="Контур.ОФД" />
              <option value="ЯРУС" />
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Логин</label>
              <input
                name="login"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Пароль</label>
              <input
                name="password_encrypted"
                type="password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Начало *</label>
              <input
                name="starts_at"
                id="ofd-starts"
                type="date"
                required
                defaultValue={today}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Истекает *</label>
              <input
                name="expires_at"
                id="ofd-expires"
                type="date"
                required
                defaultValue={defaultExpires}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Закупочная цена, ₽</label>
              <input
                name="cost_price"
                id="ofd-cost"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Цена продажи, ₽</label>
              <input
                name="sell_price"
                id="ofd-price"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
              Добавить ОФД
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
        function recalcOfdExpires() {
          var validity = parseInt(document.getElementById('ofd-validity-hidden') && document.getElementById('ofd-validity-hidden').value, 10);
          var starts = document.getElementById('ofd-starts').value;
          if (!validity || !starts) return;
          document.getElementById('ofd-expires').value = addMonthsToDate(starts, validity);
        }
        var hiddenValidity = document.createElement('input');
        hiddenValidity.type = 'hidden';
        hiddenValidity.id = 'ofd-validity-hidden';
        document.body.appendChild(hiddenValidity);

        var catalog = document.getElementById('ofd-catalog');
        if (catalog) {
          catalog.addEventListener('change', function() {
            var opt = this.options[this.selectedIndex];
            if (!opt.value) return;
            var months = parseInt(opt.dataset.validity, 10);
            hiddenValidity.value = months || '';
            document.getElementById('ofd-provider').value = opt.dataset.name || '';
            document.getElementById('ofd-cost').value = opt.dataset.cost || '0';
            document.getElementById('ofd-price').value = opt.dataset.price || '0';
            recalcOfdExpires();
          });
        }
        document.getElementById('ofd-starts').addEventListener('change', recalcOfdExpires);
      `}} />
    </div>
  )
}
