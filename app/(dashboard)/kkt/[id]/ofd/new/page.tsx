import { createClient } from '@/lib/supabase/server'
import { createOfdSubscriptionAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function NewOfdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: kkt } = await supabase.from('kkt').select('brand, model, serial_number').eq('id', id).single()
  if (!kkt) notFound()

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/kkt/${id}`} className="text-sm text-gray-500 hover:text-gray-900">← {(kkt as any).brand} {(kkt as any).model}</Link>
        <h1 className="mt-2 text-2xl font-bold">Добавить подписку ОФД</h1>
        <p className="mt-0.5 text-sm text-gray-500">КН: {(kkt as any).serial_number}</p>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={createOfdSubscriptionAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="kkt_id" value={id} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Провайдер ОФД *</label>
            <select
              name="provider"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
            >
              <option value="">Выберите...</option>
              <option value="ОФД.ру">ОФД.ру</option>
              <option value="Платформа ОФД">Платформа ОФД</option>
              <option value="Первый ОФД">Первый ОФД</option>
              <option value="Taxcom">Taxcom</option>
              <option value="Контур.ОФД">Контур.ОФД</option>
              <option value="ЯРУС">ЯРУС</option>
              <option value="Другой">Другой</option>
            </select>
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
                type="date"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
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
              <label className="block text-sm font-medium text-gray-700">Цена продажи, ₽</label>
              <input
                name="sell_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Добавить ОФД
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
