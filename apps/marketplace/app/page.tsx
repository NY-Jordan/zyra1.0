import type { Metadata } from 'next'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { HeroSection } from '@/components/landing/sections/HeroSection'
import { ProblemSection } from '@/components/landing/sections/ProblemSection'
import { SolutionSection } from '@/components/landing/sections/SolutionSection'
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection'
import { DemoSection } from '@/components/landing/sections/DemoSection'
import { MobileAppSection } from '@/components/landing/sections/MobileAppSection'
import { PricingSection } from '@/components/landing/sections/PricingSection'
import { TestimonialsSection } from '@/components/landing/sections/TestimonialsSection'
import { ContactSection } from '@/components/landing/sections/ContactSection'
import { LanguageProvider } from '@/components/landing/i18n/LanguageContext'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  offers: {
    '@type': 'Offer',
    price: '15000',
    priceCurrency: 'XAF',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '15000',
      priceCurrency: 'XAF',
      unitText: 'MONTH',
    },
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/full-logo-dark.png`,
  },
}

export default function HomePage() {
  return (
    <LanguageProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white font-[family-name:var(--font-inter)] dark:bg-[#0B0E12]">
        <LandingNavbar />
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <DemoSection />
        <MobileAppSection />
        <PricingSection />
        <TestimonialsSection />
        <ContactSection />
        <LandingFooter />
      </div>
    </LanguageProvider>
  )
}
