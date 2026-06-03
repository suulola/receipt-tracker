'use client'

import Link from 'next/link'
import { Bell, ChevronRight, ScanLine } from 'lucide-react'
import { fmt } from '@/lib/utils'
import { useReceiptsQuery } from '@/lib/hooks/useReceipts'
import { StoreMark } from '@/components/StoreMark'
import type { ReceiptListItem } from '@/lib/types/api'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function relativeDate(purchaseDate: string | null, createdAt: string): string {
  const raw = purchaseDate ?? createdAt
  const d = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`)
  d.setHours(0, 0, 0, 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.getTime() === today.getTime()) return 'Today'
  if (d.getTime() === yesterday.getTime()) return 'Yesterday'
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

function ReceiptCard({ r }: { r: ReceiptListItem }) {
  return (
    <Link
      href={`/receipts/${r.id}`}
      className="block active:scale-[0.99] transition-transform no-underline"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div className="flex items-center" style={{ gap: 12, padding: '14px 15px' }}>
        <StoreMark name={r.storeName} />
        <div className="flex-1 min-w-0">
          <p className="truncate" style={{ font: '500 16px/24px var(--font-sans)', color: 'var(--ink-900)' }}>
            {r.storeName}{r.storeBranch ? ` ${r.storeBranch}` : ''}
          </p>
          <p style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-500)', marginTop: 1 }}>
            {relativeDate(r.purchaseDate, r.createdAt)} · {r.itemCount} item{r.itemCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col items-end" style={{ gap: 3, flexShrink: 0 }}>
          {r.total != null && (
            <span style={{ font: '600 17px/22px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>
              ${r.total.toFixed(2)}
            </span>
          )}
          <span style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-400)' }}>tap to view</span>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 15px' }}
      className="flex items-center gap-3">
      <div className="rounded-xl bg-neutral-100 animate-pulse shrink-0" style={{ width: 40, height: 40 }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded animate-pulse w-2/3" style={{ background: 'var(--paper-100)' }} />
        <div className="h-2.5 rounded animate-pulse w-1/3" style={{ background: 'var(--paper-100)' }} />
      </div>
      <div className="h-4 w-12 rounded animate-pulse" style={{ background: 'var(--paper-100)' }} />
    </div>
  )
}

export default function HomePage() {
  const { data: receipts = [], isPending, error } = useReceiptsQuery()

  const now = new Date()
  const thisMonth = receipts.filter(r => {
    const raw = r.purchaseDate ?? r.createdAt
    const d = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthTotal = thisMonth.reduce((s, r) => s + (r.total ?? 0), 0)
  const recent = receipts.slice(0, 2)

  return (
    <main className="flex flex-col min-h-dvh" style={{ background: 'var(--bg)', paddingBottom: 'var(--tabbar-h)' }}>
      {/* Header */}
      <div style={{ padding: '24px var(--gutter) 8px' }}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ font: '500 14px/20px var(--font-sans)', color: 'var(--ink-500)' }}>{getGreeting()}</p>
            <h1 style={{ font: '700 26px/30px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--ink-900)', marginTop: 2 }}>
              Your prices
            </h1>
          </div>
          <button
            style={{
              width: 40, height: 40, borderRadius: 'var(--r-full)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-700)', cursor: 'pointer',
            }}
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '8px var(--gutter) 0' }}>
        {/* Hero card */}
        <div style={{
          background: 'linear-gradient(168deg, var(--green-50) 0%, #F4FAF4 55%, var(--paper-50) 100%)',
          border: '1px solid var(--green-100)',
          borderRadius: 'var(--r-xl)',
          padding: 18,
          marginBottom: 24,
        }}>
          <p style={{ font: '600 11px/14px var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green-700)' }}>
            {!isPending && thisMonth.length > 0 ? 'Spent this month' : 'Get started'}
          </p>

          {isPending ? (
            <div className="h-10 w-32 rounded animate-pulse my-3" style={{ background: 'var(--green-100)' }} />
          ) : thisMonth.length > 0 ? (
            <div style={{ margin: '6px 0' }}>
              <span style={{ font: '700 40px/44px var(--font-mono)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: 'var(--green-800)' }}>
                {fmt(monthTotal)}
              </span>
              <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--green-800)', opacity: 0.75, marginTop: 4 }}>
                across {thisMonth.length} receipt{thisMonth.length !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--green-800)', opacity: 0.75, margin: '10px 0' }}>
              Scan your first receipt to start tracking prices.
            </p>
          )}

          <Link
            href="/scan"
            className="flex items-center justify-center no-underline active:scale-[0.98] transition-transform"
            style={{
              gap: 8, width: '100%', padding: '13px 18px', marginTop: 14,
              background: 'var(--green-500)', color: '#fff',
              font: '500 16px/24px var(--font-sans)',
              borderRadius: 'var(--r-md)', border: 'none',
              boxShadow: '0 1px 2px rgba(14,107,64,.25)',
            }}
          >
            <ScanLine size={18} strokeWidth={2} />
            Add a receipt
          </Link>
        </div>

        {/* Recent receipts */}
        {error && (
          <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--coral-500)', marginBottom: 16 }}>
            Could not load receipts: {error.message}
          </p>
        )}

        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span style={{ font: '600 11px/14px var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)' }}>
            Recent receipts
          </span>
          {receipts.length > 2 && (
            <Link href="/history" style={{ font: '500 14px/20px var(--font-sans)', color: 'var(--green-600)' }}>
              See all
            </Link>
          )}
        </div>

        <div className="flex flex-col" style={{ gap: 10, marginBottom: 8 }}>
          {isPending ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : recent.length === 0 ? (
            <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--ink-400)', padding: '20px 0', textAlign: 'center' }}>
              No receipts yet
            </p>
          ) : (
            recent.map(r => <ReceiptCard key={r.id} r={r} />)
          )}
        </div>
      </div>
    </main>
  )
}
