'use client'

import { useEffect, useState } from 'react'
import Image, { type StaticImageData } from 'next/image'

interface AuthImageCarouselProps {
  images: StaticImageData[]
  alt: string
  intervalMs?: number
}

export function AuthImageCarousel({ images, alt, intervalMs = 5000 }: AuthImageCarouselProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [images.length, intervalMs])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((image, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image
            src={image}
            alt={alt}
            fill
            sizes="54vw"
            priority={i === 0}
            placeholder="blur"
            className="object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/15 via-transparent to-transparent" />

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === index ? 20 : 6,
                backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
