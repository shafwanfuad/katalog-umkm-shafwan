"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";

// US-36: Menampilkan bagian "Terakhir dilihat" di beranda jika ada data
export default function TerakhirDilihat() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem("katalog_terakhir_dilihat");
      if (data) {
        setItems(JSON.parse(data));
      }
    } catch {
      // Abaikan
    }
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-garis pt-10 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Terakhir Dilihat</h2>
        <span className="text-xs text-teks-lembut">{items.length} produk</span>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {items.map((item) => (
          <KartuProduk key={`terakhir-${item.id}`} produk={item} />
        ))}
      </div>
    </section>
  );
}
