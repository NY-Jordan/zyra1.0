import React from 'react'
import { Shield, Clock, Users, Calendar, Check, LifeBuoy } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-emerald-600" />,
      title: "Gestion des rendez-vous",
      description: "Système complet pour gérer les rendez-vous, avec notifications automatiques"
    },
    {
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      title: "Gestion des clients",
      description: "Base de données clients avec historique et préférences"
    },
    {
      icon: <Shield className="h-6 w-6 text-emerald-600" />,
      title: "Sécurité avancée",
      description: "Protection des données conformément aux normes RGPD"
    },
    {
      icon: <Clock className="h-6 w-6 text-emerald-600" />,
      title: "Accès 24/7",
      description: "Accès à votre tableau de bord depuis n'importe quel appareil"
    },
    {
      icon: <LifeBuoy className="h-6 w-6 text-emerald-600" />,
      title: "Support client",
      description: "Assistance technique par email et chat en direct"
    },
    {
      icon: <Check className="h-6 w-6 text-emerald-600" />,
      title: "Mises à jour gratuites",
      description: "Accès aux nouvelles fonctionnalités sans frais supplémentaires"
    }
  ]
  
  return (
    <section className="bg-white py-12 sm:py-16 border-t border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Tous les forfaits incluent</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 px-2">
              Des outils essentiels pour la gestion efficace de votre salon
            </p>
          </div>
          
          <div className="grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-50 flex items-center justify-center mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1 sm:mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}