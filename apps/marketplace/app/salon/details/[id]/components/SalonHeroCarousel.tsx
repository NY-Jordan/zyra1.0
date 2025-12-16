'use client'

import React from 'react'
import { ChevronRight, MapPin, Phone, Star } from 'lucide-react'

interface SalonHeroCarouselProps {
  photos: string[]
  salonName: string
  address: string
  phone: string
  rating?: number
  reviewCount?: number
  onCallClick?: () => void
}

export function SalonHeroCarousel({
  photos,
  salonName,
  address,
  phone,
  rating = 4.0,
  reviewCount = 128,
  onCallClick,
}: SalonHeroCarouselProps) {
  const [heroImageIndex, setHeroImageIndex] = React.useState(0)
  const [autoPlayActive, setAutoPlayActive] = React.useState(true)

  // Auto-play carousel
  React.useEffect(() => {
    if (!autoPlayActive || !photos || photos.length === 0) return

    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % (photos?.length || 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [autoPlayActive, photos])

  if (!photos || photos.length === 0) {
    return (
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[520px] overflow-hidden bg-slate-200">
        <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
          <div className="text-slate-500 opacity-40 text-center">
            <p className="text-lg font-semibold">Pas d'images disponibles</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[520px] overflow-hidden bg-slate-200">
        {/* Images with Smooth Transitions */}
        {photos.map((photo, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              idx === heroImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={photo}
              alt={`${salonName} ${idx}`}
              className="w-full h-full object-cover will-change-auto"
              loading="lazy"
            />
          </div>
        ))}

        {/* Dark Gradient Overlay at Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Left Button - Styled Modern */}
        <button
          onClick={() => {
            setAutoPlayActive(false)
            setHeroImageIndex((prev) => (prev - 1 + photos.length) % photos.length)
          }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg p-3 sm:p-4 transition-all duration-300 group"
          aria-label="Image précédente"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white rotate-180 group-hover:scale-125 transition-transform" />
        </button>

        {/* Right Button - Styled Modern */}
        <button
          onClick={() => {
            setAutoPlayActive(false)
            setHeroImageIndex((prev) => (prev + 1) % photos.length)
          }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg p-3 sm:p-4 transition-all duration-300 group"
          aria-label="Image suivante"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-125 transition-transform" />
        </button>

        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-6 sm:pt-8 lg:pt-12 pb-4 sm:pb-6 lg:pb-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 tracking-tight line-clamp-2">
                  {salonName}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/15 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full w-fit">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-300 text-yellow-300 flex-shrink-0" />
                    <span className="font-semibold text-white text-sm sm:text-base">{rating}</span>
                    <span className="text-white/80 text-xs sm:text-sm">({reviewCount} avis)</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-sm sm:text-base min-w-0">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">{address}</span>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${phone}`}
                onClick={onCallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 lg:px-7 py-2.5 sm:py-3 lg:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>Appeler</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modern Dot Navigation - Bottom Center */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-sm px-3 sm:px-5 py-2 sm:py-3 rounded-full">
          {photos.slice(0, 10).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAutoPlayActive(false)
                setHeroImageIndex(idx)
              }}
              className={`transition-all duration-300 ${
                idx === heroImageIndex
                  ? 'bg-white w-8 sm:w-10 h-2.5 sm:h-3 rounded-full'
                  : 'bg-white/50 hover:bg-white/80 w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full'
              }`}
              aria-label={`Aller à l'image ${idx + 1}`}
            />
          ))}
        </div>

        {/* Image Counter - Top Right Modern */}
        <div className="absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 z-30 bg-black/50 backdrop-blur-md text-white px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-white/20">
          {heroImageIndex + 1} / {photos.length}
        </div>
      </div>
    </div>
  )
}
