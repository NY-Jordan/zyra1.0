'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOwner } from '@/hooks/useOwner'
import { useSalon } from '@/hooks/useSalon'
import LoadingScreen from '@/presentation/components/common/LoadingScreen'

interface SetupWrapperProps {
  children: React.ReactNode
}

export default function SetupWrapper({ children }: SetupWrapperProps) {
  const { isAuthenticated, isLoading: authLoading } = useOwner()
  const { isConnected } = useSalon()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    if (isConnected) {
      router.push('/salon/dashboard')
    }
  }, [authLoading, isAuthenticated, isConnected, router])
  if (authLoading) return <LoadingScreen message="Chargement..." />
  if (!isAuthenticated || isConnected) return null

  return <>{children}</>
}
