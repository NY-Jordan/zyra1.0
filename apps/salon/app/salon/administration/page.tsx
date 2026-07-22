'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import AdministrationManagement from '@/presentation/components/administration/AdministrationManagement'
import { useSalonMember } from '@/hooks/useSalonMember'

export default function AdministrationPage() {
  const { member, isLoading } = useSalonMember()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || !member) return
    toast.error('Accès réservé au propriétaire du salon')
    router.replace('/salon/dashboard')
  }, [isLoading, member, router])

  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-6">
        {isLoading || member ? null : <AdministrationManagement />}
      </div>
    </ProtectedLayout>
  )
}
