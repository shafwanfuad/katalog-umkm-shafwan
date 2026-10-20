import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// US-35: Ekspor produk ke CSV (diproses di server, aman, terlindungi login)
export async function GET() {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized: Harap login sebagai admin.", {
        status: 401,
      });
    }

    const { data: produk, error } = await supabase
      .from("produk")
      .select("id, nama, harga, kategori, foto_url, deskripsi, created_at")
      .order("id", { ascending: true });

    if (error) {
      return new NextResponse(`Error database: ${error.message}`, { status: 500 });
    }

    function escapeCsv(val) {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }

    const header = ["ID", "Nama Produk", "Harga", "Kategori", "Link Foto", "Deskripsi", "Waktu Dibuat"];
    const rows = (produk || []).map((p) => [
      p.id,
      escapeCsv(p.nama),
      p.harga,
      escapeCsv(p.kategori),
      escapeCsv(p.foto_url),
      escapeCsv(p.deskripsi),
      escapeCsv(p.created_at),
    ]);

    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="produk-katalog-umkm.csv"',
      },
    });
  } catch (err) {
    return new NextResponse(`Gagal ekspor: ${err.message}`, { status: 500 });
  }
}
