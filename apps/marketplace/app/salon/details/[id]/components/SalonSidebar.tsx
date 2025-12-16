'use client'

import React from 'react'
import { Clock, MapPin, Phone, Gift, Calendar } from 'lucide-react'
import { Button } from '@zyra/ui/components/button'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'

interface SalonSidebarProps {
  salon: ISalon
}

export function SalonSidebar({ salon }: SalonSidebarProps) {
  return (
    <div className="space-y-4 sm:space-y-6 h-fit sticky top-32 sm:top-40 lg:top-32">
      {/* Reservation Button */}
      <button onClick={() => window.location.href = `/booking/${salon.id}`} className="w-full bg-black hover:bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 group">
        <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
        <span>Réserver une visite</span>
      </button>
      {/* About Section */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-5">À Propos</h3>

        <div className="space-y-4 sm:space-y-5">
          {/* Opening Hours */}
          {salon.openingHours && salon.openingHours.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <span>Horaires</span>
              </h4>
              <div className="space-y-2.5 text-sm">
                {salon.openingHours.map((hour) => (
                  <div key={hour.day} className="flex justify-between">
                    <span className="text-slate-600">{hour.day}</span>
                    <span className="font-semibold text-slate-900">
                      {hour.openDay ? `${hour.open} - ${hour.close}` : 'Fermé'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 sm:pt-5">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-red-50">
                <MapPin className="h-5 w-5 text-red-600" />
              </div>
              <span>Adresse</span>
            </h4>
            <p className="text-sm text-slate-700 mb-2">{salon.address}</p>
            <p className="text-sm text-slate-600 mb-3">
              {salon.city}, {salon.country}
            </p>
            <button
              onClick={() =>
                window.open(`https://maps.google.com/?daddr=${encodeURIComponent(salon.address)}`)
              }
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1 transition-colors"
            >
              Voir sur la carte
              <span>→</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-4 sm:pt-5">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <span>Contact</span>
            </h4>
            <a
              href={`tel:${salon.phone}`}
              className="text-blue-600 hover:text-blue-700 font-semibold block mb-2 text-sm transition-colors"
            >
              {salon.phone}
            </a>
            {salon.email && (
              <a
                href={`mailto:${salon.email}`}
                className="text-blue-600 hover:text-blue-700 text-sm transition-colors break-all"
              >
                {salon.email}
              </a>
            )}
          </div>
        </div>
      </div>

  

      {/* Info Pratiques */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="font-bold text-slate-900 mb-4">Infos Pratiques</h3>
        <ul className="space-y-3 text-sm">
          {[
            'Confirmation instantanée',
            'Paiement sécurisé',
            'Accès WiFi gratuit',
            'Parking à proximité',
            'Accessible aux PMR',
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-3 text-slate-700">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
