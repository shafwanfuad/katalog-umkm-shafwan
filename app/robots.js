// US-27: robots.txt valid dan menunjuk ke sitemap
export default function robots() {
  const baseUrl = process.env.SITE_URL || "https://katalog-umkm.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
