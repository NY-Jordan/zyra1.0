'use client'
import React from 'react'
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/config/react-query";

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
