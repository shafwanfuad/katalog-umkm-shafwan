"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// K-12: In-memory rate limiting untuk percobaan login
const loginAttempts = new Map();

function periksaRateLimitLogin(key) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxPercobaan = 5;

  const riwayat = loginAttempts.get(key) || [];
  const terkini = riwayat.filter((waktu) => now - waktu < windowMs);

  if (terkini.length >= maxPercobaan) {
    return false;
  }

  terkini.push(now);
  loginAttempts.set(key, terkini);
  return true;
}

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get?.("email")?.toString()?.trim();
  const password = data?.get?.("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  // K-12: Rate limit maksimal 5 percobaan per menit
  if (!periksaRateLimitLogin(email)) {
    return {
      error: "Terlalu banyak percobaan login gagal. Harap tunggu 1 menit sebelum mencoba lagi.",
    };
  }

  let errorPesan = null;

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.message === "Invalid login credentials" ||
        error.code === "invalid_credentials"
      ) {
        errorPesan = "Email atau password salah. Periksa kembali data Anda.";
      } else {
        errorPesan = error.message || "Gagal masuk. Silakan coba lagi.";
      }
    }
  } catch (err) {
    errorPesan = err.message || "Terjadi kesalahan saat memproses login.";
  }

  if (errorPesan) {
    return { error: errorPesan };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function logout() {
  try {
    const supabase = await createAdminClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan galat saat proses keluar jika sesi sudah tidak valid
  }

  revalidatePath("/", "layout");
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get?.("password_baru")?.toString();
  const konfirmasiPassword = data?.get?.("konfirmasi_password")?.toString();

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak sama dengan password baru." };
  }

  try {
    const supabase = await createAdminClient();

    // Periksa bahwa admin sudah login di server
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        error: "Anda belum login atau sesi telah berakhir. Silakan login kembali.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return { error: error.message || "Gagal mengganti password." };
    }

    return { success: "Password berhasil diganti." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat mengganti password." };
  }
}

export async function updatePassword(prevState, formData) {
  return gantiPassword(prevState, formData);
}

