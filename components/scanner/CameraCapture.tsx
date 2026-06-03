'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Camera, Upload, Plus, Check, X, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageStrip } from './ImageStrip'
import type { Receipt } from '@/lib/schemas/receipt'

type ScanState = 'choosing' | 'camera' | 'capturing' | 'processing'

interface CameraCaptureProps {
  onReceiptExtracted: (receipt: Receipt) => void
}

export function CameraCapture({ onReceiptExtracted }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [state, setState] = useState<ScanState>('choosing')
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }, [])

  const startCamera = useCallback(async () => {
    setState('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch {
      setError('Camera unavailable. Use the upload option instead.')
      setState('choosing')
    }
  }, [])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setImages((prev) => [...prev, dataUrl])
    setState('capturing')
  }, [])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const toProcess = files.slice(0, 5)
    toProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        setImages((prev) => {
          const next = [...prev, dataUrl].slice(0, 5)
          return next
        })
        setState('capturing')
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }, [])

  const cameraReadyRef = useRef(cameraReady)
  useEffect(() => { cameraReadyRef.current = cameraReady }, [cameraReady])

  // Stop camera on unmount regardless of state
  useEffect(() => () => stopCamera(), [stopCamera])

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length === 0) setState(cameraReadyRef.current ? 'camera' : 'choosing')
      return next
    })
  }, [])

  const processReceipt = useCallback(async () => {
    if (images.length === 0) return
    setState('processing')
    setError(null)
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Server error ${res.status}`)
      }
      const receipt = await res.json()
      stopCamera()
      onReceiptExtracted(receipt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('capturing')
    }
  }, [images, stopCamera, onReceiptExtracted])

  const reset = useCallback(() => {
    stopCamera()
    setImages([])
    setError(null)
    setState('choosing')
  }, [stopCamera])

  const isProcessing = state === 'processing'
  const hasImages = images.length > 0
  const canAddMore = images.length < 5

  // ── Landing: choose camera or upload ──────────────────────────────────────
  if (state === 'choosing') {
    return (
      <div className="relative flex flex-col flex-1 items-center justify-center bg-neutral-950 px-6 gap-6">
        <Link
          href="/"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          aria-label="Go home"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="text-center mb-2">
          <h1 className="text-white text-2xl font-semibold tracking-tight">Scan Receipt</h1>
          <p className="text-white/40 text-sm mt-1">Choose how to add your receipt</p>
        </div>

        {error && (
          <div className="w-full max-w-xs bg-red-900/60 text-red-200 text-sm px-4 py-2 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={startCamera}
            className="flex items-center gap-4 w-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-2xl px-5 py-4"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Camera size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Take a Photo</p>
              <p className="text-white/40 text-xs mt-0.5">Use your camera</p>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-4 w-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-2xl px-5 py-4"
          >
            <div className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
              <Upload size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Upload Image</p>
              <p className="text-white/40 text-xs mt-0.5">From your gallery</p>
            </div>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    )
  }

  // ── Camera / Capturing / Processing ───────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-black">
      {/* Viewfinder */}
      <div className="relative flex-1 min-h-0">
        <video
          ref={videoRef}
          className={cn('w-full h-full object-cover', !cameraReady && 'hidden')}
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Corner guides */}
        {cameraReady && (
          <div className="absolute inset-4 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/60 rounded-tl-md" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/60 rounded-tr-md" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/60 rounded-bl-md" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/60 rounded-br-md" />
          </div>
        )}

        {/* Back button */}
        <button
          onClick={reset}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="Back"
        >
          <X size={18} />
        </button>

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm">Reading receipt{images.length > 1 ? 's' : ''}…</p>
          </div>
        )}
      </div>

      {/* Image strip */}
      {hasImages && (
        <div className="bg-neutral-900 px-3 pt-2">
          <ImageStrip images={images} onRemove={removeImage} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/80 text-red-100 text-sm px-4 py-2 text-center">{error}</div>
      )}

      {/* Controls */}
      <div className="bg-neutral-900 px-4 py-4 flex items-center justify-between gap-3">
        {/* Upload more from gallery */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || !canAddMore}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white disabled:opacity-30 transition-colors"
            aria-label="Upload from gallery"
          >
            <Upload size={20} />
          </button>
        </div>

        {/* Capture button */}
        {canAddMore ? (
          <button
            onClick={captureFrame}
            disabled={!cameraReady || isProcessing}
            className={cn(
              'w-16 h-16 rounded-full border-4 border-white flex items-center justify-center',
              'bg-white text-black shadow-lg active:scale-95 transition-transform',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
            aria-label={hasImages ? 'Capture next part' : 'Capture receipt'}
          >
            {hasImages ? <Plus size={24} /> : <Camera size={24} />}
          </button>
        ) : (
          <div className="w-16 h-16" />
        )}

        {/* Confirm / done */}
        <button
          onClick={processReceipt}
          disabled={!hasImages || isProcessing}
          className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Process receipt"
        >
          <Check size={20} />
        </button>
      </div>

      {/* Helper text */}
      <div className="bg-neutral-900 pb-3 text-center">
        <p className="text-xs text-white/40">
          {state === 'camera' && 'Point at receipt and tap capture'}
          {state === 'capturing' && canAddMore && `${images.length}/5 — add more or tap ✓ when done`}
          {state === 'capturing' && !canAddMore && 'Maximum 5 images — tap ✓ to process'}
          {isProcessing && 'Extracting receipt data…'}
        </p>
      </div>
    </div>
  )
}
