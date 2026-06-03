import type { Receipt } from '@/lib/schemas/receipt'

export async function runOcr(images: string[]): Promise<Receipt> {
  const res = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Server error ${res.status}`)
  }
  return res.json()
}
