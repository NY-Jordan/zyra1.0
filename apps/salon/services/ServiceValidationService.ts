import { IService } from '@zyra/conf/domain/entities/services.entities'
import { ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import { fetchCollection, createDocument } from '@zyra/conf/lib/query'
import { isForbiddenService } from '@zyra/conf/lib/config'
import { serviceSchema } from '@/schema/services.schema'
import * as z from 'zod'

// Type dérivé du schema
type ServiceFormData = z.infer<typeof serviceSchema>

/**
 * Interface pour le résultat d'analyse d'un service
 */
export interface ServiceAnalysisResult {
  /** Le service est-il valide pour être créé ? */
  isValid: boolean
  /** Le service est-il interdit par les règles métier ? */
  isForbidden: boolean
  /** Liste des services trouvés dans la recherche */
  searchResults: IService[]
  /** Service avec correspondance exacte si trouvé */
  exactMatch: IService | null
  /** Peut-on créer ce service dans la base globale ? */
  canCreateGlobal: boolean
  /** Doit-on afficher la zone de validation ? */
  shouldShowValidation: boolean
  /** Message d'erreur si applicable */
  errorMessage?: string
}

/**
 * Interface pour les options de validation
 */
export interface ValidationOptions {
  /** Longueur minimale du nom pour déclencher la validation */
  minNameLength?: number
  /** Inclure les services inactifs dans la recherche */
  includeInactive?: boolean
}

/**
 * Interface pour le résultat de validation avec le schema Zod
 */
export interface ValidationResult {
  /** Les données sont-elles valides ? */
  valid: boolean
  /** Liste des erreurs de validation */
  errors: string[]
  /** Données validées et transformées si valides */
  data?: ServiceFormData
}

/**
 * Service de validation et gestion des services salon
 * 
 * Ce service centralise toute la logique de :
 * - Validation des noms de services
 * - Recherche dans la base globale
 * - Vérification des services interdits
 * - Création de nouveaux services globaux
 * - Analyse de disponibilité des noms
 * - Validation avec Zod schema
 */
export class ServiceValidationService {
  private static instance: ServiceValidationService
  private globalServicesCache: IService[] = []
  private lastCacheUpdate = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Singleton pattern pour éviter les instances multiples
   */
  public static getInstance(): ServiceValidationService {
    if (!ServiceValidationService.instance) {
      ServiceValidationService.instance = new ServiceValidationService()
    }
    return ServiceValidationService.instance
  }

  /**
   * Charger les services globaux avec cache intelligent
   * @param forceRefresh - Force le rechargement même si le cache est valide
   * @returns Promise<IService[]> - Liste des services globaux
   */
  public async loadGlobalServices(forceRefresh = false): Promise<IService[]> {
    const now = Date.now()
    
    // Utiliser le cache si disponible et récent, sauf si refresh forcé
    if (!forceRefresh && 
        this.globalServicesCache.length > 0 && 
        (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
      return this.globalServicesCache
    }

    try {
      const services = await fetchCollection('services') as IService[]
      this.globalServicesCache = services
      this.lastCacheUpdate = now
      return services
    } catch (error) {
      console.error('Erreur lors du chargement des services globaux:', error)
      // Retourner le cache même périmé en cas d'erreur
      return this.globalServicesCache
    }
  }

  /**
   * Analyser un nom de service et retourner toutes les informations de validation
   * @param serviceName - Nom du service à analyser
   * @param selectedService - Service actuellement sélectionné (peut être null)
   * @param options - Options de validation
   * @returns ServiceAnalysisResult - Résultat complet de l'analyse
   */
  public async analyzeServiceName(
    serviceName: string,
    selectedService: IService | null = null,
    options: ValidationOptions = {}
  ): Promise<ServiceAnalysisResult> {
    const {
      minNameLength = 4,
      includeInactive = false
    } = options

    const trimmedName = serviceName?.trim() || ''

    // Cas 1: Nom trop court
    if (trimmedName.length < minNameLength) {
      return {
        isValid: false,
        isForbidden: false,
        searchResults: [],
        exactMatch: null,
        canCreateGlobal: false,
        shouldShowValidation: false
      }
    }

    // Charger les services globaux
    const globalServices = await this.loadGlobalServices()

    // Cas 2: Service interdit
    const forbiddenServices = globalServices.filter(s => s.status === false)
    const isForbidden = isForbiddenService(trimmedName, forbiddenServices)

    if (isForbidden) {
      return {
        isValid: false,
        isForbidden: true,
        searchResults: [],
        exactMatch: null,
        canCreateGlobal: false,
        shouldShowValidation: true,
        errorMessage: 'Ce service est similaire à un service existant et n\'est pas autorisé'
      }
    }

    // Cas 3: Recherche des services correspondants
    const activeServices = globalServices.filter(service => 
      includeInactive || service.status === true
    )

    const searchResults = activeServices.filter(service =>
      service.name.toLowerCase().includes(trimmedName.toLowerCase())
    )

    // Cas 4: Vérification match exact
    const exactMatch = searchResults.find(service => 
      service.name.toLowerCase().trim() === trimmedName.toLowerCase()
    )

    // Cas 5: Déterminer la validité
    const isValid = !!exactMatch || !!selectedService

    return {
      isValid,
      isForbidden: false,
      searchResults,
      exactMatch,
      canCreateGlobal: searchResults.length === 0 && !selectedService,
      shouldShowValidation: true
    }
  }

  /**
   * Créer un nouveau service dans la base globale
   * @param serviceName - Nom du service à créer
   * @param additionalData - Données supplémentaires (optionnel)
   * @returns Promise<IService> - Le service créé
   */
  public async createGlobalService(
    serviceName: string,
    additionalData: Partial<Omit<IService, 'id' | 'name'>> = {}
  ): Promise<IService> {
    const trimmedName = serviceName.trim()
    
    if (!trimmedName) {
      throw new Error('Le nom du service est obligatoire')
    }

    // Vérifier que le service n'existe pas déjà
    const analysis = await this.analyzeServiceName(trimmedName)
    if (analysis.exactMatch) {
      throw new Error('Un service avec ce nom existe déjà')
    }

    if (analysis.isForbidden) {
      throw new Error('Ce service n\'est pas autorisé')
    }

    try {
      const newServiceData: Omit<IService, 'id'> = {
        name: trimmedName,
        status: true,
        reservations: 0,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        ...additionalData
      }

      const createdService = await createDocument('services', newServiceData)
      
      // Invalider le cache pour forcer un rechargement
      this.lastCacheUpdate = 0

      return {
        id: createdService.id || 'new',
        ...newServiceData
      }
    } catch (error) {
      console.error('Erreur lors de la création du service global:', error)
      throw new Error('Impossible de créer le service global')
    }
  }

  /**
   * Vérifier si un service existe déjà dans un salon
   * @param serviceName - Nom du service à vérifier
   * @param salonServices - Liste des services du salon
   * @returns boolean - True si le service existe déjà
   */
  public serviceExistsInSalon(
    serviceName: string,
    salonServices: ISalonService[]
  ): boolean {
    const trimmedName = serviceName.trim().toLowerCase()
    return salonServices.some(
      service => service.name.toLowerCase().trim() === trimmedName
    )
  }

  /**
   * Rechercher des services par mot-clé
   * @param keyword - Mot-clé de recherche
   * @param limit - Nombre maximum de résultats (défaut: 10)
   * @returns Promise<IService[]> - Services correspondants
   */
  public async searchServices(keyword: string, limit = 10): Promise<IService[]> {
    if (!keyword || keyword.trim().length < 2) {
      return []
    }

    const globalServices = await this.loadGlobalServices()
    const trimmedKeyword = keyword.trim().toLowerCase()

    return globalServices
      .filter(service => 
        service.status === true &&
        service.name.toLowerCase().includes(trimmedKeyword)
      )
      .slice(0, limit)
  }

  /**
   * Obtenir des suggestions de noms basées sur une saisie partielle
   * @param partialName - Début du nom saisi
   * @param limit - Nombre maximum de suggestions
   * @returns Promise<string[]> - Liste des suggestions
   */
  public async getNameSuggestions(partialName: string, limit = 5): Promise<string[]> {
    if (!partialName || partialName.trim().length < 2) {
      return []
    }

    const services = await this.searchServices(partialName, limit * 2)
    
    // Extraire les noms uniques et les trier par pertinence
    return services
      .map(service => service.name)
      .filter((name, index, array) => array.indexOf(name) === index)
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(partialName.toLowerCase())
        const bStarts = b.toLowerCase().startsWith(partialName.toLowerCase())
        
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return a.length - b.length
      })
      .slice(0, limit)
  }

  /**
   * Valider les données d'un service avec le schema Zod
   * @param serviceData - Données du service à valider (objet complet ou partiel)
   * @returns Promise<ValidationResult> - Résultat de validation avec schema
   */
  public async validateServiceData(serviceData: Partial<ServiceFormData>): Promise<ValidationResult> {
    try {
      // Validation avec le schema Zod
      const validatedData = serviceSchema.parse(serviceData)
      // Vérifications métier supplémentaires
      const businessValidation = await this.validateBusinessRules(validatedData)
      if (!businessValidation.valid) {
        return {
          valid: false,
          errors: businessValidation.errors,
        }
      }

      return {
        valid: true,
        errors: [],
        data: validatedData
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => {
          const path = err.path.join('.')
          return `${path}: ${err.message}`
        })
        return {
          valid: false,
          errors
        }
      }

      return {
        valid: false,
        errors: ['Erreur de validation inconnue']
      }
    }
  }

  /**
   * Validation des règles métier (complémentaire au schema Zod)
   * @param serviceData - Données validées par le schema
   * @returns Promise<{valid: boolean, errors: string[]}> - Résultat de validation métier
   */
  private async validateBusinessRules(serviceData: ServiceFormData): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Vérifier si le nom de service est interdit
    const analysis = await this.analyzeServiceName(serviceData.name)
    if (analysis.isForbidden) {
      errors.push('Ce nom de service n\'est pas autorisé selon les règles métier')
    }

    // Règles métier spécifiques
    // Exemple: Certaines combinaisons prix/durée peuvent être invalides
    if (serviceData.price > 0 && serviceData.duration > 0) {
      const pricePerMinute = serviceData.price / serviceData.duration
      if (pricePerMinute > 10000) { // Plus de 10k XAF par minute
        errors.push('Le rapport prix/durée semble trop élevé (max 10,000 XAF par minute)')
      }
    }

    // Validation de l'URL d'image si fournie
    if (serviceData.imageUrl && serviceData.imageUrl !== '') {
      try {
        new URL(serviceData.imageUrl)
        // Vérifier que c'est bien une image
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
        const hasValidExtension = imageExtensions.some(ext => 
          serviceData.imageUrl!.toLowerCase().includes(ext)
        )
        if (!hasValidExtension) {
          errors.push('L\'URL de l\'image doit pointer vers un fichier image valide')
        }
      } catch {
        errors.push('L\'URL de l\'image n\'est pas valide')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Valider uniquement le nom avec le schema (utile pour la validation en temps réel)
   * @param name - Nom à valider
   * @returns {valid: boolean, error?: string} - Résultat de validation
   */
  public validateServiceName(name: string): { valid: boolean; error?: string } {
    try {
      // Utiliser seulement la validation du nom du schema
      const nameSchema = serviceSchema.pick({ name: true })
      nameSchema.parse({ name })
      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const nameError = error.errors.find(err => err.path[0] === 'name')
        return {
          valid: false,
          error: nameError?.message || 'Nom invalide'
        }
      }
      return {
        valid: false,
        error: 'Erreur de validation du nom'
      }
    }
  }

  /**
   * Obtenir la configuration du schema pour l'interface utilisateur
   * @returns Limites et contraintes définies dans le schema
   */
  public getSchemaConstraints() {
    return {
      name: {
        minLength: 4,
        maxLength: 100
      },
      price: {
        min: 0,
        max: 1000000
      },
      duration: {
        min: 5,
        max: 480
      }
    }
  }

  /**
   * Nettoyer le cache (utile pour les tests ou après des modifications importantes)
   */
  public clearCache(): void {
    this.globalServicesCache = []
    this.lastCacheUpdate = 0
  }

  /**
   * Obtenir des statistiques sur les services
   * @returns Promise<ServiceStats> - Statistiques des services
   */
  public async getServiceStats(): Promise<{
    total: number
    active: number
    inactive: number
    mostPopular: IService[]
  }> {
    const services = await this.loadGlobalServices()
    
    const active = services.filter(s => s.status === true)
    const inactive = services.filter(s => s.status === false)
    const mostPopular = services
      .filter(s => s.status === true)
      .sort((a, b) => (b.reservations || 0) - (a.reservations || 0))
      .slice(0, 5)

    return {
      total: services.length,
      active: active.length,
      inactive: inactive.length,
      mostPopular
    }
  }

  /**
   * Valider et transformer les données avant création d'un service salon
   * @param rawData - Données brutes du formulaire
   * @returns Promise<{success: boolean, data?: ServiceFormData, errors?: string[]}> - Résultat complet
   */
  public async prepareServiceForCreation(rawData: unknown): Promise<{
    success: boolean
    data?: ServiceFormData
    errors?: string[]
  }> {
    try {
      // Étape 1: Validation avec le schema
      const validation = await this.validateServiceData(rawData as Partial<ServiceFormData>)
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        }
      }

      // Étape 2: Nettoyage et transformation des données
      const cleanedData: ServiceFormData = {
        ...validation.data!,
        name: validation.data!.name.trim(),
        imageUrl: validation.data!.imageUrl?.trim() || undefined
      }

      return {
        success: true,
        data: cleanedData
      }
    } catch (error) {
      return {
        success: false,
        errors: ['Erreur lors de la préparation des données du service']
      }
    }
  }
}

// Export d'une instance par défaut pour faciliter l'utilisation
export const serviceValidationService = ServiceValidationService.getInstance()

// Export du type pour utilisation dans les composants
export type { ServiceFormData }