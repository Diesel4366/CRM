import { createClient } from '@/lib/supabase/server'
import { createKktEventAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function NewKktEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: kkt } = await supabase
    .from('kkt')
    .select('brand, model, serial_number, outlet(legal_entity(client_id))')
    .eq('id', id)
    .single()
  if (!kkt) notFound()

  const clientId = (kkt as any).outlet?.legal_entity?.client_id
  let orders: { id: string; order_number: string }[] = []
  if (clientId) {
    const { data } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20)
    orders = data ?? []
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/kkt/${id}`} className="text-sm text-gray-500 hover:text-gray-900">← {(kkt as any).brand} {(kkt as any).model}</Link>
        <h1 className="mt-2 text-2xl font-bold">Добавить событие</h1>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={createKktEventAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="kkt_id" value={id} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Тип события *</label>
            <select
              name="event_type"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
            >
              <option value="">Выберите...</option>
              <option value="fn_replace">Замена ФН</option>
              <option value="registration">Регистрация</option>
              <option value="re_registration">Перерегистрация</option>
              <option value="firmware">Обновление прошивки</option>
              <option value="repair">Ремонт</option>
              <option value="ofd_connect">Подключение ОФД</option>
              <option value="ofd_renew">Продление ОФД</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Дата события *</label>
            <input
              name="performed_at"
              type="date"
              required
              defaultValue={today}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {orders.length > 0 && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Связанный заказ (опционально)</label>
              <select
                name="order_id"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
              >
                <option value="">Не указан</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>{o.order_number}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Примечания</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Добавить
            </button>
            <Link
              href={`/kkt/${id}`}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
