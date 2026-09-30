/**
 * DM Sans Font Family Constants
 * Digunakan untuk standarisasi tipografi di seluruh aplikasi
 */
export const Fonts = {
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  semiBold: 'DMSans-SemiBold',
  bold: 'DMSans-Bold',
  extraBold: 'DMSans-ExtraBold',
  italic: 'DMSans-Italic',
  boldItalic: 'DMSans-BoldItalic',
  default: 'DMSans-Regular',
} as const;

export type FontFamilyType = typeof Fonts[keyof typeof Fonts];
