'use client'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@zyra/ui/components/select'
import PageHeader from '@/presentation/components/common/PageHeader'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TransactionsList, Transaction } from '@/presentation/components/transactions'
import Pagination from '@/presentation/components/common/Pagination'
import { fetchCollectionPaginate } from '@zyra/conf/lib/query'
import { where, orderBy } from 'firebase/firestore'
import { Download, Filter } from "lucide-react"

const PAGE_SIZE = 15

export default function TransactionsIndex() {
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState("all")
  const [paymentMethod, setPaymentMethod] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch paginated transactions
  const { data: transactionsData = { data: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['transactions', keyword, status, paymentMethod, currentPage],
    queryFn: async () => {
      let constraints = []
      // Filter by status
      if (status !== "all") {
        constraints.push(where('status', '==', status))
      }
      // Filter by payment method
      if (paymentMethod !== "all") {
        constraints.push(where('paymentMethod', '==', paymentMethod))
      }
      // Order by creation date (most recent first)
      constraints.push(orderBy('updatedAt', 'desc'))

      let res = await fetchCollectionPaginate('transactions', {
        page: currentPage,
        pageSize: PAGE_SIZE,
        constraints
      })
      let filtered = res.data
      // Filter by keyword (reference, user email, or amount)
      if (keyword) {
        filtered = filtered.filter((t: any) =>
          t.reference?.toLowerCase().includes(keyword.toLowerCase()) ||
          t.userEmail?.toLowerCase().includes(keyword.toLowerCase()) ||
          t.amount?.toString().includes(keyword)
        )
      }
      return { data: filtered, total: res.total }
    },
    refetchOnWindowFocus: true,
  })

  const handleExportTransactions = () => {
    // TODO: Implement export functionality
    console.log('Export transactions')
  }

  const resetFilters = () => {
    setKeyword("")
    setStatus("all")
    setPaymentMethod("all")
    setCurrentPage(1)
  }

  return (
    <>
      <PageHeader 
        title="Gestion des transactions"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Transactions", isCurrent: true }
        ]}
      />

      <div className="space-y-6">
        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className='flex flex-wrap gap-3 items-center'>
              {/* Search by reference, email, or amount */}
              <Input
                placeholder="Rechercher par référence, email ou montant..."
                className="w-[280px]"
                value={keyword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
              />
              {/* Status filter */}
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="failed">Échec</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment method filter */}
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les méthodes</SelectItem>
                  <SelectItem value="card">Carte bancaire</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset filters */}
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Réinitialiser
              </Button>
            </div>

            {/* Export button */}
            <Button 
              onClick={handleExportTransactions} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              Transactions ({transactionsData.total})
            </h2>
          </div>
          
          <TransactionsList 
            transactions={transactionsData.data as Transaction[]} 
            loading={isLoading} 
          />
          
          {transactionsData.total > PAGE_SIZE && (
            <div className="p-4 border-t">
              <Pagination
                page={currentPage}
                pageSize={PAGE_SIZE}
                total={transactionsData.total}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
