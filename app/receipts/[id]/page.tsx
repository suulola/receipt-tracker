'use client'

import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Info } from 'lucide-react'
import { fmtOrDash, formatDate } from '@/lib/utils'
import { useReceiptQuery } from '@/lib/hooks/useReceipts'
import { StoreMark } from '@/components/StoreMark'

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '6px 8px 10px' }}>
      <button
        onClick={onBack}
        style={{
          width: 40, height: 40, borderRadius: 'var(--r-full)', border: 'none',
          background: 'transparent', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'var(--ink-700)', cursor: 'pointer',
        }}
        aria-label="Back"
      >
        <ChevronLeft size={22} strokeWidth={1.9} />
      </button>
      <span style={{ font: '600 17px/22px var(--font-sans)', color: 'var(--ink-900)' }}>{title}</span>
      <span style={{ width: 40 }} />
    </div>
  )
}

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: receipt, isPending, error } = useReceiptQuery(id)

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--bg)', color: 'var(--ink-400)', font: '400 14px/20px var(--font-sans)' }}>
        Loading…
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-6 text-center" style={{ background: 'var(--bg)' }}>
        <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--ink-500)' }}>{error?.message ?? 'Receipt not found'}</p>
        <button onClick={() => router.back()} style={{ font: '500 14px/20px var(--font-sans)', color: 'var(--green-600)', background: 'none', border: 'none', cursor: 'pointer' }}>
          Go back
        </button>
      </div>
    )
  }

  const store = receipt.store
  const storeName = `${store.name}${store.branch ? ` ${store.branch}` : ''}`
  const purchaseDateStr = formatDate(receipt.purchaseDate)
  const totalSavings = receipt.items.reduce((s, i) => s + (i.savings ?? 0), 0)

  return (
    <main className="flex flex-col min-h-dvh" style={{ background: 'var(--bg)' }}>
      <div style={{ padding: '4px 12px 0' }}>
        <TopBar title="Receipt" onBack={() => router.back()} />
      </div>

      <div className="flex-1 overflow-y-auto pb-8" style={{ padding: '0 var(--gutter)' }}>
        {/* Store hero */}
        <div className="flex items-center" style={{ gap: 13, paddingBottom: 18 }}>
          <StoreMark name={store.name} size={52} />
          <div className="flex-1 min-w-0">
            <h2 style={{ font: '700 21px/26px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--ink-900)' }}>{storeName}</h2>
            <span style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-500)', marginTop: 2, display: 'block' }}>
              {[purchaseDateStr, store.city].filter(Boolean).join(' · ')}
              {receipt.items.length > 0 && ` · ${receipt.items.length} items`}
            </span>
          </div>
          <div className="flex flex-col items-end" style={{ flexShrink: 0 }}>
            <span style={{ font: '600 11px/14px var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)' }}>Total</span>
            {receipt.total != null && (
              <span style={{ font: '600 22px/26px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)', letterSpacing: '-0.01em' }}>
                ${receipt.total.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Items */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
          marginBottom: 12,
        }}>
          {receipt.items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center"
              style={{ gap: 12, padding: '13px 15px', borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
            >
              <div className="flex-1 min-w-0">
                <p style={{ font: '500 16px/24px var(--font-sans)', color: 'var(--ink-900)' }}>{item.rawName}</p>
                {item.quantity != null && (
                  <p style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-500)', marginTop: 1 }}>
                    {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                    {item.unitPrice != null ? ` @ ${fmtOrDash(item.unitPrice)}/${item.unit ?? 'ea'}` : ''}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end" style={{ gap: 2, flexShrink: 0 }}>
                <span style={{ font: '500 14px/18px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>
                  {fmtOrDash(item.totalPrice)}
                </span>
                {item.savings != null && item.savings > 0 && (
                  <span style={{ font: '500 12px/16px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--green-600)' }}>
                    −{fmtOrDash(item.savings)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals footer */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
          marginBottom: 12,
        }}>
          {totalSavings > 0 && (
            <div className="flex justify-between" style={{ padding: '12px 15px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--green-700)' }}>Total savings</span>
              <span style={{ font: '500 14px/18px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--green-700)' }}>−{fmtOrDash(totalSavings)}</span>
            </div>
          )}
          {receipt.subtotal != null && (
            <div className="flex justify-between" style={{ padding: '12px 15px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--ink-600)' }}>Subtotal</span>
              <span style={{ font: '500 14px/18px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>{fmtOrDash(receipt.subtotal)}</span>
            </div>
          )}
          {receipt.tax != null && (
            <div className="flex justify-between" style={{ padding: '12px 15px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--ink-600)' }}>Tax (HST/GST)</span>
              <span style={{ font: '500 14px/18px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>{fmtOrDash(receipt.tax)}</span>
            </div>
          )}
          {receipt.total != null && (
            <div className="flex justify-between" style={{ padding: '14px 15px' }}>
              <span style={{ font: '600 17px/22px var(--font-sans)', color: 'var(--ink-900)' }}>Total</span>
              <span style={{ font: '600 17px/22px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>{fmtOrDash(receipt.total)}</span>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center" style={{ gap: 7, padding: '12px 4px' }}>
          <Info size={15} color="var(--ink-400)" strokeWidth={1.9} />
          <span style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-400)' }}>
            Go to Search to compare prices across stores.
          </span>
        </div>
      </div>
    </main>
  )
}
