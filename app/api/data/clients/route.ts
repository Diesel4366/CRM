import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('clients').select('id, name').order('name')
  return NextResponse.json(data ?? [])
}
