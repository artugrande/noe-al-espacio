import type React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk } from "next/font/google"
import { HydrateLocale } from "@/components/hud/HydrateLocale"
import { LocaleProvider } from "@/lib/i18n/locale"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const siteUrl = "https://noe-al-espacio.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Noe al Espacio — Juego 3D argentino",
    template: "%s · Noe al Espacio",
  },
  description:
    "Juego 3D tribute a la astronauta argentina Noel de Castro: esquivá basura espacial, juntá mates, usá escudo, impulso e imán, y llegá a la ISS. Hecho en Salta.",
  keywords: [
    "Noe al Espacio",
    "Noel de Castro",
    "astronauta argentina",
    "juego 3D",
    "basura espacial",
    "Salta",
    "Axiom Space",
    "taller educativo",
  ],
  authors: [{ name: "ArtuGrande", url: "https://x.com/ArtuGrande" }],
  creator: "ArtuGrande",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "Noe al Espacio",
    title: "Noe al Espacio — Juego 3D argentino",
    description:
      "Esquivá basura espacial, juntá mates con el imán y llegá a la estación. Tribute a Noel de Castro.",
    images: [
      {
        url: "/images/noe-al-espacio-logo.png",
        width: 930,
        height: 1050,
        alt: "Logo de Noe al Espacio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Noe al Espacio — Juego 3D argentino",
    description:
      "Esquivá basura espacial, juntá mates con el imán y llegá a la estación.",
    creator: "@ArtuGrande",
    images: ["/images/noe-al-espacio-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Noe al Espacio",
  description:
    "Juego 3D web tribute a la astronauta argentina Noel de Castro. Esquivá basura espacial, juntá mates y llegá a la ISS.",
  url: siteUrl,
  inLanguage: "es-AR",
  genre: ["Arcade", "Educational"],
  gamePlatform: "Web Browser",
  author: {
    "@type": "Person",
    name: "ArtuGrande",
    url: "https://x.com/ArtuGrande",
  },
  image: `${siteUrl}/images/noe-al-espacio-logo.png`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="screen-orientation" content="landscape" />
        <meta name="orientation" content="landscape" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} font-space-grotesk bg-black`}>
        <LocaleProvider>
          <HydrateLocale />
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
