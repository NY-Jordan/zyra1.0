import React from 'react'
import { useRouter } from 'next/navigation'

export default function FAQSection() {
  const router = useRouter()
  const faqs = [
    {
      question: "Puis-je changer de forfait ultérieurement ?",
      answer: "Oui, vous pouvez passer à un forfait supérieur ou inférieur à tout moment. Les ajustements de facturation seront calculés au prorata."
    },
    {
      question: "Y a-t-il un engagement minimum ?",
      answer: "Non, nos forfaits sont sans engagement. Vous pouvez annuler à tout moment sans frais supplémentaires."
    },
    {
      question: "Comment fonctionne la facturation annuelle ?",
      answer: "La facturation annuelle vous permet d'économiser 20% par rapport au tarif mensuel. Le montant total est prélevé une fois par an."
    }
  ]
  
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Questions fréquentes</h2>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-100">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 sm:mt-12 text-center">
            <p className="text-sm text-gray-600">
              Vous avez d'autres questions ? {' '}
              <button 
                onClick={() => router.push('/salon/contact')}
                className="text-emerald-600 font-medium hover:text-emerald-700"
              >
                Contactez notre équipe
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}