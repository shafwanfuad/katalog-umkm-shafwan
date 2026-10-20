"use client";

import Link from "next/link";
import { useFavorit } from "@/components/FavoritProvider";

export default function TombolFavoritHeader() {
  const { totalFavorit } = useFavorit();

  return (
    <Link
      href="/favorit"
      className="relative flex items-center gap-1.5 rounded-xl border border-garis bg-permukaan px-3 py-2 text-xs font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
      aria-label="Lihat produk favorit"
    >
      <span className="text-sm">❤️</span>
      <span className="hidden sm:inline">Favorit</span>
      {totalFavorit > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bahaya text-[11px] font-bold text-white">
          {totalFavorit}
        </span>
      )}
    </Link>
  );
}
