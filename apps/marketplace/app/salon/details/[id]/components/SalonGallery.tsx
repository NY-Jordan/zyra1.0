'use client'

import React from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface SalonGalleryProps {
  photos: string[]
}

export function SalonGallery({ photos }: SalonGalleryProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  if (!photos || photos.length === 0) return null

  const open = (idx: number) => { setCurrentIndex(idx); setIsModalOpen(true) }

  const main = photos[0]!
  const right = photos.slice(1, 3)
  const galleryHeight = 'clamp(260px, 34vw, 440px)'

  return (
    <>
      {photos.length === 1 ? (
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer w-full"
          style={{ height: galleryHeight }}
          onClick={() => open(0)}
        >
          <img src={main} alt="Photo" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[1.9fr_1fr] gap-3" style={{ height: galleryHeight }}>
          {/* Main */}
          <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group min-h-0"
            onClick={() => open(0)}
          >
            <img src={main} alt="Photo principale" className="absolute inset-0 w-full h-full object-cover group-hover:brightness-95 transition-all" />
          </div>

          {/* Right stack */}
          <div className="hidden sm:grid grid-rows-2 gap-3 min-h-0">
            {right.map((photo, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden cursor-pointer group min-h-0"
                onClick={() => open(idx + 1)}
              >
                <img src={photo} alt={`Photo ${idx + 2}`} className="absolute inset-0 w-full h-full object-cover group-hover:brightness-95 transition-all" />
                {idx === right.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); open(0) }}
                    className="absolute bottom-3 right-3 bg-white hover:bg-gray-50 text-gray-900 text-[13px] font-semibold px-4 py-2 rounded-full shadow-md transition-colors"
                  >
                    Afficher toutes les images
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile see-all */}
      {photos.length > 1 && (
        <button
          onClick={() => open(0)}
          className="sm:hidden mt-2.5 w-full text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-full py-2.5 hover:bg-gray-50 transition-colors"
        >
          Afficher toutes les images ({photos.length})
        </button>
      )}

      {/* Lightbox */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/80 text-[13px] font-medium">
            {currentIndex + 1} / {photos.length}
          </div>
          <div className="w-full max-w-4xl px-16">
            <img src={photos[currentIndex]} alt={`Photo ${currentIndex + 1}`} className="w-full max-h-[80vh] object-contain" />
          </div>
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex(p => (p - 1 + photos.length) % photos.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => setCurrentIndex(p => (p + 1) % photos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
