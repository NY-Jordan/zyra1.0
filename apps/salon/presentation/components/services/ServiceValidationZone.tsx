import React from 'react'
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
    <div className={`p-4 rounded-xl border space-y-3 ${
      analysisResult.isForbidden
        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
        : 'bg-[#F8F4F0] dark:bg-slate-800/40 border-[#E8E0D8] dark:border-slate-700'
    }`}>
      {/* En-tête avec statut de validation */}
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-slate-800 dark:text-white">
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
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50">
        <ShieldAlert className="h-3 w-3" />
        Interdit
      </span>
    )
  }

  if (analysisResult.isValid) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50">
        <Check className="h-3 w-3" />
        Validé
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50">
      <AlertTriangle className="h-3 w-3" />
      En attente
    </span>
  )
}

/**
 * Message d'erreur pour service interdit
 */
function ForbiddenServiceMessage({ errorMessage }: { errorMessage?: string }) {
  return (
    <div className="p-3 bg-rose-100 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-white/70 dark:bg-black/20 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <h5 className="text-[13px] font-bold text-rose-800 dark:text-rose-300 mb-1">Service non autorisé</h5>
          <p className="text-[12px] text-rose-700 dark:text-rose-400">
            {errorMessage || 'Ce service n\'est pas autorisé.'}
          </p>
          <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400">
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
      <p className="text-[12px] text-slate-500 dark:text-slate-400">
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
      className="p-3 bg-white dark:bg-[#161B24] rounded-xl border border-[#F0EAE4] dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h5 className="text-[13px] font-semibold text-slate-700 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
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
    <div className="pt-2 border-t border-[#E8E0D8] dark:border-slate-700">
      <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        Aucun service trouvé. Vous devez d'abord créer ce service dans la base globale.
      </p>
      <button
        type="button"
        onClick={onCreate}
        disabled={isCreating}
        className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 transition-colors"
      >
        {isCreating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Création en cours...
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" />
            Créer "{serviceName}" dans la base globale
          </>
        )}
      </button>
    </div>
  )
}

/**
 * Confirmation de service validé
 */
function ValidatedServiceConfirmation({ service }: { service: IService }) {
  return (
    <div className="pt-2 border-t border-[#E8E0D8] dark:border-slate-700">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
        <Check className="h-4 w-4" />
        <span>Service validé :</span>
        <strong>{service.name}</strong>
        {service.id === 'new' && (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#F5F2EF] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-[#EDE8E3] dark:border-slate-700">
            Nouveau
          </span>
        )}
      </div>
    </div>
  )
}