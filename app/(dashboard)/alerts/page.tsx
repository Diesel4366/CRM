import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { differenceInDays, parseISO } from 'date-fns'
import { AlertTriangle, Clock } from 'lucide-react'

export default async function AlertsPage() {
  const supabase = await createClient()
  const [{ data: fnList }, { data: ofdList }] = await Promise.all([
    supabase.from('fn').select('*').neq('status', 'replaced').order('expires_at'),
    supabase.from('ofd_subscriptions').select('*').neq('status', 'expired').order('expires_at'),
  ])

  const fnKktIds = [...new Set((fnList ?? []).map((f: any) => f.kkt_id).filter(Boolean))]
  const ofdKktIds = [...new Set((ofdList ?? []).map((o: any) => o.kkt_id).filter(Boolean))]
  const allKktIds = [...new Set([...fnKktIds, ...ofdKktIds])]

  const { data: kktList } = allKktIds.length
    ? await supabase.from('kkt').select('id, brand, model, serial_number, outlet_id').in('id', allKktIds)
    : { data: [] }

  const outletIds = [...new Set((kktList ?? []).map((k: any) => k.outlet_id).filter(Boolean))]
  const { data: outletList } = outletIds.length
    ? await supabase.from('outlets').select('id, name, address, legal_entity_id').in('id', outletIds)
    : { data: [] }

  const leIds = [...new Set((outletList ?? []).map((o: any) => o.legal_entity_id).filter(Boolean))]
  const { data: leList } = leIds.length
    ? await supabase.from('legal_entities').select('id, name, client_id').in('id', leIds)
    : { data: [] }

  const clientIds = [...new Set((leList ?? []).map((le: any) => le.client_id).filter(Boolean))]
  const { data: clientListData } = clientIds.length
    ? await supabase.from('clients').select('id, name').in('id', clientIds)
    : { data: [] }

  const kktMap = Object.fromEntries((kktList ?? []).map((k: any) => [k.id, k]))
  const outletMap = Object.fromEntries((outletList ?? []).map((o: any) => [o.id, o]))
  const leMap = Object.fromEntries((leList ?? []).map((le: any) => [le.id, le]))
  const clientMap = Object.fromEntries((clientListData ?? []).map((c: any) => [c.id, c.name]))

  const today = new Date()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Алерты — сроки истечения</h1>

      {/* ФН */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-4 w-4 text-red-500" /> Фискальные накопители
        </h2>
        <div className="divide-y rounded-xl border bg-white">
          {!fnList?.length && <div className="p-6 text-center text-sm text-gray-400">Нет данных</div>}
          {fnList?.map((fn: any) => {
            const days = differenceInDays(parseISO(fn.expires_at), today)
            const kkt = kktMap[fn.kkt_id]
            const outlet = kkt ? outletMap[kkt.outlet_id] : null
            const le = outlet ? leMap[outlet.legal_entity_id] : null
            const clientName = le ? clientMap[le.client_id] : null
            return (
              <div key={fn.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{clientName ?? '—'}</p>
                  <p className="text-sm text-gray-500">{outlet?.name} · {kkt?.brand} {kkt?.model}</p>
                  <p className="text-xs text-gray-400">ФН {fn.serial_number} · {fn.fn_type === '15m' ? '15 мес.' : '36 мес.'} · до {fn.expires_at}</p>
                </div>
                <Badge variant={days < 0 ? 'destructive' : days <= 14 ? 'destructive' : days <= 60 ? 'outline' : 'secondary'}>
                  {days < 0 ? `просрочен ${Math.abs(days)} дн.` : `${days} дн.`}
                </Badge>
              </div>
            )
          })}
        </div>
      </section>

      {/* ОФД */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Clock className="h-4 w-4 text-orange-500" /> ОФД-подписки
        </h2>
        <div className="divide-y rounded-xl border bg-white">
          {!ofdList?.length && <div className="p-6 text-center text-sm text-gray-400">Нет данных</div>}
          {ofdList?.map((ofd: any) => {
            const days = differenceInDays(parseISO(ofd.expires_at), today)
            const kkt = kktMap[ofd.kkt_id]
            const outlet = kkt ? outletMap[kkt.outlet_id] : null
            const le = outlet ? leMap[outlet.legal_entity_id] : null
            const clientName = le ? clientMap[le.client_id] : null
            return (
              <div key={ofd.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{clientName ?? '—'}</p>
                  <p className="text-sm text-gray-500">{outlet?.name} · {kkt?.brand} {kkt?.model}</p>
                  <p className="text-xs text-gray-400">{ofd.provider} · до {ofd.expires_at}</p>
                </div>
                <Badge variant={days < 0 ? 'destructive' : days <= 14 ? 'destructive' : days <= 30 ? 'outline' : 'secondary'}>
                  {days < 0 ? `просрочен ${Math.abs(days)} дн.` : `${days} дн.`}
                </Badge>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
