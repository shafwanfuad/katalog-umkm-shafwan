import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// US-06 & US-07: daftar produk di /admin diambil dari database Supabase
export default async function HalamanAdmin() {
  let daftarProduk = [];
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      daftarProduk = data;
    }
  } catch (err) {
    console.error("Gagal mengambil data produk admin:", err);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Produk</h1>
          <p className="mt-0.5 text-sm text-teks-lembut">
            Total {daftarProduk.length} produk terdaftar
          </p>
        </div>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      <TabelProduk daftarProduk={daftarProduk} />
    </div>
  );
}
