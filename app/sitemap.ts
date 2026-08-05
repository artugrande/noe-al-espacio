import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://noe-al-espacio.vercel.app"
  const now = new Date()
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/construir`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]
}
