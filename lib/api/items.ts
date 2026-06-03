import type { ItemSummary } from '@/lib/types/api'
import { apiFetch } from './client'

export function getItems(signal?: AbortSignal): Promise<ItemSummary[]> {
  return apiFetch('/items', { signal })
}
