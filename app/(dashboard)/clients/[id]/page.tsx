import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { deleteClientAction, deleteLegalEntityAction, deleteOutletAction } from '@/app/actions'
import { Pencil, Trash2, Plus, Monitor, MapPin, Phone, Building2, ChevronRight } from 'lucide-react'

const kktStatusLabel: Record<string, string> = {
  active: 'Активна',
  deregistered: 'Снята',
  repair: 'Ремонт',
}
const kktStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  deregistered: 'secondary',
  repair: 'destructive',
}

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select(`
      *,
      legal_entities (
        *,
        outlets (
          *,
          kkt ( * )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!client) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = client as any
  const legalEntities = c.legal_entities ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/clients" className="hover:text-gray-900">Клиенты</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{c.name}</span>
          </div>
          <h1 className="text-2xl font-bold">{c.name}</h1>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
            {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
            {c.email && <span>{c.email}</span>}
          </div>
          {c.notes && <p className="mt-2 text-sm text-gray-600">{c.notes}</p>}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/clients/${id}/edit`}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3 w-3" /> Изменить
          </Link>
          <form action={deleteClientAction}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              onClick={e => { if (!confirm('Удалить клиента?')) e.preventDefault() }}
            >
              <Trash2 className="h-3 w-3" /> Удалить
            </button>
          </form>
        </div>
      </div>

      {/* Legal entities */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Building2 className="h-5 w-5 text-gray-400" />Юридические лица</h2>
          <Link
            href={`/clients/${id}/legal-entities/new`}
            className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            <Plus className="h-3 w-3" /> Добавить юр. лицо
          </Link>
        </div>

        {!legalEntities.length && (
          <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-400">
            Юридических лиц нет. Добавьте первое.
          </div>
        )}

        <div className="space-y-4">
          {legalEntities.map((le: any) => (
            <div key={le.id} className="rounded-xl border bg-white">
              {/* Legal entity header */}
              <div className="flex items-start justify-between border-b p-4">
                <div>
                  <p className="font-semibold">{le.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>ИНН: {le.inn}</span>
                    {le.kpp && <span>КПП: {le.kpp}</span>}
                    {le.director && <span>Директор: {le.director}</span>}
                    {le.legal_address && <span>{le.legal_address}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/clients/${id}/legal-entities/${le.id}/edit`}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <form action={deleteLegalEntityAction}>
                    <input type="hidden" name="id" value={le.id} />
                    <input type="hidden" name="client_id" value={id} />
                    <button
                      type="submit"
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      onClick={e => { if (!confirm('Удалить юр. лицо?')) e.preventDefault() }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Outlets */}
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Торговые точки</p>
                  <Link
                    href={`/clients/${id}/legal-entities/${le.id}/outlets/new`}
                    className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Plus className="h-3 w-3" /> Добавить точку
                  </Link>
                </div>

                {!(le.outlets ?? []).length && (
                  <p className="text-sm text-gray-400 py-2">Нет торговых точек</p>
                )}

                <div className="space-y-3">
                  {(le.outlets ?? []).map((outlet: any) => (
                    <div key={outlet.id} className="rounded-lg border bg-gray-50 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{outlet.name}</p>
                          {outlet.address && <p className="text-xs text-gray-500 mt-0.5">{outlet.address}</p>}
                          {outlet.contact_person && (
                            <p className="text-xs text-gray-500">
                              {outlet.contact_person}{outlet.contact_phone ? ` · ${outlet.contact_phone}` : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Link
                            href={`/clients/${id}/legal-entities/${le.id}/outlets/${outlet.id}/edit`}
                            className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-700"
                          >
                            <Pencil className="h-3 w-3" />
                          </Link>
                          <form action={deleteOutletAction}>
                            <input type="hidden" name="id" value={outlet.id} />
                            <input type="hidden" name="client_id" value={id} />
                            <button
                              type="submit"
                              className="rounded p-1 text-gray-400 hover:bg-white hover:text-red-500"
                              onClick={e => { if (!confirm('Удалить торговую точку?')) e.preventDefault() }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* KKTs */}
                      <div className="mt-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><Monitor className="h-3 w-3" />Кассы</p>
                          <Link
                            href={`/clients/${id}/legal-entities/${le.id}/outlets/${outlet.id}/kkt/new`}
                            className="inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-50"
                          >
                            <Plus className="h-2.5 w-2.5" /> Добавить кассу
                          </Link>
                        </div>
                        {!(outlet.kkt ?? []).length && (
                          <p className="text-xs text-gray-400">Нет касс</p>
                        )}
                        <div className="space-y-1.5">
                          {(outlet.kkt ?? []).map((kkt: any) => (
                            <Link
                              key={kkt.id}
                              href={`/kkt/${kkt.id}`}
                              className="flex items-center justify-between rounded border bg-white px-3 py-2 text-xs hover:bg-gray-50"
                            >
                              <span className="font-medium">{kkt.brand} {kkt.model}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">№ {kkt.serial_number}</span>
                                <Badge variant={kktStatusVariant[kkt.status]} className="text-xs py-0">
                                  {kktStatusLabel[kkt.status]}
                                </Badge>
                                <ChevronRight className="h-3 w-3 text-gray-400" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
