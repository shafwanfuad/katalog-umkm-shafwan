"use client";

import { useEffect } from "react";

// US-36: Mencatat produk yang baru dibuka ke localStorage (maksimal 6 produk)
export default function CatatTerakhirDilihat({ produk }) {
  useEffect(() => {
    if (!produk?.id) return;
    try {
      const tersimpan = localStorage.getItem("katalog_terakhir_dilihat");
      let list = tersimpan ? JSON.parse(tersimpan) : [];

      // Hapus jika sudah ada (supaya pindah ke paling depan)
      list = list.filter((item) => String(item.id) !== String(produk.id));

      list.unshift({
        id: produk.id,
        nama: produk.nama,
        harga: produk.harga,
        foto_url: produk.foto_url,
        kategori: produk.kategori,
      });

      // Batasi maksimal 6 produk
      if (list.length > 6) {
        list = list.slice(0, 6);
      }

      localStorage.setItem("katalog_terakhir_dilihat", JSON.stringify(list));
    } catch {
      // Abaikan jika storage dinonaktifkan
    }
  }, [produk]);

  return null;
}
