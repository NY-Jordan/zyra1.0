'use client'

import React from 'react'
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react'

interface SalonGalleryProps {
  photos: string[]
}

export function SalonGallery({ photos }: SalonGalleryProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  if (!photos || photos.length === 0) return null

  const displayed = photos.slice(0, 4)

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">Galerie</h2>
          {photos.length > 4 && (
            <button
              onClick={() => { setCurrentIndex(0); setIsModalOpen(true) }}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Images className="h-3.5 w-3.5" />
              Voir tout ({photos.length})
            </button>
          )}
        </div>

        <div className={`grid gap-2 ${displayed.length === 1 ? 'grid-cols-1' : displayed.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {displayed.map((photo, idx) => (
            <div
              key={idx}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
                idx === 0 && displayed.length >= 3 ? 'row-span-2' : ''
              } ${idx === 0 ? 'h-48 sm:h-56' : 'h-28 sm:h-32'}`}
              style={idx === 0 && displayed.length >= 3 ? { height: undefined } : {}}
              onClick={() => { setCurrentIndex(idx); setIsModalOpen(true) }}
            >
              <img
                src={photo}
                alt={`Galerie ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
              {idx === 3 && photos.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-[16px] font-bold">+{photos.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative w-full max-w-3xl">
            <img
              src={photos[currentIndex]}
              alt={`Galerie ${currentIndex + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex(p => (p - 1 + photos.length) % photos.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentIndex(p => (p + 1) % photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[12px] font-semibold px-3 py-1.5 rounded-full">
                  {currentIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
