import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ssvnm.in";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
