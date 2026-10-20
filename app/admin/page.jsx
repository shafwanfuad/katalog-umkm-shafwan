import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// US-06 & US-07: data produk admin dari Supabase
// US-30: ringkasan dashboard (total produk, jumlah per kategori)
// US-33: cari & paginasi di list admin
// US-35: ekspor produk ke CSV
export default async function HalamanAdmin({ searchParams }) {
  const { q = "", halaman = "1" } = (await searchParams) || {};

  const halamanSekarang = Math.max(1, parseInt(halaman || "1", 10));
  const perHalaman = 15;
  const dari = (halamanSekarang - 1) * perHalaman;
  const sampai = dari + perHalaman - 1;

  let daftarProduk = [];
  let ringkasanKategori = {};
  let totalProdukSemua = 0;
  let totalHasil = 0;
  let totalHalaman = 1;

  try {
    const supabase = await createAdminClient();

    // Ambil data untuk ringkasan dashboard (US-30)
    const { data: semuaData } = await supabase
      .from("produk")
      .select("kategori, deskripsi");

    if (semuaData) {
      totalProdukSemua = semuaData.length;
      semuaData.forEach((item) => {
        const kat = item.kategori?.trim() || "Tanpa Kategori";
        ringkasanKategori[kat] = (ringkasanKategori[kat] || 0) + 1;
      });
    }

    // Hitung total hasil pencarian untuk paginasi admin (US-33)
    let countQuery = supabase
      .from("produk")
      .select("*", { count: "exact", head: true });

    if (q.trim()) {
      countQuery = countQuery.ilike("nama", `%${q.trim()}%`);
    }

    const { count } = await countQuery;
    totalHasil = count || 0;
    totalHalaman = Math.max(1, Math.ceil(totalHasil / perHalaman));

    // Query daftar produk dipaginasi
    let query = supabase.from("produk").select("*");

    if (q.trim()) {
      query = query.ilike("nama", `%${q.trim()}%`);
    }

    query = query
      .order("id", { ascending: false })
      .range(dari, sampai);

    const { data } = await query;
    if (data) {
      daftarProduk = data;
    }
  } catch (err) {
    console.error("Gagal mengambil data produk admin:", err);
  }

  function buatUrlAdmin(hal) {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (hal > 1) sp.set("halaman", hal.toString());
    const qs = sp.toString();
    return qs ? `/admin?${qs}` : "/admin";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      {/* Ringkasan Dashboard Toko (US-30) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-garis bg-permukaan/60 p-5">
          <p className="text-xs font-semibold text-teks-lembut">Total Produk</p>
          <p className="mt-2 text-3xl font-extrabold text-utama">{totalProdukSemua}</p>
          <p className="mt-1 text-xs text-teks-lembut">Terdaftar di database</p>
        </div>

        <div className="sm:col-span-2 rounded-2xl border border-garis bg-permukaan/60 p-5 flex flex-col gap-2">
          <p className="text-xs font-semibold text-teks-lembut">Produk per Kategori</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(ringkasanKategori).map(([kat, jml]) => (
              <span
                key={kat}
                className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-medium text-teks"
              >
                <span>{kat}:</span>
                <strong className="font-bold text-utama">{jml}</strong>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Header & Aksi Produk */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-garis pt-6">
        <div>
          <h1 className="text-2xl font-extrabold">Kelola Produk</h1>
          <p className="mt-0.5 text-sm text-teks-lembut">
            {q ? `Hasil pencarian "${q}": ${totalHasil} produk` : `Menampilkan ${daftarProduk.length} produk`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tombol Ekspor CSV (US-35) */}
          <a
            href="/admin/ekspor-csv"
            className="inline-flex items-center gap-1.5 rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
          >
            <span>📥</span>
            <span>Ekspor CSV</span>
          </a>

          <Tombol href="/admin/produk/baru">+ Tambah produk</Tombol>
        </div>
      </div>

      {/* Kolom Pencarian List Admin (US-33) */}
      <form method="GET" action="/admin" className="relative max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari nama produk di admin..."
          className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 pr-20 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-utama px-3 text-xs font-semibold text-white hover:bg-utama-gelap"
        >
          Cari
        </button>
      </form>

      {/* Tabel Produk dengan Status Aktif/Nonaktif (US-32) */}
      <TabelProduk daftarProduk={daftarProduk} />

      {/* Paginasi List Admin (US-33) */}
      {totalHalaman > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 text-sm">
          {halamanSekarang > 1 ? (
            <Link
              href={buatUrlAdmin(halamanSekarang - 1)}
              className="rounded-lg border border-garis bg-latar px-3 py-1.5 font-semibold text-teks hover:border-utama hover:text-utama"
            >
              &larr; Sebelumnya
            </Link>
          ) : (
            <span className="rounded-lg border border-garis/50 bg-permukaan px-3 py-1.5 font-medium text-teks-lembut/50 cursor-not-allowed">
              &larr; Sebelumnya
            </span>
          )}

          <span className="text-teks-lembut">
            Halaman <strong>{halamanSekarang}</strong> dari <strong>{totalHalaman}</strong>
          </span>

          {halamanSekarang < totalHalaman ? (
            <Link
              href={buatUrlAdmin(halamanSekarang + 1)}
              className="rounded-lg border border-garis bg-latar px-3 py-1.5 font-semibold text-teks hover:border-utama hover:text-utama"
            >
              Selanjutnya &rarr;
            </Link>
          ) : (
            <span className="rounded-lg border border-garis/50 bg-permukaan px-3 py-1.5 font-medium text-teks-lembut/50 cursor-not-allowed">
              Selanjutnya &rarr;
            </span>
          )}
        </div>
      )}
    </div>
  );
}
