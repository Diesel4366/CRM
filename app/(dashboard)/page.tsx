import { createClient } from '@/lib/supabase/server'
import { differenceInDays, parseISO, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Clock, ClipboardList, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types/database'

function daysLeft(dateStr: string) {
  return differenceInDays(parseISO(dateStr), new Date())
}

function urgencyBadge(days: number) {
  if (days <= 14) return <Badge variant="destructive">{days} дн.</Badge>
  if (days <= 30) return <Badge className="bg-orange-100 text-orange-800">{days} дн.</Badge>
  return <Badge variant="secondary">{days} дн.</Badge>
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: expiringFn },
    { data: expiringOfd },
    { data: activeOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from('fn')
      .select('*')
      .in('status', ['active', 'expiring_soon'])
      .lte('expires_at', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('expires_at'),
    supabase
      .from('ofd_subscriptions')
      .select('*')
      .in('status', ['active', 'expiring_soon'])
      .lte('expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('expires_at'),
    supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .in('status', ['confirmed', 'in_progress']),
    supabase
      .from('orders')
      .select('*')
      .in('status', ['confirmed', 'in_progress'])
      .order('scheduled_at', { nullsFirst: false })
      .limit(5),
  ])

  const fnKktIds = [...new Set((expiringFn ?? []).map((f: any) => f.kkt_id).filter(Boolean))]
  const ofdKktIds = [...new Set((expiringOfd ?? []).map((o: any) => o.kkt_id).filter(Boolean))]
  const allKktIds = [...new Set([...fnKktIds, ...ofdKktIds])]

  const { data: kktList } = allKktIds.length
    ? await supabase.from('kkt').select('id, model, serial_number, outlet_id').in('id', allKktIds)
    : { data: [] }

  const outletIds = [...new Set((kktList ?? []).map((k: any) => k.outlet_id).filter(Boolean))]
  const { data: outletList } = outletIds.length
    ? await supabase.from('outlets').select('id, name, address').in('id', outletIds)
    : { data: [] }

  const clientIds = [...new Set((recentOrders ?? []).map((o: any) => o.client_id).filter(Boolean))]
  const { data: clientList } = clientIds.length
    ? await supabase.from('clients').select('id, name').in('id', clientIds)
    : { data: [] }

  const kktMap = Object.fromEntries((kktList ?? []).map((k: any) => [k.id, k]))
  const outletMap = Object.fromEntries((outletList ?? []).map((o: any) => [o.id, o]))
  const clientMap = Object.fromEntries((clientList ?? []).map((c: any) => [c.id, c.name]))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Дашборд</h1>

      {/* Виджеты */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{expiringFn?.length ?? 0}</p>
              <p className="text-xs text-gray-500">ФН истекают</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{expiringOfd?.length ?? 0}</p>
              <p className="text-xs text-gray-500">ОФД истекают</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <ClipboardList className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{activeOrders?.length ?? 0}</p>
              <p className="text-xs text-gray-500">Заказов в работе</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">
                {(activeOrders as Order[] | null)?.reduce((s, o) => s + o.total_profit, 0).toLocaleString('ru') ?? 0} ₽
              </p>
              <p className="text-xs text-gray-500">Прибыль (в работе)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Истекающие ФН */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Истекающие ФН (60 дней)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!expiringFn?.length ? (
              <p className="text-sm text-gray-400">Всё в порядке</p>
            ) : (
              <div className="space-y-2">
                {(expiringFn as any[]).map(fn => {
                  const kkt = kktMap[(fn as any).kkt_id]
                  const outlet = kkt ? outletMap[kkt.outlet_id] : null
                  return (
                    <div key={fn.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                      <div>
                        <p className="font-medium">{outlet?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{kkt?.model} · ФН {fn.serial_number}</p>
                      </div>
                      {urgencyBadge(daysLeft(fn.expires_at))}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Истекающие ОФД */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-orange-500" />
              Истекающие ОФД (30 дней)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!expiringOfd?.length ? (
              <p className="text-sm text-gray-400">Всё в порядке</p>
            ) : (
              <div className="space-y-2">
                {(expiringOfd as any[]).map(ofd => {
                  const kkt = kktMap[(ofd as any).kkt_id]
                  const outlet = kkt ? outletMap[kkt.outlet_id] : null
                  return (
                    <div key={ofd.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                      <div>
                        <p className="font-medium">{outlet?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{kkt?.model} · {ofd.provider}</p>
                      </div>
                      {urgencyBadge(daysLeft(ofd.expires_at))}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Заказы в работе */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Заказы в работе</CardTitle>
            <Link href="/orders" className="text-xs text-blue-600 hover:underline">Все заказы →</Link>
          </CardHeader>
          <CardContent>
            {!recentOrders?.length ? (
              <p className="text-sm text-gray-400">Нет активных заказов</p>
            ) : (
              <div className="space-y-2">
                {(recentOrders as Order[]).map(order => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{order.order_number} · {clientMap[(order as any).client_id]}</p>
                      <p className="text-xs text-gray-400">
                        {order.scheduled_at
                          ? format(parseISO(order.scheduled_at), 'd MMM yyyy', { locale: ru })
                          : 'Дата не задана'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.total_price.toLocaleString('ru')} ₽</p>
                      <Badge variant={order.status === 'in_progress' ? 'default' : 'secondary'} className="text-xs">
                        {order.status === 'confirmed' ? 'Подтверждён' : 'В работе'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
