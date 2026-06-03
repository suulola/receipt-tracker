import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ReceiptListItem } from '@/lib/types/api'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as a CAD dollar amount, e.g. 24.99 → "$24.99". Returns null if value is null/undefined. */
export function fmt(n: number | null | undefined): string | null {
  return n != null ? `$${n.toFixed(2)}` : null
}

/** Format a number as a dollar amount with a dash fallback, e.g. undefined → "—". */
export function fmtOrDash(n: number | null | undefined): string {
  return n != null ? `$${n.toFixed(2)}` : '—'
}

/** Format an ISO date string for display, e.g. "2026-06-03" → "June 3, 2026". */
export function formatDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`)
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Parse a price string into a non-negative number, or null if invalid. */
export function parsePrice(value: string): number | null {
  const n = parseFloat(value)
  return isNaN(n) || n < 0 ? null : n
}

/** Group receipts by purchase date into labelled sections for display. */
export function groupByDate(receipts: ReceiptListItem[]): [string, ReceiptListItem[]][] {
  const groups = new Map<string, ReceiptListItem[]>()
  for (const r of receipts) {
    const raw = r.purchaseDate ?? r.createdAt
    const label = dateGroupLabel(raw)
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)?.push(r)
  }
  return Array.from(groups.entries())
}

/** Group an ISO date string into a human-readable label: Today, Yesterday, or a month/day string. */
export function dateGroupLabel(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`)
  d.setHours(0, 0, 0, 0)

  if (d.getTime() === today.getTime()) return 'Today'
  if (d.getTime() === yesterday.getTime()) return 'Yesterday'
  return d.toLocaleDateString('en-CA', {
    month: 'long',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}
