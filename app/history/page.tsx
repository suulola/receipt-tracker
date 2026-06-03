'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { groupByDate } from '@/lib/utils'
import { useReceiptsQuery } from '@/lib/hooks/useReceipts'
import { StoreMark } from '@/components/StoreMark'

export default function HistoryPage() {
  const { data: receipts = [], isPending, error } = useReceiptsQuery()
  const groups = groupByDate(receipts)

  return (
    <main className="flex flex-col min-h-dvh" style={{ background: 'var(--bg)', paddingBottom: 'var(--tabbar-h)' }}>
      <div style={{ padding: '24px var(--gutter) 12px' }}>
        <h1 style={{ font: '700 26px/30px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--ink-900)' }}>
          Receipts
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 var(--gutter)' }}>
        {error && (
          <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--coral-500)', marginBottom: 16 }}>
            Could not load receipts: {error.message}
          </p>
        )}

        {isPending && (
          <div className="flex flex-col" style={{ gap: 20 }}>
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="h-3 w-20 rounded animate-pulse mb-3" style={{ background: 'var(--paper-200)' }} />
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                  {[1, 2].map(j => (
                    <div key={j} className="flex items-center gap-3 px-4 py-4" style={{ borderTop: j > 1 ? '1px solid var(--border)' : undefined }}>
                      <div className="rounded-xl animate-pulse shrink-0" style={{ width: 44, height: 44, background: 'var(--paper-100)' }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 rounded animate-pulse w-2/3" style={{ background: 'var(--paper-100)' }} />
                        <div className="h-2.5 rounded animate-pulse w-1/3" style={{ background: 'var(--paper-100)' }} />
                      </div>
                      <div className="h-4 w-14 rounded animate-pulse" style={{ background: 'var(--paper-100)' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isPending && receipts.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p style={{ font: '500 16px/24px var(--font-sans)', color: 'var(--ink-700)' }}>No receipts yet</p>
            <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--ink-400)' }}>Scan your first receipt to get started</p>
          </div>
        )}

        {groups.map(([label, items]) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <span style={{
              display: 'block', marginBottom: 10,
              font: '600 11px/14px var(--font-sans)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--ink-400)',
            }}>
              {label}
            </span>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}>
              {items.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/receipts/${r.id}`}
                  className="flex items-center no-underline active:bg-[var(--paper-50)] transition-colors"
                  style={{
                    gap: 13, padding: '15px 16px',
                    borderTop: i > 0 ? '1px solid var(--border)' : undefined,
                  }}
                >
                  <StoreMark name={r.storeName} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ font: '600 17px/22px var(--font-sans)', color: 'var(--ink-900)' }}>
                      {r.storeName}{r.storeBranch ? ` ${r.storeBranch}` : ''}
                    </p>
                    <p style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-500)', marginTop: 2 }}>
                      {r.storeCity ?? 'Kitchener'} · {r.itemCount} item{r.itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center" style={{ gap: 6, flexShrink: 0 }}>
                    {r.total != null && (
                      <span style={{ font: '600 17px/22px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>
                        ${r.total.toFixed(2)}
                      </span>
                    )}
                    <ChevronRight size={18} color="var(--ink-300)" strokeWidth={1.9} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        <div style={{ height: 8 }} />
      </div>
    </main>
  )
}
