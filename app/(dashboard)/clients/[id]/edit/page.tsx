import { createClient } from '@/lib/supabase/server'
import { updateClientAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Client } from '@/types/database'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const db = supabase as any
  const { data } = await db.from('clients').select('*').eq('id', id).single()
  if (!data) notFound()
  const client = data as Client

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/clients/${id}`} className="text-sm text-gray-500 hover:text-gray-900">← {client.name}</Link>
        <h1 className="mt-2 text-2xl font-bold">Редактировать клиента</h1>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={updateClientAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="id" value={id} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Название / ФИО *</label>
            <input
              name="name"
              required
              defaultValue={client.name}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Телефон</label>
            <input
              name="phone"
              type="tel"
              defaultValue={client.phone ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={client.email ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Примечания</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={client.notes ?? ''}
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
