"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import { parseDetailProduk } from "@/lib/produk-helper";
import { useKeranjang } from "@/components/KeranjangProvider";

// US-03, US-12 (jumlah & varian), US-19 (status stok), US-21 (tambah ke keranjang)
export default function TombolWhatsApp({ produk }) {
  const item = parseDetailProduk(produk);
  const { tambahItem } = useKeranjang();

  const [jumlah, setJumlah] = useState(1);
  const [varian, setVarian] = useState("Standar (Original)");
  const [ditambahkan, setDitambahkan] = useState(false);

  const totalHarga = (item?.harga || 0) * jumlah;
  const nomor = toko.nomorWhatsApp ? toko.nomorWhatsApp.replace(/\D/g, "") : "";

  const pesan = `Halo, saya ingin memesan ${item?.nama}\n- Varian: ${varian}\n- Jumlah: ${jumlah}\n- Total: ${formatRupiah(totalHarga)}`;
  const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  const daftarVarian = [
    "Standar (Original)",
    "Porsi Besar",
    "Paket Hemat",
  ];

  function handleTambahKeranjang() {
    tambahItem(item, jumlah, varian);
    setDitambahkan(true);
    setTimeout(() => setDitambahkan(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-garis bg-permukaan/60 p-5">
      {/* Pilihan varian (US-12) */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-teks-lembut">Pilihan varian:</span>
        <div className="flex flex-wrap gap-2">
          {daftarVarian.map((v) => {
            const aktif = varian === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setVarian(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  aktif
                    ? "bg-utama text-white"
                    : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pilihan jumlah (US-12) */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-teks-lembut">Jumlah:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={item.isHabis}
            onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-garis bg-latar text-sm font-bold text-teks hover:bg-permukaan active:scale-95 disabled:opacity-50"
            aria-label="Kurangi jumlah"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-bold">{jumlah}</span>
          <button
            type="button"
            disabled={item.isHabis}
            onClick={() => setJumlah((prev) => prev + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-garis bg-latar text-sm font-bold text-teks hover:bg-permukaan active:scale-95 disabled:opacity-50"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>
      </div>

      {/* Rincian Total */}
      <div className="flex items-center justify-between border-t border-garis pt-3 text-sm">
        <span className="font-medium text-teks-lembut">Total ({jumlah} item):</span>
        <span className="font-bold text-harga">{formatRupiah(totalHarga)}</span>
      </div>

      {/* Tombol Aksi: Tambah ke Keranjang & Pesan WhatsApp (US-19 & US-21) */}
      {item.isHabis ? (
        <div className="rounded-xl border border-dashed border-bahaya/40 bg-bahaya/10 p-3.5 text-center text-sm font-bold text-bahaya">
          Stok Habis — Pemesanan Dinonaktifkan
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Tombol Tambah ke Keranjang (US-21) */}
          <button
            type="button"
            onClick={handleTambahKeranjang}
            className="flex-1 rounded-xl border border-utama bg-latar px-5 py-3 font-semibold text-utama transition-colors hover:bg-utama/10 active:scale-95"
          >
            {ditambahkan ? "✓ Berhasil Ditambahkan" : "+ Tambah ke Keranjang"}
          </button>

          {/* Tombol Pesan via WhatsApp */}
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center rounded-xl bg-utama px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-utama-gelap text-center"
          >
            Pesan via WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
