'use client'

import React, { useState, useMemo } from 'react'
import { Input } from '@zyra/ui/components/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@zyra/ui/components/alert-dialog'
import {
  Search,
  Plus,
  Users,
  UserCheck,
  ShoppingBag,
  Phone,
  Mail,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react'
import { useSalon } from '@/hooks/useSalon'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import ClientFormModal from './ClientFormModal'
import { ClientActivitySheet } from './ClientActivitySheet'
import { useDeleteClient } from '@/usecases/clientsUseCases'

const ITEMS_PER_PAGE = 9

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, bg, iconColor }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; bg: string; iconColor: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl bg-white/70 dark:bg-black/20 flex items-center justify-center ${iconColor} flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[20px] font-extrabold text-slate-800 dark:text-white leading-none truncate">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">{label}</p>
      </div>
    </div>
  )
}

// ── Client card ───────────────────────────────────────────────────────────────

function ClientCard({ client, onEdit, onDelete, onViewActivity }: {
  client: IClient
  onEdit: () => void
  onDelete: () => void
  onViewActivity: () => void
}) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl p-4 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onViewActivity}
          className="flex items-center gap-3 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-slate-800 dark:text-white truncate">{client.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Depuis le {formatDate(client.createdAt)}</p>
          </div>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onViewActivity}
            aria-label="Voir l'activité"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/20 dark:hover:text-sky-400 transition-colors"
          >
            <History className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Modifier"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-[#F5F2EF] hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Supprimer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#F0EAE4] dark:border-slate-800/50 space-y-1.5">
        <div className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300">
          <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{client.phone}</span>
        </div>
        {client.email && (
          <div className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300">
            <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[#F0EAE4] dark:border-slate-800/50 flex justify-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F8F4F0] dark:bg-slate-800/40 text-slate-600 dark:text-slate-300">
          <ShoppingBag className="h-3 w-3 text-emerald-500" />
          {client.history.length} commande{client.history.length > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

export default function ClientsManagement() {
  const { salon } = useSalon()
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null)
  const [clientToDelete, setClientToDelete] = useState<IClient | null>(null)
  const [activityClient, setActivityClient] = useState<IClient | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const deleteClientMutation = useDeleteClient()

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', salon?.id],
    queryFn: () =>
      fetchCollection('clients', [
        where('salonId', '==', salon?.id),
      ]),
    enabled: !!salon?.id,
  }) as { data: IClient[]; isLoading: boolean }

  const statistics = useMemo(() => {
    const total = clients.length
    const active = clients.filter(c => c.history.length > 0).length
    const totalOrders = clients.reduce((sum, c) => sum + c.history.length, 0)
    return { total, active, totalOrders }
  }, [clients])

  const filteredClients = useMemo(() => {
    return clients
      .filter((client: IClient) => {
        const term = searchTerm.toLowerCase()
        return (
          client.name.toLowerCase().includes(term) ||
          client.phone.includes(searchTerm) ||
          (client.email && client.email.toLowerCase().includes(term))
        )
      })
      .sort((a: IClient, b: IClient) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [clients, searchTerm])

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredClients, currentPage])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleNewClient = () => {
    setSelectedClient(null)
    setIsFormModalOpen(true)
  }

  const handleEditClient = (client: IClient) => {
    setSelectedClient(client)
    setIsFormModalOpen(true)
  }

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate({ clientId: clientToDelete.id, clientName: clientToDelete.name }, {
        onSuccess: () => setClientToDelete(null),
      })
    }
  }

  const card = 'bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl'

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-white tracking-tight">Clients</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Gérez vos clients réguliers
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewClient}
          className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau client
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          icon={<Users className="h-5 w-5" />} label="Total clients"
          value={statistics.total}
          bg="bg-[#ECF6FE] dark:bg-sky-950/20" iconColor="text-sky-600"
        />
        <KpiCard
          icon={<UserCheck className="h-5 w-5" />} label="Clients actifs"
          value={statistics.active}
          bg="bg-[#EEF8F0] dark:bg-emerald-950/20" iconColor="text-emerald-600"
        />
        <KpiCard
          icon={<ShoppingBag className="h-5 w-5" />} label="Commandes cumulées"
          value={statistics.totalOrders}
          bg="bg-[#F2EDFE] dark:bg-violet-950/20" iconColor="text-violet-600"
        />
      </div>

      {/* Recherche */}
      <div className={`${card} p-4`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher par nom, téléphone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
          />
        </div>
      </div>

      {/* Liste des clients */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-[13px] text-slate-400">Chargement des clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className={`text-center py-12 ${card}`}>
          <Users className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-[14px] font-bold text-slate-700 dark:text-slate-300 mb-1">Aucun client</h3>
          <p className="text-[13px] text-slate-400 mb-4">
            {searchTerm
              ? 'Aucun client ne correspond à votre recherche.'
              : 'Commencez par ajouter votre premier client.'}
          </p>
          {!searchTerm && (
            <button
              type="button"
              onClick={handleNewClient}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau client
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedClients.map((client: IClient) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={() => handleEditClient(client)}
                onDelete={() => setClientToDelete(client)}
                onViewActivity={() => setActivityClient(client)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between px-4 py-3 ${card}`}>
              <div className="text-[12px] text-slate-500 dark:text-slate-400">
                Page {currentPage} sur {totalPages} ({filteredClients.length} client{filteredClients.length > 1 ? 's' : ''})
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 h-8 px-3 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-300 border border-[#E8E0D8] dark:border-slate-700 hover:bg-[#F5F2EF] dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 h-8 px-3 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-300 border border-[#E8E0D8] dark:border-slate-700 hover:bg-[#F5F2EF] dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  Suivant
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Historique d'activité */}
      <ClientActivitySheet
        client={activityClient}
        salonId={salon?.id}
        open={!!activityClient}
        onOpenChange={o => { if (!o) setActivityClient(null) }}
      />

      {/* Modal formulaire */}
      <ClientFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        client={selectedClient}
      />

      {/* Confirmation de suppression */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(o) => { if (!o) setClientToDelete(null) }}>
        <AlertDialogContent className="rounded-2xl border-[#F0EAE4] dark:border-slate-800/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[16px] font-extrabold text-slate-800 dark:text-white">
              Supprimer ce client ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              Êtes-vous sûr de vouloir supprimer <strong>{clientToDelete?.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteClientMutation.isPending} className="rounded-xl text-[12px]">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteClientMutation.isPending}
              className="rounded-xl text-[12px] bg-rose-500 hover:bg-rose-600"
            >
              {deleteClientMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
