'use client'

import React from 'react'
import { useFieldArray, Control, useWatch } from 'react-hook-form'
import { Input } from '@zyra/ui/components/input'
import { Plus, Trash2 } from 'lucide-react'
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-slate-800 dark:text-white">{title}</h3>
        <button
          type="button"
          onClick={handleAddSupplement}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {'Ajouter un supplément'}
        </button>
      </div>

      {fields.length === 0 && (
        <div className="bg-[#F8F4F0] dark:bg-slate-800/40 border border-dashed border-[#E8E0D8] dark:border-slate-700 rounded-xl p-6">
          <div className="text-center text-slate-400 dark:text-slate-500">
            <p className="text-[13px] font-medium">Aucun supplément ajouté</p>
            <p className="text-[12px] mt-1">
              Cliquez sur "{'Ajouter un supplément'}" pour ajouter des suppléments
            </p>
          </div>
        </div>
      )}

      {fields.length > 0 && (
        <div className="space-y-2.5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-xl p-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex-1">
                  <Input
                    {...control.register(`${fieldName}.${index}.name`, {
                      required: "Le nom du supplément est requis"
                    })}
                    placeholder="Nom du supplément"
                    className="h-9 rounded-lg border-[#E8E0D8] dark:border-slate-700"
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
                    className="h-9 rounded-lg border-[#E8E0D8] dark:border-slate-700"
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
                    className="h-9 rounded-lg border-[#E8E0D8] dark:border-slate-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSupplement(index)}
                  className="h-9 w-9 flex-shrink-0 rounded-lg flex items-center justify-center text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ServiceSupplementsManager