import type React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Noe al Espacio 3D",
  description: "Taller interactivo 3D inspirado en la astronauta argentina Noe Castro",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Meta tags para forzar orientación horizontal en móviles */}
        <meta name="screen-orientation" content="landscape" />
        <meta name="orientation" content="landscape" />
      </head>
      <body className={`${spaceGrotesk.variable} font-space-grotesk bg-black`}>
        {children}
      </body>
    </html>
  )
}
