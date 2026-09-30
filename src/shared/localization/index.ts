import { useState, useEffect } from 'react';
import { id, TranslationType } from './id';
import { en } from './en';

export type LanguageCode = 'id' | 'en';

const dictionaries: Record<LanguageCode, TranslationType> = {
  id,
  en,
};

// Default language: English (can be switched to Indonesian anytime)
let currentLang: LanguageCode = 'en';
const languageSubscribers = new Set<() => void>();

function notifyLanguageSubscribers() {
  languageSubscribers.forEach(cb => cb());
}

/**
 * Mengatur bahasa aplikasi yang aktif saat ini ('id' atau 'en')
 */
export function setLanguage(lang: LanguageCode) {
  if (currentLang !== lang && (lang === 'id' || lang === 'en')) {
    currentLang = lang;
    notifyLanguageSubscribers();
  }
}

/**
 * Mendapatkan kode bahasa yang sedang aktif
 */
export function getLanguage(): LanguageCode {
  return currentLang;
}

/**
 * Mendapatkan seluruh kamus teks terjemahan bahasa yang sedang aktif
 */
export function getTranslations(): TranslationType {
  return dictionaries[currentLang];
}

/**
 * Helper untuk menerjemahkan nama kategori produk atau acara secara dinamis
 */
export function translateCategory(category: string, lang: LanguageCode = currentLang): string {
  const dict = dictionaries[lang];
  switch (category) {
    case 'Semua':
      return dict.categories.all;
    case 'Makanan & Minuman':
      return dict.categories.food;
    case 'Kerajinan':
      return dict.categories.craft;
    case 'Pakaian':
      return dict.categories.clothing;
    case 'Keagamaan':
      return dict.categories.religion;
    case 'Olahraga':
      return dict.categories.sports;
    case 'Kebudayaan':
      return dict.categories.culture;
    case 'Pendidikan':
      return dict.categories.education;
    case 'Sosial':
      return dict.categories.social;
    case 'Pemerintahan':
      return dict.categories.government;
    case 'Lainnya':
      return dict.categories.other;
    default:
      return category;
  }
}

/**
 * Custom React hook untuk menggunakan terjemahan dengan reaktivitas state otomatis
 */
export function useTranslation() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick(t => t + 1);
    languageSubscribers.add(update);
    return () => {
      languageSubscribers.delete(update);
    };
  }, []);

  return {
    t: dictionaries[currentLang],
    currentLang,
    setLanguage,
    translateCategory: (cat: string) => translateCategory(cat, currentLang),
  };
}
