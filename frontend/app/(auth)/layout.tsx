
import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentification",
  description: "Connectez-vous ou créez un compte pour accéder à votre espace",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white p-4 rounded-xl shadow-xl">
          {children}
      </div>
    </div>

  )
}
