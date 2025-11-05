'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Lock, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordChangeFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function PasswordChangeForm({ onSuccess, onCancel }: PasswordChangeFormProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<PasswordFormData>()

  const onSubmit = async (data: PasswordFormData) => {
    if (!auth.currentUser) {
      toast.error('Utilisateur non authentifié')
      return
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (data.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setIsUpdating(true)
    try {
      // Réauthentifier l'utilisateur
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        data.currentPassword
      )
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Mettre à jour le mot de passe
      await updatePassword(auth.currentUser, data.newPassword)

      toast.success('Mot de passe mis à jour avec succès')
      reset()
      onSuccess()
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error)
      if (error.code === 'auth/wrong-password') {
        toast.error('Mot de passe actuel incorrect')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Le nouveau mot de passe est trop faible')
      } else {
        toast.error('Erreur lors du changement de mot de passe')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Changer le mot de passe</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Mot de passe actuel
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  {...register('currentPassword', {
                    required: 'Le mot de passe actuel est requis'
                  })}
                  placeholder="Entrez votre mot de passe actuel"
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...register('newPassword', {
                    required: 'Le nouveau mot de passe est requis',
                    minLength: {
                      value: 6,
                      message: 'Le mot de passe doit contenir au moins 6 caractères'
                    }
                  })}
                  placeholder="Entrez le nouveau mot de passe"
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register('confirmPassword', {
                    required: 'Veuillez confirmer le mot de passe',
                    validate: (value) => {
                      const newPassword = watch('newPassword')
                      return value === newPassword || 'Les mots de passe ne correspondent pas'
                    }
                  })}
                  placeholder="Confirmez le nouveau mot de passe"
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Changer le mot de passe
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}