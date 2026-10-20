"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get?.("email")?.toString()?.trim();
  const password = data?.get?.("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
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
  const harga = parseInt(data?.get?.("harga")?.toString() || "0", 10);
  const kategori = data?.get?.("kategori")?.toString()?.trim() || "";
  const foto_url = data?.get?.("foto_url")?.toString()?.trim() || "";
  const deskripsi = data?.get?.("deskripsi")?.toString()?.trim() || "";

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  if (isNaN(harga) || harga < 0) {
    return { error: "Harga tidak valid (harus angka positif atau 0)." };
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

    const { error } = await supabase.from("produk").insert([
      {
        nama,
        harga,
        kategori,
        foto_url: foto_url || "/produk/kopi.svg",
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
  const harga = parseInt(data?.get?.("harga")?.toString() || "0", 10);
  const kategori = data?.get?.("kategori")?.toString()?.trim() || "";
  const foto_url = data?.get?.("foto_url")?.toString()?.trim() || "";
  const deskripsi = data?.get?.("deskripsi")?.toString()?.trim() || "";

  if (!id) {
    return { error: "ID produk tidak ditemukan." };
  }

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  if (isNaN(harga) || harga < 0) {
    return { error: "Harga tidak valid (harus angka positif atau 0)." };
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

    const { error } = await supabase
      .from("produk")
      .update({
        nama,
        harga,
        kategori,
        foto_url: foto_url || "/produk/kopi.svg",
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

    if (!nama) {
      return { error: "Isi nama produk terlebih dahulu." };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      const prompt = `Tulis deskripsi produk yang menarik, singkat (2-3 kalimat), dan persuasif dalam bahasa Indonesia untuk produk UMKM berikut:\nNama Produk: ${nama}\nKategori: ${kategori || "Umum"}\n\nTuliskan langsung kalimat deskripsinya tanpa pengantar, tanpa tanda petik, dan tanpa format markdown berlebih.`;

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
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) {
        return { deskripsi: text };
      }
    }

    // Fallback otomatis jika API key belum diatur
    const fallback = `${nama} merupakan produk unggulan kategori ${kategori || "kebutuhan harian"} yang dibuat dengan bahan berkualitas dan higienis. Memberikan kualitas rasa dan kepuasan terbaik untuk seluruh keluarga.`;
    return { deskripsi: fallback };
  } catch (err) {
    return { error: err.message || "Gagal membuat deskripsi dengan AI." };
  }
}
