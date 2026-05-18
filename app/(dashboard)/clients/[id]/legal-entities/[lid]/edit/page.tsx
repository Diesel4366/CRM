import { createClient } from '@/lib/supabase/server'
import { updateLegalEntityAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { LegalEntity } from '@/types/database'

export default async function EditLegalEntityPage({ params }: { params: Promise<{ id: string; lid: string }> }) {
  const { id, lid } = await params
  const supabase = await createClient()
  const db = supabase as any
  const { data } = await db.from('legal_entities').select('*').eq('id', lid).single()
  if (!data) notFound()
  const le = data as LegalEntity

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/clients/${id}`} className="text-sm text-gray-500 hover:text-gray-900">← Клиент</Link>
        <h1 className="mt-2 text-2xl font-bold">Редактировать юр. лицо</h1>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={updateLegalEntityAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="id" value={lid} />
          <input type="hidden" name="client_id" value={id} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Наименование *</label>
            <input
              name="name"
              required
              defaultValue={le.name}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">ИНН *</label>
              <input
                name="inn"
                required
                defaultValue={le.inn}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">КПП</label>
              <input
                name="kpp"
                defaultValue={le.kpp ?? ''}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">ОГРН</label>
            <input
              name="ogrn"
              defaultValue={le.ogrn ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Юридический адрес</label>
            <input
              name="legal_address"
              defaultValue={le.legal_address ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Директор</label>
            <input
              name="director"
              defaultValue={le.director ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Примечания</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={le.notes ?? ''}
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
