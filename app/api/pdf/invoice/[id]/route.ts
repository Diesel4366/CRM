import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { format, parseISO, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: order }, { data: settings }] = await Promise.all([
    supabase.from('orders').select('*, order_items(*), documents(doc_number, doc_type, issued_at, due_date)').eq('id', id).single(),
    supabase.from('settings').select('*'),
  ])

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const ordAny = order as any
  const [clientRes, legalRes] = await Promise.all([
    ordAny.client_id
      ? supabase.from('clients').select('name, phone, email').eq('id', ordAny.client_id).single()
      : { data: null },
    ordAny.legal_entity_id
      ? supabase.from('legal_entities').select('name, inn, kpp, legal_address, director').eq('id', ordAny.legal_entity_id).single()
      : { data: null },
  ])

  const settingsMap: Record<string, string> = {}
  for (const s of ((settings ?? []) as { key: string; value: string | null }[])) {
    settingsMap[s.key] = s.value ?? ''
  }

  const invoiceDocs = (ordAny.documents ?? []).filter((d: any) => d.doc_type === 'invoice')
  const docNumber = invoiceDocs[0]?.doc_number ?? `СЧ-${ordAny.order_number}`
  const issuedAt = invoiceDocs[0]?.issued_at
    ? format(parseISO(invoiceDocs[0].issued_at), 'd MMMM yyyy', { locale: ru })
    : format(new Date(), 'd MMMM yyyy', { locale: ru })
  const dueDate = invoiceDocs[0]?.due_date
    ? format(parseISO(invoiceDocs[0].due_date), 'd MMMM yyyy', { locale: ru })
    : format(addDays(new Date(), 5), 'd MMMM yyyy', { locale: ru })

  const items = (ordAny.order_items ?? []) as any[]
  const totalPrice = Number(ordAny.total_price) || items.reduce((s: number, i: any) => s + Number(i.unit_price) * Number(i.quantity), 0)

  const companyName = settingsMap.company_name || 'ИП'
  const inn = settingsMap.inn || ''
  const address = settingsMap.address || ''
  const bankName = settingsMap.bank_name || ''
  const bik = settingsMap.bik || ''
  const bankAccount = settingsMap.bank_account || ''
  const korrAccount = settingsMap.korr_account || ''
  const vat = settingsMap.vat || 'Без НДС'

  const client = clientRes.data as any
  const legalEntity = legalRes.data as any

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Счёт ${docNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #000; padding: 20mm; }
  h1 { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
  .subtitle { font-size: 11px; color: #666; margin-bottom: 16px; }
  .bank-box { border: 1px solid #000; padding: 8px; margin-bottom: 12px; display: flex; gap: 16px; }
  .bank-box .bank-left { flex: 1; border-right: 1px solid #000; padding-right: 12px; }
  .bank-box .bank-right { flex: 1; padding-left: 12px; }
  .bank-box .label { font-size: 9px; color: #666; }
  .bank-box .value { font-size: 11px; font-weight: bold; }
  .bank-box .account { font-size: 14px; font-weight: bold; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .party-block { border: 1px solid #ccc; padding: 8px; }
  .party-block .party-label { font-size: 9px; color: #666; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #f5f5f5; border: 1px solid #ccc; padding: 6px 8px; text-align: left; font-size: 10px; }
  td { border: 1px solid #ccc; padding: 6px 8px; font-size: 11px; }
  .text-right { text-align: right; }
  .total-row td { font-weight: bold; background: #f9f9f9; }
  .footer { margin-top: 20px; font-size: 10px; color: #666; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 32px; }
  .sig-line { border-top: 1px solid #000; padding-top: 4px; font-size: 10px; }
  @media print {
    @page { size: A4; margin: 15mm; }
    body { padding: 0; }
  }
</style>
</head>
<body>

<div class="bank-box">
  <div class="bank-left">
    <div class="label">Банк получателя</div>
    <div class="value">${bankName}</div>
    <div class="label" style="margin-top:4px">БИК</div>
    <div class="value">${bik}</div>
    <div class="label" style="margin-top:4px">Корр. счёт</div>
    <div class="value">${korrAccount}</div>
  </div>
  <div class="bank-right">
    <div class="label">Счёт получателя</div>
    <div class="account">${bankAccount}</div>
    <div style="margin-top:8px">
      <div class="label">Получатель</div>
      <div class="value">${companyName}</div>
      <div class="label" style="margin-top:2px">ИНН</div>
      <div class="value">${inn}</div>
    </div>
  </div>
</div>

<h1>Счёт на оплату № ${docNumber} от ${issuedAt}</h1>
<div class="subtitle">Срок оплаты: ${dueDate}</div>

<div class="parties">
  <div class="party-block">
    <div class="party-label">ПОСТАВЩИК (ИСПОЛНИТЕЛЬ):</div>
    <div>${companyName}</div>
    <div>ИНН: ${inn}</div>
    <div>${address}</div>
  </div>
  <div class="party-block">
    <div class="party-label">ПОКУПАТЕЛЬ (ЗАКАЗЧИК):</div>
    ${legalEntity ? `
    <div>${legalEntity.name}</div>
    ${legalEntity.inn ? `<div>ИНН: ${legalEntity.inn}${legalEntity.kpp ? ` / КПП: ${legalEntity.kpp}` : ''}</div>` : ''}
    ${legalEntity.legal_address ? `<div>${legalEntity.legal_address}</div>` : ''}
    ` : `
    <div>${client?.name ?? 'Клиент'}</div>
    ${client?.phone ? `<div>${client.phone}</div>` : ''}
    `}
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:40px">№</th>
      <th>Наименование товара/услуги</th>
      <th style="width:60px" class="text-right">Кол-во</th>
      <th style="width:50px">Ед.</th>
      <th style="width:90px" class="text-right">Цена, ₽</th>
      <th style="width:100px" class="text-right">Сумма, ₽</th>
    </tr>
  </thead>
  <tbody>
    ${items.map((item: any, i: number) => `
    <tr>
      <td class="text-right">${i + 1}</td>
      <td>${item.name}</td>
      <td class="text-right">${item.quantity}</td>
      <td>${item.unit}</td>
      <td class="text-right">${Number(item.unit_price).toLocaleString('ru')}</td>
      <td class="text-right">${(Number(item.unit_price) * Number(item.quantity)).toLocaleString('ru')}</td>
    </tr>`).join('')}
  </tbody>
  <tfoot>
    <tr class="total-row">
      <td colspan="5" class="text-right">Итого:</td>
      <td class="text-right">${totalPrice.toLocaleString('ru')} ₽</td>
    </tr>
    <tr>
      <td colspan="5" class="text-right">${vat}:</td>
      <td class="text-right">${vat === 'Без НДС' ? '—' : '0,00'}</td>
    </tr>
    <tr class="total-row">
      <td colspan="5" class="text-right">Всего к оплате:</td>
      <td class="text-right">${totalPrice.toLocaleString('ru')} ₽</td>
    </tr>
  </tfoot>
</table>

<div class="footer">
  Всего наименований ${items.length}, на сумму ${totalPrice.toLocaleString('ru')} ₽. ${vat}.
</div>

<div class="signatures">
  <div>
    <div class="sig-line">Руководитель / ИП</div>
    <div style="margin-top:32px; font-size:10px">____________________________ / Ступин А.А.</div>
  </div>
  <div>
    <div class="sig-line">Главный бухгалтер</div>
    <div style="margin-top:32px; font-size:10px">____________________________ / Ступин А.А.</div>
  </div>
</div>

<script>window.print()</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
