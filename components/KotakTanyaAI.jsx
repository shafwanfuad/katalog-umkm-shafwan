"use client";

import { useState } from "react";
import { tanyaProdukAI } from "@/app/admin/actions";

// US-50: Asisten AI tanya jawab produk
export default function KotakTanyaAI({ produkId, namaProduk }) {
  const [pertanyaan, setPertanyaan] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorPesan, setErrorPesan] = useState("");

  async function handleTanya(e) {
    e.preventDefault();
    const query = pertanyaan.trim();
    if (!query) return;

    if (query.length < 3) {
      setErrorPesan("Pertanyaan terlalu singkat (minimal 3 karakter).");
      return;
    }
    if (query.length > 200) {
      setErrorPesan("Pertanyaan maksimal 200 karakter.");
      return;
    }

    setIsLoading(true);
    setErrorPesan("");
    setJawaban("");

    try {
      const res = await tanyaProdukAI(produkId, query);
      if (res?.error) {
        setErrorPesan(res.error);
      } else if (res?.jawaban) {
        setJawaban(res.jawaban);
      }
    } catch (err) {
      setErrorPesan(err.message || "Gagal menghubungi asisten AI.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-garis bg-permukaan/40 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <h3 className="text-sm font-bold text-teks">
          Tanya Asisten AI tentang {namaProduk}
        </h3>
      </div>
      <p className="text-xs text-teks-lembut">
        Dapatkan jawaban cepat seputar rasa, bahan, dan cara pemesanan langsung dari AI.
      </p>

      <form onSubmit={handleTanya} className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            value={pertanyaan}
            onChange={(e) => setPertanyaan(e.target.value)}
            maxLength={200}
            placeholder="Contoh: Apakah rasanya pedas? Tahan berapa lama?"
            className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 pr-24 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !pertanyaan.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-utama px-3.5 text-xs font-semibold text-white transition-colors hover:bg-utama-gelap disabled:opacity-50"
          >
            {isLoading ? "Menjawab..." : "Tanya"}
          </button>
        </div>
        <div className="flex justify-between text-[11px] text-teks-lembut px-1">
          <span>Pertanyaan dijawab berdasarkan data resmi produk</span>
          <span>{pertanyaan.length}/200</span>
        </div>
      </form>

      {errorPesan && (
        <p className="rounded-lg border border-bahaya/30 bg-bahaya/10 p-2.5 text-xs font-medium text-bahaya">
          {errorPesan}
        </p>
      )}

      {jawaban && (
        <div className="rounded-xl border border-garis bg-latar p-3.5 text-sm text-teks flex flex-col gap-1">
          <span className="text-xs font-bold text-utama">Jawaban Asisten AI:</span>
          <p className="leading-relaxed">{jawaban}</p>
        </div>
      )}
    </section>
  );
}
