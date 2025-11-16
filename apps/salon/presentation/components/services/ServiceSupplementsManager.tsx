'use client'

import React from 'react'
import { useFieldArray, Control, useWatch } from 'react-hook-form'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@zyra/ui/components/card'
import { generateUniqueId } from '@zyra/conf/lib/config'
import { ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'


interface ServiceSupplementsManagerProps {
  control: Control<any>
  supplements: ISalonServiceSupplement[]
  disabled?: boolean
  title?: string
  fieldName?: string // Nom du champ dans le formulaire (ex: "supplements")
}

export function ServiceSupplementsManager({
  control,
  fieldName = "supplements",
  title = "Suppléments",
  supplements
}: ServiceSupplementsManagerProps) {
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  })

  const handleAddSupplement = () => {
    append({
      id: generateUniqueId(),
      name: "",
      price: 0,
      duration: 0
    })
  }

  const handleRemoveSupplement = (index: number) => {
    remove(index)
  }

  return (
    <div className={`space-y-4 `}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSupplement}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {'Ajouter un supplément'}
          </Button>
      </div>

      {fields.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>Aucun supplément ajouté</p>
                <p className="text-sm mt-1">
                  Cliquez sur "{'Ajouter un supplément'}" pour ajouter des suppléments
                </p>
            </div>
          </CardContent>
        </Card>
      )}

      {fields.length > 0 && (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    {...control.register(`${fieldName}.${index}.name`, {
                      required: "Le nom du supplément est requis"
                    })}
                    placeholder="Nom du supplément"
                    className="mb-2"
                  />
                </div>
                <div className="w-24">
                  <Input
                    {...control.register(`${fieldName}.${index}.price`, {
                      required: "Le prix est requis",
                      min: { value: 0, message: "Le prix doit être positif" },
                      valueAsNumber: true
                    })}
                    type="number"
                    placeholder="Prix"
                    min="0"
                    step="0.01"
                    className="mb-2"
                  />
                </div>
                <div className="w-20">
                  <Input
                    {...control.register(`${fieldName}.${index}.duration`, {
                      required: "La durée est requise",
                      min: { value: 0, message: "La durée doit être positive" },
                      valueAsNumber: true
                    })}
                    type="number"
                    placeholder="Min"
                    min="0"
                    className="mb-2"
                  />
                </div>
                
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveSupplement(index)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ServiceSupplementsManager