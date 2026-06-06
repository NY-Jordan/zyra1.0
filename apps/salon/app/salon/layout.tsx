import SalonLayoutClient from "@/presentation/layouts/SalonLayoutClient"

export default function SalonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SalonLayoutClient>{children}</SalonLayoutClient>
}
