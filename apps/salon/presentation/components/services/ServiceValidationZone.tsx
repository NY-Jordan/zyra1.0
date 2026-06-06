import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { Badge } from '@zyra/ui/components/badge'
import { Loader2, Plus, Check, AlertTriangle, ShieldAlert } from 'lucide-react'
import { IService } from '@zyra/conf/domain/entities/services.entities'
import { ServiceAnalysisResult } from '@/services/ServiceValidationService'

interface ServiceValidationZoneProps {
  analysisResult: ServiceAnalysisResult
  serviceName: string
  selectedGlobalService: IService | null
  isCreatingGlobal: boolean
  onSelectGlobalService: (service: IService) => void
  onCreateGlobalService: () => void
}

/**
 * Composant de validation des services
 * 
 * Affiche la zone de validation avec :
 * - Statut de validation (Validé/En attente/Interdit)
 * - Messages d'erreur pour services interdits
 * - Liste des services trouvés dans la base globale
 * - Bouton de création de nouveau service global
 * - Confirmation de service validé
 */
export default function ServiceValidationZone({
  analysisResult,
  serviceName,
  selectedGlobalService,
  isCreatingGlobal,
  onSelectGlobalService,
  onCreateGlobalService
}: ServiceValidationZoneProps) {
  // Ne pas afficher si pas de validation nécessaire
  if (!analysisResult.shouldShowValidation) {
    return null
  }

  return (
    <div className={`p-4 rounded-lg border space-y-3 ${
      analysisResult.isForbidden ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-slate-800/50 dark:border-slate-700'
    }`}>
      {/* En-tête avec statut de validation */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Validation du service
        </h4>
        <ValidationStatusBadge analysisResult={analysisResult} />
      </div>

      {/* Message de service interdit */}
      {analysisResult.isForbidden && (
        <ForbiddenServiceMessage errorMessage={analysisResult.errorMessage} />
      )}

      {/* Services trouvés dans la base globale */}
      {!analysisResult.isForbidden && 
       analysisResult.searchResults.length > 0 && 
       !analysisResult.isValid && (
        <FoundServicesSection 
          searchResults={analysisResult.searchResults}
          onSelectService={onSelectGlobalService}
        />
      )}

      {/* Bouton créer service global */}
      {!analysisResult.isForbidden && analysisResult.canCreateGlobal && (
        <CreateGlobalServiceSection 
          serviceName={serviceName}
          isCreating={isCreatingGlobal}
          onCreate={onCreateGlobalService}
        />
      )}

      {/* Confirmation service validé */}
      {!analysisResult.isForbidden && 
       analysisResult.isValid && 
       selectedGlobalService && (
        <ValidatedServiceConfirmation service={selectedGlobalService} />
      )}
    </div>
  )
}

/**
 * Badge de statut de validation
 */
function ValidationStatusBadge({ analysisResult }: { analysisResult: ServiceAnalysisResult }) {
  if (analysisResult.isForbidden) {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
        <ShieldAlert className="h-3 w-3 mr-1" />
        Interdit
      </Badge>
    )
  }

  if (analysisResult.isValid) {
    return (
      <Badge variant="default" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
        <Check className="h-3 w-3 mr-1" />
        Validé
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-orange-500 text-orange-600">
      <AlertTriangle className="h-3 w-3 mr-1" />
      En attente
    </Badge>
  )
}

/**
 * Message d'erreur pour service interdit
 */
function ForbiddenServiceMessage({ errorMessage }: { errorMessage?: string }) {
  return (
    <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <h5 className="font-medium text-red-800 dark:text-red-300 mb-1">Service non autorisé</h5>
          <p className="text-sm text-red-700 dark:text-red-400">
            {errorMessage || 'Ce service n\'est pas autorisé.'}
          </p>
          <div className="mt-2 text-xs text-red-600 dark:text-red-400">
            💡 <strong>Conseil :</strong> Essayez d'être plus précis dans la dénomination 
            (ex: "Coupe Homme Moderne" au lieu de "Coupe")
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Section des services trouvés
 */
function FoundServicesSection({ 
  searchResults, 
  onSelectService 
}: { 
  searchResults: IService[]
  onSelectService: (service: IService) => void 
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 dark:text-slate-400">
        {searchResults.length} service(s) trouvé(s) dans la base globale :
      </p>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {searchResults.map((service) => (
          <ServiceCard 
            key={service.id}
            service={service}
            onClick={() => onSelectService(service)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Card individuelle pour chaque service trouvé
 */
function ServiceCard({ 
  service, 
  onClick 
}: { 
  service: IService
  onClick: () => void 
}) {
  return (
    <div
      onClick={onClick}
      className="p-3 bg-white dark:bg-slate-800 rounded-md border dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h5 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            {service.name}
          </h5>
        </div>
      </div>
    </div>
  )
}

/**
 * Section pour créer un nouveau service global
 */
function CreateGlobalServiceSection({ 
  serviceName, 
  isCreating, 
  onCreate 
}: { 
  serviceName: string
  isCreating: boolean
  onCreate: () => void 
}) {
  return (
    <div className="pt-2 border-t dark:border-slate-600">
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
        Aucun service trouvé. Vous devez d'abord créer ce service dans la base globale.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCreate}
        disabled={isCreating}
        className="w-full"
      >
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Création en cours...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Créer "{serviceName}" dans la base globale
          </>
        )}
      </Button>
    </div>
  )
}

/**
 * Confirmation de service validé
 */
function ValidatedServiceConfirmation({ service }: { service: IService }) {
  return (
    <div className="pt-2 border-t">
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" />
        <span>Service validé :</span>
        <strong>{service.name}</strong>
        {service.id === 'new' && (
          <Badge variant="outline" className="text-xs">Nouveau</Badge>
        )}
      </div>
    </div>
  )
}