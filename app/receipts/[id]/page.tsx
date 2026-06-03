'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Hash, User } from 'lucide-react'
import type { ReceiptOut } from '@/lib/types/api'
import { fmt, fmtOrDash, formatDate } from '@/lib/utils'
import { apiUrl } from '@/lib/config'

const CATEGORY_COLORS: Record<string, string> = {
  fruits:         'bg-green-100 text-green-700',
  vegetables:     'bg-lime-100 text-lime-700',
  dairy:          'bg-blue-100 text-blue-700',
  meat:           'bg-red-100 text-red-700',
  seafood:        'bg-cyan-100 text-cyan-700',
  bakery:         'bg-amber-100 text-amber-700',
  beverages:      'bg-sky-100 text-sky-700',
  snacks:         'bg-orange-100 text-orange-700',
  frozen:         'bg-indigo-100 text-indigo-700',
  canned_goods:   'bg-yellow-100 text-yellow-700',
  household:      'bg-purple-100 text-purple-700',
  cleaning:       'bg-teal-100 text-teal-700',
  stationery:     'bg-rose-100 text-rose-700',
  electronics:    'bg-violet-100 text-violet-700',
  clothing:       'bg-pink-100 text-pink-700',
  health_beauty:  'bg-fuchsia-100 text-fuchsia-700',
  tools_hardware: 'bg-stone-100 text-stone-700',
  other:          'bg-neutral-100 text-neutral-600',
}

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [receipt, setReceipt] = useState<ReceiptOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${apiUrl}/receipts/${id}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`)
        return r.json()
      })
      .then((data: ReceiptOut) => {
        if (!data?.store) throw new Error('Invalid response from server')
        setReceipt(data)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-neutral-50 text-neutral-400 text-sm">
        Loading…
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-neutral-50 gap-3 px-6 text-center">
        <p className="text-neutral-500 text-sm">{error ?? 'Receipt not found'}</p>
        <button onClick={() => router.back()} className="text-sm text-emerald-600 font-medium">
          Go back
        </button>
      </div>
    )
  }

  const store = receipt.store
  const storeName = `${store.name}${store.branch ? ` ${store.branch}` : ''}`
  const storeLocation = [store.address, store.city, store.province, store.postalCode]
    .filter(Boolean)
    .join(', ')

  const purchaseDate = formatDate(receipt.purchaseDate)
  const totalSavings = receipt.items.reduce((sum, i) => sum + (i.savings ?? 0), 0)

  return (
    <main className="flex flex-col min-h-dvh bg-neutral-50">
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-100 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-neutral-900 truncate">{storeName}</h1>
          {purchaseDate && <p className="text-xs text-neutral-400">{purchaseDate}</p>}
        </div>
        {fmt(receipt.total) && (
          <span className="text-base font-bold text-neutral-900">{fmt(receipt.total)}</span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          {storeLocation && (
            <div className="flex items-start gap-3 px-4 py-3 border-b border-neutral-100">
              <MapPin size={16} className="text-neutral-400 mt-0.5 shrink-0" />
              <p className="text-sm text-neutral-600">{storeLocation}</p>
            </div>
          )}
          {purchaseDate && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
              <Calendar size={16} className="text-neutral-400 shrink-0" />
              <p className="text-sm text-neutral-600">{purchaseDate}</p>
            </div>
          )}
          {receipt.transactionNumber && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
              <Hash size={16} className="text-neutral-400 shrink-0" />
              <p className="text-sm text-neutral-600">Txn #{receipt.transactionNumber}</p>
            </div>
          )}
          {receipt.customerName && (
            <div className="flex items-center gap-3 px-4 py-3">
              <User size={16} className="text-neutral-400 shrink-0" />
              <p className="text-sm text-neutral-600">{receipt.customerName}</p>
            </div>
          )}
        </div>

        <div className="mx-4 mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            {receipt.items.length} item{receipt.items.length !== 1 ? 's' : ''}
          </p>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-neutral-100">
            {receipt.items.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{item.rawName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${CATEGORY_COLORS[item.categorySlug] ?? CATEGORY_COLORS.other}`}>
                      {item.categoryLabel}
                    </span>
                    {item.quantity != null && (
                      <span className="text-xs text-neutral-400">
                        {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                        {item.unitPrice != null ? ` @ ${fmtOrDash(item.unitPrice)}/${item.unit ?? 'ea'}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-neutral-900">{fmtOrDash(item.totalPrice)}</p>
                  {item.savings != null && item.savings > 0 && (
                    <p className="text-xs text-emerald-600">-{fmtOrDash(item.savings)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          {totalSavings > 0 && (
            <div className="flex justify-between px-4 py-3 border-b border-neutral-100">
              <span className="text-sm text-emerald-600">Total savings</span>
              <span className="text-sm font-medium text-emerald-600">-{fmtOrDash(totalSavings)}</span>
            </div>
          )}
          {receipt.subtotal != null && (
            <div className="flex justify-between px-4 py-3 border-b border-neutral-100">
              <span className="text-sm text-neutral-600">Subtotal</span>
              <span className="text-sm text-neutral-900">{fmtOrDash(receipt.subtotal)}</span>
            </div>
          )}
          {receipt.tax != null && (
            <div className="flex justify-between px-4 py-3 border-b border-neutral-100">
              <span className="text-sm text-neutral-600">Tax (HST/GST)</span>
              <span className="text-sm text-neutral-900">{fmtOrDash(receipt.tax)}</span>
            </div>
          )}
          {receipt.total != null && (
            <div className="flex justify-between px-4 py-4">
              <span className="text-base font-semibold text-neutral-900">Total</span>
              <span className="text-base font-bold text-neutral-900">{fmtOrDash(receipt.total)}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
