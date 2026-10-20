// Helper untuk US-19 (Status stok) & US-20 (Harga coret & badge)
export function parseDetailProduk(produk) {
  if (!produk) return null;

  let stok = typeof produk.stok === "number" ? produk.stok : 10;
  let statusStok = produk.status_stok || (stok <= 0 ? "habis" : "tersedia");
  let hargaCoret = typeof produk.harga_coret === "number" ? produk.harga_coret : null;
  let badge = produk.badge || null;

  const desc = produk.deskripsi || "";

  // Deteksi status habis dari tag atau teks
  if (
    desc.includes("[Habis]") ||
    desc.toLowerCase().includes("stok: 0") ||
    desc.toLowerCase().includes("stok habis")
  ) {
    stok = 0;
    statusStok = "habis";
  }

  // Deteksi badge dari deskripsi
  const badgeMatch = desc.match(/\[Badge:\s*([^\]]+)\]/i);
  if (badgeMatch) {
    badge = badgeMatch[1].trim();
  } else if (!badge && produk.created_at) {
    // Badge "Baru" otomatis untuk produk yang dibuat dalam 7 hari terakhir
    const diffHari = (new Date() - new Date(produk.created_at)) / (1000 * 60 * 60 * 24);
    if (diffHari <= 7) {
      badge = "Baru";
    }
  }

  // Deteksi harga coret dari deskripsi
  const coretMatch = desc.match(/\[(Harga Coret|Coret|Diskon):\s*(\d+)\]/i);
  if (coretMatch) {
    hargaCoret = parseInt(coretMatch[2], 10);
  }

  // Bersihkan tag internal dari deskripsi saat ditampilkan ke pembeli
  const deskripsiTampil = desc
    .replace(/\[(Habis|Stok:\s*\d+|Badge:[^\]]+|Harga Coret:[^\]]+|Diskon:[^\]]+)\]/gi, "")
    .trim();

  const isHabis = statusStok === "habis" || stok <= 0;

  return {
    ...produk,
    stok,
    isHabis,
    hargaCoret,
    badge,
    deskripsiTampil: deskripsiTampil || desc,
  };
}
