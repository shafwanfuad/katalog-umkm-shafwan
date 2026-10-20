import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const namaKategori = decodeURIComponent(slug).replace(/-/g, " ");

  return {
    title: `Kategori: ${namaKategori} | ${toko.nama}`,
    description: `Daftar produk kategori ${namaKategori} dari ${toko.nama}.`,
  };
}

// US-49: Halaman per kategori dari database
export default async function HalamanKategori({ params }) {
  const { slug } = await params;
  const namaKategori = decodeURIComponent(slug).replace(/-/g, " ");

  const supabase = createServerClient();
  const { data: daftarProduk, error } = await supabase
    .from("produk")
    .select("*")
    .ilike("kategori", namaKategori)
    .not("deskripsi", "ilike", "%[Nonaktif]%")
    .order("id", { ascending: true });

  if (error || !daftarProduk || daftarProduk.length === 0) {
    notFound();
  }

  const kategoriAsli = daftarProduk[0]?.kategori || namaKategori;

  return (
    <div className="py-10 flex flex-col gap-6">
      <div>
        <Link
          href="/"
          className="text-sm font-semibold text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          &larr; Kembali ke semua produk
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold capitalize">
            Kategori: {kategoriAsli}
          </h1>
          <span className="text-xs text-teks-lembut">
            {daftarProduk.length} produk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {daftarProduk.map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>
    </div>
  );
}
