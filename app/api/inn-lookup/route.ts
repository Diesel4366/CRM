import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const inn = req.nextUrl.searchParams.get('inn')?.trim()
  if (!inn) return NextResponse.json({ error: 'inn required' }, { status: 400 })

  const supabase = await createClient()
  const db = supabase as any
  const { data: tokenRow } = await db.from('settings').select('value').eq('key', 'dadata_token').single()
  const token = tokenRow?.value
  if (!token) return NextResponse.json({ error: 'DaData token not configured' }, { status: 503 })

  const res = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify({ query: inn }),
  })

  if (!res.ok) return NextResponse.json({ error: 'DaData upstream error' }, { status: 502 })
  const json = await res.json()
  const s = json.suggestions?.[0]
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    name: s.data?.name?.short_with_opf ?? s.value ?? '',
    inn: s.data?.inn ?? '',
    kpp: s.data?.kpp ?? '',
    ogrn: s.data?.ogrn ?? '',
    legal_address: s.data?.address?.value ?? '',
    director: s.data?.management?.name ?? '',
  })
}
