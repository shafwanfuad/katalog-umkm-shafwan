# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**
Baca AGENTS.md dan docs/user-stories.md bagian US-01. Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase. Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Dibuat `lib/supabase/server.js` untuk koneksi server dan `app/page.jsx` diperbarui mengambil data dari tabel `produk` Supabase secara server-side. Pesan error dan "Belum ada produk" berhasil ditampilkan sesuai kondisi data.

**Perbaikan:**
Memastikan environment variable menggunakan `SUPABASE_URL` dan `SUPABASE_SECRET_KEY` tanpa awalan `NEXT_PUBLIC_` untuk keamanan.

## US-02 Detail produk

**Prompt:**
Baca docs/user-stories.md bagian US-02. Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:**
Halaman `/produk/[id]` mengambil data produk langsung dari tabel `produk` menggunakan `maybeSingle()` di server. Menampilkan halaman 404 via `notFound()` jika ID tidak ditemukan.

**Perbaikan:**
Menghapus penggunaan `cariProdukContoh` dan membersihkan komponen `CatatanBelumAktif`.

## US-03 Pesan via WhatsApp

**Prompt:**
Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)". Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:**
Tombol WhatsApp diubah menjadi tautan `<a>` ke `https://wa.me/<nomor>?text=<pesan>` dengan nomor dari `lib/toko.js`, format mata uang Rupiah, dan encoding URL yang aman.

**Perbaikan:**
Menambahkan atribut `target="_blank"` dan `rel="noopener noreferrer"` untuk keamanan dan kenyamanan pengguna di desktop maupun mobile.

## US-04 Login admin

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04. Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**
Dibuat `lib/supabase/admin.js` dengan cookie store `@supabase/ssr`, Server Action `login` dan `logout` di `app/admin/actions.js`, serta form login dengan `useActionState`. Tombol keluar di `NavAdmin` mengakhiri sesi dan redirect ke `/admin/login`.

**Perbaikan:**
Mengonfigurasi penanganan cookie Next.js 16 secara tepat agar sesi login tersimpan aman di cookie HTTP-only.

## US-05 Ganti password

**Prompt:**
Baca docs/user-stories.md bagian US-05. Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
Dibuat Server Action `gantiPassword` yang memeriksa login admin (`supabase.auth.getUser()`), memvalidasi panjang minimal 8 karakter dan kesamaan konfirmasi di server, lalu memperbarui password dengan `updateUser`.

**Perbaikan:**
Menambahkan penanganan pesan sukses ("Password berhasil diganti.") dan pesan galat spesifik jika validasi gagal.

## US-06 Proteksi halaman admin

**Prompt:**
Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06. Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:**
Dibuat `proxy.js` di root dengan matcher `/admin/:path*` yang memvalidasi sesi admin melalui Supabase Auth. Pengunjung tanpa sesi diarahkan ke `/admin/login`. Seluruh Server Action juga memverifikasi sesi di server.

**Perbaikan:**
Menyesuaikan dengan konvensi Proxy Next.js 16 (pengganti middleware) yang berjalan di Node.js runtime.

## Debugging dan fitur bonus

### US-07 List Produk [SENDIRI]
- **Prompt:** Hubungkan halaman admin `/admin` ke database Supabase agar menampilkan daftar produk nyata dan jumlah totalnya.
- **Hasil:** Tabel produk di `/admin` menampilkan data langsung dari tabel `produk` Supabase.

### US-08 Tambah Produk [SENDIRI]
- **Prompt:** Buat Server Action tambah produk dengan validasi server dan simpan ke database.
- **Hasil:** Form `/admin/produk/baru` berhasil menyimpan produk baru dan kembali ke `/admin`.

### US-09 Ubah Produk [SENDIRI]
- **Prompt:** Buat form ubah produk terisi data lama dan simpan pembaruan ke database.
- **Hasil:** `/admin/produk/[id]/ubah` memuat data lama dan memperbarui tabel `produk`.

### US-10 Hapus Produk [SENDIRI]
- **Prompt:** Buat tombol hapus produk dengan konfirmasi dialog dan Server Action terlindungi login.
- **Hasil:** Konfirmasi muncul sebelum penghapusan dan produk terhapus dari Supabase.

