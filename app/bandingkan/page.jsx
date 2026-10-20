import Link from "next/link";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { formatRupiah } from "@/lib/format";
import { parseDetailProduk } from "@/lib/produk-helper";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bandingkan Produk",
  description: "Bandingkan spesifikasi dan harga dua produk pilihan secara berdampingan.",
};

// US-37: Bandingkan 2 produk secara berdampingan
export default async function HalamanBandingkan({ searchParams }) {
  const { id1, id2 } = (await searchParams) || {};

  if (!id1 || !id2) {
    return (
      <div className="py-16 text-center flex flex-col items-center gap-4">
        <h1 className="text-2xl font-extrabold">Bandingkan 2 Produk</h1>
        <p className="max-w-md text-sm text-teks-lembut">
          Pilih dua produk dari katalog untuk membandingkan foto, kategori, harga,
          dan deskripsinya secara langsung.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-utama px-5 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap"
        >
          Pilih Produk di Katalog
        </Link>
      </div>
    );
  }

  const supabase = createServerClient();
  const [{ data: raw1 }, { data: raw2 }] = await Promise.all([
    supabase.from("produk").select("*").eq("id", id1).maybeSingle(),
    supabase.from("produk").select("*").eq("id", id2).maybeSingle(),
  ]);

  if (!raw1 || !raw2) {
    return (
      <div className="py-16 text-center flex flex-col items-center gap-4">
        <h1 className="text-2xl font-extrabold">Produk Tidak Ditemukan</h1>
        <p className="text-sm text-teks-lembut">
          Salah satu atau kedua produk yang dibandingkan tidak ada di database.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-utama px-5 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const produk1 = parseDetailProduk(raw1);
  const produk2 = parseDetailProduk(raw2);

  return (
    <div className="py-10 flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="text-sm font-semibold text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          &larr; Kembali ke katalog
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold">Perbandingan Produk</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Melihat kelebihan dan perbedaan antara kedua produk pilihan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[produk1, produk2].map((p, index) => (
          <div
            key={p.id}
            className="flex flex-col gap-4 rounded-2xl border border-garis bg-latar p-5 shadow-sm"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-permukaan">
              <img
                src={p.foto_url}
                alt={p.nama}
                className="h-full w-full object-cover"
              />
              <span className="absolute top-3 left-3 rounded-md bg-utama px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                Produk {index + 1}
              </span>
            </div>

            <div>
              <span className="rounded-full border border-garis bg-permukaan px-2.5 py-0.5 text-xs font-semibold text-teks-lembut">
                {p.kategori}
              </span>
              <h2 className="mt-2 text-xl font-bold">{p.nama}</h2>
            </div>

            <div className="rounded-xl bg-harga-latar p-3">
              <p className="text-xs text-teks-lembut">Harga</p>
              <p className="text-xl font-extrabold text-harga">
                {formatRupiah(p.harga)}
              </p>
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold text-teks-lembut">Deskripsi Produk:</p>
              <p className="mt-1 text-sm leading-relaxed text-teks">
                {p.deskripsiTampil}
              </p>
            </div>

            <div className="border-t border-garis pt-4">
              <TombolWhatsApp produk={p} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
