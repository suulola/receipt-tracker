'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Info, Trash2 } from 'lucide-react'
import { fmtOrDash, formatDate } from '@/lib/utils'
import { useReceiptQuery, useDeleteReceiptMutation } from '@/lib/hooks/useReceipts'
import { StoreMark } from '@/components/StoreMark'

function TopBar({ title, onBack, onDelete }: { title: string; onBack: () => void; onDelete: () => void }) {
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
      <button
        onClick={onDelete}
        style={{
          width: 40, height: 40, borderRadius: 'var(--r-full)', border: 'none',
          background: 'transparent', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'var(--ink-400)', cursor: 'pointer',
        }}
        aria-label="Delete receipt"
      >
        <Trash2 size={18} strokeWidth={1.9} />
      </button>
    </div>
  )
}

function DeleteConfirmSheet({ onConfirm, onCancel, isPending }: { onConfirm: () => void; onCancel: () => void; isPending: boolean }) {
  return (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center"
      style={{ zIndex: 50, background: 'rgba(0,0,0,0.35)' }}
      onClick={onCancel}
    >
      <div
        className="w-full md:w-auto md:min-w-80"
        style={{
          background: 'var(--surface)', borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
          padding: '24px 20px 32px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ font: '600 17px/24px var(--font-sans)', color: 'var(--ink-900)', marginBottom: 6 }}>Delete receipt?</p>
        <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--ink-500)', marginBottom: 24 }}>
          This will permanently remove the receipt and all its line items.
        </p>
        <div className="flex flex-col" style={{ gap: 10 }}>
          <button
            onClick={onConfirm}
            disabled={isPending}
            style={{
              padding: '13px 18px', borderRadius: 'var(--r-md)', border: 'none',
              background: '#dc2626', color: '#fff',
              font: '500 16px/24px var(--font-sans)', cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
          <button
            onClick={onCancel}
            disabled={isPending}
            style={{
              padding: '13px 18px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--ink-700)', font: '500 16px/24px var(--font-sans)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const deleteMutation = useDeleteReceiptMutation()

  const { data: receipt, isPending, error } = useReceiptQuery(id)

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => router.replace('/'),
    })
  }

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
      {showDelete && (
        <DeleteConfirmSheet
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          isPending={deleteMutation.isPending}
        />
      )}
      <div style={{ padding: '4px 12px 0' }}>
        <TopBar title="Receipt" onBack={() => router.back()} onDelete={() => setShowDelete(true)} />
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
            <Link
              key={item.id}
              href={`/compare/${encodeURIComponent(item.normalizedName)}`}
              className="flex items-center no-underline transition-colors"
              style={{
                gap: 12, padding: '13px 15px',
                borderTop: i > 0 ? '1px solid var(--border)' : undefined,
                background: 'transparent',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--paper-50)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
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
              <div className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
                <div className="flex flex-col items-end" style={{ gap: 2 }}>
                  <span style={{ font: '500 14px/18px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>
                    {fmtOrDash(item.totalPrice)}
                  </span>
                  {item.savings != null && item.savings > 0 && (
                    <span style={{ font: '500 12px/16px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--green-600)' }}>
                      −{fmtOrDash(item.savings)}
                    </span>
                  )}
                </div>
                <ChevronRight size={16} strokeWidth={1.9} color="var(--ink-300)" />
              </div>
            </Link>
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
            Tap an item to compare prices across stores.
          </span>
        </div>
      </div>
    </main>
  )
}
