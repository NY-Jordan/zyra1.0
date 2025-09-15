import type { Metadata } from "next";
import { Providers } from "../../components/providers";
import "@zyra/ui/globals.css"
import { Toaster } from "@zyra/ui/components/sonner";


export const metadata: Metadata = {
  title: "Salon Admin - Gestion de salon",
  description: "Interface d'administration pour salon de coiffure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
      >
        <Providers>
          {children}
          <Toaster position="top-right"  />

        </Providers>
      </body>
    </html>
  );
}
