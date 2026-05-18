export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type KktStatus = 'active' | 'deregistered' | 'repair'
export type FnType = '15m' | '36m'
export type FnStatus = 'active' | 'expiring_soon' | 'expired' | 'replaced'
export type OfdStatus = 'active' | 'expiring_soon' | 'expired'
export type OrderStatus = 'draft' | 'confirmed' | 'in_progress' | 'done' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'invoiced' | 'paid' | 'partially_paid'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'tinkoff'
export type ItemType = 'kkt' | 'fn' | 'ofd' | 'visit' | 'service' | 'other' | 'bundle'
export type EventType = 'fn_replace' | 'registration' | 're_registration' | 'firmware' | 'repair' | 'ofd_connect' | 'ofd_renew'
export type DocType = 'invoice' | 'act' | 'upd'

export interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export interface LegalEntity {
  id: string
  client_id: string
  name: string
  inn: string
  kpp: string | null
  ogrn: string | null
  legal_address: string | null
  director: string | null
  notes: string | null
  created_at: string
}

export interface Outlet {
  id: string
  legal_entity_id: string
  name: string
  address: string | null
  contact_person: string | null
  contact_phone: string | null
  access_notes: string | null
  working_hours: string | null
  notes: string | null
  created_at: string
}

export interface Kkt {
  id: string
  outlet_id: string
  brand: string
  model: string
  serial_number: string
  reg_number: string | null
  firmware_version: string | null
  status: KktStatus
  notes: string | null
  created_at: string
}

export interface Fn {
  id: string
  kkt_id: string
  serial_number: string
  fn_type: FnType
  installed_at: string
  expires_at: string
  status: FnStatus
  replaced_by: string | null
  notes: string | null
  created_at: string
}

export interface OfdSubscription {
  id: string
  kkt_id: string
  provider: string
  login: string | null
  password_encrypted: string | null
  starts_at: string
  expires_at: string
  cost_price: number
  sell_price: number
  status: OfdStatus
  notes: string | null
  created_at: string
}

export interface CatalogItem {
  id: string
  name: string
  item_type: ItemType
  cost_price: number
  retail_price: number
  unit: string
  active: boolean
  validity_months: number | null
  fuel_consumption: number | null
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  client_id: string
  legal_entity_id: string | null
  outlet_id: string | null
  status: OrderStatus
  scheduled_at: string | null
  completed_at: string | null
  total_price: number
  total_cost: number
  total_profit: number
  payment_status: PaymentStatus
  payment_method: PaymentMethod | null
  tinkoff_invoice_id: string | null
  notes: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  item_type: ItemType
  name: string
  quantity: number
  unit: string
  cost_price: number
  unit_price: number
  kkt_id: string | null
  notes: string | null
  odometer_start: number | null
  odometer_end: number | null
  fuel_consumption: number | null
  created_at: string
}

export interface KktEvent {
  id: string
  kkt_id: string
  order_id: string | null
  event_type: EventType
  performed_at: string
  old_fn_id: string | null
  new_fn_id: string | null
  firmware_before: string | null
  firmware_after: string | null
  notes: string | null
  created_at: string
}

export interface Document {
  id: string
  order_id: string
  doc_type: DocType
  doc_number: string
  issued_at: string
  due_date: string | null
  file_url: string | null
  tinkoff_status: string | null
  notes: string | null
  created_at: string
}

export interface Setting {
  key: string
  value: string | null
  updated_at: string
}

export interface CatalogBundleItem {
  id: string
  bundle_id: string
  item_id: string
  quantity: number
  item?: CatalogItem
}

// Relations (joined queries)
export interface ClientWithRelations extends Client {
  legal_entities?: LegalEntityWithRelations[]
}

export interface LegalEntityWithRelations extends LegalEntity {
  outlets?: OutletWithRelations[]
}

export interface OutletWithRelations extends Outlet {
  kkt?: KktWithRelations[]
}

export interface KktWithRelations extends Kkt {
  fn?: Fn[]
  ofd_subscriptions?: OfdSubscription[]
  kkt_events?: KktEvent[]
}

export interface OrderWithRelations extends Order {
  client?: Client
  legal_entity?: LegalEntity
  outlet?: Outlet
  order_items?: OrderItem[]
  documents?: Document[]
}

export type Database = {
  kassamaster: {
    Tables: {
      clients: { Row: Client; Insert: Omit<Client, 'id' | 'created_at'>; Update: Partial<Omit<Client, 'id'>> }
      legal_entities: { Row: LegalEntity; Insert: Omit<LegalEntity, 'id' | 'created_at'>; Update: Partial<Omit<LegalEntity, 'id'>> }
      outlets: { Row: Outlet; Insert: Omit<Outlet, 'id' | 'created_at'>; Update: Partial<Omit<Outlet, 'id'>> }
      kkt: { Row: Kkt; Insert: Omit<Kkt, 'id' | 'created_at'>; Update: Partial<Omit<Kkt, 'id'>> }
      fn: { Row: Fn; Insert: Omit<Fn, 'id' | 'created_at'>; Update: Partial<Omit<Fn, 'id'>> }
      ofd_subscriptions: { Row: OfdSubscription; Insert: Omit<OfdSubscription, 'id' | 'created_at'>; Update: Partial<Omit<OfdSubscription, 'id'>> }
      catalog_items: { Row: CatalogItem; Insert: Omit<CatalogItem, 'id' | 'created_at'>; Update: Partial<Omit<CatalogItem, 'id'>> }
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'total_price' | 'total_cost' | 'total_profit'>; Update: Partial<Omit<Order, 'id'>> }
      order_items: { Row: OrderItem; Insert: Omit<OrderItem, 'id' | 'created_at'>; Update: Partial<Omit<OrderItem, 'id'>> }
      kkt_events: { Row: KktEvent; Insert: Omit<KktEvent, 'id' | 'created_at'>; Update: Partial<Omit<KktEvent, 'id'>> }
      documents: { Row: Document; Insert: Omit<Document, 'id' | 'created_at'>; Update: Partial<Omit<Document, 'id'>> }
      settings: { Row: Setting; Insert: Setting; Update: Partial<Setting> }
    }
  }
}
