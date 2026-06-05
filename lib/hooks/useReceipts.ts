import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReceipts, getReceipt, saveReceipt, deleteReceipt } from '@/lib/api/receipts'
import type { Receipt } from '@/lib/schemas/receipt'

export function useReceiptsQuery() {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: ({ signal }) => getReceipts(signal),
  })
}

export function useReceiptQuery(id: string) {
  return useQuery({
    queryKey: ['receipts', id],
    queryFn: ({ signal }) => getReceipt(id, signal),
    enabled: !!id,
  })
}

export function useSaveReceiptMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (receipt: Receipt) => saveReceipt(receipt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] })
    },
  })
}

export function useDeleteReceiptMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] })
    },
  })
}
