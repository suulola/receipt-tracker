import { NextRequest } from 'next/server'

// Thin proxy — forwards the image payload to FastAPI and returns its response.
// All AI logic, system prompt, and API keys live in the backend.
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return Response.json({ error: 'Could not reach the backend' }, { status: 502 })
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    return Response.json({ error: `Backend error (${res.status})` }, { status: res.status })
  }

  return Response.json(data, { status: res.status })
}
