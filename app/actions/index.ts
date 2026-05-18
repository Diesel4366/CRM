'use server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── CLIENTS ────────────────────────────────────────────────────────────────

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db.from('clients').insert({
    name: formData.get('name') as string,
    phone: (formData.get('phone') as string) || null,
    email: (formData.get('email') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }).select().single()

  if (error || !data) throw new Error(error?.message ?? 'Ошибка создания клиента')
  revalidatePath('/clients')
  redirect(`/clients/${data.id}`)
}

export async function updateClientAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('clients').update({
    name: formData.get('name') as string,
    phone: (formData.get('phone') as string) || null,
    email: (formData.get('email') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)

  revalidatePath(`/clients/${id}`)
  redirect(`/clients/${id}`)
}

export async function deleteClientAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('clients').delete().eq('id', id)
  revalidatePath('/clients')
  redirect('/clients')
}

// ─── LEGAL ENTITIES ──────────────────────────────────────────────────────────

export async function createLegalEntityAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const clientId = formData.get('client_id') as string
  await db.from('legal_entities').insert({
    client_id: clientId,
    name: formData.get('name') as string,
    inn: formData.get('inn') as string,
    kpp: (formData.get('kpp') as string) || null,
    ogrn: (formData.get('ogrn') as string) || null,
    legal_address: (formData.get('legal_address') as string) || null,
    director: (formData.get('director') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })

  revalidatePath(`/clients/${clientId}`)
  redirect(`/clients/${clientId}`)
}

export async function updateLegalEntityAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const clientId = formData.get('client_id') as string
  await db.from('legal_entities').update({
    name: formData.get('name') as string,
    inn: formData.get('inn') as string,
    kpp: (formData.get('kpp') as string) || null,
    ogrn: (formData.get('ogrn') as string) || null,
    legal_address: (formData.get('legal_address') as string) || null,
    director: (formData.get('director') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)

  revalidatePath(`/clients/${clientId}`)
  redirect(`/clients/${clientId}`)
}

export async function deleteLegalEntityAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const clientId = formData.get('client_id') as string
  await db.from('legal_entities').delete().eq('id', id)
  revalidatePath(`/clients/${clientId}`)
  redirect(`/clients/${clientId}`)
}

// ─── OUTLETS ─────────────────────────────────────────────────────────────────

export async function createOutletAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const clientId = formData.get('client_id') as string
  const legalEntityId = formData.get('legal_entity_id') as string
  await db.from('outlets').insert({
    legal_entity_id: legalEntityId,
    name: formData.get('name') as string,
    address: (formData.get('address') as string) || null,
    contact_person: (formData.get('contact_person') as string) || null,
    contact_phone: (formData.get('contact_phone') as string) || null,
    access_notes: (formData.get('access_notes') as string) || null,
    working_hours: (formData.get('working_hours') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })

  revalidatePath(`/clients/${clientId}`)
  redirect(`/clients/${clientId}`)
}

export async function updateOutletAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const clientId = formData.get('client_id') as string
  await db.from('outlets').update({
    name: formData.get('name') as string,
    address: (formData.get('address') as string) || null,
    contact_person: (formData.get('contact_person') as string) || null,
    contact_phone: (formData.get('contact_phone') as string) || null,
    access_notes: (formData.get('access_notes') as string) || null,
    working_hours: (formData.get('working_hours') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)

  revalidatePath(`/clients/${clientId}`)
  redirect(`/clients/${clientId}`)
}

export async function deleteOutletAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const clientId = formData.get('client_id') as string
  await db.from('outlets').delete().eq('id', id)
  revalidatePath(`/clients/${clientId}`)
  redirect(`/clients/${clientId}`)
}

// ─── KKT ─────────────────────────────────────────────────────────────────────

