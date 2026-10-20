"use client";

import { useEffect, useState } from "react";

// US-25: Mode gelap dengan ingatan pilihan di localStorage
export default function TombolModeGelap() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tema");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (saved === "dark" || (!saved && prefersDark)) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Abaikan
    }
  }, []);

  function toggleTema() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tema", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tema", "light");
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTema}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-garis bg-permukaan text-sm transition-colors hover:border-utama hover:text-utama"
      aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
