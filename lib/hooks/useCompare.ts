import { useQuery, useMutation } from '@tanstack/react-query'
import { compareItem, analyseItem } from '@/lib/api/compare'
import type { CompareResult } from '@/lib/types/api'

export function useCompareQuery(item: string) {
  return useQuery({
    queryKey: ['compare', item],
    queryFn: ({ signal }) => compareItem(item, signal),
    enabled: !!item,
  })
}

export function useAnalyseMutation(item: string, results: CompareResult[]) {
  return useMutation({
    mutationFn: () => analyseItem(item, results),
  })
}
