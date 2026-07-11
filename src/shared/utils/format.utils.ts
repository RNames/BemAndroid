/**
 * Format Utilities
 * Kumpulan fungsi helper yang dapat digunakan di seluruh aplikasi
 */

/**
 * Format angka ke format Rupiah
 * @example formatPrice(15000) → "Rp 15.000"
 */
export const formatPrice = (price: number): string =>
  `Rp ${price.toLocaleString('id-ID')}`;

/**
 * Format timestamp (ms) ke tanggal lokal Indonesia
 * @example formatDate(1783528003153) → "11 Juli 2026"
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Membuat pesan WhatsApp yang sudah di-encode untuk URL
 */
export const buildWhatsappUrl = (phone: string, message: string): string => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
};

/**
 * Potong teks panjang dengan ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {return text;}
  return `${text.substring(0, maxLength)}...`;
};
