import { createClient } from '@/lib/supabase/server'
import { differenceInDays, parseISO, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Clock, ClipboardList, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Fn, OfdSubscription, Order } from '@/types/database'

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
      .select('*, kkt(model, serial_number, outlet(name, address))')
      .in('status', ['active', 'expiring_soon'])
      .lte('expires_at', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('expires_at'),
    supabase
      .from('ofd_subscriptions')
      .select('*, kkt(model, serial_number, outlet(name))')
      .in('status', ['active', 'expiring_soon'])
      .lte('expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('expires_at'),
    supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .in('status', ['confirmed', 'in_progress']),
    supabase
      .from('orders')
      .select('*, client(name)')
      .in('status', ['confirmed', 'in_progress'])
      .order('scheduled_at', { nullsFirst: false })
      .limit(5),
  ])

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
                {(expiringFn as (Fn & { kkt: { model: string; serial_number: string; outlet: { name: string; address: string } } })[]).map(fn => (
                  <div key={fn.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-medium">{(fn.kkt as { outlet: { name: string } }).outlet?.name}</p>
                      <p className="text-xs text-gray-400">{fn.kkt?.model} · ФН {fn.serial_number}</p>
                    </div>
                    {urgencyBadge(daysLeft(fn.expires_at))}
                  </div>
                ))}
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
                {(expiringOfd as (OfdSubscription & { kkt: { model: string; outlet: { name: string } } })[]).map(ofd => (
                  <div key={ofd.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-medium">{(ofd.kkt as { outlet: { name: string } }).outlet?.name}</p>
                      <p className="text-xs text-gray-400">{ofd.kkt?.model} · {ofd.provider}</p>
                    </div>
                    {urgencyBadge(daysLeft(ofd.expires_at))}
                  </div>
                ))}
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
                {(recentOrders as (Order & { client: { name: string } })[]).map(order => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{order.order_number} · {order.client?.name}</p>
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
