"use client";

import { useTransition } from "react";
import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

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
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.map((produk) => (
            <tr key={produk.id} className="border-t border-garis">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={produk.foto_url}
                    alt=""
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <span className="font-semibold">{produk.nama}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-teks-lembut">{produk.kategori}</td>
              <td className="px-4 py-3">{formatRupiah(produk.harga)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                    Ubah
                  </Tombol>
                  <TombolHapus id={produk.id} nama={produk.nama} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
