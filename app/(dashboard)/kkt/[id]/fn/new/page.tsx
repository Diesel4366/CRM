import { createClient } from '@/lib/supabase/server'
import { createFnAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addMonths, format } from 'date-fns'

export default async function NewFnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: kkt } = await supabase.from('kkt').select('brand, model, serial_number').eq('id', id).single()
  if (!kkt) notFound()

  const today = new Date().toISOString().split('T')[0]
  const expires15 = format(addMonths(new Date(), 15), 'yyyy-MM-dd')
  const expires36 = format(addMonths(new Date(), 36), 'yyyy-MM-dd')

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/kkt/${id}`} className="text-sm text-gray-500 hover:text-gray-900">← {(kkt as any).brand} {(kkt as any).model}</Link>
        <h1 className="mt-2 text-2xl font-bold">Замена ФН</h1>
        <p className="mt-0.5 text-sm text-gray-500">КН: {(kkt as any).serial_number}</p>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={createFnAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="kkt_id" value={id} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Серийный номер ФН *</label>
            <input
              name="serial_number"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="9999999999999999"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Тип ФН *</label>
            <select
              name="fn_type"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
            >
              <option value="15m">15 месяцев</option>
              <option value="36m">36 месяцев</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Дата установки *</label>
              <input
                name="installed_at"
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
                type="date"
                required
                defaultValue={expires36}
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
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Установить ФН
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