export async function createKktAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const clientId = formData.get('client_id') as string
  const outletId = formData.get('outlet_id') as string
  const { data, error } = await db.from('kkt').insert({
    outlet_id: outletId,
    brand: formData.get('brand') as string,
    model: formData.get('model') as string,
    serial_number: formData.get('serial_number') as string,
    reg_number: (formData.get('reg_number') as string) || null,
    firmware_version: (formData.get('firmware_version') as string) || null,
    status: (formData.get('status') as string) || 'active',
    notes: (formData.get('notes') as string) || null,
  }).select().single()

  if (error || !data) throw new Error(error?.message ?? 'Ошибка создания кассы')
  revalidatePath(`/clients/${clientId}`)
  revalidatePath('/kkt')
  redirect(`/kkt/${data.id}`)
}

export async function updateKktAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('kkt').update({
    brand: formData.get('brand') as string,
    model: formData.get('model') as string,
    serial_number: formData.get('serial_number') as string,
    reg_number: (formData.get('reg_number') as string) || null,
    firmware_version: (formData.get('firmware_version') as string) || null,
    status: formData.get('status') as string,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)

  revalidatePath(`/kkt/${id}`)
  redirect(`/kkt/${id}`)
}

export async function deleteKktAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('kkt').delete().eq('id', id)
  revalidatePath('/kkt')
  redirect('/kkt')
}

// ─── FN ──────────────────────────────────────────────────────────────────────

export async function createFnAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const kktId = formData.get('kkt_id') as string

  // Mark old active FN as replaced
  await db.from('fn').update({ status: 'replaced' })
    .eq('kkt_id', kktId)
    .eq('status', 'active')

  await db.from('fn').insert({
    kkt_id: kktId,
    serial_number: formData.get('serial_number') as string,
    fn_type: formData.get('fn_type') as string,
    installed_at: formData.get('installed_at') as string,
    expires_at: formData.get('expires_at') as string,
    status: 'active',
    notes: (formData.get('notes') as string) || null,
  })

  // Log event
  await db.from('kkt_events').insert({
    kkt_id: kktId,
    event_type: 'fn_replace',
    performed_at: new Date().toISOString(),
    notes: `Установлен новый ФН: ${formData.get('serial_number')}`,
  })

  revalidatePath(`/kkt/${kktId}`)
  redirect(`/kkt/${kktId}`)
}

export async function replaceFnAction(formData: FormData) {
  return createFnAction(formData)
}

// ─── OFD ─────────────────────────────────────────────────────────────────────

export async function createOfdSubscriptionAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const kktId = formData.get('kkt_id') as string
  await db.from('ofd_subscriptions').insert({
    kkt_id: kktId,
    provider: formData.get('provider') as string,
    login: (formData.get('login') as string) || null,
    password_encrypted: (formData.get('password_encrypted') as string) || null,
    starts_at: formData.get('starts_at') as string,
    expires_at: formData.get('expires_at') as string,
    cost_price: Number(formData.get('cost_price')) || 0,
    sell_price: Number(formData.get('sell_price')) || 0,
    status: 'active',
    notes: (formData.get('notes') as string) || null,
  })

  revalidatePath(`/kkt/${kktId}`)
  redirect(`/kkt/${kktId}`)
}

export async function updateOfdSubscriptionAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const kktId = formData.get('kkt_id') as string
  await db.from('ofd_subscriptions').update({
    provider: formData.get('provider') as string,
    login: (formData.get('login') as string) || null,
    password_encrypted: (formData.get('password_encrypted') as string) || null,
    starts_at: formData.get('starts_at') as string,
    expires_at: formData.get('expires_at') as string,
    cost_price: Number(formData.get('cost_price')) || 0,
    sell_price: Number(formData.get('sell_price')) || 0,
    status: formData.get('status') as string,
  }).eq('id', id)

  revalidatePath(`/kkt/${kktId}`)
  redirect(`/kkt/${kktId}`)
}

// ─── CATALOG ─────────────────────────────────────────────────────────────────

