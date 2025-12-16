'use client'

import React from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface SalonGalleryProps {
  photos: string[]
}

export function SalonGallery({ photos }: SalonGalleryProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0)

  if (!photos || photos.length === 0) {
    return null
  }

  const displayPhotos = photos.slice(0, 3)

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  return (
    <>
      {/* Gallery Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Galerie</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors flex items-center gap-1.5"
          >
            Voir la galerie
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPhotos.map((photo, idx) => (
            <div
              key={idx}
              className="group relative rounded-lg overflow-hidden h-48 sm:h-56 lg:h-64 cursor-pointer"
              onClick={() => {
                setCurrentPhotoIndex(idx)
                setIsModalOpen(true)
              }}
            >
              <img
                src={photo}
                alt={`Galerie ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-slate-900 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-slate-100">
                  Voir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all duration-300"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Container */}
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            <img
              src={photos[currentPhotoIndex]}
              alt={`Galerie ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-lg transition-all duration-300"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-lg transition-all duration-300"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Photo Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>
              </>
            )}

            {/* Thumbnail Navigation */}
            {photos.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      idx === currentPhotoIndex
                        ? 'border-white scale-105'
                        : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
