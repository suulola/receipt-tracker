import type { ReceiptListItem, ReceiptOut } from '@/lib/types/api'
import type { Receipt } from '@/lib/schemas/receipt'
import { apiFetch } from './client'

export function getReceipts(signal?: AbortSignal): Promise<ReceiptListItem[]> {
  return apiFetch('/receipts', { signal })
}

export async function getReceipt(id: string, signal?: AbortSignal): Promise<ReceiptOut> {
  const data = await apiFetch<ReceiptOut>(`/receipts/${id}`, { signal })
  if (!data?.store) throw new Error('Invalid response from server')
  return data
}

export function saveReceipt(receipt: Receipt): Promise<ReceiptOut> {
  return apiFetch('/receipts', {
    method: 'POST',
    body: JSON.stringify(receipt),
  })
}

export function deleteReceipt(id: string): Promise<void> {
  return apiFetch(`/receipts/${id}`, { method: 'DELETE' })
}
