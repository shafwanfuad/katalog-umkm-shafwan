import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// US-09: form terisi data lama dari database dan perubahan tersimpan ke database.
export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk produk={produk} labelTombol="Simpan perubahan" />
    </div>
  );
}
