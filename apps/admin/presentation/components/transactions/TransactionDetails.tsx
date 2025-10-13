'use client'
import React from 'react'
import { Badge } from '@zyra/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Transaction } from './types'

interface TransactionDetailsProps {
  transaction: Transaction
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: 'En attente', variant: 'secondary' as const },
    success: { label: 'Succès', variant: 'default' as const },
    failed: { label: 'Échec', variant: 'destructive' as const },
    cancelled: { label: 'Annulé', variant: 'outline' as const }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  return <Badge variant={config.variant}>{config.label}</Badge>
}

const getPaymentMethodLabel = (method: string) => {
  const methods = {
    card: 'Carte bancaire',
    mobile_money: 'Mobile Money'
  }
  return methods[method as keyof typeof methods] || method
}

const formatAmount = (amount: number, currency: string = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: any) => {
  if (!date) return '-'
  
  const dateObject = date?.toDate ? date.toDate() : new Date(date)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(dateObject)
}

export default function TransactionDetails({ transaction }: TransactionDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Transaction Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Transaction {transaction.reference}
            {getStatusBadge(transaction.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Référence</label>
              <p className="font-mono">{transaction.reference}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Montant</label>
              <p className="text-lg font-semibold">
                {formatAmount(transaction.amount, transaction.currency)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Méthode de paiement</label>
              <p>{getPaymentMethodLabel(transaction.paymentMethod)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Date de création</label>
              <p>{formatDate(transaction.createdAt)}</p>
            </div>
            
            {transaction.updatedAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Dernière modification</label>
                <p>{formatDate(transaction.updatedAt)}</p>
              </div>
            )}
            
            {transaction.korapayReference && (
              <div>
                <label className="text-sm font-medium text-gray-500">Référence Korapay</label>
                <p className="font-mono">{transaction.korapayReference}</p>
              </div>
            )}
          </div>
          
          {transaction.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p>{transaction.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations utilisateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">ID Utilisateur</label>
              <p className="font-mono">{transaction.userId}</p>
            </div>
            
            {transaction.userName && (
              <div>
                <label className="text-sm font-medium text-gray-500">Nom</label>
                <p>{transaction.userName}</p>
              </div>
            )}
            
            {transaction.userEmail && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p>{transaction.userEmail}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
