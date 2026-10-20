"use client";

import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { useFavorit } from "@/components/FavoritProvider";

// US-24: Tampilan yang hanya berisi produk favorit
export default function HalamanFavorit() {
  const { favorit } = useFavorit();

  return (
    <div className="py-10 sm:py-14 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm font-semibold text-teks-lembut underline underline-offset-4 hover:text-utama self-start"
        >
          &larr; Kembali ke katalog
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Produk Favorit ({favorit.length})
        </h1>
        <p className="text-sm text-teks-lembut">
          Daftar produk yang Anda sukai, tersimpan di browser ini.
        </p>
      </div>

      {favorit.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-garis bg-permukaan py-16 text-center flex flex-col items-center gap-3">
          <span className="text-4xl">❤️</span>
          <h2 className="text-lg font-bold text-teks">Belum ada produk favorit</h2>
          <p className="max-w-sm text-sm text-teks-lembut">
            Tandai produk yang Anda sukai dengan mengeklik ikon hati di kartu produk
            agar mudah ditemukan kembali nanti.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-utama px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
          >
            Jelajahi Katalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {favorit.map((item) => (
            <KartuProduk key={item.id} produk={item} />
          ))}
        </div>
      )}
    </div>
  );
}
