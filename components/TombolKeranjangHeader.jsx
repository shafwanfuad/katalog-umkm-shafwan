"use client";

import { useKeranjang } from "@/components/KeranjangProvider";

export default function TombolKeranjangHeader() {
  const { totalItem, setTerbuka } = useKeranjang();

  return (
    <button
      type="button"
      onClick={() => setTerbuka(true)}
      className="relative flex items-center gap-2 rounded-xl border border-garis bg-permukaan px-3 py-2 text-xs font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
      aria-label="Buka keranjang belanja"
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
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <span>Keranjang</span>
      {totalItem > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-utama text-[11px] font-bold text-white">
          {totalItem}
        </span>
      )}
    </button>
  );
}
