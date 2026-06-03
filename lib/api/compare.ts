import type { CompareResponse, CompareResult } from '@/lib/types/api'
import { apiFetch } from './client'

export function compareItem(item: string, signal?: AbortSignal): Promise<CompareResponse> {
  return apiFetch(`/compare?item=${encodeURIComponent(item)}`, { signal })
}

export function analyseItem(
  item: string,
  results: CompareResult[],
): Promise<{ recommendation: string }> {
  return apiFetch('/analyse', {
    method: 'POST',
    body: JSON.stringify({ item, results }),
  })
}
