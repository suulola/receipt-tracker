import { useQuery } from '@tanstack/react-query'
import { getItems } from '@/lib/api/items'

export function useItemsQuery() {
  return useQuery({
    queryKey: ['items'],
    queryFn: ({ signal }) => getItems(signal),
  })
}
