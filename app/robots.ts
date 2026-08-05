import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = "https://noe-al-espacio.vercel.app"
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dev/"],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
