"use client";

import { useState } from "react";

// US-18: galeri foto produk dengan foto utama dan thumbnail foto kecil
export default function GaleriFoto({ fotoUrl, nama }) {
  let daftarFoto = [];

  if (fotoUrl) {
    if (fotoUrl.startsWith("[") && fotoUrl.endsWith("]")) {
      try {
        const parsed = JSON.parse(fotoUrl);
        if (Array.isArray(parsed) && parsed.length > 0) {
          daftarFoto = parsed;
        }
      } catch {
        // Abaikan jika bukan JSON valid
      }
    }

    if (daftarFoto.length === 0) {
      daftarFoto = fotoUrl
        .split(/[\n,]+/)
        .map((u) => u.trim())
        .filter(Boolean);
    }
  }

  if (daftarFoto.length === 0) {
    daftarFoto = ["/produk/kopi.svg"];
  }

  const [fotoAktif, setFotoAktif] = useState(daftarFoto[0]);

  return (
    <div className="flex flex-col gap-3">
      {/* Foto utama */}
      <img
        src={fotoAktif}
        alt={nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover transition-opacity duration-200"
      />

      {/* Gambar kecil thumbnail (hanya muncul jika foto > 1) */}
      {daftarFoto.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {daftarFoto.map((foto, index) => {
            const terpilih = foto === fotoAktif;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setFotoAktif(foto)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                  terpilih
                    ? "border-utama ring-2 ring-utama"
                    : "border-garis opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={foto}
                  alt={`${nama} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
