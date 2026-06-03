'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Tag, X } from 'lucide-react'
import { useItemsQuery } from '@/lib/hooks/useItems'

const SUGGESTIONS = ['Bananas', 'Olive oil', 'Coffee', 'Eggs', 'Milk']

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { data: items = [], isPending, error } = useItemsQuery()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return items.filter(it => it.normalizedName.toLowerCase().includes(q))
  }, [items, query])

  return (
    <main className="flex flex-col min-h-dvh" style={{ background: 'var(--bg)', paddingBottom: 'var(--tabbar-h)' }}>
      <div style={{ padding: '24px var(--gutter) 12px' }}>
        <h1 style={{ font: '700 26px/30px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--ink-900)', marginBottom: 12 }}>
          Search
        </h1>

        {/* Search field */}
        <div
          className="flex items-center"
          style={{
            gap: 10,
            background: query ? 'var(--surface)' : 'var(--paper-100)',
            border: query ? '1px solid var(--green-500)' : '1px solid transparent',
            borderRadius: 'var(--r-md)',
            padding: '13px 14px',
            boxShadow: query ? '0 0 0 3px color-mix(in oklab, var(--green-500) 45%, transparent)' : 'none',
            transition: 'all 120ms',
          }}
        >
          <Search size={20} strokeWidth={1.9} color={query ? 'var(--green-600)' : 'var(--ink-400)'} style={{ flexShrink: 0 }} />
          <input
            autoFocus
            placeholder="Search items, stores…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              border: 'none', background: 'transparent', outline: 'none', flex: 1,
              font: '400 16px/24px var(--font-sans)', color: 'var(--ink-900)', minWidth: 0,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                width: 24, height: 24, borderRadius: 'var(--r-full)',
                background: 'var(--paper-200)', color: 'var(--ink-500)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 var(--gutter)' }}>
        {/* Suggestions */}
        {!query && (
          <div style={{ marginTop: 18 }}>
            <span style={{ font: '600 11px/14px var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)', display: 'block', marginBottom: 10 }}>
              Try
            </span>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    borderRadius: 'var(--r-full)', border: '1px solid var(--border-strong)',
                    background: 'transparent', color: 'var(--ink-700)',
                    font: '600 12px/16px var(--font-sans)',
                    padding: '7px 13px', cursor: 'pointer',
                    transition: 'background 120ms',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isPending && query && (
          <div className="flex flex-col" style={{ gap: 0, marginTop: 16 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {[1, 2, 3].map((i, idx) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: idx > 0 ? '1px solid var(--border)' : undefined }}>
                  <div className="rounded animate-pulse shrink-0" style={{ width: 38, height: 38, background: 'var(--paper-100)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded animate-pulse w-1/2" style={{ background: 'var(--paper-100)' }} />
                    <div className="h-2.5 rounded animate-pulse w-1/3" style={{ background: 'var(--paper-100)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ font: '400 14px/20px var(--font-sans)', color: 'var(--coral-500)', marginTop: 16 }}>
            {error.message}
          </p>
        )}

        {/* Results */}
        {query && !isPending && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
            marginTop: 16,
          }}>
            {results.length === 0 ? (
              <div className="flex flex-col items-center text-center" style={{ padding: '24px 16px', gap: 4 }}>
                <p style={{ font: '500 16px/24px var(--font-sans)', color: 'var(--ink-900)' }}>No matches for "{query}"</p>
                <p style={{ font: '400 12px/16px var(--font-sans)', color: 'var(--ink-400)' }}>Try a simpler word, or scan a receipt with it.</p>
              </div>
            ) : results.map((it, i) => (
              <Link
                key={it.normalizedName}
                href={`/compare/${encodeURIComponent(it.normalizedName)}`}
                className="flex items-center no-underline active:bg-[var(--paper-50)] transition-colors"
                style={{
                  gap: 12, padding: '13px 15px',
                  borderTop: i > 0 ? '1px solid var(--border)' : undefined,
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 'var(--r-sm)',
                  background: 'var(--paper-100)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Tag size={18} strokeWidth={1.9} color="var(--ink-400)" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate capitalize" style={{ font: '500 16px/24px var(--font-sans)', color: 'var(--ink-900)' }}>
                    {it.normalizedName}
                  </p>
                  <p style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-500)', marginTop: 1 }}>
                    {it.purchaseCount} purchase{it.purchaseCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end" style={{ gap: 2 }}>
                  <span style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--ink-400)' }}>{it.categoryLabel}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>
    </main>
  )
}
