'use client'

import React from 'react'
import { User, Phone, Mail, MessageSquare } from 'lucide-react'

interface ClientInfoFormProps {
  formData: {
    clientName: string
    clientPhone: string
    clientEmail: string
    notes: string
  }
  onChange: (field: string, value: string) => void
}

export default function ClientInfoForm({ formData, onChange }: ClientInfoFormProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[18px] font-extrabold text-slate-800">Vos informations</h2>
        <p className="text-[13px] text-slate-500">Complétez vos coordonnées pour finaliser la réservation</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#F0EAE4] p-4 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
            <User className="h-3.5 w-3.5 text-slate-400" />
            Nom complet <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
            placeholder="Ex: Jean Dupont"
            className="w-full h-10 px-3 rounded-xl border border-[#E8E0D8] bg-[#F8F4F0] text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            Téléphone <span className="text-rose-400">*</span>
          </label>
          <input
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => onChange('clientPhone', e.target.value)}
            placeholder="Ex: +237 6XX XX XX XX"
            className="w-full h-10 px-3 rounded-xl border border-[#E8E0D8] bg-[#F8F4F0] text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            Email <span className="text-slate-400">(optionnel)</span>
          </label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => onChange('clientEmail', e.target.value)}
            placeholder="Ex: jean@example.com"
            className="w-full h-10 px-3 rounded-xl border border-[#E8E0D8] bg-[#F8F4F0] text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
            Notes <span className="text-slate-400">(optionnel)</span>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder="Précisions particulières, préférences..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E8E0D8] bg-[#F8F4F0] text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
          />
        </div>
      </div>
    </div>
  )
}
