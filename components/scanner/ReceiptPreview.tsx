'use client'

import { useState } from 'react'
import { Trash2, Plus, ChevronDown, ArrowLeft, Check } from 'lucide-react'
import { cn, fmtOrDash, parsePrice } from '@/lib/utils'
import {
  type Receipt,
  type ReceiptItem,
  ItemCategory,
  CATEGORY_LABELS,
  type ItemCategoryType,
} from '@/lib/schemas/receipt'

interface ReceiptPreviewProps {
  receipt: Receipt
  onConfirm: (receipt: Receipt) => Promise<void>
  onRescan: () => void
}

function ItemRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: ReceiptItem
  index: number
  onChange: (updated: ReceiptItem) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const id = `item-${index}`

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">{item.rawName || '(unnamed item)'}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {CATEGORY_LABELS[item.category]}
            {item.quantity !== undefined && ` · ${item.quantity}${item.unit ? item.unit : ''}`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-neutral-900">{fmtOrDash(item.totalPrice)}</p>
          {item.savings != null && item.savings > 0 && (
            <p className="text-xs text-emerald-600">-{fmtOrDash(item.savings)}</p>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn('text-neutral-400 transition-transform', expanded && 'rotate-180')}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 bg-neutral-50 border-t border-neutral-100 space-y-3">
          <div>
            <label htmlFor={`${id}-name`} className="text-xs text-neutral-500 mb-1 block">Item name</label>
            <input
              id={`${id}-name`}
              className="w-full text-sm text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={item.rawName}
              onChange={(e) => onChange({ ...item, rawName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label htmlFor={`${id}-category`} className="text-xs text-neutral-500 mb-1 block">Category</label>
              <select
                id={`${id}-category`}
                className="w-full text-sm text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={item.category}
                onChange={(e) => onChange({ ...item, category: e.target.value as ItemCategoryType })}
              >
                {ItemCategory.options.map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${id}-price`} className="text-xs text-neutral-500 mb-1 block">Total price</label>
              <input
                id={`${id}-price`}
                type="number"
                step="0.01"
                min="0.01"
                className="w-full text-sm text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={item.totalPrice || ''}
                onChange={(e) => {
                  const v = parsePrice(e.target.value)
                  if (v !== null) onChange({ ...item, totalPrice: v })
                }}
              />
            </div>

            <div>
              <label htmlFor={`${id}-discount`} className="text-xs text-neutral-500 mb-1 block">Discount</label>
              <input
                id={`${id}-discount`}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full text-sm text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={item.savings ?? ''}
                onChange={(e) => {
                  const v = parsePrice(e.target.value)
                  onChange({ ...item, savings: v ?? undefined })
                }}
              />
            </div>

            <div>
              <label htmlFor={`${id}-qty`} className="text-xs text-neutral-500 mb-1 block">Quantity</label>
              <input
                id={`${id}-qty`}
                type="number"
                step="0.01"
                min="0"
                className="w-full text-sm text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={item.quantity ?? ''}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  onChange({ ...item, quantity: isNaN(v) ? undefined : v })
                }}
              />
            </div>

            <div>
              <label htmlFor={`${id}-unit`} className="text-xs text-neutral-500 mb-1 block">Unit</label>
              <input
                id={`${id}-unit`}
                className="w-full text-sm text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="lb, kg, L…"
                value={item.unit ?? ''}
                onChange={(e) => onChange({ ...item, unit: e.target.value || undefined })}
              />
            </div>
          </div>

          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 size={13} />
            Remove item
          </button>
        </div>
      )}
    </div>
  )
}

export function ReceiptPreview({ receipt, onConfirm, onRescan }: ReceiptPreviewProps) {
  const [data, setData] = useState<Receipt>(receipt)
  const [saving, setSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  function updateItem(index: number, updated: ReceiptItem) {
    setData((d) => ({ ...d, items: d.items.map((item, i) => (i === index ? updated : item)) }))
  }

  function removeItem(index: number) {
    setData((d) => ({ ...d, items: d.items.filter((_, i) => i !== index) }))
  }

  function addItem() {
    const blank: ReceiptItem = { rawName: '', category: 'other', totalPrice: 0 }
    setData((d) => ({ ...d, items: [...d.items, blank] }))
  }

  function validate(): string | null {
    for (const item of data.items) {
      if (!item.rawName.trim()) return 'All items must have a name'
      if (!item.totalPrice || item.totalPrice <= 0) return 'All items must have a price greater than $0'
    }
    return null
  }

  async function handleConfirm() {
    const err = validate()
    if (err) { setValidationError(err); return }
    setValidationError(null)
    setSaving(true)
    try {
      await onConfirm(data)
    } catch (e) {
      setValidationError(e instanceof Error ? e.message : 'Failed to save receipt. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 pt-5 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onRescan} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-900">Confirm Receipt</h2>
            <p className="text-xs text-neutral-500">
              {data.imageCount > 1 ? `${data.imageCount} images merged` : '1 image'} · tap any item to edit
            </p>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-xl px-4 py-3">
          <p className="font-semibold text-neutral-900">
            {data.store.name}
            {data.store.branch && <span className="font-normal text-neutral-500"> {data.store.branch}</span>}
          </p>
          {(data.store.city || data.store.province) && (
            <p className="text-sm text-neutral-500 mt-0.5">
              {[data.store.address, data.store.city, data.store.province].filter(Boolean).join(', ')}
            </p>
          )}
          {data.transactionDate && (
            <p className="text-xs text-neutral-400 mt-1">
              {new Date(data.transactionDate + 'T00:00:00').toLocaleDateString('en-CA', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          )}
          {data.customerName && (
            <p className="text-xs text-emerald-700 mt-1">Member: {data.customerName}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {data.items.map((item, i) => (
          <ItemRow
            key={i}
            index={i}
            item={item}
            onChange={(updated) => updateItem(i, updated)}
            onRemove={() => removeItem(i)}
          />
        ))}

        <button
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-neutral-200 rounded-xl text-sm text-neutral-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
        >
          <Plus size={16} />
          Add item
        </button>
      </div>

      <div className="border-t border-neutral-100 px-4 py-4 bg-white space-y-3">
        {(data.subtotal != null || data.tax != null || data.total != null) && (
          <div className="text-sm text-neutral-600 space-y-1">
            {data.subtotal != null && (
              <div className="flex justify-between">
                <span>Subtotal</span><span>{fmtOrDash(data.subtotal)}</span>
              </div>
            )}
            {data.tax != null && (
              <div className="flex justify-between">
                <span>Tax (HST/GST)</span><span>{fmtOrDash(data.tax)}</span>
              </div>
            )}
            {data.total != null && (
              <div className="flex justify-between font-semibold text-neutral-900 pt-1 border-t border-neutral-100">
                <span>Total</span><span>{fmtOrDash(data.total)}</span>
              </div>
            )}
          </div>
        )}

        {validationError && (
          <p className="text-xs text-red-500 text-center">{validationError}</p>
        )}

        <button
          onClick={handleConfirm}
          disabled={saving || data.items.length === 0}
          className={cn(
            'w-full py-3.5 rounded-xl font-semibold text-white text-sm',
            'bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all',
            'disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2',
          )}
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
          ) : (
            <><Check size={18} />Save Receipt</>
          )}
        </button>
      </div>
    </div>
  )
}
