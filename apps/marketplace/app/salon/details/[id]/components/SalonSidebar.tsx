'use client'

import React from 'react'
import { Clock, MapPin, Phone, Calendar, CheckCircle } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'

interface SalonSidebarProps {
  salon: ISalon
}

export function SalonSidebar({ salon }: SalonSidebarProps) {
  return (
    <div className="space-y-4 h-fit sticky top-20">
      {/* CTA */}
      <button
        onClick={() => window.location.href = `/booking/${salon.id}`}
        className="w-full h-12 rounded-2xl text-[14px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
      >
        <Calendar className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
        Réserver une visite
      </button>

      {/* Horaires */}
      {salon.openingHours && salon.openingHours.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#F0EAE4] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="text-[13px] font-bold text-slate-800">Horaires</span>
          </div>
          <div className="space-y-1.5">
            {salon.openingHours.map(hour => (
              <div key={hour.day} className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500">{hour.day}</span>
                <span className={`text-[12px] font-semibold ${hour.openDay ? 'text-slate-700' : 'text-rose-500'}`}>
                  {hour.openDay ? `${hour.open} – ${hour.close}` : 'Fermé'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adresse & Contact */}
      <div className="bg-white rounded-2xl border border-[#F0EAE4] p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <span className="text-[13px] font-bold text-slate-800">Adresse</span>
          </div>
          <p className="text-[12px] text-slate-600 leading-relaxed">{salon.address}</p>
          <p className="text-[12px] text-slate-500">{salon.city}{salon.country ? `, ${salon.country}` : ''}</p>
          <button
            onClick={() => window.open(`https://maps.google.com/?daddr=${encodeURIComponent(salon.address || '')}`)}
            className="mt-2 text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Voir sur la carte →
          </button>
        </div>

        {(salon.phone || salon.email) && (
          <div className="border-t border-[#F5F2EF] pt-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <span className="text-[13px] font-bold text-slate-800">Contact</span>
            </div>
            {salon.phone && (
              <a href={`tel:${salon.phone}`} className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 block">
                {salon.phone}
              </a>
            )}
            {salon.email && (
              <a href={`mailto:${salon.email}`} className="text-[12px] text-slate-500 hover:text-slate-700 break-all block mt-0.5">
                {salon.email}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Infos pratiques */}
      <div className="bg-white rounded-2xl border border-[#F0EAE4] p-4">
        <p className="text-[13px] font-bold text-slate-800 mb-3">Infos pratiques</p>
        <ul className="space-y-2">
          {['Confirmation instantanée', 'Paiement sécurisé', 'Accès WiFi gratuit', 'Parking à proximité'].map(item => (
            <li key={item} className="flex items-center gap-2.5 text-[12px] text-slate-600">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
