import { createClient } from '@/lib/supabase/server'
import { createKktAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function NewKktPage({ params }: { params: Promise<{ id: string; lid: string; oid: string }> }) {
  const { id, lid, oid } = await params
  const supabase = await createClient()
  const db = supabase as any
  const { data } = await db.from('outlets').select('name').eq('id', oid).single()
  if (!data) notFound()
  const outletName = (data as { name: string }).name

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/clients/${id}`} className="text-sm text-gray-500 hover:text-gray-900">← Клиент</Link>
        <h1 className="mt-2 text-2xl font-bold">Добавить кассу</h1>
        <p className="mt-0.5 text-sm text-gray-500">Точка: {outletName}</p>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={createKktAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="outlet_id" value={oid} />
          <input type="hidden" name="client_id" value={id} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Производитель *</label>
              <select
                name="brand"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
              >
                <option value="">Выберите...</option>
                <option value="АТОЛ">АТОЛ</option>
                <option value="Штрих-М">Штрих-М</option>
                <option value="Эвотор">Эвотор</option>
                <option value="Вики">Вики</option>
                <option value="Кассатка">Кассатка</option>
                <option value="Другое">Другое</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Модель *</label>
              <input
                name="model"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                placeholder="30Ф"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Серийный номер *</label>
              <input
                name="serial_number"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Регистрационный номер</label>
              <input
                name="reg_number"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                placeholder="0000000000000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Версия прошивки</label>
              <input
                name="firmware_version"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                placeholder="5.10.1"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Статус</label>
              <select
                name="status"
                defaultValue="active"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
              >
                <option value="active">Активна</option>
                <option value="repair">Ремонт</option>
                <option value="deregistered">Снята с учёта</option>
              </select>
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

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Добавить кассу
            </button>
            <Link
              href={`/clients/${id}`}
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