export async function createCatalogItemAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const validityRaw = formData.get('validity_months') as string
  const fuelRaw = formData.get('fuel_consumption') as string
  await db.from('catalog_items').insert({
    name: formData.get('name') as string,
    item_type: formData.get('item_type') as string,
    cost_price: Number(formData.get('cost_price')) || 0,
    retail_price: Number(formData.get('retail_price')) || 0,
    unit: (formData.get('unit') as string) || 'шт',
    active: formData.get('active') === 'on',
    validity_months: validityRaw ? Number(validityRaw) : null,
    fuel_consumption: fuelRaw ? Number(fuelRaw) : null,
  })

  revalidatePath('/catalog')
  redirect('/catalog')
}

export async function updateCatalogItemAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const itemType = formData.get('item_type') as string
  const validityRaw = formData.get('validity_months') as string
  const fuelRaw = formData.get('fuel_consumption') as string

  // Для комплекта пересчитываем закупочную цену из компонентов
  let costPrice = Number(formData.get('cost_price')) || 0
  if (itemType === 'bundle') {
    const { data: comps } = await db
      .from('catalog_bundle_items')
      .select('quantity, item:item_id(cost_price)')
      .eq('bundle_id', id)
    if (comps?.length) {
      costPrice = (comps as any[]).reduce(
        (s: number, c: any) => s + (Number(c.item?.cost_price) || 0) * c.quantity, 0
      )
    }
  }

  await db.from('catalog_items').update({
    name: formData.get('name') as string,
    item_type: itemType,
    cost_price: costPrice,
    retail_price: Number(formData.get('retail_price')) || 0,
    unit: (formData.get('unit') as string) || 'шт',
    active: formData.get('active') === 'on',
    validity_months: validityRaw ? Number(validityRaw) : null,
    fuel_consumption: fuelRaw ? Number(fuelRaw) : null,
  }).eq('id', id)

  revalidatePath('/catalog')
  redirect('/catalog')
}

export async function deleteCatalogItemAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('catalog_items').delete().eq('id', id)
  revalidatePath('/catalog')
  redirect('/catalog')
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

async function generateOrderNumber(db: any): Promise<string> {
  const year = new Date().getFullYear()
  const { count } = await db.from('orders').select('*', { count: 'exact', head: true })
  const num = String((count ?? 0) + 1).padStart(4, '0')
  return `КМ-${year}-${num}`
}

export async function createOrderAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const orderNumber = await generateOrderNumber(db)
  const { data, error } = await db.from('orders').insert({
    order_number: orderNumber,
    client_id: formData.get('client_id') as string,
    legal_entity_id: (formData.get('legal_entity_id') as string) || null,
    outlet_id: (formData.get('outlet_id') as string) || null,
    status: 'draft',
    scheduled_at: (formData.get('scheduled_at') as string) || null,
    notes: (formData.get('notes') as string) || null,
    payment_status: 'unpaid',
    payment_method: null,
    total_price: 0,
    total_cost: 0,
    total_profit: 0,
  }).select().single()

  if (error || !data) throw new Error(error?.message ?? 'Ошибка создания заказа')
  revalidatePath('/orders')
  redirect(`/orders/${data.id}`)
}

export async function updateOrderAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('orders').update({
    client_id: formData.get('client_id') as string,
    legal_entity_id: (formData.get('legal_entity_id') as string) || null,
    outlet_id: (formData.get('outlet_id') as string) || null,
    scheduled_at: (formData.get('scheduled_at') as string) || null,
    notes: (formData.get('notes') as string) || null,
    payment_status: formData.get('payment_status') as string,
    payment_method: (formData.get('payment_method') as string) || null,
  }).eq('id', id)

  revalidatePath(`/orders/${id}`)
  redirect(`/orders/${id}`)
}

export async function updateOrderStatusAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const update: Record<string, string | null> = { status }
  if (status === 'done') {
    update.completed_at = new Date().toISOString()
  }
  await db.from('orders').update(update).eq('id', id)
  revalidatePath(`/orders/${id}`)
  redirect(`/orders/${id}`)
}