### US-11 & US-15 Filter, Pencarian, & Urutan Produk [SENDIRI]
- **Prompt:** Buat filter kategori, pencarian kata kunci, dan pilihan urutan (termurah, termahal, terbaru) pada query database di katalog utama.
- **Hasil:** `components/FilterKatalog.jsx` terhubung langsung dengan query parameter URL dan query Supabase.

### US-12 Pilih Jumlah & Varian [SENDIRI]
- **Prompt:** Tambahkan opsi pemilihan varian dan pengatur kuantitas di komponen WhatsApp sebelum checkout.
- **Hasil:** Kuantitas, varian, dan total harga otomatis terhitung dan tertulis di pesan WhatsApp.

### US-13 PWA (Progressive Web App) [SENDIRI]
- **Prompt:** Pasang Web App Manifest dan ikon di `public/icons` agar katalog dapat di-install di layar utama HP.
- **Hasil:** `app/manifest.js` dan metadata Apple Web App terkonfigurasi.

### US-14 Deskripsi Produk Dibuat AI [SENDIRI]
- **Prompt:** Integrasikan Google Gemini API (`gemini-3.8-flash`) di sisi server untuk membuat deskripsi produk otomatis dari nama dan kategori.
- **Hasil:** Tombol "✨ Buat deskripsi dengan AI" mengisi deskripsi produk otomatis.
- **Perbaikan:** Menghubungkan API key dari `.env.local` dan menangani pembacaan langsung di server action.

### US-16 Paginasi Produk [SENDIRI]
- **Prompt:** Pecah daftar produk ke beberapa halaman dengan pembatasan langsung di query database (`.range()`).
- **Hasil:** `components/Paginasi.jsx` menampilkan navigasi halaman dan menjaga parameter filter.

### US-17 Produk Terkait [SENDIRI]
- **Prompt:** Tampilkan rekomendasi produk lain dari kategori yang sama di halaman detail tanpa menyertakan produk yang sedang dibuka.
- **Hasil:** Section produk terkait muncul di bawah detail produk.

### US-18 Galeri Foto Produk [SENDIRI]
- **Prompt:** Buat galeri foto dengan gambar utama dan thumbnail gambar kecil yang dapat diklik.
- **Hasil:** `components/GaleriFoto.jsx` memungkinkan pergantian foto utama secara interaktif.

### US-19 & US-20 Status Stok, Harga Coret, & Badge [SENDIRI]
- **Prompt:** Tambahkan status stok (Tersedia/Habis), harga coret diskon, dan label badge (Baru/Terlaris) pada kartu dan detail produk.
- **Hasil:** Produk habis menampilkan penanda "Habis" dan menonaktifkan tombol pemesanan. Harga diskon tampil dicoret.

### US-21 Keranjang Belanja [SENDIRI]
- **Prompt:** Buat fitur keranjang belanja yang persisten di `localStorage`, memungkinkan ubah jumlah dan hapus item, serta pesan semua isi keranjang dalam satu pesan WhatsApp.
- **Hasil:** `KeranjangProvider.jsx` menyediakan tombol keranjang melayang dan drawer rincian pesanan.

### US-22 Halaman Tentang Toko [SENDIRI]
- **Prompt:** Buat halaman `/tentang` berisi profil toko, alamat, jam buka, dan kontak WhatsApp resmi.
- **Hasil:** Halaman profil dan kontak tertaut di navigasi header dan footer.

### US-23 Bagikan Link Produk [SENDIRI]
- **Prompt:** Tambahkan tombol bagikan / salin link dengan Web Share API dan clipboard fallback beserta umpan balik "✓ Link Tersalin!".
- **Hasil:** `TombolBagikan.jsx` aktif di halaman detail produk.

### US-24 Produk Favorit [SENDIRI]
- **Prompt:** Buat penanda favorit produk yang tersimpan di browser dan halaman khusus `/favorit`.
- **Hasil:** Pengunjung dapat menandai produk favorit dengan ikon hati dan melihatnya di `/favorit`.

