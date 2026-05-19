'use client'

import { useState } from 'react'
import { addMonths, format, parseISO } from 'date-fns'
import { CheckCircle2, Cpu } from 'lucide-react'

export type ClientKktForFn = {
  id: string
  brand: string
  model: string
  serial_number: string
  reg_number: string | null
  outlet_name: string
  fn: { id: string; serial_number: string; fn_type: string; status: string }[]
}

type FnOrderItem = {
  id: string
  name: string
  kkt_id: string | null
}

type Props = {
  fnItems: FnOrderItem[]
  clientKkts: ClientKktForFn[]
  saveFnReplacementAction: (fd: FormData) => Promise<void>
}

function FnItemCard({ item, clientKkts, saveFnReplacementAction }: {
  item: FnOrderItem
  clientKkts: ClientKktForFn[]
  saveFnReplacementAction: (fd: FormData) => Promise<void>
}) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const defaultFnType: '15m' | '36m' = item.name.includes('36') ? '36m' : '15m'
  const defaultExpires = format(addMonths(new Date(), defaultFnType === '15m' ? 15 : 36), 'yyyy-MM-dd')

  const [kktId, setKktId] = useState(item.kkt_id ?? '')
  const [kktRegNumber, setKktRegNumber] = useState(() =>
    item.kkt_id ? (clientKkts.find(k => k.id === item.kkt_id)?.reg_number ?? '') : ''
  )
  const [fnSerial, setFnSerial] = useState('')
  const [fnType, setFnType] = useState<'15m' | '36m'>(defaultFnType)
  const [installedAt, setInstalledAt] = useState(today)
  const [expiresAt, setExpiresAt] = useState(defaultExpires)

  const linkedKkt = item.kkt_id ? clientKkts.find(k => k.id === item.kkt_id) : null
  const linkedActiveFn = linkedKkt?.fn.find(f => f.status === 'active')

  if (item.kkt_id && linkedKkt) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
          <div className="text-sm space-y-0.5">
            <p className="font-medium text-green-800">{item.name}</p>
            <p className="text-green-700">
              <span className="font-medium">Касса:</span> {linkedKkt.brand} {linkedKkt.model}
              &nbsp;·&nbsp;ЗН: {linkedKkt.serial_number}
              {linkedKkt.reg_number && <>&nbsp;·&nbsp;РН: {linkedKkt.reg_number}</>}
            </p>
            {linkedActiveFn && (
              <p className="text-green-700">
                <span className="font-medium">ФН:</span> {linkedActiveFn.serial_number}
                &nbsp;·&nbsp;{linkedActiveFn.fn_type === '15m' ? '15 мес.' : '36 мес.'}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  function handleKktChange(newId: string) {
    setKktId(newId)
    if (newId) {
      const kkt = clientKkts.find(k => k.id === newId)
      setKktRegNumber(kkt?.reg_number ?? '')
    }
  }

  function handleInstalledAtChange(val: string) {
    setInstalledAt(val)
    if (val) {
      try {
        setExpiresAt(format(addMonths(parseISO(val), fnType === '15m' ? 15 : 36), 'yyyy-MM-dd'))
      } catch { /* invalid date */ }
    }
  }

  function handleFnTypeChange(val: '15m' | '36m') {
    setFnType(val)
    setExpiresAt(format(addMonths(installedAt ? parseISO(installedAt) : new Date(), val === '15m' ? 15 : 36), 'yyyy-MM-dd'))
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-700 mb-3">{item.name}</p>

      {clientKkts.length === 0 ? (
        <p className="text-sm text-gray-400">У клиента нет касс в системе. Сначала добавьте ККТ на странице клиента.</p>
      ) : (
        <form action={saveFnReplacementAction} className="space-y-3">
          <input type="hidden" name="order_item_id" value={item.id} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600">Касса *</label>
              <select
                name="kkt_id"
                value={kktId}
                onChange={e => handleKktChange(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:border-gray-400"
              >
                <option value="">Выберите кассу</option>
                {clientKkts.map(k => (
                  <option key={k.id} value={k.id}>
                    {k.brand} {k.model} — ЗН: {k.serial_number} · {k.outlet_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Рег. номер ККТ</label>
              <input
                name="kkt_reg_number"
                value={kktRegNumber}
                onChange={e => setKktRegNumber(e.target.value)}
                placeholder="0000000000000000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Серийный № ФН *</label>
              <input
                name="fn_serial"
                value={fnSerial}
                onChange={e => setFnSerial(e.target.value)}
                required
                placeholder="9999078900007766"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Тип ФН</label>
              <select
                name="fn_type"
                value={fnType}
                onChange={e => handleFnTypeChange(e.target.value as '15m' | '36m')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:border-gray-400"
              >
                <option value="15m">15 месяцев</option>
                <option value="36m">36 месяцев</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Дата установки</label>
              <input
                name="installed_at"
                type="date"
                value={installedAt}
                onChange={e => handleInstalledAtChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Истекает</label>
              <input
                name="expires_at"
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!kktId || !fnSerial}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-40"
          >
            Сохранить данные замены
          </button>
        </form>
      )}
    </div>
  )
}

export function FnReplacementSection({ fnItems, clientKkts, saveFnReplacementAction }: Props) {
  if (!fnItems.length) return null

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
        <Cpu className="h-4 w-4" />
        Замена ФН
      </h2>
      <div className="space-y-4">
        {fnItems.map(item => (
          <FnItemCard
            key={item.id}
            item={item}
            clientKkts={clientKkts}
            saveFnReplacementAction={saveFnReplacementAction}
          />
        ))}
      </div>
    </div>
  )
}
