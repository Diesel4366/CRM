import { createClient } from '@/lib/supabase/server'
import { LegalEntityForm } from '@/components/ui/legal-entity-form'
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
        <LegalEntityForm
          mode="edit"
          clientId={id}
          entityId={lid}
          backHref={`/clients/${id}`}
          initial={{
            name: le.name,
            inn: le.inn,
            kpp: le.kpp ?? '',
            ogrn: le.ogrn ?? '',
            legal_address: le.legal_address ?? '',
            director: le.director ?? '',
            notes: le.notes ?? '',
          }}
        />
      </div>
    </div>
  )
}
