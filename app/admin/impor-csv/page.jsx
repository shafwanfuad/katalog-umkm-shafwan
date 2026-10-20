"use client";

import { useActionState } from "react";
import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { imporProdukCSV } from "@/app/admin/actions";

// US-46: Impor banyak produk sekaligus dari file CSV
export default function HalamanImporCSV() {
  const [state, formAction, isPending] = useActionState(imporProdukCSV, null);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div>
        <Link
          href="/admin"
          className="text-sm font-semibold text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          &larr; Kembali ke daftar produk
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold">Impor Produk dari CSV</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Unggah file CSV untuk menambahkan banyak produk sekaligus ke database.
        </p>
      </div>

      <div className="rounded-2xl border border-garis bg-permukaan/50 p-5 max-w-xl text-xs text-teks-lembut flex flex-col gap-2">
        <p className="font-semibold text-teks">Format kolom file CSV:</p>
        <p className="font-mono bg-latar p-2.5 rounded-lg border border-garis overflow-x-auto">
          Nama Produk,Harga,Kategori,Link Foto,Deskripsi
        </p>
        <p>Contoh: <code>Kopi Gayo,45000,Minuman,/produk/kopi.svg,Biji kopi premium</code></p>
      </div>

      <form action={formAction} className="flex max-w-xl flex-col gap-4">
        {state?.error && (
          <p className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
            {state.error}
          </p>
        )}

        {state?.success && (
          <div className="rounded-xl border border-utama/30 bg-utama/10 p-4 text-sm text-utama flex flex-col gap-2">
            <p className="font-bold">
              ✓ Berhasil mengimpor {state.berhasil} produk!
            </p>
            {state.gagal > 0 && (
              <div className="text-bahaya text-xs flex flex-col gap-1 border-t border-utama/20 pt-2">
                <p className="font-semibold">{state.gagal} baris dilewati karena format tidak sesuai:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {state.daftarGagal?.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="input-csv" className="text-sm font-semibold">
            Pilih File CSV
          </label>
          <input
            id="input-csv"
            name="file_csv"
            type="file"
            accept=".csv,text/csv"
            required
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks file:mr-3 file:rounded-md file:border-0 file:bg-permukaan file:px-3 file:py-1 file:text-xs file:font-semibold file:text-teks hover:file:bg-utama hover:file:text-white"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Tombol type="submit" disabled={isPending}>
            {isPending ? "Mengimpor Data..." : "Mulai Impor CSV"}
          </Tombol>
          <Tombol href="/admin" varian="garis">
            Batal
          </Tombol>
        </div>
      </form>
    </div>
  );
}
