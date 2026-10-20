import Link from "next/link";

export default function Paginasi({ halamanSekarang, totalHalaman, queryParams = {} }) {
  if (totalHalaman <= 1) return null;

  function buatUrl(hal) {
    const sp = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v && k !== "halaman" && v !== "Semua") {
        sp.set(k, v);
      }
    });
    if (hal > 1) {
      sp.set("halaman", hal.toString());
    }
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  }

  const prevUrl = halamanSekarang > 1 ? buatUrl(halamanSekarang - 1) : null;
  const nextUrl = halamanSekarang < totalHalaman ? buatUrl(halamanSekarang + 1) : null;

  return (
    <nav
      aria-label="Navigasi halaman katalog"
      className="flex flex-wrap items-center justify-center gap-2 pt-6"
    >
      {prevUrl ? (
        <Link
          href={prevUrl}
          className="inline-flex items-center rounded-xl border border-garis bg-latar px-4 py-2 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
        >
          &larr; Sebelumnya
        </Link>
      ) : (
        <span className="inline-flex items-center cursor-not-allowed rounded-xl border border-garis/50 bg-permukaan px-4 py-2 text-sm font-medium text-teks-lembut/50">
          &larr; Sebelumnya
        </span>
      )}

      <span className="px-3 py-2 text-sm text-teks-lembut">
        Halaman <strong className="font-bold text-teks">{halamanSekarang}</strong> dari{" "}
        <strong className="font-bold text-teks">{totalHalaman}</strong>
      </span>

      {nextUrl ? (
        <Link
          href={nextUrl}
          className="inline-flex items-center rounded-xl border border-garis bg-latar px-4 py-2 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
        >
          Selanjutnya &rarr;
        </Link>
      ) : (
        <span className="inline-flex items-center cursor-not-allowed rounded-xl border border-garis/50 bg-permukaan px-4 py-2 text-sm font-medium text-teks-lembut/50">
          Selanjutnya &rarr;
        </span>
      )}
    </nav>
  );
}
