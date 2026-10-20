"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export default function FilterKatalog({
  daftarKategori = [],
  kategoriTerpilih = "Semua",
  kataKunciAwal = "",
  urutanAwal = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(kataKunciAwal);
  const [, startTransition] = useTransition();

  function updateQuery(baru) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(baru).forEach(([k, v]) => {
      if (!v || v === "Semua") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateQuery({ q });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Form pencarian (US-11) */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 pr-20 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-utama px-3 text-xs font-semibold text-white hover:bg-utama-gelap"
          >
            Cari
          </button>
        </form>

        {/* Pilihan urutan (US-15) */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="pilih-urutan"
            className="text-xs font-medium text-teks-lembut whitespace-nowrap"
          >
            Urutkan:
          </label>
          <select
            id="pilih-urutan"
            value={urutanAwal}
            onChange={(e) => updateQuery({ urutan: e.target.value })}
            className="rounded-xl border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Standar</option>
            <option value="termurah">Harga: Termurah</option>
            <option value="termahal">Harga: Termahal</option>
            <option value="terbaru">Terbaru</option>
          </select>
        </div>
      </div>

      {/* Filter Kategori (US-11) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {daftarKategori.map((kat) => {
          const aktif = (kategoriTerpilih || "Semua") === kat;
          return (
            <button
              key={kat}
              type="button"
              onClick={() => updateQuery({ kategori: kat })}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                aktif
                  ? "bg-utama text-white"
                  : "border border-garis bg-permukaan text-teks-lembut hover:border-utama hover:text-utama"
              }`}
            >
              {kat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
