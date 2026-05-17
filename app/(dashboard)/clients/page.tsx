import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Plus, ChevronRight, Phone } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*, legal_entities(id, name, inn, outlets(id, kkt(id)))')
    .order('name')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Клиенты</h1>
        
          <Link href="/clients/new"><Plus className="mr-2 h-4 w-4" />Добавить</Link>
        
      </div>

      <div className="divide-y rounded-xl border bg-white">
        {!clients?.length && (
          <div className="p-8 text-center text-sm text-gray-400">Клиентов пока нет</div>
        )}
        {(clients as any[])?.map(client => {
          const totalKkt = (client.legal_entities ?? [])
            .flatMap((le: { outlets?: { kkt?: unknown[] }[] }) => le.outlets ?? [])
            .flatMap((o: { kkt?: unknown[] }) => o.kkt ?? []).length
          return (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{client.name}</span>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {client.phone && (
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>
                  )}
                  <span>{(client.legal_entities ?? []).length} юр. лица</span>
                  <span>{totalKkt} касс</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
