import Link from "next/link";
import { toko } from "@/lib/toko";

export const metadata = {
  title: `Tentang Kami - ${toko.nama}`,
  description: `Profil dan kontak resmi ${toko.nama}. Kunjungi kami atau hubungi langsung via WhatsApp.`,
};

// US-22: Halaman Tentang dan kontak toko
export default function HalamanTentang() {
  const nomorWa = toko.nomorWhatsApp ? toko.nomorWhatsApp.replace(/\D/g, "") : "";
  const waUrl = `https://wa.me/${nomorWa}?text=${encodeURIComponent(
    `Halo ${toko.nama}, saya ingin bertanya tentang toko dan produk Anda.`
  )}`;

  return (
    <div className="py-10 sm:py-14 max-w-3xl">
      <Link
        href="/"
        className="text-sm font-semibold text-teks-lembut underline underline-offset-4 hover:text-utama"
      >
        &larr; Kembali ke katalog
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Tentang {toko.nama}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-teks-lembut">
          {toko.tagline}
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-garis bg-permukaan/50 p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-teks">Profil Toko</h2>
          <p className="mt-2 text-sm leading-relaxed text-teks-lembut">
            Kami adalah usaha mikro, kecil, dan menengah (UMKM) lokal yang berdedikasi
            menyajikan produk berkualitas tinggi langsung ke tangan Anda. Setiap produk
            dihadirkan dengan standar kebersihan, keaslian bahan, dan pelayanan ramah
            demi kepuasan pelanggan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-garis pt-6">
          <div>
            <h3 className="text-sm font-bold text-teks flex items-center gap-2">
              📍 Alamat Toko
            </h3>
            <p className="mt-1 text-sm text-teks-lembut leading-relaxed">
              {toko.alamat}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-teks flex items-center gap-2">
              ⏰ Jam Operasional
            </h3>
            <p className="mt-1 text-sm text-teks-lembut leading-relaxed">
              {toko.jamBuka}
            </p>
          </div>
        </div>

        <div className="border-t border-garis pt-6 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-teks">Hubungi Kami</h3>
          <p className="text-sm text-teks-lembut">
            Punya pertanyaan mengenai ketersediaan produk, pesanan khusus, atau kerja sama?
            Silakan hubungi kami langsung:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-utama px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-utama-gelap"
            >
              💬 Chat via WhatsApp (+{toko.nomorWhatsApp})
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-garis bg-latar px-5 py-3 text-sm font-semibold text-teks hover:border-utama hover:text-utama"
            >
              Jelajahi Produk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
