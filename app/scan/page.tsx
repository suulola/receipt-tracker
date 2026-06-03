'use client'

import { useState } from 'react'
import { CameraCapture } from '@/components/scanner/CameraCapture'
import { ReceiptPreview } from '@/components/scanner/ReceiptPreview'
import type { Receipt } from '@/lib/schemas/receipt'
import { apiUrl } from '@/lib/config'

type PageState = 'scan' | 'preview' | 'saved'

export default function ScanPage() {
  const [pageState, setPageState] = useState<PageState>('scan')
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  function handleReceiptExtracted(r: Receipt) {
    setReceipt(r)
    setPageState('preview')
  }

  async function handleConfirm(confirmed: Receipt) {
    const res = await fetch(`${apiUrl}/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(confirmed),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? `Save failed (${res.status})`)
    }
    setPageState('saved')
  }

  function handleRescan() {
    setReceipt(null)
    setPageState('scan')
  }

  return (
    <main className="h-dvh flex flex-col bg-black">
      {pageState === 'scan' && (
        <CameraCapture onReceiptExtracted={handleReceiptExtracted} />
      )}

      {pageState === 'preview' && receipt && (
        <ReceiptPreview
          receipt={receipt}
          onConfirm={handleConfirm}
          onRescan={handleRescan}
        />
      )}

      {pageState === 'saved' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white px-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-neutral-900">Receipt Saved</h2>
            <p className="text-sm text-neutral-500 mt-1">All items have been recorded</p>
          </div>
          <button
            onClick={handleRescan}
            className="mt-4 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium text-sm hover:bg-emerald-600 transition-colors"
          >
            Scan Another Receipt
          </button>
        </div>
      )}
    </main>
  )
}
