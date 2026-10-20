import { Suspense } from "react";
import KartuProduk from "@/components/KartuProduk";
import FilterKatalog from "@/components/FilterKatalog";
import Paginasi from "@/components/Paginasi";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// US-01, US-11 (filter & pencarian), US-15 (urutan produk), US-16 (paginasi query database)
export default async function HalamanKatalog({ searchParams }) {
  const { q = "", kategori = "", urutan = "", halaman = "1" } =
    (await searchParams) || {};

  const halamanSekarang = Math.max(1, parseInt(halaman || "1", 10));
  const perHalaman = 12;
  const dari = (halamanSekarang - 1) * perHalaman;
  const sampai = dari + perHalaman - 1;

  let daftarProduk = [];
  let daftarKategori = ["Semua"];
  let totalData = 0;
  let totalHalaman = 1;
  let errorPesan = null;

  try {
    const supabase = createServerClient();

    // Ambil daftar kategori unik dari database
    const { data: katData } = await supabase.from("produk").select("kategori");
    if (katData) {
      const setKat = new Set(
        katData
          .map((k) => k.kategori?.trim())
          .filter(Boolean)
      );
      daftarKategori = ["Semua", ...Array.from(setKat)];
    }

    // Hitung total produk sesuai filter untuk paginasi akurat (US-16)
    let countQuery = supabase
      .from("produk")
      .select("*", { count: "exact", head: true });

    if (q.trim()) {
      countQuery = countQuery.ilike("nama", `%${q.trim()}%`);
    }

    if (kategori && kategori !== "Semua") {
      countQuery = countQuery.eq("kategori", kategori);
    }

    const { count } = await countQuery;
    totalData = count || 0;
    totalHalaman = Math.max(1, Math.ceil(totalData / perHalaman));

    // Query produk dengan batasan query database (range)
    let query = supabase.from("produk").select("*");

    if (q.trim()) {
      query = query.ilike("nama", `%${q.trim()}%`);
    }

    if (kategori && kategori !== "Semua") {
      query = query.eq("kategori", kategori);
    }

    if (urutan === "termurah") {
      query = query.order("harga", { ascending: true });
    } else if (urutan === "termahal") {
      query = query.order("harga", { ascending: false });
    } else if (urutan === "terbaru") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("id", { ascending: true });
    }

    // Pembatasan jumlah di level query database (US-16)
    query = query.range(dari, sampai);

    const { data, error } = await query;

    if (error) {
      errorPesan = error.message;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    errorPesan = err.message || "Terjadi kesalahan saat memuat data.";
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 id="judul-produk" className="text-xl font-bold">
              Produk kami
            </h2>
            <span className="text-xs text-teks-lembut">
              Menampilkan {daftarProduk.length} dari {totalData} produk
            </span>
          </div>
          <Suspense fallback={<div className="h-20 animate-pulse rounded-xl bg-permukaan" />}>
            <FilterKatalog
              daftarKategori={daftarKategori}
              kategoriTerpilih={kategori}
              kataKunciAwal={q}
              urutanAwal={urutan}
            />
          </Suspense>
        </div>

        {errorPesan ? (
          <p className="rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
            Gagal memuat produk: {errorPesan}
          </p>
        ) : daftarProduk.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-garis bg-permukaan py-12 text-center">
            <p className="font-semibold text-teks">Belum ada produk</p>
            {(q || (kategori && kategori !== "Semua")) && (
              <p className="mt-1 text-sm text-teks-lembut">
                Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {daftarProduk.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>

            {/* Navigasi Paginasi (US-16) */}
            <Paginasi
              halamanSekarang={halamanSekarang}
              totalHalaman={totalHalaman}
              queryParams={{ q, kategori, urutan }}
            />
          </>
        )}
      </section>
    </>
  );
}
