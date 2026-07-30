'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { ScrollArea } from '@zyra/ui/components/scroll-area'
import { Search, User, Phone, Mail, Loader2, UserCircle } from 'lucide-react'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import useSalon from '@zyra/core/hooks/useSalon'

interface ClientSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectClient: (client: IClient) => void
}

export default function ClientSearchModal({ 
  open, 
  onOpenChange, 
  onSelectClient 
}: ClientSearchModalProps) {
  const { salon } = useSalon()
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['salon-clients', salon?.id],
    queryFn: async () => {
      if (!salon?.id) return []
      return await fetchCollection('clients', [
        where('salonId', '==', salon.id)
      ]) as IClient[]
    },
    enabled: open && !!salon?.id,
  })

  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients

    const query = searchQuery.toLowerCase()
    return clients.filter(client => 
      client.name.toLowerCase().includes(query) ||
      client.phone.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query))
    )
  }, [clients, searchQuery])

  const handleSelectClient = (client: IClient) => {
    onSelectClient(client)
    setSearchQuery('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher un client
          </DialogTitle>
          <DialogDescription>
            Recherchez un client existant par nom, téléphone ou email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, téléphone ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <UserCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery.trim() 
                  ? 'Aucun client trouvé' 
                  : 'Aucun client enregistré'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full p-3 border rounded-lg hover:bg-accent hover:border-primary transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {client.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.history && client.history.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {client.history.length} commande(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('')
              onOpenChange(false)
            }}
          >
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
