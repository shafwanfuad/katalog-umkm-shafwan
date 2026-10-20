import Link from "next/link";
import TombolKeranjangHeader from "@/components/TombolKeranjangHeader";
import TombolFavoritHeader from "@/components/TombolFavoritHeader";
import TombolModeGelap from "@/components/TombolModeGelap";
import { toko } from "@/lib/toko";

export default function Header() {
  return (
    <header className="border-b border-garis bg-latar sticky top-0 z-30 backdrop-blur-md bg-latar/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
            {toko.nama}
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm font-semibold">
            <Link href="/" className="text-teks-lembut hover:text-utama">
              Katalog
            </Link>
            <Link href="/tentang" className="text-teks-lembut hover:text-utama">
              Tentang
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/tentang"
            className="sm:hidden text-xs font-semibold text-teks-lembut hover:text-utama"
          >
            Tentang
          </Link>
          <TombolFavoritHeader />
          <TombolKeranjangHeader />
          <TombolModeGelap />
        </div>
      </div>
    </header>
  );
}
