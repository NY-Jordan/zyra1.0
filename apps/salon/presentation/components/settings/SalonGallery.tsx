'use client'

import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Camera, X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { editDocument } from '@zyra/conf/lib/query'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'

interface SalonGalleryProps {
  salon: ISalon
  onUpdate: () => void
}

const MAX_PHOTOS = 6

export default function SalonGallery({ salon, onUpdate }: SalonGalleryProps) {
  const [isUploading, setIsUploading] = useState(false)
  
  const currentPhotos = Array.isArray(salon.photos) ? salon.photos : []
  const remainingSlots = MAX_PHOTOS - currentPhotos.length
  const isAtLimit = currentPhotos.length >= MAX_PHOTOS

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0 || !salon?.id) return

    // Vérifier la limite avant le traitement
    if (isAtLimit) {
      toast.error('Vous avez atteint la limite de 6 photos maximum')
      return
    }

    // Vérifier si on ne dépasse pas la limite avec les nouvelles photos
    if (currentPhotos.length + files.length > MAX_PHOTOS) {
      toast.error(`Vous ne pouvez ajouter que ${remainingSlots} photo(s) supplémentaire(s)`)
      return
    }

    setIsUploading(true)
    try {
      const uploadedPhotos: string[] = []
      
      // Traiter chaque fichier
      const filePromises = Array.from(files).slice(0, remainingSlots).map((file) => {
        return new Promise<string>((resolve, reject) => {
          if (!file.type.startsWith('image/')) {
            reject(new Error('Type de fichier non supporté'))
            return
          }
          if (file.size > 5 * 1024 * 1024) {
            reject(new Error('Fichier trop volumineux (max 5MB)'))
            return
          }

          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })

      const results = await Promise.allSettled(filePromises)
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          uploadedPhotos.push(result.value)
        }
      })

      if (uploadedPhotos.length === 0) {
        toast.error('Aucune photo valide trouvée')
        return
      }

      const newPhotos = [...currentPhotos, ...uploadedPhotos]

      await editDocument('salons', salon.id, {
        photos: newPhotos
      })

      toast.success(`${uploadedPhotos.length} photo(s) ajoutée(s) avec succès`)
      onUpdate()
    } catch (error) {
      console.error('Erreur upload photos:', error)
      toast.error('Erreur lors de l\'ajout des photos')
    } finally {
      setIsUploading(false)
    }
  }

  const removePhoto = async (photoIndex: number) => {
    if (!salon?.id || !Array.isArray(salon.photos)) return

    try {
      const newPhotos = salon.photos.filter((_, index) => index !== photoIndex)
      
      await editDocument('salons', salon.id, {
        photos: newPhotos
      })

      toast.success('Photo supprimée avec succès')
      onUpdate()
    } catch (error) {
      console.error('Erreur suppression photo:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Galerie photos</CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentPhotos.length}/{MAX_PHOTOS} photos ajoutées
              {remainingSlots > 0 && (
                <span className="text-green-600 ml-2">
                  • {remainingSlots} emplacement(s) disponible(s)
                </span>
              )}
            </p>
          </div>
          <Button 
            onClick={() => document.getElementById('photo-upload')?.click()}
            disabled={isUploading || isAtLimit}
          >
            <Camera className="h-4 w-4 mr-2" />
            {isUploading ? 'Upload en cours...' : 
             isAtLimit ? 'Limite atteinte' : 'Ajouter des photos'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {/* Alerte de limite */}
        {isAtLimit && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Vous avez atteint la limite de 6 photos. Supprimez une photo pour en ajouter une nouvelle.
            </p>
          </div>
        )}

        {currentPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                {/* Numéro de la photo */}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}/{MAX_PHOTOS}
                </div>
              </div>
            ))}

            {/* Slots vides pour visualiser les emplacements restants */}
            {Array.from({ length: remainingSlots }, (_, index) => (
              <div 
                key={`empty-${index}`}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => !isUploading && document.getElementById('photo-upload')?.click()}
              >
                <div className="text-center text-gray-400">
                  <Camera className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-xs">Ajouter</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Aucune photo ajoutée</p>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez jusqu'à {MAX_PHOTOS} photos pour présenter votre salon
            </p>
            <Button 
              onClick={() => document.getElementById('photo-upload')?.click()}
              disabled={isUploading}
            >
              Ajouter votre première photo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}