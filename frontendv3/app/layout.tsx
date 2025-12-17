import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import {Toaster} from "react-hot-toast"; // Importez le provider

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
    title: "MedTutor AI",
    description: "Formation médicale par simulation",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
        <body className={inter.className}>
        <AuthProvider>
            {children}
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        </AuthProvider>
        </body>
        </html>
    );
}