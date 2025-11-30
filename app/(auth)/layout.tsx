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
    <div className="h-full">
      <div className="h-full">
          {children}
      </div>
    </div>
  )
}