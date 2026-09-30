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

/**
 * Format timestamp (ms) ke tanggal & waktu lokal Indonesia
 * @example formatDateTime(1783502880000) → "11 Jul 2026, 09.00 WIB"
 */
export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${dateStr}, ${hours}:${minutes} WIB`;
};

/**
 * Format jadwal event lengkap (tanggal mulai s/d selesai)
 */
export const formatEventSchedule = (startDate: number, endDate?: number): string => {
  const startStr = formatDateTime(startDate);
  if (!endDate) {
    return startStr;
  }
  const endStr = formatDateTime(endDate);
  return `${startStr} s/d ${endStr}`;
};

