'use client'

import React from 'react'
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import type { salonDetailsDictionary } from '../i18n'

interface SalonFooterProps {
  salon: ISalon
  t: (typeof salonDetailsDictionary)['fr']['footer']
}

export function SalonFooter({ salon, t }: SalonFooterProps) {
  return (
    <footer className="border-t border-slate-100 bg-white mt-10">
      <div className="max-w-[1120px] mx-auto px-5 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* Salon info */}
          <div>
            <p className="text-[15px] font-semibold text-slate-900">{salon.name}</p>
            <div className="mt-2 space-y-1">
              {(salon.address || salon.city) && (
                <p className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {[salon.address, salon.city].filter(Boolean).join(', ')}
                </p>
              )}
              {salon.phone && (
                <p className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {salon.phone}
                </p>
              )}
              {salon.email && (
                <p className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {salon.email}
                </p>
              )}
            </div>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} {salon.name}. {t.rights}</p>
          <p className="text-[11px] text-slate-400">{t.poweredBy}</p>
        </div>
      </div>
    </footer>
  )
}
