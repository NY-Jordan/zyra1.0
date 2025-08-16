'use client'
import { Badge } from '@zyra/ui/components/badge'
import { Button } from '@zyra/ui/components/button'
import { Pencil, Trash2 } from 'lucide-react'
import React from 'react'

export default function ReservationsDetails({reservationsList}: { reservationsList: any[] }) {
  return (
     <div className="mb-8 mt-5">
              <h2 className="font-semibold mb-2">Liste des réservations</h2>
              <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                  <thead>
                  <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Client</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Service</th>
                      <th className="px-4 py-2 text-left">Statut</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {(reservationsList || []).map((r: any) => (
                      <tr key={r.id} className="border-t">
                      <td className="px-4 py-2">{r.client}</td>
                      <td className="px-4 py-2">{r.date}</td>
                      <td className="px-4 py-2">{r.service}</td>
                      <td className="px-4 py-2">
                          <Badge variant={
                          r.statut === "confirmée"
                              ? "outline"
                              : r.statut === "en attente"
                              ? "secondary"
                              : "destructive"
                          }>
                          {r.statut}
                          </Badge>
                      </td>
                      <td className="px-4 py-2 flex gap-2">
                          <Button size="icon" variant="outline"><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="destructive"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
              </div>
          </div>
  )
}
