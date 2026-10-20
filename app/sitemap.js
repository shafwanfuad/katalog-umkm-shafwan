import { createServerClient } from "@/lib/supabase/server";

// US-27: sitemap.xml dibuat dari database dan memuat halaman produk
export default async function sitemap() {
  const baseUrl = process.env.SITE_URL || "https://katalog-umkm.vercel.app";

  let produkUrls = [];
  try {
    const supabase = createServerClient();
    const { data: produk } = await supabase.from("produk").select("id, created_at");
    if (produk) {
      produkUrls = produk.map((p) => ({
        url: `${baseUrl}/produk/${p.id}`,
        lastModified: p.created_at || new Date().toISOString(),
      }));
    }
  } catch {
    // Abaikan
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${baseUrl}/favorit`,
      lastModified: new Date().toISOString(),
    },
    ...produkUrls,
  ];
}
