import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, AlertTriangle } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'

export default async function KktPage() {
  const supabase = await createClient()
  const { data: kktList } = await supabase
    .from('kkt')
    .select('*, fn(id, expires_at, status, fn_type), ofd_subscriptions(id, expires_at, provider, status)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const outletIds = [...new Set((kktList ?? []).map((k: any) => k.outlet_id).filter(Boolean))]
  const { data: outlets } = outletIds.length
    ? await supabase.from('outlets').select('id, name, address, legal_entity_id').in('id', outletIds)
    : { data: [] }

  const leIds = [...new Set((outlets ?? []).map((o: any) => o.legal_entity_id).filter(Boolean))]
  const { data: legalEntities } = leIds.length
    ? await supabase.from('legal_entities').select('id, name, client_id').in('id', leIds)
    : { data: [] }

  const clientIds = [...new Set((legalEntities ?? []).map((le: any) => le.client_id).filter(Boolean))]
  const { data: clients } = clientIds.length
    ? await supabase.from('clients').select('id, name').in('id', clientIds)
    : { data: [] }

  const outletMap = Object.fromEntries((outlets ?? []).map((o: any) => [o.id, o]))
  const leMap = Object.fromEntries((legalEntities ?? []).map((le: any) => [le.id, le]))
  const clientMap = Object.fromEntries((clients ?? []).map((c: any) => [c.id, c.name]))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Кассы ККТ</h1>
      <div className="divide-y rounded-xl border bg-white">
        {!kktList?.length && (
          <div className="p-8 text-center text-sm text-gray-400">Касс пока нет</div>
        )}
        {kktList?.map((kkt: any) => {
          const outlet = outletMap[kkt.outlet_id]
          const le = outlet ? leMap[outlet.legal_entity_id] : null
          const clientName = le ? clientMap[le.client_id] : null
          const activeFn = kkt.fn?.find((f: any) => f.status !== 'replaced')
          const activeOfd = kkt.ofd_subscriptions?.find((o: any) => o.status !== 'expired')
          const fnDays = activeFn ? differenceInDays(parseISO(activeFn.expires_at), new Date()) : null
          const ofdDays = activeOfd ? differenceInDays(parseISO(activeOfd.expires_at), new Date()) : null
          const hasAlert = (fnDays !== null && fnDays <= 60) || (ofdDays !== null && ofdDays <= 30)

          return (
            <Link
              key={kkt.id}
              href={`/kkt/${kkt.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {hasAlert && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                  <span className="font-medium">{kkt.brand} {kkt.model}</span>
                  <Badge variant="outline" className="text-xs">№ {kkt.serial_number}</Badge>
                </div>
                <span className="text-sm text-gray-500">{outlet?.name}</span>
                <span className="text-xs text-gray-400">
                  {clientName} · {outlet?.address}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                {fnDays !== null && (
                  <Badge variant={fnDays <= 14 ? 'destructive' : fnDays <= 60 ? 'outline' : 'secondary'}>
                    ФН: {fnDays} дн.
                  </Badge>
                )}
                {ofdDays !== null && (
                  <Badge variant={ofdDays <= 14 ? 'destructive' : ofdDays <= 30 ? 'outline' : 'secondary'}>
                    ОФД: {ofdDays} дн.
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
