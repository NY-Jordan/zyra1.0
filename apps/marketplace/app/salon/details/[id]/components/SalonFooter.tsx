'use client'

import React from 'react'
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'

interface SalonFooterProps {
  salon: ISalon
}

export function SalonFooter({ salon }: SalonFooterProps) {
  return (
    <footer className="border-t border-gray-100 bg-white mt-10">
      <div className="max-w-[1120px] mx-auto px-5 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* Salon info */}
          <div>
            <p className="text-[15px] font-semibold text-gray-900">{salon.name}</p>
            <div className="mt-2 space-y-1">
              {(salon.address || salon.city) && (
                <p className="flex items-center gap-1.5 text-[12px] text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  {[salon.address, salon.city].filter(Boolean).join(', ')}
                </p>
              )}
              {salon.phone && (
                <p className="flex items-center gap-1.5 text-[12px] text-gray-500">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {salon.phone}
                </p>
              )}
              {salon.email && (
                <p className="flex items-center gap-1.5 text-[12px] text-gray-500">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {salon.email}
                </p>
              )}
            </div>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} {salon.name}. Tous droits réservés.</p>
          <p className="text-[11px] text-gray-400">Propulsé par Zyraa</p>
        </div>
      </div>
    </footer>
  )
}
