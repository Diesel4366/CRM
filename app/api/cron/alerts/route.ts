import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { differenceInDays, parseISO, addDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const in60 = format(addDays(new Date(), 60), 'yyyy-MM-dd')
  const in30 = format(addDays(new Date(), 30), 'yyyy-MM-dd')

  const [
    { data: expiringFn },
    { data: expiringOfd },
    { data: tomorrowOrders },
    { data: settings },
  ] = await Promise.all([
    supabase.from('fn')
      .select('*, kkt(brand, model, serial_number, outlet(name, address, legal_entity(client(name))))')
      .in('status', ['active', 'expiring_soon'])
      .lte('expires_at', in60)
      .order('expires_at'),
    supabase.from('ofd_subscriptions')
      .select('*, kkt(brand, model, serial_number, outlet(name, legal_entity(client(name))))')
      .in('status', ['active', 'expiring_soon'])
      .lte('expires_at', in30)
      .order('expires_at'),
    supabase.from('orders')
      .select('*, client(name)')
      .eq('scheduled_at', tomorrow)
      .in('status', ['confirmed', 'in_progress']),
    supabase.from('settings').select('*'),
  ])

  const settingsMap: Record<string, string> = {}
  for (const s of ((settings ?? []) as { key: string; value: string | null }[])) {
    settingsMap[s.key] = s.value ?? ''
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? settingsMap.telegram_bot_token
  const chatId = process.env.TELEGRAM_CHAT_ID ?? settingsMap.telegram_chat_id

  const lines: string[] = ['🔔 <b>Ежедневный отчёт КассаМастер</b>', '']

  // FN alerts
  if (expiringFn && expiringFn.length > 0) {
    lines.push(`⚠️ <b>Истекают ФН (${expiringFn.length}):</b>`)
    for (const fn of expiringFn as any[]) {
      const days = differenceInDays(parseISO(fn.expires_at), new Date())
      const outlet = fn.kkt?.outlet
      const client = outlet?.legal_entity?.client
      lines.push(`  • ${client?.name ?? '?'} / ${outlet?.name ?? '?'} — ${fn.kkt?.brand} ${fn.kkt?.model} (ФН ${fn.serial_number}): ${days} дн.`)
    }
    lines.push('')
  }

  // OFD alerts
  if (expiringOfd && expiringOfd.length > 0) {
    lines.push(`⏰ <b>Истекают ОФД (${expiringOfd.length}):</b>`)
    for (const ofd of expiringOfd as any[]) {
      const days = differenceInDays(parseISO(ofd.expires_at), new Date())
      const outlet = ofd.kkt?.outlet
      const client = outlet?.legal_entity?.client
      lines.push(`  • ${client?.name ?? '?'} / ${outlet?.name ?? '?'} — ${ofd.provider}: ${days} дн.`)
    }
    lines.push('')
  }

  // Tomorrow orders
  if (tomorrowOrders && tomorrowOrders.length > 0) {
    lines.push(`📋 <b>Завтра заказы (${tomorrowOrders.length}):</b>`)
    for (const order of tomorrowOrders as any[]) {
      lines.push(`  • ${order.order_number} — ${order.client?.name ?? '?'}`)
    }
    lines.push('')
  }

  if (lines.length === 2) {
    lines.push('✅ Всё в порядке!')
  }

  const message = lines.join('\n')

  let telegramResult: { ok: boolean; error?: string } = { ok: false, error: 'No token configured' }

  if (botToken && chatId) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      })
      const data = await res.json()
      telegramResult = { ok: data.ok, error: data.description }
    } catch (e) {
      telegramResult = { ok: false, error: String(e) }
    }
  }

  return NextResponse.json({
    success: true,
    telegram: telegramResult,
    stats: {
      expiringFn: expiringFn?.length ?? 0,
      expiringOfd: expiringOfd?.length ?? 0,
      tomorrowOrders: tomorrowOrders?.length ?? 0,
    },
  })
}
