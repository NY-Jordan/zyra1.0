'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { Store, Settings, AlertCircle } from 'lucide-react'
import { Button } from '@zyra/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'

export default function SalonHomePage() {
  const router = useRouter()
  const { isConnected, salon, salonId } = useSalon()

  useEffect(() => {
    // Si un salon est connecté, rediriger vers le dashboard
    if (isConnected && salon) {
      router.push('/salon/dashboard')
    } else if (!isConnected) {
      // Si aucun salon n'est connecté, rediriger vers la configuration
      router.push('/salon/setup')
    }
  }, [isConnected, salon, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Zyra Salon</CardTitle>
          <p className="text-muted-foreground">
            Vérification de la configuration...
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Statut */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="text-sm">
              {isConnected ? 'Salon connecté, redirection...' : 'Configuration requise...'}
            </span>
          </div>

          {/* Actions d'urgence */}
          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/salon/setup')} 
              variant="outline" 
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuration du salon
            </Button>
            
            <Button 
              onClick={() => router.push('/salon/dashboard')} 
              className="w-full"
            >
              Aller au Dashboard
            </Button>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Cette page détecte automatiquement votre configuration et vous redirige vers la bonne section.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
