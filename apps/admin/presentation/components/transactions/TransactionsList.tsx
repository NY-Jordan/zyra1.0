'use client'
import React from 'react'
import { Badge } from '@zyra/ui/components/badge'
import { Button } from '@zyra/ui/components/button'
import { Eye, Download } from 'lucide-react'
import { Transaction } from './types'

interface TransactionsListProps {
  transactions: Transaction[]
  loading?: boolean
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
    minute: '2-digit'
  }).format(dateObject)
}

export default function TransactionsList({ transactions, loading }: TransactionsListProps) {
  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 border rounded">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">
          <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Aucune transaction trouvée</h3>
          <p className="mt-1">Il n'y a aucune transaction correspondant à vos critères.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Référence
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilisateur
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Montant
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Méthode
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {transaction.reference}
                </div>
                {transaction.korapayReference && (
                  <div className="text-xs text-gray-500">
                    Korapay: {transaction.korapayReference}
                  </div>
                )}
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {transaction.userName || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  {transaction.userEmail}
                </div>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatAmount(transaction.amount, transaction.currency)}
                </div>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {getPaymentMethodLabel(transaction.paymentMethod)}
                </div>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                {getStatusBadge(transaction.status)}
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(transaction.createdAt)}
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => {
                      // TODO: Implement view details
                      console.log('View transaction:', transaction.id)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
