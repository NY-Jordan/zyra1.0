'use client'

import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Edit, MapPin, ExternalLink } from 'lucide-react'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import SalonLocationForm from '@/presentation/components/SalonLocationForm'
import dynamic from 'next/dynamic'
import { useHasPermission } from '@/hooks/useHasPermission'

// Import dynamique pour éviter les erreurs SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface SalonLocationProps {
  salon: ISalon
  onUpdate: () => void
}

export default function SalonLocation({ salon, onUpdate }: SalonLocationProps) {
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission('settings.location')
  const [isEditing, setIsEditing] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const handleLocationUpdate = () => {
    setIsEditing(false)
    onUpdate()
  }

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${salon.location_lat},${salon.location_lng}`
    window.open(url, '_blank')
  }

  const openInAppleMaps = () => {
    const url = `https://maps.apple.com/?q=${salon.location_lat},${salon.location_lng}`
    window.open(url, '_blank')
  }

  // Composant de carte avec gestion d'erreur
  const InteractiveMap = () => {
    if (!salon.location_lat || !salon.location_lng) {
      return (
        <div className="w-full h-64 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>Aucune coordonnée disponible</p>
            <p className="text-xs">Veuillez configurer la localisation</p>
          </div>
        </div>
      )
    }

    const lat = parseFloat(salon.location_lat.toString())
    const lng = parseFloat(salon.location_lng.toString())

    if (isNaN(lat) || isNaN(lng)) {
      return (
        <div className="w-full h-64 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>Coordonnées invalides</p>
            <p className="text-xs">Lat: {salon.location_lat}, Lng: {salon.location_lng}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full h-64 rounded-lg overflow-hidden border">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">{salon.name}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">{salon.address}</p>
                <div className="mt-2 space-y-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={openInGoogleMaps}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Google Maps
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Localisation</CardTitle>
            {canEdit && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier l'emplacement
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{salon.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ville</p>
                <p className="font-medium">{salon.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latitude</p>
                <p className="font-mono text-sm">{salon.location_lat}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longitude</p>
                <p className="font-mono text-sm">{salon.location_lng}</p>
              </div>
            </div>

            {/* Carte interactive */}
            <InteractiveMap />

            {/* Boutons d'ouverture dans les apps de cartes */}
            {salon.location_lat && salon.location_lng && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={openInGoogleMaps}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir dans Google Maps
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={openInAppleMaps}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir dans Apple Maps
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de localisation */}
      {isEditing && (
        <SalonLocationForm
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onLocationSelect={handleLocationUpdate}
          countryCode={salon.country || 'cm'}
        />
      )}
    </>
  )
}