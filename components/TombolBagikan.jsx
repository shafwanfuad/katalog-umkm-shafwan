"use client";

import { useState } from "react";

// US-23: Bagikan atau salin link produk dengan umpan balik
export default function TombolBagikan({ judul, deskripsi }) {
  const [tersalin, setTersalin] = useState(false);

  async function handleBagikan() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: judul,
          text: deskripsi || judul,
          url: url,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleBagikan}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
        tersalin
          ? "border-utama bg-utama/10 text-utama"
          : "border-garis bg-latar text-teks hover:border-utama hover:text-utama"
      }`}
      aria-label="Bagikan produk"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      <span>{tersalin ? "✓ Link Tersalin!" : "Bagikan"}</span>
    </button>
  );
}
