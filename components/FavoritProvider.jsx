"use client";

import { createContext, useContext, useEffect, useState } from "react";

const FavoritContext = createContext({
  favorit: [],
  isFavorit: () => false,
  toggleFavorit: () => {},
  totalFavorit: 0,
});

export function FavoritProvider({ children }) {
  const [favorit, setFavorit] = useState([]);
  const [dimuat, setDimuat] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem("katalog_favorit");
      if (data) {
        setFavorit(JSON.parse(data));
      }
    } catch {
      // Abaikan
    }
    setDimuat(true);
  }, []);

  useEffect(() => {
    if (dimuat) {
      try {
        localStorage.setItem("katalog_favorit", JSON.stringify(favorit));
      } catch {
        // Abaikan
      }
    }
  }, [favorit, dimuat]);

  function isFavorit(id) {
    return favorit.some((item) => String(item.id) === String(id));
  }

  function toggleFavorit(produk) {
    setFavorit((prev) => {
      const ada = prev.some((item) => String(item.id) === String(produk.id));
      if (ada) {
        return prev.filter((item) => String(item.id) !== String(produk.id));
      }
      return [
        ...prev,
        {
          id: produk.id,
          nama: produk.nama,
          harga: produk.harga,
          foto_url: produk.foto_url,
          kategori: produk.kategori,
          deskripsi: produk.deskripsi,
        },
      ];
    });
  }

  return (
    <FavoritContext.Provider
      value={{
        favorit,
        isFavorit,
        toggleFavorit,
        totalFavorit: favorit.length,
      }}
    >
      {children}
    </FavoritContext.Provider>
  );
}

export function useFavorit() {
  return useContext(FavoritContext);
}
