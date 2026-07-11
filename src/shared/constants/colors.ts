/**
 * Shared Color Constants
 * Satu tempat untuk semua warna aplikasi
 */
export const Colors = {
  // Primary
  primary: '#16A34A',
  primaryLight: '#DCFCE7',
  primaryBorder: '#BBF7D0',
  primaryDark: '#15803D',

  // WhatsApp
  whatsapp: '#25D366',
  whatsappDark: '#128C7E',

  // Neutral
  background: '#F8FAFC',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  divider: '#F1F5F9',
  border: '#E5E7EB',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Status
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  success: '#22C55E',

  // Badge
  stockEmpty: '#D1D5DB',
} as const;

export type AppColor = typeof Colors[keyof typeof Colors];
