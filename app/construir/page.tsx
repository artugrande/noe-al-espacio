import type { Metadata } from "next"
import { BuildGuide } from "@/components/guide/BuildGuide"

export const metadata: Metadata = {
  title: "Construí tu propio juego · Noe al Espacio",
  description:
    "Guía educativa paso a paso para construir un juego 3D con Cursor, inspirada en Noe al Espacio y en astronautas argentinos.",
}

export default function ConstruirPage() {
  return <BuildGuide />
}
