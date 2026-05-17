import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { differenceInDays, parseISO } from 'date-fns'
import { AlertTriangle, Clock } from 'lucide-react'

export default async function AlertsPage() {
  const supabase = await createClient()
  const [{ data: fnList }, { data: ofdList }] = await Promise.all([
    supabase
      .from('fn')
      .select('*, kkt(brand, model, serial_number, outlet(name, address, legal_entity(name, client(name))))')
      .neq('status', 'replaced')
      .order('expires_at'),
    supabase
      .from('ofd_subscriptions')
      .select('*, kkt(brand, model, serial_number, outlet(name, address, legal_entity(name, client(name))))')
      .neq('status', 'expired')
      .order('expires_at'),
  ])

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
            return (
              <div key={fn.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{fn.kkt?.outlet?.legal_entity?.client?.name}</p>
                  <p className="text-sm text-gray-500">{fn.kkt?.outlet?.name} · {fn.kkt?.brand} {fn.kkt?.model}</p>
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
            return (
              <div key={ofd.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{ofd.kkt?.outlet?.legal_entity?.client?.name}</p>
                  <p className="text-sm text-gray-500">{ofd.kkt?.outlet?.name} · {ofd.kkt?.brand} {ofd.kkt?.model}</p>
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
