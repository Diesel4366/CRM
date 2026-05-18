import { createClient } from '@/lib/supabase/server'
import { updateOutletAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Outlet } from '@/types/database'

export default async function EditOutletPage({ params }: { params: Promise<{ id: string; lid: string; oid: string }> }) {
  const { id, lid, oid } = await params
  const supabase = await createClient()
  const db = supabase as any
  const { data } = await db.from('outlets').select('*').eq('id', oid).single()
  if (!data) notFound()
  const outlet = data as Outlet

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/clients/${id}`} className="text-sm text-gray-500 hover:text-gray-900">← Клиент</Link>
        <h1 className="mt-2 text-2xl font-bold">Редактировать торговую точку</h1>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={updateOutletAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="id" value={oid} />
          <input type="hidden" name="legal_entity_id" value={lid} />
          <input type="hidden" name="client_id" value={id} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Название *</label>
            <input
              name="name"
              required
              defaultValue={outlet.name}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Адрес</label>
            <input
              name="address"
              defaultValue={outlet.address ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Контактное лицо</label>
              <input
                name="contact_person"
                defaultValue={outlet.contact_person ?? ''}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Телефон контакта</label>
              <input
                name="contact_phone"
                type="tel"
                defaultValue={outlet.contact_phone ?? ''}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Режим работы</label>
            <input
              name="working_hours"
              defaultValue={outlet.working_hours ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Инструкция по доступу</label>
            <textarea
              name="access_notes"
              rows={2}
              defaultValue={outlet.access_notes ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Примечания</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={outlet.notes ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Сохранить
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
