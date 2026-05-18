import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')
  if (!clientId) return NextResponse.json([])

  const supabase = await createClient()
  const { data } = await supabase
    .from('legal_entities')
    .select('id, client_id, name')
    .eq('client_id', clientId)
    .order('name')
  return NextResponse.json(data ?? [])
}