### US-25 Mode Gelap (Dark Mode) [SENDIRI]
- **Prompt:** Buat tombol toggle mode gelap/terang yang tersimpan di browser dan memastikan teks kontras terbaca.
- **Hasil:** `TombolModeGelap.jsx` dan token CSS dark mode di `globals.css`.

### US-26 Metadata SEO & Open Graph [SENDIRI]
- **Prompt:** Gunakan `generateMetadata` di halaman detail produk untuk judul, deskripsi, dan foto Open Graph.
- **Hasil:** Pratinjau sosial media tampil rapi sesuai produk.

### US-27 Sitemap & Robots.txt [SENDIRI]
- **Prompt:** Buat `app/sitemap.js` dan `app/robots.js` dinamis dari database produk.
- **Hasil:** Mesin pencari dapat mengindeks semua produk dan dilarang mengindeks `/admin`.

### US-28 Halaman 404 & Loading Skeleton [SENDIRI]
- **Prompt:** Buat `app/not-found.jsx` dan `app/loading.jsx` skeleton kustom.
- **Hasil:** Umpan balik visual saat data dimuat dan saat halaman tidak ditemukan.

### US-30 Dashboard Ringkasan Admin [SENDIRI]
- **Prompt:** Tampilkan total produk dan rincian produk per kategori di halaman admin.
- **Hasil:** Ringkasan statistik toko tampil di atas tabel admin.

### US-32 Aktif / Nonaktifkan Produk [SENDIRI]
- **Prompt:** Tambahkan opsi aktifkan/sembunyikan produk dari admin tanpa menghapusnya dari database.
- **Hasil:** Produk nonaktif tidak muncul di katalog publik dan detailnya menampilkan 404.

### US-33 Cari & Paginasi di Admin [SENDIRI]
- **Prompt:** Buat pencarian dan paginasi di halaman admin yang tersimpan di URL.
- **Hasil:** Kolom cari dan navigasi halaman admin berfungsi mulus.

### US-34 Validasi Form Server [SENDIRI]
- **Prompt:** Validasi input produk di server dan tampilkan pesan error per field di bawah input tanpa menghilangkan data.
- **Hasil:** Pesan error tampil di bawah nama atau harga yang salah.

### US-35 Ekspor CSV Produk [SENDIRI]
- **Prompt:** Buat tombol ekspor CSV yang aman dan dilindungi login admin.
- **Hasil:** Route handler `/admin/ekspor-csv` mengunduh data produk dalam format CSV.

### US-36 Terakhir Dilihat [SENDIRI]
- **Prompt:** Rekam riwayat produk yang dibuka dan tampilkan di beranda.
- **Hasil:** Section "Terakhir Dilihat" muncul otomatis di beranda.

### US-37 Bandingkan 2 Produk [SENDIRI]
- **Prompt:** Buat halaman `/bandingkan` untuk membandingkan 2 produk berdampingan.
- **Hasil:** Menampilkan perbandingan spesifikasi dan tombol WhatsApp kedua produk.

### US-49 Halaman Kategori [SENDIRI]
- **Prompt:** Buat rute `/kategori/[slug]` dinamis dari database dengan halaman 404 jika kategori tidak ditemukan.
- **Hasil:** Mengelompokkan produk per kategori khusus.

### US-50 Asisten AI Tanya Jawab Produk [SENDIRI]
- **Prompt:** Buat kotak tanya jawab interaktif di halaman produk yang dijawab oleh Gemini API berdasarkan data produk.
- **Hasil:** `KotakTanyaAI.jsx` menjawab pertanyaan pembeli secara akurat tanpa kunci API terekspos ke browser.

### Keamanan Lanjutan (K-6 hingga K-13) [SENDIRI]
- **Prompt:** Konfigurasikan header keamanan lengkap di `next.config.mjs` (CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, X-Robots-Tag), rate limit login admin (K-12), hilangkan console.log data sensitif (K-13), dan amankan stack trace (K-9).
- **Hasil:** Seluruh kriteria keamanan lanjutan K-6 sampai K-13 terpenuhi dengan audit 0 vulnerabilities.
