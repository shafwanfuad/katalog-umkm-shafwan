"use client";

import { useTransition } from "react";
import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProduk, toggleStatusAktif } from "@/app/admin/actions";

function TombolStatusAktif({ id, isNonaktif }) {
  const [isPending, startTransition] = useTransition();

  function onToggle() {
    startTransition(async () => {
      const res = await toggleStatusAktif(id);
      if (res?.error) {
        alert(res.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isPending}
      className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-colors ${
        isNonaktif
          ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
          : "border-garis bg-latar text-utama hover:bg-permukaan"
      }`}
      title={isNonaktif ? "Klik untuk mengaktifkan produk" : "Klik untuk menonaktifkan produk"}
    >
      {isPending ? "..." : isNonaktif ? "⚪ Nonaktif" : "🟢 Aktif"}
    </button>
  );
}

function TombolHapus({ id, nama }) {
  const [isPending, startTransition] = useTransition();

  function onHapus() {
    if (
      window.confirm(
        `Yakin ingin menghapus produk "${nama}"? Data akan dihapus secara permanen.`
      )
    ) {
      startTransition(async () => {
        const res = await hapusProduk(id);
        if (res?.error) {
          alert(res.error);
        }
      });
    }
  }

  return (
    <Tombol
      type="button"
      varian="bahaya"
      onClick={onHapus}
      disabled={isPending}
    >
      {isPending ? "Menghapus..." : "Hapus"}
    </Tombol>
  );
}

export default function TabelProduk({ daftarProduk = [] }) {
  if (!daftarProduk || daftarProduk.length === 0) {
    return (
      <div className="rounded-2xl border border-garis bg-permukaan p-8 text-center text-teks-lembut">
        Belum ada produk. Klik tombol &ldquo;Tambah produk&rdquo; untuk menambahkan produk pertama.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold">Status (US-32)</th>
            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.map((produk) => {
            const isNonaktif = produk.deskripsi?.includes("[Nonaktif]");
            return (
              <tr key={produk.id} className="border-t border-garis hover:bg-permukaan/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={produk.foto_url}
                      alt=""
                      className={`h-10 w-10 rounded-md object-cover ${
                        isNonaktif ? "grayscale opacity-50" : ""
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isNonaktif ? "line-through text-teks-lembut" : ""}`}>
                        {produk.nama}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-teks-lembut">{produk.kategori}</td>
                <td className="px-4 py-3 font-medium">{formatRupiah(produk.harga)}</td>
                <td className="px-4 py-3">
                  <TombolStatusAktif id={produk.id} isNonaktif={isNonaktif} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                      Ubah
                    </Tombol>
                    <TombolHapus id={produk.id} nama={produk.nama} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
