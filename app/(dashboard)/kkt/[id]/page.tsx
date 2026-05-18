import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { differenceInDays, parseISO, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronRight, Plus } from 'lucide-react'
import type { KktEvent, Fn } from '@/types/database'

const kktStatusLabel: Record<string, string> = {
  active: 'Активна',
  deregistered: 'Снята с учёта',
  repair: 'Ремонт',
}
const kktStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  deregistered: 'secondary',
  repair: 'destructive',
}
const fnTypeLabel: Record<string, string> = { '15m': '15 месяцев', '36m': '36 месяцев' }
const fnStatusLabel: Record<string, string> = {
  active: 'Активен',
  expiring_soon: 'Истекает',
  expired: 'Истёк',
  replaced: 'Заменён',
}
const fnStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  expiring_soon: 'outline',
  expired: 'destructive',
  replaced: 'secondary',
}
const eventTypeLabel: Record<string, string> = {
  fn_replace: 'Замена ФН',
  registration: 'Регистрация',
  re_registration: 'Перерегистрация',
  firmware: 'Обновление ПО',
  repair: 'Ремонт',
  ofd_connect: 'Подключение ОФД',
  ofd_renew: 'Продление ОФД',
}

export default async function KktDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: kkt } = await supabase
    .from('kkt')
    .select(`
      *,
      outlet (
        *,
        legal_entity (
          *,
          client ( * )
        )
      ),
      fn ( * ),
      ofd_subscriptions ( * ),
      kkt_events ( * )
    `)
    .eq('id', id)
    .single()

  if (!kkt) notFound()

  const outlet = (kkt as any).outlet
  const legalEntity = outlet?.legal_entity
  const client = legalEntity?.client

  const allFns = ((kkt as any).fn ?? []) as Fn[]
  const activeFn = allFns.find(f => f.status === 'active')
  const allOfd = ((kkt as any).ofd_subscriptions ?? [])
  const activeOfd = allOfd.find((o: any) => o.status === 'active' || o.status === 'expiring_soon')
  const events = ((kkt as any).kkt_events ?? []) as KktEvent[]

  const fnDaysLeft = activeFn ? differenceInDays(parseISO(activeFn.expires_at), new Date()) : null
  const ofdDaysLeft = activeOfd ? differenceInDays(parseISO(activeOfd.expires_at), new Date()) : null

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
        <Link href="/clients" className="hover:text-gray-900">Клиенты</Link>
        {client && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/clients/${client.id}`} className="hover:text-gray-900">{client.name}</Link>
          </>
        )}
        {legalEntity && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span>{legalEntity.name}</span>
          </>
        )}
        {outlet && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span>{outlet.name}</span>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span>{(kkt as any).brand} {(kkt as any).model}</span>
      </div>

      {/* KKT Header */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{(kkt as any).brand} {(kkt as any).model}</h1>
              <Badge variant={kktStatusVariant[(kkt as any).status]}>
                {kktStatusLabel[(kkt as any).status]}
              </Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
              <span>Серийный номер: <strong>{(kkt as any).serial_number}</strong></span>
              {(kkt as any).reg_number && <span>Рег. номер: <strong>{(kkt as any).reg_number}</strong></span>}
              {(kkt as any).firmware_version && <span>Прошивка: <strong>{(kkt as any).firmware_version}</strong></span>}
              {outlet?.address && <span>Адрес: {outlet.address}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active FN */}
        <div className="rounded-xl border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Текущий ФН</h2>
            <Link
              href={`/kkt/${id}/fn/new`}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-3 w-3" /> Заменить ФН
            </Link>
          </div>
          {!activeFn ? (
            <p className="text-sm text-gray-400">ФН не установлен</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Серийный номер</span>
                <strong>{activeFn.serial_number}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Тип</span>
                <span>{fnTypeLabel[activeFn.fn_type]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Установлен</span>
                <span>{format(parseISO(activeFn.installed_at), 'd MMM yyyy', { locale: ru })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Истекает</span>
                <span>{format(parseISO(activeFn.expires_at), 'd MMM yyyy', { locale: ru })}</span>
              </div>
              {fnDaysLeft !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Осталось</span>
                  <Badge variant={fnDaysLeft <= 14 ? 'destructive' : fnDaysLeft <= 60 ? 'outline' : 'secondary'}>
                    {fnDaysLeft} дн.
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active OFD */}
        <div className="rounded-xl border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Подписка ОФД</h2>
            <Link
              href={`/kkt/${id}/ofd/new`}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-3 w-3" /> Обновить ОФД
            </Link>
          </div>
          {!activeOfd ? (
            <p className="text-sm text-gray-400">Подписка не подключена</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Провайдер</span>
                <strong>{activeOfd.provider}</strong>
              </div>
              {activeOfd.login && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Логин</span>
                  <span>{activeOfd.login}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Истекает</span>
                <span>{format(parseISO(activeOfd.expires_at), 'd MMM yyyy', { locale: ru })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Стоимость продажи</span>
                <span>{Number(activeOfd.sell_price).toLocaleString('ru')} ₽</span>
              </div>
              {ofdDaysLeft !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Осталось</span>
                  <Badge variant={ofdDaysLeft <= 14 ? 'destructive' : ofdDaysLeft <= 30 ? 'outline' : 'secondary'}>
                    {ofdDaysLeft} дн.
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History of events */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-semibold">История работ</h2>
          <Link
            href={`/kkt/${id}/events/new`}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-3 w-3" /> Добавить событие
          </Link>
        </div>
        {!events.length ? (
          <div className="p-8 text-center text-sm text-gray-400">Событий нет</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-5 py-3">Дата</th>
                <th className="px-5 py-3">Событие</th>
                <th className="px-5 py-3">Примечания</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.sort((a, b) => b.performed_at.localeCompare(a.performed_at)).map(ev => (
                <tr key={ev.id}>
                  <td className="px-5 py-3 whitespace-nowrap text-gray-500">
                    {format(parseISO(ev.performed_at), 'd MMM yyyy', { locale: ru })}
                  </td>
                  <td className="px-5 py-3 font-medium">{eventTypeLabel[ev.event_type]}</td>
                  <td className="px-5 py-3 text-gray-500">{ev.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FN History */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="text-base font-semibold">История ФН</h2>
        </div>
        {!allFns.length ? (
          <div className="p-8 text-center text-sm text-gray-400">ФН не добавлялись</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-5 py-3">Серийный номер</th>
                <th className="px-5 py-3">Тип</th>
                <th className="px-5 py-3">Установлен</th>
                <th className="px-5 py-3">Истекает</th>
                <th className="px-5 py-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allFns.sort((a, b) => b.installed_at.localeCompare(a.installed_at)).map(fn => (
                <tr key={fn.id}>
                  <td className="px-5 py-3 font-medium">{fn.serial_number}</td>
                  <td className="px-5 py-3">{fnTypeLabel[fn.fn_type]}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {format(parseISO(fn.installed_at), 'd MMM yyyy', { locale: ru })}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {format(parseISO(fn.expires_at), 'd MMM yyyy', { locale: ru })}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={fnStatusVariant[fn.status]}>{fnStatusLabel[fn.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
