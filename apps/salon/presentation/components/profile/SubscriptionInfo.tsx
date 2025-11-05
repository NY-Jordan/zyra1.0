'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Badge } from '@zyra/ui/components/badge'
import { Button } from '@zyra/ui/components/button'
import { Calendar, CreditCard, Crown, AlertTriangle } from 'lucide-react'
import { useSalon } from '@/hooks/useSalon'
import { useOwner } from '@/hooks/useOwner'

export default function SubscriptionInfo() {
  const {
    subscription,
    subscriptionLoading,
    isSubscriptionActive,
    subscriptionDaysRemaining,
    isSubscriptionExpiringSoon,
    refetchSubscription
  } = useOwner()

  if (subscriptionLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Souscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Souscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-medium text-amber-700">Aucune souscription active</p>
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas de souscription active pour le moment.
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={() => window.open('/payment/packages', '_blank')}>
            <Crown className="h-4 w-4 mr-2" />
            Découvrir nos forfaits
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isExpired = () => {
    if (!subscription.endDate) return false
    const endDate = new Date(subscription.endDate.seconds * 1000)
    const now = new Date()
    return endDate < now
  }

  const getStatusBadge = () => {
    if (isExpired()) {
      return <Badge variant="destructive">Expirée</Badge>
    }
    if (isSubscriptionExpiringSoon) {
      return <Badge variant="outline" className="text-amber-600 border-amber-600">Expire bientôt</Badge>
    }
    if (isSubscriptionActive) {
      return <Badge variant="default" className="bg-green-600">Active</Badge>
    }
    if (subscription.status === 'cancelled') {
      return <Badge variant="secondary">Annulée</Badge>
    }
    return <Badge variant="secondary">{subscription.status}</Badge>
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue'
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Souscription</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Crown className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Forfait</p>
              <p className="font-medium">{subscription.packageName || 'Forfait Standard'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Facturation</p>
              <p className="font-medium">
                {subscription.amount ? `${subscription.amount} ${subscription.currency || 'XOF'}` : 'Montant non défini'} / {subscription.billingPeriod === 'monthly' ? 'mois' : 'an'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Date de fin</p>
              <p className="font-medium">{formatDate(subscription.endDate)}</p>
              {subscriptionDaysRemaining !== null && subscriptionDaysRemaining > 0 && (
                <p className="text-xs text-muted-foreground">
                  {subscriptionDaysRemaining} jour{subscriptionDaysRemaining > 1 ? 's' : ''} restant{subscriptionDaysRemaining > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {subscription.autoRenew && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Renouvellement automatique activé
              </p>
            </div>
          )}
        </div>

        {(isExpired() || isSubscriptionExpiringSoon) && (
          <div className="pt-2 border-t">
            <Button 
              className="w-full" 
              variant={isExpired() ? "default" : "outline"}
              onClick={() => window.open('/payment/packages', '_blank')}
            >
              {isExpired() ? "Renouveler maintenant" : "Prolonger l'abonnement"}
            </Button>
          </div>
        )}

        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground"
            onClick={() => window.open('/salon/subscription', '_blank')}
          >
            Gérer ma souscription
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}