'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Camera, ChevronRight, Receipt, ShoppingBag } from 'lucide-react'
import type { ReceiptListItem } from '@/lib/types/api'
import { fmt, dateGroupLabel } from '@/lib/utils'
import { apiUrl } from '@/lib/config'

function groupByDate(receipts: ReceiptListItem[]): [string, ReceiptListItem[]][] {
  const groups = new Map<string, ReceiptListItem[]>()

  for (const r of receipts) {
    const raw = r.purchaseDate ?? r.createdAt
    const label = dateGroupLabel(raw)
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)?.push(r)
  }

  return Array.from(groups.entries())
}

function ReceiptSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden divide-y divide-neutral-100 shadow-sm">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-neutral-100 rounded animate-pulse w-2/3" />
            <div className="h-2.5 bg-neutral-100 rounded animate-pulse w-1/3" />
          </div>
          <div className="h-3 bg-neutral-100 rounded animate-pulse w-12" />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${apiUrl}/receipts`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`)
        return r.json()
      })
      .then(setReceipts)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const groups = groupByDate(receipts)

  return (
    <main className="flex flex-col min-h-dvh bg-neutral-50">
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-100 px-4 py-4">
        <h1 className="text-xl font-semibold text-neutral-900">Receipts</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        {loading && (
          <div className="mt-5 px-4 space-y-5">
            <div className="h-3 bg-neutral-100 rounded animate-pulse w-16" />
            <ReceiptSkeleton />
          </div>
        )}

        {error && (
          <div className="mx-4 mt-6 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">
            Could not load receipts: {error}
          </div>
        )}

        {!loading && !error && receipts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
              <ShoppingBag size={28} className="text-neutral-400" />
            </div>
            <div>
              <p className="text-neutral-700 font-medium">No receipts yet</p>
              <p className="text-neutral-400 text-sm mt-1">Scan your first receipt to get started</p>
            </div>
          </div>
        )}

        {groups.map(([label, items]) => (
          <section key={label} className="mt-5 px-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              {label}
            </p>
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-neutral-100 shadow-sm">
              {items.map((r) => (
                <Link
                  key={r.id}
                  href={`/receipts/${r.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Receipt size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {r.storeName}{r.storeBranch ? ` ${r.storeBranch}` : ''}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {r.storeCity ? `${r.storeCity} · ` : ''}{r.itemCount} item{r.itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {fmt(r.total) && (
                      <span className="text-sm font-semibold text-neutral-900">{fmt(r.total)}</span>
                    )}
                    <ChevronRight size={16} className="text-neutral-300" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-neutral-50 to-transparent pointer-events-none">
        <Link
          href="/scan"
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all text-white font-semibold text-sm py-4 rounded-2xl shadow-lg shadow-emerald-500/30 pointer-events-auto"
        >
          <Camera size={20} />
          Scan Receipt
        </Link>
      </div>
    </main>
  )
}
