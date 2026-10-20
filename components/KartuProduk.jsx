"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { parseDetailProduk } from "@/lib/produk-helper";
import { useKeranjang } from "@/components/KeranjangProvider";

// US-01, US-19 (status stok), US-20 (harga coret & badge), US-21 (keranjang)
export default function KartuProduk({ produk }) {
  const item = parseDetailProduk(produk);
  const { tambahItem } = useKeranjang();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar transition-shadow hover:shadow-md">
      <Link href={`/produk/${item.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full bg-permukaan overflow-hidden">
          <img
            src={item.foto_url}
            alt={item.nama}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              item.isHabis ? "grayscale opacity-60" : ""
            }`}
          />

          {/* Badge Stok Habis (US-19) */}
          {item.isHabis ? (
            <span className="absolute top-2.5 left-2.5 rounded-lg bg-bahaya px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              Habis
            </span>
          ) : item.badge ? (
            /* Badge Produk (US-20: Baru / Terlaris) */
            <span
              className={`absolute top-2.5 left-2.5 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-sm ${
                item.badge.toLowerCase() === "terlaris"
                  ? "bg-amber-600"
                  : "bg-utama"
              }`}
            >
              {item.badge}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <p className="text-xs text-teks-lembut">{item.kategori}</p>
          <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-utama">
            {item.nama}
          </h3>

          <div className="mt-auto pt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
              {formatRupiah(item.harga)}
            </span>
            {/* Harga Coret (US-20) */}
            {item.hargaCoret && item.hargaCoret > item.harga && (
              <span className="text-xs text-teks-lembut line-through">
                {formatRupiah(item.hargaCoret)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Tombol Tambah ke Keranjang (US-21) */}
      <div className="px-3 pb-3">
        <button
          type="button"
          disabled={item.isHabis}
          onClick={(e) => {
            e.preventDefault();
            tambahItem(item);
          }}
          className={`w-full rounded-xl py-2 text-xs font-bold transition-all ${
            item.isHabis
              ? "cursor-not-allowed bg-permukaan text-teks-lembut/50"
              : "border border-garis bg-latar text-utama hover:bg-utama hover:text-white active:scale-95"
          }`}
        >
          {item.isHabis ? "Stok Habis" : "+ Keranjang"}
        </button>
      </div>
    </div>
  );
}
