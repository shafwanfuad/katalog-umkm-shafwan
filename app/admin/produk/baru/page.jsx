import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";

// US-08: tambah produk baru dan simpan ke database.
export default function HalamanTambahProduk() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormProduk labelTombol="Simpan produk" />
    </div>
  );
}
