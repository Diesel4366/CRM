import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Order } from '@/types/database'

const statusLabel: Record<string, string> = {
  draft: 'Черновик', confirmed: 'Подтверждён',
  in_progress: 'В работе', done: 'Выполнен', cancelled: 'Отменён',
}
const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary', confirmed: 'outline', in_progress: 'default',
  done: 'secondary', cancelled: 'destructive',
}
const paymentLabel: Record<string, string> = {
  unpaid: 'Не оплачен', invoiced: 'Счёт выставлен',
  paid: 'Оплачен', partially_paid: 'Частично',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*, client(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Заказы</h1>
        <Link
          href="/orders/new"
          className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          <Plus className="mr-2 h-4 w-4" />Новый заказ
        </Link>
      </div>

      <div className="divide-y rounded-xl border bg-white">
        {!orders?.length && (
          <div className="p-8 text-center text-sm text-gray-400">Заказов пока нет</div>
        )}
        {(orders as (Order & { client: { name: string } })[])?.map(order => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{order.order_number}</span>
                <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
              </div>
              <span className="text-sm text-gray-500">{order.client?.name}</span>
              <span className="text-xs text-gray-400">
                {order.scheduled_at
                  ? format(parseISO(order.scheduled_at), 'd MMM yyyy', { locale: ru })
                  : 'Дата не задана'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{order.total_price.toLocaleString('ru')} ₽</p>
              <p className="text-xs text-green-600">+{order.total_profit.toLocaleString('ru')} ₽ прибыль</p>
              <p className="text-xs text-gray-400">{paymentLabel[order.payment_status]}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