export async function updatePaymentStatusAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const paymentStatus = formData.get('payment_status') as string
  const paymentMethod = (formData.get('payment_method') as string) || null
  await db.from('orders').update({
    payment_status: paymentStatus,
    payment_method: paymentMethod,
  }).eq('id', id)
  revalidatePath(`/orders/${id}`)
  redirect(`/orders/${id}`)
}

export async function deleteOrderAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('orders').delete().eq('id', id)
  revalidatePath('/orders')
  redirect('/orders')
}

// ─── ORDER ITEMS ─────────────────────────────────────────────────────────────

async function recalcOrderTotals(db: any, orderId: string) {
  const { data: items } = await db.from('order_items').select('*').eq('order_id', orderId)
  const totalPrice = (items ?? []).reduce((s: number, i: any) => s + (i.unit_price * i.quantity), 0)
  const totalCost = (items ?? []).reduce((s: number, i: any) => s + (i.cost_price * i.quantity), 0)
  const totalProfit = totalPrice - totalCost
  await db.from('orders').update({
    total_price: totalPrice,
    total_cost: totalCost,
    total_profit: totalProfit,
  }).eq('id', orderId)
}

export async function addOrderItemAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const orderId = formData.get('order_id') as string
  const qty = Number(formData.get('quantity')) || 1
  const costPrice = Number(formData.get('cost_price')) || 0
  const unitPrice = Number(formData.get('unit_price')) || 0

  const fuelConsumptionRaw = formData.get('fuel_consumption') as string
  await db.from('order_items').insert({
    order_id: orderId,
    item_type: (formData.get('item_type') as string) || 'service',
    name: formData.get('name') as string,
    quantity: qty,
    unit: (formData.get('unit') as string) || 'шт',
    cost_price: costPrice,
    unit_price: unitPrice,
    kkt_id: (formData.get('kkt_id') as string) || null,
    outlet_id: (formData.get('outlet_id') as string) || null,
    notes: (formData.get('notes') as string) || null,
    fuel_consumption: fuelConsumptionRaw ? Number(fuelConsumptionRaw) : null,
  })

  await recalcOrderTotals(db, orderId)
  revalidatePath(`/orders/${orderId}`)
  redirect(`/orders/${orderId}`)
}

export async function updateOrderItemAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const orderId = formData.get('order_id') as string
  const qty = Number(formData.get('quantity')) || 1
  const costPrice = Number(formData.get('cost_price')) || 0
  const unitPrice = Number(formData.get('unit_price')) || 0

  await db.from('order_items').update({
    name: formData.get('name') as string,
    quantity: qty,
    unit: (formData.get('unit') as string) || 'шт',
    cost_price: costPrice,
    unit_price: unitPrice,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)

  await recalcOrderTotals(db, orderId)
  revalidatePath(`/orders/${orderId}`)
  redirect(`/orders/${orderId}`)
}

export async function deleteOrderItemAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const orderId = formData.get('order_id') as string
  await db.from('order_items').delete().eq('id', id)
  await recalcOrderTotals(db, orderId)
  revalidatePath(`/orders/${orderId}`)
  redirect(`/orders/${orderId}`)
}

// ─── BUNDLE COMPONENTS ───────────────────────────────────────────────────────

async function recalcBundleCostPrice(db: any, bundleId: string) {
  const { data: components } = await db
    .from('catalog_bundle_items')
    .select('quantity, item:item_id(cost_price)')
    .eq('bundle_id', bundleId)
  const totalCost = (components ?? []).reduce(
    (sum: number, c: any) => sum + c.quantity * (c.item?.cost_price ?? 0),
    0
  )
  await db.from('catalog_items').update({ cost_price: totalCost }).eq('id', bundleId)
}

