import { createClientAction } from '@/app/actions'
import Link from 'next/link'

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/clients" className="text-sm text-gray-500 hover:text-gray-900">← Клиенты</Link>
        <h1 className="mt-2 text-2xl font-bold">Новый клиент</h1>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form action={createClientAction} className="space-y-4 max-w-lg">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Название / ФИО *</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="ООО Ромашка или Иванов И.И."
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Телефон</label>
            <input
              name="phone"
              type="tel"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="+7 (000) 000-00-00"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Примечания</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 resize-none"
              placeholder="Дополнительная информация"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Создать клиента
            </button>
            <Link
              href="/clients"
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
