# 🎨 Folder Ikon SVG (`src/assets/icons/`)

Folder ini digunakan untuk menyimpan seluruh asset file ikon vektor `.svg` aplikasi.

### Contoh Ikon yang Tersedia:
- `product.svg` - Ikon tas belanja untuk tab Produk UMKM
- `calendar.svg` - Ikon kalender untuk tab Acara Desa
- `user.svg` - Ikon pengguna untuk tab Profil Akun
- `search.svg` - Ikon kaca pembesar untuk kolom pencarian

### Cara Menambahkan Ikon Baru:
1. Simpan file `.svg` Anda ke dalam folder ini (`src/assets/icons/nama_ikon.svg`).
2. Pasang library `react-native-svg` & `react-native-svg-transformer`.
3. Import ikon tersebut ke dalam komponen Anda:
   ```tsx
   import ProductIcon from '../../../assets/icons/product.svg';

   <ProductIcon width={22} height={22} stroke="#16A34A" />
   ```
