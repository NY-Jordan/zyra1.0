'use client'
import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmModal from '../CofirmModal'
import CountryModal, { CountryData } from './CountryModal'
import { useCountries, Country } from '@/usecases/useCountries'

export default function Countries() {
  const {
    countries,
    isLoading,
    addCountry,
    toggleCountry,
    deleteCountry,
    updateCountry,
    addPending,
    togglePending,
    deletePending,
    updatePending,
  } = useCountries()

  const [countryModal, setCountryModal] = useState<{ open: boolean; country: Country | null }>({ open: false, country: null })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [toggleModal, setToggleModal] = useState<{ open: boolean; country: Country | null }>({ open: false, country: null })

  const handleAdd = () => {
    setCountryModal({ open: true, country: null })
  }

  const handleSubmitCountry = (data: Omit<CountryData, 'id'>) => {
    if (countryModal.country) {
      // Edit mode
      updateCountry(countryModal.country.id, data)
      toast.success('Le pays a été modifié avec succès')
    } else {
      // Add mode
      if (countries.some(c => c.name.toLowerCase() === data.name.trim().toLowerCase())) {
        toast.error("Ce pays existe déjà.")
        return
      }
      addCountry(data)
      toast.success('Le pays a été ajouté avec succès')
    }
    setCountryModal({ open: false, country: null })
  }

  const handleEdit = (country: Country) => {
    setCountryModal({ open: true, country })
  }

  const handleDelete = (id: string) => {
    setDeleteModal({ open: true, id })
  }

  const confirmDelete = () => {
    if (deleteModal.id) {
      deleteCountry(deleteModal.id)
      toast.success('Le pays a été supprimé avec succès')
    }
    setDeleteModal({ open: false, id: null })
  }

  const handleToggle = (country: Country) => {
    setToggleModal({ open: true, country })
  }

  const confirmToggle = () => {
    if (toggleModal.country) {
      toggleCountry(toggleModal.country)
      toast.success('Le pays a été modifié avec succès')
    }
    setToggleModal({ open: false, country: null })
  }

  return (
    <div className="bg-white rounded shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Pays</h2>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus size={16} />
          Nouveau pays
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">Devise</th>
              <th className="px-4 py-2 text-left">Statut</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : countries.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Aucun pays trouvé.
                </td>
              </tr>
            ) : (
              countries.map((country: Country) => (
                <tr key={country.id} className="border-t">
                  <td className="px-4 py-2">{country.name}</td>
                  <td className="px-4 py-2">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                      {country.currency}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {country.active ? (
                      <span className="text-green-600 font-semibold">Actif</span>
                    ) : (
                      <span className="text-gray-400">Inactif</span>
                    )}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(country)}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant={country.active ? "outline" : "default"}
                      onClick={() => handleToggle(country)}
                      disabled={togglePending}
                    >
                      {country.active ? "Désactiver" : "Activer"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(country.id)}
                      disabled={deletePending}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Country Modal */}
      <CountryModal
        isOpen={countryModal.open}
        onClose={() => setCountryModal({ open: false, country: null })}
        country={countryModal.country}
        onSubmit={handleSubmitCountry}
        loading={addPending || updatePending}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Supprimer le pays"
        description="Ce pays ne sera plus disponible sur la plateforme."
        onCancel={() => setDeleteModal({ open: false, id: null })}
        onConfirm={confirmDelete}
        confirmLabel="Confirmer la suppression"
        loading={deletePending}
        confirmVariant="destructive"
      />

      <ConfirmModal
        open={toggleModal.open}
        title={
          toggleModal.country?.active
            ? 'Désactiver le pays'
            : 'Activer le pays'
        }
        description={
          toggleModal.country?.active
            ? 'Ce pays sera masqué pour les utilisateurs.'
            : 'Ce pays sera disponible pour les utilisateurs.'
        }
        onCancel={() => setToggleModal({ open: false, country: null })}
        onConfirm={confirmToggle}
        confirmLabel="Confirmer"
        loading={togglePending}
        confirmVariant={toggleModal.country?.active ? 'destructive' : 'default'}
      />
    </div>
  )
}