export async function tambahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const nama = data?.get?.("nama")?.toString()?.trim();
  const rawHarga = data?.get?.("harga")?.toString()?.trim();
  const harga = parseInt(rawHarga || "0", 10);
  const kategori = data?.get?.("kategori")?.toString()?.trim() || "";
  const foto_url = data?.get?.("foto_url")?.toString()?.trim() || "";
  const deskripsi = data?.get?.("deskripsi")?.toString()?.trim() || "";

  // US-34: Validasi di server per field
  const errors = {};
  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  }
  if (!rawHarga || isNaN(harga) || harga < 0) {
    errors.harga = "Harga wajib diisi dengan angka positif atau 0.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: { nama, harga: rawHarga, kategori, foto_url, deskripsi },
    };
  }

  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Aksi ditolak: Anda harus login sebagai admin." };
    }

    // US-29: Upload foto ke Supabase Storage
    let finalFotoUrl = foto_url?.trim() || "";
    const fotoFile = data?.get?.("foto_file");

    if (fotoFile && typeof fotoFile === "object" && fotoFile.size > 0) {
      if (!fotoFile.type?.startsWith("image/")) {
        return {
          errors: { foto_file: "File harus berupa gambar (JPG, PNG, WebP, SVG)." },
          values: { nama, harga: rawHarga, kategori, foto_url, deskripsi },
        };
      }
      const MAX_SIZE = 2 * 1024 * 1024;
      if (fotoFile.size > MAX_SIZE) {
        return {
          errors: { foto_file: "Ukuran file foto maksimal 2MB." },
          values: { nama, harga: rawHarga, kategori, foto_url, deskripsi },
        };
      }

      const buffer = Buffer.from(await fotoFile.arrayBuffer());
      const ext = fotoFile.name?.split(".").pop() || "jpg";
      const fileName = `produk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("produk")
        .upload(fileName, buffer, {
          contentType: fotoFile.type,
          upsert: true,
        });

      if (uploadError) {
        return { error: `Gagal mengunggah foto ke storage: ${uploadError.message}` };
      }

      const { data: pubData } = supabase.storage
        .from("produk")
        .getPublicUrl(fileName);

      if (pubData?.publicUrl) {
        finalFotoUrl = pubData.publicUrl;
      }
    }

    if (!finalFotoUrl) {
      finalFotoUrl = "/produk/kopi.svg";
    }

    const { error } = await supabase.from("produk").insert([
      {
        nama,
        harga,
        kategori,
        foto_url: finalFotoUrl,
        deskripsi,
      },
    ]);

    if (error) {
      return { error: error.message || "Gagal menyimpan produk baru." };
    }
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menambah produk." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function ubahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const id = data?.get?.("id")?.toString();
  const nama = data?.get?.("nama")?.toString()?.trim();
  const rawHarga = data?.get?.("harga")?.toString()?.trim();
  const harga = parseInt(rawHarga || "0", 10);
  const kategori = data?.get?.("kategori")?.toString()?.trim() || "";
  const foto_url = data?.get?.("foto_url")?.toString()?.trim() || "";
  const deskripsi = data?.get?.("deskripsi")?.toString()?.trim() || "";

  if (!id) {
    return { error: "ID produk tidak ditemukan." };
  }

  // US-34: Validasi di server per field
  const errors = {};
  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  }
  if (!rawHarga || isNaN(harga) || harga < 0) {
    errors.harga = "Harga wajib diisi dengan angka positif atau 0.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: { id, nama, harga: rawHarga, kategori, foto_url, deskripsi },
    };
  }

  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Aksi ditolak: Anda harus login sebagai admin." };
    }

    // US-29: Upload foto baru jika ada
    let finalFotoUrl = foto_url?.trim() || "";
    const fotoFile = data?.get?.("foto_file");

    if (fotoFile && typeof fotoFile === "object" && fotoFile.size > 0) {
      if (!fotoFile.type?.startsWith("image/")) {
        return {
          errors: { foto_file: "File harus berupa gambar (JPG, PNG, WebP, SVG)." },
          values: { id, nama, harga: rawHarga, kategori, foto_url, deskripsi },
        };
      }
      const MAX_SIZE = 2 * 1024 * 1024;
      if (fotoFile.size > MAX_SIZE) {
        return {
          errors: { foto_file: "Ukuran file foto maksimal 2MB." },
          values: { id, nama, harga: rawHarga, kategori, foto_url, deskripsi },
        };
      }

      const buffer = Buffer.from(await fotoFile.arrayBuffer());
      const ext = fotoFile.name?.split(".").pop() || "jpg";
      const fileName = `produk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("produk")
        .upload(fileName, buffer, {
          contentType: fotoFile.type,
          upsert: true,
        });

      if (uploadError) {
        return { error: `Gagal mengunggah foto: ${uploadError.message}` };
      }

      const { data: pubData } = supabase.storage
        .from("produk")
        .getPublicUrl(fileName);

      if (pubData?.publicUrl) {
        finalFotoUrl = pubData.publicUrl;
      }
    }

    if (!finalFotoUrl) {
      finalFotoUrl = "/produk/kopi.svg";
    }

    const { error } = await supabase
      .from("produk")
      .update({
        nama,
        harga,
        kategori,
        foto_url: finalFotoUrl,
        deskripsi,
      })
      .eq("id", id);

    if (error) {
      return { error: error.message || "Gagal memperbarui data produk." };
    }
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat mengubah produk." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

export async function toggleStatusAktif(id) {
  if (!id) return { error: "ID produk tidak valid." };

  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Aksi ditolak: Anda harus login sebagai admin." };
    }

    const { data: produk, error: fetchErr } = await supabase
      .from("produk")
      .select("deskripsi")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !produk) {
      return { error: "Produk tidak ditemukan." };
    }

    const desc = produk.deskripsi || "";
    let newDesc = desc;
    if (desc.includes("[Nonaktif]")) {
      newDesc = desc.replace(/\[Nonaktif\]\s*/g, "").trim();
    } else {
      newDesc = `[Nonaktif] ${desc}`.trim();
    }

    const { error: updErr } = await supabase
      .from("produk")
      .update({ deskripsi: newDesc })
      .eq("id", id);

    if (updErr) {
      return { error: updErr.message };
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}

export async function hapusProduk(id) {
  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Aksi ditolak: Anda harus login sebagai admin." };
    }

    const { error } = await supabase.from("produk").delete().eq("id", id);

    if (error) {
      return { error: error.message || "Gagal menghapus produk." };
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menghapus produk." };
  }
}

