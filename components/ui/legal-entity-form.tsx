'use client'

import { useState } from 'react'
import { createLegalEntityAction, updateLegalEntityAction } from '@/app/actions'
import Link from 'next/link'

interface Props {
  mode: 'create' | 'edit'
  clientId: string
  entityId?: string
  backHref: string
  initial?: {
    name?: string; inn?: string; kpp?: string; ogrn?: string
    legal_address?: string; director?: string; notes?: string
  }
}

export function LegalEntityForm({ mode, clientId, entityId, backHref, initial = {} }: Props) {
  const [inn, setInn] = useState(initial.inn ?? '')
  const [name, setName] = useState(initial.name ?? '')
  const [kpp, setKpp] = useState(initial.kpp ?? '')
  const [ogrn, setOgrn] = useState(initial.ogrn ?? '')
  const [address, setAddress] = useState(initial.legal_address ?? '')
  const [director, setDirector] = useState(initial.director ?? '')
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function lookupInn() {
    const q = inn.trim()
    if (q.length !== 10 && q.length !== 12) {
      setError('ИНН должен содержать 10 или 12 цифр')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/inn-lookup?inn=${q}`)
      if (res.status === 503) { setError('Токен DaData не настроен (Настройки → Интеграции)'); return }
      if (res.status === 404) { setError('Организация не найдена'); return }
      if (!res.ok) { setError('Ошибка запроса'); return }
      const d = await res.json()
      setName(d.name ?? '')
      setKpp(d.kpp ?? '')
      setOgrn(d.ogrn ?? '')
      setAddress(d.legal_address ?? '')
      setDirector(d.director ?? '')
    } catch {
      setError('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  const action = mode === 'create' ? createLegalEntityAction : updateLegalEntityAction
  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200'

  return (
    <form action={action} className="space-y-4 max-w-lg">
      <input type="hidden" name="client_id" value={clientId} />
      {mode === 'edit' && <input type="hidden" name="id" value={entityId} />}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">ИНН *</label>
          <div className="flex gap-2">
            <input
              name="inn"
              required
              value={inn}
              onChange={e => { setInn(e.target.value.replace(/\D/g, '')); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); lookupInn() } }}
              className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="1234567890"
              maxLength={12}
            />
            <button
              type="button"
              onClick={lookupInn}
              disabled={loading}
              title="Заполнить по ИНН"
              className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              )}
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">КПП</label>
          <input name="kpp" value={kpp} onChange={e => setKpp(e.target.value)} className={inputCls} placeholder="123456789" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Наименование *</label>
        <input name="name" required value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="ООО Ромашка" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">ОГРН</label>
        <input name="ogrn" value={ogrn} onChange={e => setOgrn(e.target.value)} className={inputCls} placeholder="1234567890123" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Юридический адрес</label>
        <input name="legal_address" value={address} onChange={e => setAddress(e.target.value)} className={inputCls} placeholder="г. Нижний Новгород, ул. Ленина, 1" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Директор</label>
        <input name="director" value={director} onChange={e => setDirector(e.target.value)} className={inputCls} placeholder="Иванов Иван Иванович" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Примечания</label>
        <textarea name="notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 resize-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          {mode === 'create' ? 'Добавить' : 'Сохранить'}
        </button>
        <Link href={backHref} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Отмена
        </Link>
      </div>
    </form>
  )
}
