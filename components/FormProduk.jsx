"use client";

import { useActionState, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { tambahProduk, ubahProduk, buatDeskripsiAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Dilengkapi asisten AI (US-14), status stok (US-19), harga coret & badge (US-20).
export default function FormProduk({ produk = {}, labelTombol }) {
  const isEdit = Boolean(produk.id);
  const actionHandler = isEdit ? ubahProduk : tambahProduk;
  const [state, formAction, isPending] = useActionState(actionHandler, null);

  const initDesc = produk.deskripsi || "";
  const isHabisInit =
    initDesc.includes("[Habis]") ||
    initDesc.toLowerCase().includes("stok: 0") ||
    initDesc.toLowerCase().includes("stok habis");
  const badgeMatch = initDesc.match(/\[Badge:\s*([^\]]+)\]/i);
  const coretMatch = initDesc.match(/\[(Harga Coret|Coret|Diskon):\s*(\d+)\]/i);

  const deskripsiBersihAwal = initDesc
    .replace(/\[(Habis|Stok:\s*\d+|Badge:[^\]]+|Harga Coret:[^\]]+|Diskon:[^\]]+)\]/gi, "")
    .trim();

  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(deskripsiBersihAwal || initDesc);
  const [statusStok, setStatusStok] = useState(isHabisInit ? "habis" : "tersedia");
  const [badge, setBadge] = useState(badgeMatch ? badgeMatch[1] : (produk.badge || ""));
  const [hargaCoret, setHargaCoret] = useState(
    coretMatch ? coretMatch[2] : (produk.harga_coret ? String(produk.harga_coret) : "")
  );

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  async function handleBuatDeskripsiAI() {
    if (!nama.trim()) {
      setAiError("Ketik nama produk terlebih dahulu.");
      return;
    }
    setAiLoading(true);
    setAiError("");
    try {
      const res = await buatDeskripsiAI(nama, kategori);
      if (res?.error) {
        setAiError(res.error);
      } else if (res?.deskripsi) {
        setDeskripsi(res.deskripsi);
      }
    } catch (e) {
      setAiError(e.message || "Gagal memanggil AI.");
    } finally {
      setAiLoading(false);
    }
  }

  // Gabungkan tag meta ke dalam deskripsi saat disimpan (US-19 & US-20)
  let deskripsiFinal = deskripsi.trim();
  if (statusStok === "habis") {
    deskripsiFinal = `[Habis] ${deskripsiFinal}`;
  }
  if (badge.trim()) {
    deskripsiFinal = `[Badge: ${badge.trim()}] ${deskripsiFinal}`;
  }
  if (hargaCoret.trim() && parseInt(hargaCoret, 10) > 0) {
    deskripsiFinal = `[Harga Coret: ${parseInt(hargaCoret, 10)}] ${deskripsiFinal}`;
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {state.error}
        </p>
      )}

      {isEdit && <input type="hidden" name="id" value={produk.id} />}
      <input type="hidden" name="deskripsi" value={deskripsiFinal} />

      <Input
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Harga Jual (Rp)"
          name="harga"
          type="number"
          min="0"
          defaultValue={produk.harga}
          required
        />
        <div className="flex flex-col gap-1.5 text-sm font-semibold">
          <label htmlFor="input-coret" className="text-sm font-semibold">
            Harga Coret / Normal (Rp) <span className="text-xs font-normal text-teks-lembut">(opsional)</span>
          </label>
          <input
            id="input-coret"
            type="number"
            min="0"
            value={hargaCoret}
            onChange={(e) => setHargaCoret(e.target.value)}
            placeholder="Contoh: 50000"
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 text-sm font-semibold">
          <label htmlFor="pilih-stok" className="text-sm font-semibold">
            Status Stok (US-19)
          </label>
          <select
            id="pilih-stok"
            value={statusStok}
            onChange={(e) => setStatusStok(e.target.value)}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            <option value="tersedia">Tersedia (Bisa Dipesan)</option>
            <option value="habis">Habis (Tandai Habis & Nonaktifkan Pesan)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 text-sm font-semibold">
          <label htmlFor="pilih-badge" className="text-sm font-semibold">
            Label / Badge (US-20)
          </label>
          <select
            id="pilih-badge"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Tanpa Label</option>
            <option value="Baru">Baru</option>
            <option value="Terlaris">Terlaris</option>
            <option value="Promo">Promo</option>
          </select>
        </div>
      </div>

      <Input
        label="Kategori"
        name="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
        placeholder="Contoh: Minuman, Camilan, Bumbu"
      />

      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg (pisahkan koma untuk beberapa foto)"
        defaultValue={produk.foto_url}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="input-deskripsi" className="text-sm font-semibold">
            Deskripsi
          </label>
          <button
            type="button"
            onClick={handleBuatDeskripsiAI}
            disabled={aiLoading}
            className="text-xs font-semibold text-utama underline underline-offset-2 hover:text-utama-gelap disabled:opacity-50"
          >
            {aiLoading ? "Membuat dengan AI..." : "✨ Buat deskripsi dengan AI"}
          </button>
        </div>
        {aiError && <p className="text-xs text-bahaya">{aiError}</p>}
        <textarea
          id="input-deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
