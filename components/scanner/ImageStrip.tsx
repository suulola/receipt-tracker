'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageStripProps {
  images: string[]
  onRemove: (index: number) => void
}

export function ImageStrip({ images, onRemove }: ImageStripProps) {
  if (images.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-1">
      {images.map((src, i) => (
        <div
          key={src.slice(-32)}
          className={cn(
            'relative shrink-0 rounded-lg overflow-hidden border-2 border-white/20',
            'w-16 h-24 bg-neutral-800',
          )}
        >
          <Image
            src={src}
            alt={`Receipt part ${i + 1}`}
            fill
            className="object-cover"
            unoptimized
          />
          <button
            onClick={() => onRemove(i)}
            className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 text-white hover:bg-red-600 transition-colors"
            aria-label={`Remove image ${i + 1}`}
          >
            <X size={10} />
          </button>
          <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] text-white bg-black/50 py-0.5">
            {i + 1}/{images.length}
          </span>
        </div>
      ))}
    </div>
  )
}
