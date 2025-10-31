// app/layout.tsx (Root layout : Navbar, Footer, i18n provider, ThemeProvider)
import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import Header  from "@/components/layout/header"
import Footer from "@/components/layout/footer"


export const metadata: Metadata = {
  title: 'Generative medical tutor',
  description: "Plateforme de ...",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen mt-18 bg-background text-text antialiased">
        <Header />
          <main id="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
