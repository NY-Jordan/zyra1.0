'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Checkbox } from '@zyra/ui/components/checkbox'
import { Badge } from '@zyra/ui/components/badge'
import { Scissors, Layers } from 'lucide-react'
import { IServiceCategory } from '@zyra/conf/domain/entities/salons.entities'
import useSalon from '@/hooks/useSalon'

interface ServiceSelectionFormProps {
  selectedCategoryIds: string[]
  onCategoryToggle: (categoryId: string) => void
}

export default function ServiceSelectionForm({
  selectedCategoryIds,
  onCategoryToggle
}: ServiceSelectionFormProps) {
  const { salon } = useSalon()

  const categories = salon?.serviceCategories || []

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Catégories de services</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sélectionnez les catégories de services que ce coiffeur pourra réaliser dans votre salon
        </p>
      </div>

      {/* Compteur de catégories sélectionnées */}
      {selectedCategoryIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <Badge variant="default" className="bg-blue-600">
            {selectedCategoryIds.length}
          </Badge>
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            catégorie{selectedCategoryIds.length > 1 ? 's' : ''} sélectionnée{selectedCategoryIds.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Liste des catégories */}
      <div className="space-y-3 max-h-[450px] overflow-y-auto">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Aucune catégorie de service disponible
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Veuillez créer des catégories de services dans les paramètres du salon
              </p>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => {
            const isSelected = selectedCategoryIds.includes(category.id)
            // Compter les services dans cette catégorie
            const servicesCount = salon?.services?.filter(s => s.categoryId === category.id).length || 0

            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => onCategoryToggle(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onCategoryToggle(category.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <h5 className="font-semibold text-base">{category.name}</h5>
                      </div>
                      
                      {category.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {category.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {servicesCount} service{servicesCount > 1 ? 's' : ''}
                        </Badge>
                        {!category.isActive && (
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Icône de sélection */}
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Message d'information */}
      {selectedCategoryIds.length === 0 && categories.length > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            ℹ️ Vous devez sélectionner au moins une catégorie pour continuer
          </p>
        </div>
      )}

      {/* Résumé des services inclus */}
      {selectedCategoryIds.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
          <h4 className="text-sm font-semibold mb-2">Services inclus</h4>
          <p className="text-xs text-muted-foreground">
            Le coiffeur aura accès à tous les services des catégories sélectionnées :
          </p>
          <div className="mt-2 space-y-1">
            {selectedCategoryIds.map(categoryId => {
              const category = categories.find(c => c.id === categoryId)
              const servicesCount = salon?.services?.filter(s => s.categoryId === categoryId).length || 0
              return (
                <div key={categoryId} className="flex items-center gap-2 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-medium">{category?.name}</span>
                  <span className="text-muted-foreground">({servicesCount} service{servicesCount > 1 ? 's' : ''})</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
