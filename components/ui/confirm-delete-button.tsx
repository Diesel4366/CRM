'use client'

import type { ReactNode } from 'react'

export function ConfirmDeleteButton({
  action,
  message,
  inputs,
  className,
  children,
}: {
  action: (fd: FormData) => Promise<void>
  message: string
  inputs: Record<string, string>
  className?: string
  children: ReactNode
}) {
  return (
    <form action={action}>
      {Object.entries(inputs).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        className={className}
        onClick={e => {
          if (!confirm(message)) e.preventDefault()
        }}
      >
        {children}
      </button>
    </form>
  )
}