export async function addBundleComponentAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const bundleId = formData.get('bundle_id') as string
  await db.from('catalog_bundle_items').insert({
    bundle_id: bundleId,
    item_id: formData.get('item_id') as string,
    quantity: Number(formData.get('quantity')) || 1,
  })
  await recalcBundleCostPrice(db, bundleId)
  revalidatePath(`/catalog/${bundleId}/edit`)
}

export async function removeBundleComponentAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const bundleId = formData.get('bundle_id') as string
  await db.from('catalog_bundle_items').delete().eq('id', id)
  await recalcBundleCostPrice(db, bundleId)
  revalidatePath(`/catalog/${bundleId}/edit`)
}

export async function addBundleToOrderAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const orderId = formData.get('order_id') as string
  const bundleId = formData.get('bundle_id') as string

  const [{ data: bundle }, { data: components }] = await Promise.all([
    db.from('catalog_items').select('name, retail_price').eq('id', bundleId).single(),
    db.from('catalog_bundle_items')
      .select('quantity, item:item_id(name, item_type, cost_price, retail_price, unit)')
      .eq('bundle_id', bundleId),
  ])

  if (!components?.length) {
    revalidatePath(`/orders/${orderId}`)
    redirect(`/orders/${orderId}`)
  }

  const outletId = (formData.get('outlet_id') as string) || null
  const rows = (components as any[]).map(c => ({
    order_id: orderId,
    item_type: c.item.item_type === 'bundle' ? 'service' : c.item.item_type,
    name: c.item.name,
    quantity: c.quantity,
    unit: c.item.unit || 'шт',
    cost_price: c.item.cost_price ?? 0,
    unit_price: c.item.retail_price ?? 0,
    outlet_id: outletId,
  }))

  // Если у комплекта задана цена и она отличается от суммы компонентов —
  // добавляем строку скидки/надбавки
  const componentSum = rows.reduce((s, r) => s + r.unit_price * r.quantity, 0)
  const bundlePrice = Number(bundle?.retail_price ?? 0)
  if (bundlePrice > 0 && bundlePrice !== componentSum) {
    const diff = bundlePrice - componentSum // отрицательное = скидка
    rows.push({
      order_id: orderId,
      item_type: 'other',
      name: diff < 0
        ? `Скидка: ${bundle.name}`
        : `Доп. наценка: ${bundle.name}`,
      quantity: 1,
      unit: '—',
      cost_price: 0,
      unit_price: diff,
      outlet_id: outletId,
    })
  }

  await db.from('order_items').insert(rows)
  await recalcOrderTotals(db, orderId)
  revalidatePath(`/orders/${orderId}`)
  redirect(`/orders/${orderId}`)
}

export async function updateOdometerAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const id = formData.get('id') as string
  const orderId = formData.get('order_id') as string
  const startRaw = formData.get('odometer_start') as string
  const endRaw = formData.get('odometer_end') as string
  const odometerStart = startRaw ? Number(startRaw) : null
  const odometerEnd = endRaw ? Number(endRaw) : null

  const [{ data: item }, { data: fuelSetting }] = await Promise.all([
    db.from('order_items').select('fuel_consumption, quantity').eq('id', id).single(),
    db.from('settings').select('value').eq('key', 'fuel_price').single(),
  ])

  const fuelConsumption = Number(item?.fuel_consumption) || 0
  const fuelPrice = Number(fuelSetting?.value) || 0
  let costPrice = 0
  if (odometerStart != null && odometerEnd != null && odometerEnd > odometerStart && fuelConsumption > 0 && fuelPrice > 0) {
    const distance = odometerEnd - odometerStart
    costPrice = Math.round((distance / 100) * fuelConsumption * fuelPrice * 100) / 100
  }

  await db.from('order_items').update({
    odometer_start: odometerStart,
    odometer_end: odometerEnd,
    cost_price: costPrice,
  }).eq('id', id)

  await recalcOrderTotals(db, orderId)
  revalidatePath(`/orders/${orderId}`)
  redirect(`/orders/${orderId}`)
}

