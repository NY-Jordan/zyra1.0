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

export default function HomePage() {
  return (
    <LanguageProvider>
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
