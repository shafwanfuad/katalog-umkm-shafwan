"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

const KeranjangContext = createContext({
  items: [],
  tambahItem: () => {},
  ubahJumlah: () => {},
  hapusItem: () => {},
  kosongkanKeranjang: () => {},
  totalItem: 0,
  totalHarga: 0,
  isTerbuka: false,
  setTerbuka: () => {},
});

export function KeranjangProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isTerbuka, setTerbuka] = useState(false);
  const [sudahDimuat, setSudahDimuat] = useState(false);

  // Ambil isi keranjang dari localStorage browser (US-21: bertahan saat pindah halaman)
  useEffect(() => {
    try {
      const data = localStorage.getItem("katalog_keranjang");
      if (data) {
        setItems(JSON.parse(data));
      }
    } catch {
      // Abaikan jika storage dinonaktifkan
    }
    setSudahDimuat(true);
  }, []);

  // Simpan setiap perubahan keranjang ke localStorage
  useEffect(() => {
    if (sudahDimuat) {
      try {
        localStorage.setItem("katalog_keranjang", JSON.stringify(items));
      } catch {
        // Abaikan
      }
    }
  }, [items, sudahDimuat]);

  function tambahItem(produk, jumlah = 1, varian = "Standar") {
    setItems((prev) => {
      const index = prev.findIndex(
        (i) => i.id === produk.id && i.varian === varian
      );
      if (index >= 0) {
        const baru = [...prev];
        baru[index].jumlah += jumlah;
        return baru;
      }
      return [
        ...prev,
        {
          id: produk.id,
          nama: produk.nama,
          harga: produk.harga,
          foto_url: produk.foto_url,
          kategori: produk.kategori,
          jumlah,
          varian,
        },
      ];
    });
    setTerbuka(true);
  }

  function ubahJumlah(id, varian, baru) {
    if (baru <= 0) {
      hapusItem(id, varian);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.varian === varian ? { ...i, jumlah: baru } : i
      )
    );
  }

  function hapusItem(id, varian) {
    setItems((prev) =>
      prev.filter((i) => !(i.id === id && i.varian === varian))
    );
  }

  function kosongkanKeranjang() {
    setItems([]);
  }

  const totalItem = items.reduce((acc, i) => acc + i.jumlah, 0);
  const totalHarga = items.reduce((acc, i) => acc + i.harga * i.jumlah, 0);

  // Buat pesan WhatsApp untuk semua item dalam keranjang (US-21)
  const nomor = toko.nomorWhatsApp ? toko.nomorWhatsApp.replace(/\D/g, "") : "";
  let teksDaftar = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.nama} (${item.varian}) x${item.jumlah} = ${formatRupiah(
          item.harga * item.jumlah
        )}`
    )
    .join("\n");

  const pesanSemua = `Halo ${toko.nama}, saya ingin memesan produk berikut:\n\n${teksDaftar}\n\n*Total Belanja:* ${formatRupiah(
    totalHarga
  )}\n\nMohon informasi ongkir dan ketersediaan stok. Terima kasih!`;

  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(
    pesanSemua
  )}`;

  return (
    <KeranjangContext.Provider
      value={{
        items,
        tambahItem,
        ubahJumlah,
        hapusItem,
        kosongkanKeranjang,
        totalItem,
        totalHarga,
        isTerbuka,
        setTerbuka,
      }}
    >
      {children}

      {/* Tombol Melayang Keranjang Belanja */}
      {totalItem > 0 && !isTerbuka && (
        <button
          type="button"
          onClick={() => setTerbuka(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-utama px-5 py-3 font-semibold text-white shadow-xl transition-all hover:bg-utama-gelap hover:scale-105 active:scale-95"
          aria-label="Lihat keranjang belanja"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>Keranjang</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-extrabold text-utama">
            {totalItem}
          </span>
        </button>
      )}

      {/* Panel Samping Keranjang (Drawer) */}
      {isTerbuka && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Latar Belakang Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setTerbuka(false)}
          />

          {/* Konten Drawer */}
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-latar shadow-2xl">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-garis p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Keranjang Belanja</h2>
                <span className="rounded-full bg-permukaan px-2.5 py-0.5 text-xs font-semibold text-teks-lembut">
                  {totalItem} item
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTerbuka(false)}
                className="rounded-lg p-2 text-teks-lembut hover:bg-permukaan hover:text-teks"
                aria-label="Tutup keranjang"
              >
                ✕
              </button>
            </div>

            {/* Daftar Item Keranjang */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-lg font-bold text-teks">Keranjang kosong</p>
                  <p className="mt-1 text-sm text-teks-lembut">
                    Pilih produk di katalog untuk memesan beberapa item sekaligus.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.varian}`}
                      className="flex items-center gap-3 rounded-xl border border-garis bg-permukaan/40 p-3"
                    >
                      <img
                        src={item.foto_url}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {item.nama}
                        </h3>
                        <p className="text-xs text-teks-lembut">{item.varian}</p>
                        <p className="text-sm font-bold text-harga">
                          {formatRupiah(item.harga * item.jumlah)}
                        </p>
                      </div>

                      {/* Kontrol Jumlah */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => hapusItem(item.id, item.varian)}
                          className="text-xs text-teks-lembut hover:text-bahaya"
                        >
                          Hapus
                        </button>
                        <div className="flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-2 py-1">
                          <button
                            type="button"
                            onClick={() =>
                              ubahJumlah(item.id, item.varian, item.jumlah - 1)
                            }
                            className="text-sm font-bold px-1 hover:text-utama"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold">
                            {item.jumlah}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              ubahJumlah(item.id, item.varian, item.jumlah + 1)
                            }
                            className="text-sm font-bold px-1 hover:text-utama"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Drawer */}
            {items.length > 0 && (
              <div className="border-t border-garis p-4 flex flex-col gap-3 bg-permukaan/30">
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold text-teks-lembut">Total Belanja:</span>
                  <span className="text-xl font-extrabold text-harga">
                    {formatRupiah(totalHarga)}
                  </span>
                </div>

                {/* Tombol Pesan Semua via WhatsApp (US-21) */}
                <a
                  href={urlWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-utama px-5 py-3.5 font-bold text-white shadow-md transition-colors hover:bg-utama-gelap text-center"
                >
                  Pesan Semua via WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </KeranjangContext.Provider>
  );
}

export function useKeranjang() {
  return useContext(KeranjangContext);
}