// ─── FN REPLACEMENT FROM ORDER ───────────────────────────────────────────────

export async function saveFnReplacementAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const orderItemId = formData.get('order_item_id') as string
  const kktId = formData.get('kkt_id') as string
  const kktRegNumber = (formData.get('kkt_reg_number') as string) || null
  const fnSerial = formData.get('fn_serial') as string
  const fnType = formData.get('fn_type') as string
  const installedAt = formData.get('installed_at') as string
  const expiresAt = formData.get('expires_at') as string

  if (!kktId || !fnSerial || !orderItemId) return

  const { data: orderItem } = await db.from('order_items').select('order_id').eq('id', orderItemId).single()
  if (!orderItem) return
  const orderId = orderItem.order_id

  await db.from('order_items').update({ kkt_id: kktId }).eq('id', orderItemId)

  if (kktRegNumber) {
    await db.from('kkt').update({ reg_number: kktRegNumber }).eq('id', kktId)
  }

  const { data: oldFn } = await db.from('fn').select('id').eq('kkt_id', kktId).eq('status', 'active').maybeSingle()
  if (oldFn) {
    await db.from('fn').update({ status: 'replaced' }).eq('id', oldFn.id)
  }

  const { data: newFn } = await db.from('fn').insert({
    kkt_id: kktId,
    serial_number: fnSerial,
    fn_type: fnType,
    installed_at: installedAt,
    expires_at: expiresAt,
    status: 'active',
    notes: `Замена по заказу`,
  }).select('id').single()

  await db.from('kkt_events').insert({
    kkt_id: kktId,
    order_id: orderId,
    event_type: 'fn_replace',
    performed_at: installedAt,
    old_fn_id: oldFn?.id ?? null,
    new_fn_id: newFn?.id ?? null,
    notes: `Замена ФН в заказе`,
  })

  revalidatePath(`/orders/${orderId}`)
  revalidatePath(`/kkt/${kktId}`)
  redirect(`/orders/${orderId}`)
}

// ─── KKT EVENTS ──────────────────────────────────────────────────────────────

export async function createKktEventAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const kktId = formData.get('kkt_id') as string
  await db.from('kkt_events').insert({
    kkt_id: kktId,
    order_id: (formData.get('order_id') as string) || null,
    event_type: formData.get('event_type') as string,
    performed_at: (formData.get('performed_at') as string) || new Date().toISOString(),
    notes: (formData.get('notes') as string) || null,
  })

  revalidatePath(`/kkt/${kktId}`)
  redirect(`/kkt/${kktId}`)
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

export async function createDocumentAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const orderId = formData.get('order_id') as string
  const docType = formData.get('doc_type') as string

  // Generate doc number
  const { count } = await db.from('documents').select('*', { count: 'exact', head: true }).eq('doc_type', docType)
  const year = new Date().getFullYear()
  const prefix = docType === 'invoice' ? 'СЧ' : docType === 'act' ? 'АКТ' : 'УПД'
  const docNumber = `${prefix}-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`

  await db.from('documents').insert({
    order_id: orderId,
    doc_type: docType,
    doc_number: docNumber,
    issued_at: new Date().toISOString().split('T')[0],
    due_date: (formData.get('due_date') as string) || null,
    file_url: null,
    tinkoff_status: null,
    notes: null,
  })

  revalidatePath(`/orders/${orderId}`)
  redirect(`/orders/${orderId}`)
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export async function saveSettingsAction(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any
  const keys = [
    'company_name', 'inn', 'address', 'bank_name', 'bik',
    'korr_account', 'bank_account', 'vat',
    'telegram_bot_token', 'telegram_chat_id',
    'tinkoff_terminal_key', 'tinkoff_password',
    'fuel_price', 'dadata_token',
  ]

  for (const key of keys) {
    const value = formData.get(key) as string
    await db.from('settings').upsert({ key, value }, { onConflict: 'key' })
  }

  revalidatePath('/settings')
  redirect('/settings')
}
