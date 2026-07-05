'use client'

import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { Minus, Plus } from 'lucide-react'

interface NumberOfPeopleProps {
  numberOfPeople: number
  onNumberChange: (number: number) => void
}

export default function NumberOfPeople({ numberOfPeople, onNumberChange }: NumberOfPeopleProps) {
  const handleIncrease = () => {
    if (numberOfPeople < 5) {
      onNumberChange(numberOfPeople + 1)
    }
  }

  const handleDecrease = () => {
    if (numberOfPeople > 1) {
      onNumberChange(numberOfPeople - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Nombre de personnes</h2>
        <p className="text-gray-600">Combien de personnes souhaitez-vous réserver?</p>
      </div>

      <div className="flex justify-center items-center gap-8">
        <Button
          onClick={handleDecrease}
          disabled={numberOfPeople <= 1}
          variant="outline"
          className="h-12 w-12 p-0"
        >
          <Minus className="h-6 w-6" />
        </Button>

        <div className="text-center">
          <div className="text-6xl font-bold text-gray-900 mb-2">{numberOfPeople}</div>
          <p className="text-gray-600">
            {numberOfPeople === 1 ? 'personne' : 'personnes'}
          </p>
        </div>

        <Button
          onClick={handleIncrease}
          disabled={numberOfPeople >= 5}
          className="h-12 w-12 p-0 bg-gray-900 hover:bg-gray-800"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-900">
          Vous pourrez configurer les détails pour chaque personne à l'étape suivante
        </p>
      </div>
    </div>
  )
}
