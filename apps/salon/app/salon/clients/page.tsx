import ClientsManagement from '@/presentation/components/clients/ClientsManagement'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'

export default function ClientsPage() {
  return <ProtectedLayout>
     <ClientsManagement />
  </ProtectedLayout>
}
