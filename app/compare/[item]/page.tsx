'use client'

import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Sparkles, Award } from 'lucide-react'
import { fmtOrDash, formatDate } from '@/lib/utils'
import { groupByStore, getDistinctUnits } from '@/lib/compare'
import { useCompareQuery, useAnalyseMutation } from '@/lib/hooks/useCompare'
import { StoreMark } from '@/components/StoreMark'
import type { StoreGroup } from '@/lib/types/api'

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

function StoreRow({ group, rank, bestPrice }: { group: StoreGroup; rank: number; bestPrice: number | null }) {
  const isBest = rank === 1
  const delta = group.bestPricePerUnit != null && bestPrice != null && !isBest
    ? group.bestPricePerUnit - bestPrice
    : null

  return (
    <div
      className="flex items-center"
      style={{
        gap: 12, padding: '13px 15px',
        background: isBest ? 'var(--amber-50)' : undefined,
      }}
    >
      <span style={{ color: 'var(--ink-400)', width: 16, textAlign: 'center', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
        {rank}
      </span>
      <StoreMark name={group.storeName} size={34} />
      <div className="flex-1 min-w-0">
        <p style={{ font: '500 16px/24px var(--font-sans)', color: 'var(--ink-900)' }}>
          {group.storeName}{group.storeBranch ? ` ${group.storeBranch}` : ''}
        </p>
        <p style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-500)', marginTop: 1 }}>
          {group.storeCity ?? ''} · {group.rows.length} purchase{group.rows.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex flex-col items-end" style={{ gap: 4, flexShrink: 0 }}>
        {isBest ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--amber-400)', color: '#3d2800',
            font: '700 12px/16px var(--font-sans)', padding: '5px 11px',
            borderRadius: 'var(--r-full)',
          }}>
            Cheapest
          </span>
        ) : delta != null ? (
          <span style={{ font: '600 12px/16px var(--font-mono)', color: delta > 1 ? 'var(--coral-500)' : 'var(--green-600)', fontVariantNumeric: 'tabular-nums' }}>
            +${delta.toFixed(2)}
          </span>
        ) : null}
        {group.bestPricePerUnit != null && group.bestUnit && (
          <span style={{ font: '600 17px/22px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>
            ${group.bestPricePerUnit.toFixed(2)}/{group.bestUnit}
          </span>
        )}
      </div>
    </div>
  )
}

