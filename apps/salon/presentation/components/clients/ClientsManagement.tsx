'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { Input } from '@zyra/ui/components/input'
import { Button } from '@zyra/ui/components/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zyra/ui/components/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zyra/ui/components/dropdown-menu'
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
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useSalon } from '@/hooks/useSalon'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import ClientFormSheet from './ClientFormSheet'
import { useDeleteClient } from '@/usecases/clientsUseCases'

const ITEMS_PER_PAGE = 10

export default function ClientsManagement() {
  const { salon } = useSalon()
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null)
  const [clientToDelete, setClientToDelete] = useState<IClient | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const deleteClientMutation = useDeleteClient()

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', salon?.id],
    queryFn: () =>
      fetchCollection('clients', [
        where('salonId', '==', salon?.id),
      ]),
    enabled: !!salon?.id,
  }) as { data: IClient[]; isLoading: boolean }

  // Filtrer les clients par recherche
  const filteredClients = useMemo(() => {
    return clients
      .filter((client: IClient) => {
        const matchesSearch =
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phone.includes(searchTerm) ||
          (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesSearch
      })
      .sort((a: IClient, b: IClient) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [clients, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredClients.slice(startIndex, endIndex)
  }, [filteredClients, currentPage])

  // Réinitialiser la page lors du changement de recherche
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleNewClient = () => {
    setSelectedClient(null)
    setIsFormSheetOpen(true)
  }

  const handleEditClient = (client: IClient) => {
    setSelectedClient(client)
    setIsFormSheetOpen(true)
  }

  const handleDeleteClient = (client: IClient) => {
    setClientToDelete(client)
  }

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id, {
        onSuccess: () => {
          setClientToDelete(null)
        }
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Gérez vos clients réguliers
          </p>
        </div>
        <Button onClick={handleNewClient}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      {/* Statistiques */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total clients
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clients.length}</div>
        </CardContent>
      </Card>

      {/* Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, téléphone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des clients */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun client</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'Aucun client ne correspond à votre recherche.'
                  : 'Commencez par ajouter votre premier client.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleNewClient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau client
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Historique</TableHead>
                    <TableHead>Date d'ajout</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.map((client: IClient) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {client.history.length} commande{client.history.length > 1 ? 's' : ''}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(client.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClient(client)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClient(client)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({filteredClients.length} client{filteredClients.length > 1 ? 's' : ''})
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Sheet pour formulaire */}
      <ClientFormSheet
        open={isFormSheetOpen}
        onOpenChange={setIsFormSheetOpen}
        client={selectedClient}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le client <strong>{clientToDelete?.name}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
