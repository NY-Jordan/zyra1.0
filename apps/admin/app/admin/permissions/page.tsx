'use client'
import React from 'react'
import PageHeader from '@/presentation/components/common/PageHeader'
import PermissionsManagement from '@/presentation/components/permissions/PermissionsManagement'

export default function PermissionsPage() {
  return (
    <>
      <PageHeader
        title="Permissions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Permissions', isCurrent: true },
        ]}
      />
      <PermissionsManagement />
    </>
  )
}
