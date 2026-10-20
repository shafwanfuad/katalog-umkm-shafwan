import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import TombolBagikan from "@/components/TombolBagikan";
import GaleriFoto from "@/components/GaleriFoto";
import KartuProduk from "@/components/KartuProduk";
import CatatTerakhirDilihat from "@/components/CatatTerakhirDilihat";
import KotakTanyaAI from "@/components/KotakTanyaAI";
import { formatRupiah } from "@/lib/format";
import { parseDetailProduk } from "@/lib/produk-helper";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// US-26: Metadata SEO dan Open Graph
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const supabase = createServerClient();
    const { data: rawProduk } = await supabase
      .from("produk")
      .select("nama, deskripsi, foto_url")
      .eq("id", id)
      .maybeSingle();

    if (!rawProduk) {
      return {
        title: "Produk Tidak Ditemukan",
      };
    }

    const produk = parseDetailProduk(rawProduk);
    const judul = `${produk.nama} | ${toko.nama}`;
    const deskripsi = produk.deskripsiTampil || toko.tagline;

    return {
      title: judul,
      description: deskripsi,
      openGraph: {
        title: judul,
        description: deskripsi,
        images: [
          {
            url: produk.foto_url || "/produk/kopi.svg",
            alt: produk.nama,
          },
        ],
      },
    };
  } catch {
    return {
      title: toko.nama,
    };
  }
}

// US-02: detail produk dari Supabase
// US-17: produk terkait
// US-18: galeri foto
// US-19: status stok
// US-20: harga coret & badge
// US-23: tombol bagikan
export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;

  const supabase = createServerClient();
  const { data: rawProduk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // US-32: produk nonaktif menampilkan halaman tidak ditemukan
  if (error || !rawProduk || rawProduk.deskripsi?.includes("[Nonaktif]")) {
    notFound();
  }

  const produk = parseDetailProduk(rawProduk);

  // Ambil produk terkait dari kategori yang sama, tidak termasuk produk saat ini (US-17)
  let produkTerkait = [];
  if (produk.kategori) {
    const { data: terkait } = await supabase
      .from("produk")
      .select("*")
      .eq("kategori", produk.kategori)
      .neq("id", produk.id)
      .limit(4);
    produkTerkait = terkait || [];
  }

  return (
    <div className="py-8 md:py-12">
      <article className="grid gap-8 md:grid-cols-2">
        {/* Galeri foto produk (US-18) */}
        <GaleriFoto fotoUrl={produk.foto_url} nama={produk.nama} />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-sm text-teks-lembut underline underline-offset-4 transition-colors hover:text-utama"
            >
              &larr; Kembali ke katalog
            </Link>

            {/* Tombol Bagikan / Salin Link (US-23) */}
            <TombolBagikan judul={produk.nama} deskripsi={produk.deskripsiTampil} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tautan Kategori (US-49) */}
            <Link
              href={`/kategori/${encodeURIComponent(
                produk.kategori?.toLowerCase().replace(/\s+/g, "-") || "umum"
              )}`}
              className="rounded-full border border-garis bg-permukaan px-3 py-1 text-xs font-semibold text-teks-lembut transition-colors hover:border-utama hover:text-utama"
            >
              {produk.kategori}
            </Link>

            {/* Badge Stok Habis (US-19) */}
            {produk.isHabis ? (
              <span className="rounded-full bg-bahaya px-3 py-1 text-xs font-bold text-white">
                Stok Habis
              </span>
            ) : produk.badge ? (
              /* Badge Produk (US-20: Baru / Terlaris) */
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
                  produk.badge.toLowerCase() === "terlaris"
                    ? "bg-amber-600"
                    : "bg-utama"
                }`}
              >
                {produk.badge}
              </span>
            ) : null}
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {produk.nama}
          </h1>

          <div className="flex flex-wrap items-baseline gap-3">
            <p className="self-start rounded-lg bg-harga-latar px-3.5 py-1.5 text-2xl font-bold text-harga">
              {formatRupiah(produk.harga)}
            </p>
            {/* Harga Coret (US-20) */}
            {produk.hargaCoret && produk.hargaCoret > produk.harga && (
              <span className="text-base font-medium text-teks-lembut line-through">
                {formatRupiah(produk.hargaCoret)}
              </span>
            )}
          </div>

          <p className="max-w-prose leading-relaxed text-teks-lembut">
            {produk.deskripsiTampil}
          </p>

          <TombolWhatsApp produk={produk} />

          {/* Tanya Asisten AI (US-50) */}
          <KotakTanyaAI produkId={produk.id} namaProduk={produk.nama} />

          {/* Pencatat Terakhir Dilihat (US-36) */}
          <CatatTerakhirDilihat produk={produk} />
        </div>
      </article>

      {/* Produk Terkait (US-17) */}
      {produkTerkait.length > 0 && (
        <section className="mt-16 border-t border-garis pt-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Produk terkait</h2>
            <p className="mt-1 text-sm text-teks-lembut">
              Pilihan lain dalam kategori &ldquo;{produk.kategori}&rdquo;
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
