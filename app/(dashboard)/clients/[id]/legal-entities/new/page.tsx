import { createClient } from '@/lib/supabase/server'
import { LegalEntityForm } from '@/components/ui/legal-entity-form'
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
        <LegalEntityForm mode="create" clientId={id} backHref={`/clients/${id}`} />
      </div>
    </div>
  )
}
