import { createClient } from '@/lib/supabase/server'
import { saveSettingsAction } from '@/app/actions'
import type { Setting } from '@/types/database'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settingsRows } = await supabase.from('settings').select('*')
  const settings: Record<string, string> = {}
  for (const row of (settingsRows as Setting[] ?? [])) {
    settings[row.key] = row.value ?? ''
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Настройки</h1>

      <form action={saveSettingsAction} className="space-y-6">
        {/* Company */}
        <div className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold border-b pb-2">Реквизиты ИП</h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Наименование организации</label>
            <input
              name="company_name"
              defaultValue={settings.company_name ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">ИНН</label>
              <input
                name="inn"
                defaultValue={settings.inn ?? ''}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">НДС</label>
              <input
                name="vat"
                defaultValue={settings.vat ?? 'Без НДС'}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Юридический адрес</label>
            <input
              name="address"
              defaultValue={settings.address ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        {/* Bank */}
        <div className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold border-b pb-2">Банковские реквизиты</h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Наименование банка</label>
            <input
              name="bank_name"
              defaultValue={settings.bank_name ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">БИК</label>
              <input
                name="bik"
                defaultValue={settings.bik ?? ''}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Расчётный счёт</label>
              <input
                name="bank_account"
                defaultValue={settings.bank_account ?? ''}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Корреспондентский счёт</label>
            <input
              name="korr_account"
              defaultValue={settings.korr_account ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        {/* Telegram */}
        <div className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold border-b pb-2">Telegram-бот</h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Bot Token</label>
            <input
              name="telegram_bot_token"
              type="password"
              defaultValue={settings.telegram_bot_token ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="1234567890:AABBccdd..."
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Chat ID</label>
            <input
              name="telegram_chat_id"
              defaultValue={settings.telegram_chat_id ?? ''}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="-100123456789"
            />
          </div>
        </div>

        {/* Tinkoff */}
        <div className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold border-b pb-2">ТБанк (эквайринг)</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Terminal Key</label>
              <input
                name="tinkoff_terminal_key"
                defaultValue={settings.tinkoff_terminal_key ?? ''}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                name="tinkoff_password"
                type="password"
                defaultValue={settings.tinkoff_password ?? ''}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Сохранить настройки
        </button>
      </form>
    </div>
  )
}
