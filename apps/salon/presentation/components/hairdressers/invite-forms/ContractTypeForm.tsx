'use client'

import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'
import { Input } from '@zyra/ui/components/input'
import { DollarSign, Percent } from 'lucide-react'

type ContractType = 'commission' | 'salary'

interface ContractTypeFormProps {
  contractType: ContractType
  commissionRate?: number
  salary?: number
  onContractTypeChange: (type: ContractType) => void
  onCommissionRateChange: (rate: number) => void
  onSalaryChange: (salary: number) => void
}

export default function ContractTypeForm({
  contractType,
  commissionRate,
  salary,
  onContractTypeChange,
  onCommissionRateChange,
  onSalaryChange
}: ContractTypeFormProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Choisissez le type de contrat et la rémunération
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`cursor-pointer transition-all ${
            contractType === 'commission' 
              ? 'ring-2 ring-primary border-primary' 
              : 'hover:shadow-md'
          }`}
          onClick={() => onContractTypeChange('commission')}
        >
          <CardContent className="p-6 text-center">
            <Percent className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Commission</h3>
            <p className="text-sm text-muted-foreground">
              Rémunération basée sur un pourcentage des services
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            contractType === 'salary' 
              ? 'ring-2 ring-primary border-primary' 
              : 'hover:shadow-md'
          }`}
          onClick={() => onContractTypeChange('salary')}
        >
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Salaire fixe</h3>
            <p className="text-sm text-muted-foreground">
              Rémunération mensuelle fixe
            </p>
          </CardContent>
        </Card>
      </div>

      {contractType === 'commission' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Taux de commission (%)</label>
          <div className="relative">
            <Input
              type="number"
              min="1"
              max="100"
              value={commissionRate || ''}
              onChange={(e) => onCommissionRateChange(parseInt(e.target.value) || 0)}
              placeholder="Ex: 30"
              className="pr-8"
            />
            <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}

      {contractType === 'salary' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Salaire mensuel (XAF)</label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              value={salary || ''}
              onChange={(e) => onSalaryChange(parseInt(e.target.value) || 0)}
              placeholder="Ex: 150000"
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              XAF
            </span>
          </div>
        </div>
      )}
    </div>
  )
}