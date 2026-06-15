'use client'
import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Avatar, AvatarFallback, AvatarImage } from '@zyra/ui/components/avatar'
import PageHeader from '@/presentation/components/common/PageHeader'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import { useOwner } from '@/hooks/useOwner'
import { User, Mail, Phone, Camera, Edit, Calendar, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { editDocument } from '@zyra/conf/lib/query'
import UserInfoEditForm from '@/presentation/components/profile/UserInfoEditForm'
import PasswordChangeForm from '@/presentation/components/profile/PasswordChangeForm'
import LogoutSalon from '@/presentation/components/profile/LogoutSalon'

export default function ProfilePage() {
  const { owner, isLoading, refetch } = useOwner()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !owner?.id) return

    // Vérifications de base
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille de l\'image ne doit pas dépasser 5MB')
      return
    }

    setIsUploading(true)
    try {
      // Convertir en base64 pour la démo
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          await editDocument('owners', owner.id, {
            photo: reader.result as string
          })
          toast.success('Photo mise à jour avec succès')
          refetch()
        } catch (error) {
          console.error('Erreur upload photo:', error)
          toast.error('Erreur lors de la mise à jour de la photo')
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setIsUploading(false)
      toast.error('Erreur lors du traitement de l\'image')
    }
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Mon Profil"
            breadcrumbs={[
              { label: 'Dashboard', href: '/salon' },
              { label: 'Mon Profil', isCurrent: true }
            ]}
          />
          <div className="flex items-center justify-center min-h-96">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Mon Profil"
          breadcrumbs={[
            { label: 'Dashboard', href: '/salon' },
            { label: 'Mon Profil', isCurrent: true }
          ]}
          actions={
            <div className="flex gap-2">
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
              {!isChangingPassword && (
                <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Changer mot de passe
                </Button>
              )}
            </div>
          }
        />

        <div className="space-y-6">
          {/* En-tête avec photo de profil */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={owner?.photo || '/default-avatar.png'}
                      alt={owner?.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg bg-primary/10">
                      {owner?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>

                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <h1 className="text-2xl font-semibold">{owner?.name || 'Utilisateur'}</h1>
                  <p className="text-muted-foreground">{owner?.email}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Membre depuis {owner?.status?.createdAt ? new Date(owner.status.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Formulaire d'édition des informations */}
          {isEditing && owner && (
            <UserInfoEditForm
              owner={owner}
              onSuccess={() => {
                setIsEditing(false)
                refetch()
              }}
              onCancel={() => setIsEditing(false)}
            />
          )}

          {/* Formulaire de changement de mot de passe */}
          {isChangingPassword && (
            <PasswordChangeForm
              onSuccess={() => setIsChangingPassword(false)}
              onCancel={() => setIsChangingPassword(false)}
            />
          )}

          {/* Informations en lecture seule */}
          {!isEditing && !isChangingPassword && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nom complet</p>
                      <p className="font-medium">{owner?.name || 'Non renseigné'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{owner?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{owner?.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informations du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date de création</p>
                    <p className="font-medium">
                      {owner?.status?.createdAt ? new Date(owner.status.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID Utilisateur</p>
                    <p className="font-mono text-xs text-muted-foreground">{owner?.id}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sécurité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mot de passe</p>
                      <p className="font-medium">••••••••</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                </CardContent>
              </Card>

            </div>
          )}
        </div>    
      </div>   
    </ProtectedLayout>
  )
}

