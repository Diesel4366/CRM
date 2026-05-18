import { createClient } from '@/lib/supabase/server'
import { createLegalEntityAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function NewLegalEntityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const db = supabase as any
  const { data } = await db.from('clients').select('name').eq('id', id).single()
  if (!data) notFound()
  const clientName = (data as { name: string }).name

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/clients/${id}`} className="text-sm text-gray-500 hover:text-gray-900">← {clientName}</Link>
        <h1 className="mt-2 text-2xl font-bold">Добавить юридическое лицо</h1>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={createLegalEntityAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="client_id" value={id} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Наименование *</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="ООО Ромашка"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">ИНН *</label>
              <input
                name="inn"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">КПП</label>
              <input
                name="kpp"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                placeholder="123456789"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">ОГРН</label>
            <input
              name="ogrn"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="1234567890123"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Юридический адрес</label>
            <input
              name="legal_address"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="г. Нижний Новгород, ул. Ленина, 1"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Директор</label>
            <input
              name="director"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="Иванов Иван Иванович"
            />
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
              Добавить
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