export async function buatDeskripsiAI(nama, kategori) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Aksi ditolak: Anda harus login sebagai admin." };
    }

    if (!nama || !nama.trim()) {
      return { error: "Isi nama produk terlebih dahulu." };
    }

    let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const envPath = path.join(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf8");
          const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
          if (match) apiKey = match[1].trim();
        }
      } catch (e) {
        console.error("Gagal membaca .env.local:", e);
      }
    }

    if (!apiKey) {
      return { error: "GEMINI_API_KEY belum diatur di .env.local." };
    }

    const prompt = `Tulis deskripsi produk yang menarik, singkat (2-3 kalimat), dan persuasif dalam bahasa Indonesia untuk produk UMKM berikut:\nNama Produk: ${nama.trim()}\nKategori: ${kategori?.trim() || "Umum"}\n\nTuliskan langsung kalimat deskripsinya tanpa kata pengantar, tanpa tanda petik, dan tanpa markdown berlebih.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await response.json();

    if (json.error) {
      return {
        error: `Gemini API (${json.error.code || "Error"}): ${json.error.message}`,
      };
    }

    const candidates = json?.candidates || [];
    const parts = candidates[0]?.content?.parts || [];
    const text = parts
      .filter((p) => p.text)
      .map((p) => p.text)
      .join("\n\n")
      .trim();

    if (text) {
      return { deskripsi: text };
    }

    return { error: "Gemini tidak menghasilkan teks deskripsi." };
  } catch (err) {
    return { error: err.message || "Gagal membuat deskripsi dengan AI." };
  }
}

// US-50: Asisten AI tanya jawab produk (diproses di server)
export async function tanyaProdukAI(produkId, pertanyaan) {
  if (!produkId) return { error: "ID produk tidak valid." };
  const query = pertanyaan?.toString()?.trim();
  if (!query || query.length < 3) return { error: "Pertanyaan minimal 3 karakter." };
  if (query.length > 200) return { error: "Pertanyaan maksimal 200 karakter." };

  try {
    const supabase = await createAdminClient();
    const { data: rawProduk } = await supabase
      .from("produk")
      .select("nama, harga, kategori, deskripsi")
      .eq("id", produkId)
      .maybeSingle();

    if (!rawProduk) return { error: "Data produk tidak ditemukan." };

    let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const envPath = path.join(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf8");
          const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
          if (match) apiKey = match[1].trim();
        }
      } catch {}
    }

    if (!apiKey) {
      return { error: "Kunci API AI belum diatur di server." };
    }

    const prompt = `Anda adalah asisten toko ramah dan membantu. Jawab pertanyaan pengunjung HANYA berdasarkan informasi produk berikut ini:\n\nNama Produk: ${rawProduk.nama}\nHarga: Rp ${rawProduk.harga}\nKategori: ${rawProduk.kategori || "-"}\nDeskripsi: ${rawProduk.deskripsi || "-"}\n\nPertanyaan Pembeli: "${query}"\n\nInstruksi Jawaban:\n- Jawab dalam bahasa Indonesia yang ramah, sopan, dan singkat (1-3 kalimat).\n- Jangan mengarang fakta di luar data produk di atas.\n- Jika pertanyaannya di luar data produk, sarankan dengan ramah untuk menanyakannya langsung melalui WhatsApp toko.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await response.json();
    if (json.error) {
      return { error: `AI error: ${json.error.message}` };
    }

    const parts = json?.candidates?.[0]?.content?.parts || [];
    const text = parts.filter((p) => p.text).map((p) => p.text).join("\n\n").trim();
    if (text) {
      return { jawaban: text };
    }
    return { error: "Asisten AI tidak dapat menjawab saat ini." };
  } catch (err) {
    return { error: err.message || "Gagal memproses pertanyaan." };
  }
}

// US-46: Impor produk dari file CSV (validasi baris & login diperiksa)
export async function imporProdukCSV(prevState, formData) {
  const file = formData?.get?.("file_csv");
  if (!file || typeof file !== "object" || file.size === 0) {
    return { error: "Pilih file CSV terlebih dahulu." };
  }

  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Aksi ditolak: Anda harus login sebagai admin." };
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length <= 1) {
      return { error: "File CSV kosong atau hanya berisi baris judul." };
    }

    const dataLines = lines.slice(1);
    const barisValid = [];
    const barisGagal = [];

    dataLines.forEach((line, index) => {
      const nomorBaris = index + 2;
      const parts = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
      const nama = parts[0];
      const rawHarga = parts[1];
      const kategori = parts[2] || "Umum";
      const foto_url = parts[3] || "/produk/kopi.svg";
      const deskripsi = parts[4] || "";

      const harga = parseInt(rawHarga, 10);

      if (!nama) {
        barisGagal.push(`Baris ${nomorBaris}: Nama produk kosong.`);
      } else if (isNaN(harga) || harga < 0) {
        barisGagal.push(`Baris ${nomorBaris}: Harga '${rawHarga}' tidak valid (harus angka positif).`);
      } else {
        barisValid.push({
          nama,
          harga,
          kategori,
          foto_url,
          deskripsi,
        });
      }
    });

    if (barisValid.length > 0) {
      const { error: insErr } = await supabase.from("produk").insert(barisValid);
      if (insErr) {
        return { error: `Gagal menyimpan ke database: ${insErr.message}` };
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin");

    return {
      success: true,
      berhasil: barisValid.length,
      gagal: barisGagal.length,
      daftarGagal: barisGagal,
    };
  } catch (err) {
    return { error: err.message || "Gagal memproses file CSV." };
  }
}
