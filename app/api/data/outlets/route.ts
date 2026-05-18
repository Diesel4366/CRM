import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const legalEntityId = searchParams.get('legal_entity_id')
  if (!legalEntityId) return NextResponse.json([])

  const supabase = await createClient()
  const { data } = await supabase
    .from('outlets')
    .select('id, legal_entity_id, name')
    .eq('legal_entity_id', legalEntityId)
    .order('name')
  return NextResponse.json(data ?? [])
}
