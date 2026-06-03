import { useMutation } from '@tanstack/react-query'
import { runOcr } from '@/lib/api/ocr'

export function useOcrMutation() {
  return useMutation({
    mutationFn: (images: string[]) => runOcr(images),
  })
}