export default function CompareDetailPage() {
  const { item: rawItem } = useParams<{ item: string }>()
  const router = useRouter()
  const item = decodeURIComponent(rawItem)

  const { data, isPending, error } = useCompareQuery(item)
  const results = data?.results ?? []
  const analyseMutation = useAnalyseMutation(item, results)

  const groups = groupByStore(results)
  const units = getDistinctUnits(results)
  const unitsAgree = units.length <= 1
  const withPpu = results.filter(r => r.pricePerUnit != null)
  const overallBest = unitsAgree && withPpu.length > 0
    ? withPpu.reduce((a, b) => a.pricePerUnit! <= b.pricePerUnit! ? a : b)
    : null
  const bestPpu = groups[0]?.bestPricePerUnit ?? null

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--bg)', color: 'var(--ink-400)', font: '400 14px/20px var(--font-sans)' }}>
        Loading…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-6 text-center" style={{ background: 'var(--bg)' }}>
        <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--ink-500)' }}>{error.message}</p>
        <button onClick={() => router.back()} style={{ font: '500 14px/20px var(--font-sans)', color: 'var(--green-600)', background: 'none', border: 'none', cursor: 'pointer' }}>Go back</button>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-6 text-center" style={{ background: 'var(--bg)' }}>
        <p style={{ font: '600 17px/22px var(--font-sans)', color: 'var(--ink-900)' }}>No purchases found</p>
        <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--ink-400)' }}>Scan a receipt with "{item}" to start comparing.</p>
        <button onClick={() => router.back()} style={{ font: '500 14px/20px var(--font-sans)', color: 'var(--green-600)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}>Go back</button>
      </div>
    )
  }

  return (
    <main className="flex flex-col min-h-dvh" style={{ background: 'var(--bg)' }}>
      <div style={{ padding: '4px 12px 0' }}>
        <TopBar title="Where to buy" onBack={() => router.back()} />
      </div>

      <div className="flex-1 overflow-y-auto pb-8" style={{ padding: '0 var(--gutter)' }}>
        {/* Item hero */}
        <div className="flex items-start justify-between" style={{ gap: 12, paddingBottom: 16 }}>
          <div>
            <h1 style={{ font: '700 26px/30px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--ink-900)', textTransform: 'capitalize' }}>
              {item}
            </h1>
            <span style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-500)', marginTop: 4, display: 'block' }}>
              {results.length} purchase{results.length !== 1 ? 's' : ''} · {groups.length} store{groups.length !== 1 ? 's' : ''}
            </span>
          </div>
          {groups.length >= 2 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'var(--green-600)', color: '#fff',
              font: '700 12px/16px var(--font-sans)', padding: '5px 11px',
              borderRadius: 'var(--r-full)', flexShrink: 0, marginTop: 4,
            }}>
              <Award size={13} strokeWidth={2} />
              Lowest in stock
            </span>
          )}
        </div>

        {/* Best price callout */}
        {overallBest && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            background: 'linear-gradient(165deg, var(--green-50), #F5FAF4)',
            border: '1px solid var(--green-100)', borderRadius: 'var(--r-xl)',
            padding: '16px 18px', marginBottom: 24,
          }}>
            <div className="flex flex-col" style={{ gap: 7, flex: 1, minWidth: 0 }}>
              <span style={{ font: '600 11px/14px var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green-700)' }}>
                Cheapest right now
              </span>
              <div className="flex items-center" style={{ gap: 9 }}>
                <StoreMark name={overallBest.storeName} size={34} />
                <span style={{ font: '500 16px/24px var(--font-sans)', color: 'var(--ink-900)' }}>{overallBest.storeName}</span>
              </div>
              <span style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-500)' }}>
                seen {formatDate(overallBest.purchaseDate) ?? 'recently'}
              </span>
            </div>
            <div className="flex flex-col items-end" style={{ gap: 3, flexShrink: 0 }}>
              <span style={{ font: '700 30px/34px var(--font-mono)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: 'var(--green-800)' }}>
                ${overallBest.pricePerUnit!.toFixed(2)}/{overallBest.unit}
              </span>
            </div>
          </div>
        )}

        {/* Units disclaimer */}
        {!unitsAgree && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'var(--amber-50)', border: '1px solid var(--amber-100)',
            borderRadius: 'var(--r-md)', padding: '10px 13px', marginBottom: 16,
          }}>
            <p style={{ font: '400 12px/16px var(--font-sans)', color: 'var(--amber-700)' }}>
              Different units ({units.join(', ')}) — per-unit prices can't be ranked against each other.
            </p>
          </div>
        )}

        {/* AI analyse */}
        <div style={{ marginBottom: 20 }}>
          {analyseMutation.isSuccess && analyseMutation.data?.recommendation ? (
            <div style={{
              background: 'linear-gradient(168deg, var(--green-50), #F6FBF5)',
              border: '1px solid var(--green-100)', borderRadius: 'var(--r-lg)', padding: '15px 16px',
            }}>
              <div className="flex items-center" style={{ gap: 8, marginBottom: 7 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 'var(--r-full)',
                  background: 'var(--green-100)', color: 'var(--green-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={16} strokeWidth={2} />
                </span>
                <span style={{ font: '600 11px/14px var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green-700)' }}>
                  Tally's take
                </span>
              </div>
              <p style={{ font: '400 16px/24px var(--font-sans)', color: 'var(--ink-700)', margin: 0 }}>
                {analyseMutation.data.recommendation}
              </p>
            </div>
          ) : (
            <button
              onClick={() => analyseMutation.mutate()}
              disabled={analyseMutation.isPending}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                background: 'var(--surface)', border: '1px solid var(--green-200)',
                borderRadius: 'var(--r-md)', padding: '13px 16px',
                font: '500 16px/24px var(--font-sans)', color: analyseMutation.isPending ? 'var(--ink-500)' : 'var(--green-700)',
                cursor: analyseMutation.isPending ? 'default' : 'pointer',
                transition: 'background 120ms',
              }}
            >
              <Sparkles size={18} strokeWidth={2} color={analyseMutation.isPending ? 'var(--ink-400)' : 'var(--green-500)'} />
              {analyseMutation.isPending ? 'Reading your price history…' : 'Analyse my buying options'}
            </button>
          )}
          {analyseMutation.isError && (
            <p style={{ font: '400 12px/16px var(--font-sans)', color: 'var(--coral-500)', marginTop: 8 }}>
              {analyseMutation.error?.message ?? 'Analysis failed'}
            </p>
          )}
        </div>

        {/* All stores */}
        <span style={{ font: '600 11px/14px var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)', display: 'block', marginBottom: 10 }}>
          All stores
        </span>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
          marginBottom: 20,
        }}>
          {groups.map((group, i) => (
            <div key={group.key} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
              <StoreRow group={group} rank={i + 1} bestPrice={bestPpu} />
              {/* Purchase rows */}
              {group.rows.map(row => (
                <div
                  key={row.receiptItemId}
                  className="flex items-center"
                  style={{
                    gap: 12, padding: '10px 15px 10px 43px',
                    background: 'var(--paper-50)',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--ink-700)' }}>{row.rawName}</p>
                    <p style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-400)', marginTop: 1 }}>
                      {formatDate(row.purchaseDate) ?? 'Unknown date'}
                      {row.quantity != null && ` · ${row.quantity}${row.unit ? ` ${row.unit}` : ''}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end" style={{ gap: 1, flexShrink: 0 }}>
                    <span style={{ font: '500 14px/18px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>
                      ${row.totalPrice.toFixed(2)}
                    </span>
                    {row.pricePerUnit != null && row.unit && (
                      <span style={{ font: '500 12px/16px var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-400)' }}>
                        ${row.pricePerUnit.toFixed(2)}/{row.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
