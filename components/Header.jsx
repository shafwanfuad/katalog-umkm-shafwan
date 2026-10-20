import Link from "next/link";
import TombolKeranjangHeader from "@/components/TombolKeranjangHeader";
import { toko } from "@/lib/toko";

export default function Header() {
  return (
    <header className="border-b border-garis bg-latar sticky top-0 z-30 backdrop-blur-md bg-latar/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <TombolKeranjangHeader />
      </div>
    </header>
  );
}
