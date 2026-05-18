'use client'

import { useState } from 'react'
import { createOrderAction } from '@/app/actions'
import Link from 'next/link'
import { useEffect } from 'react'

type Client = { id: string; name: string }
type LegalEntity = { id: string; client_id: string; name: string }
type Outlet = { id: string; legal_entity_id: string; name: string }

export default function NewOrderPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([])
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedLeId, setSelectedLeId] = useState('')

  useEffect(() => {
    fetch('/api/data/clients').then(r => r.json()).then(setClients).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedClientId) {
      setLegalEntities([])
      setSelectedLeId('')
      setOutlets([])
      return
    }
    fetch(`/api/data/legal-entities?client_id=${selectedClientId}`)
      .then(r => r.json()).then(setLegalEntities).catch(() => {})
    setSelectedLeId('')
    setOutlets([])
  }, [selectedClientId])

  useEffect(() => {
    if (!selectedLeId) {
      setOutlets([])
      return
    }
    fetch(`/api/data/outlets?legal_entity_id=${selectedLeId}`)
      .then(r => r.json()).then(setOutlets).catch(() => {})
  }, [selectedLeId])

  return (
    <div className="space-y-6">
      <div>
        <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900">← Заказы</Link>
        <h1 className="mt-2 text-2xl font-bold">Новый заказ</h1>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={createOrderAction} className="space-y-4 max-w-lg">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Клиент *</label>
            <select
              name="client_id"
              required
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
            >
              <option value="">Выберите клиента...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {legalEntities.length > 0 && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Юридическое лицо</label>
              <select
                name="legal_entity_id"
                value={selectedLeId}
                onChange={e => setSelectedLeId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
              >
                <option value="">Не выбрано</option>
                {legalEntities.map(le => (
                  <option key={le.id} value={le.id}>{le.name}</option>
                ))}
              </select>
            </div>
          )}

          {outlets.length > 0 && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Торговая точка</label>
              <select
                name="outlet_id"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 bg-white"
              >
                <option value="">Не выбрано</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Запланированная дата</label>
            <input
              name="scheduled_at"
              type="date"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Примечания</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Создать заказ
            </button>
            <Link
              href="/orders"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
