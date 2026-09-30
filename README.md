# 📱 Portal Desa (BEM Android)

Aplikasi mobile berbasis **React Native** & **TypeScript** yang dirancang sebagai pusat informasi dan promosi **Katalog Produk UMKM** serta **Agenda Acara Desa**. Aplikasi ini terhubung ke **Firebase Firestore** secara real-time, mendukung login dengan **Google Sign-In**, penyimpanan foto teroptimasi di **Cloudinary Storage**, integrasi ke **WhatsApp Direct**, rute lokasi di **Google Maps**, **sistem pembaruan versi real data** via website desa ([risetbemgtd2026.vercel.app](https://risetbemgtd2026.vercel.app/)), serta **sistem multibahasa dinamis** (English & Bahasa Indonesia).

> 📖 **Dokumentasi Lengkap:** Silakan baca file [DOKUMENTASI.md](file:///d:/Project/BEM/bemAndroid/DOKUMENTASI.md) untuk penjelasan teknis mendalam mengenai arsitektur, skema database, data flow, aturan keamanan, dan konfigurasi API.

---

## 🚀 Fitur Utama

- 🛍️ **Katalog Produk UMKM**: Menampilkan produk lokal dalam format grid 2 kolom dengan filter pencarian dan kategori dinamis.
- 📅 **Agenda Acara Desa**: Menampilkan jadwal kegiatan desa dengan kategori (*Keagamaan*, *Olahraga*, *Kebudayaan*, *Pendidikan*, *Sosial*, *Pemerintahan*, *Lainnya*).
- 💬 **Integrasi WhatsApp Direct**: Menghubungi penjual UMKM via WhatsApp dengan template pesan otomatis.
- 📍 **Petunjuk Arah Google Maps**: Membuka lokasi acara langsung di aplikasi peta.
- 🔐 **Autentikasi Google Sign-In**: Login satu klik akun Google dan sinkronisasi profil pengguna ke Firestore.
- 👤 **Profil Pengguna Lengkap**:
  - **Edit Profil**: Mengubah nama lengkap & foto profil (upload kamera/galeri via Cloudinary).
  - **Informasi Akun**: Rincian profil akun secara aman tanpa mengekspos UID sensitif.
  - **Produk Saya & Acara Saya**: Mengelola konten yang didaftarkan oleh pengguna beserta status verifikasi.
  - **Kotak Masuk (Inbox)**: Menerima notifikasi dan pesan resmi dari sistem desa secara real-time.
  - **Pengaturan Bahasa**: Pilihan bahasa antarmuka aplikasi (*English* dan *Bahasa Indonesia*).
- 🌐 **Sistem Lokalisasi Multibahasa Dinamis**: Seluruh teks antarmuka (navbar, appbar, search bar, kartu, modal, form) berganti bahasa seketika secara reaktif.
- 🔄 **Pembaruan Aplikasi Real Data (App Update System)**:
  - Pemeriksaan versi otomatis saat startup langsung dari Firestore (`/app_config/version`).
  - Menampilkan dialog rilis versi baru (*What's New*) dan tombol **Update Now** yang mengarahkan ke website desa [risetbemgtd2026.vercel.app](https://risetbemgtd2026.vercel.app/).
  - Penegakan pembaruan wajib (*Force Update*) jika versi minimum tidak terpenuhi.
  - Tombol uji coba pembaruan (*Debug Update*) di menu profil.
- ➕ **Pengajuan Produk & Acara Baru**: Pengguna terotentikasi dapat mendaftarkan produk atau mengajukan acara desa.
- 📷 **Upload Foto (Kamera & Galeri)**: Mengambil foto langsung lewat kamera atau galeri dengan upload otomatis ke Cloudinary.
- 🔒 **Sistem Moderasi Aman**: Produk dan acara baru yang didaftarkan memiliki status `approved: false` (pending review) untuk diverifikasi oleh admin sebelum tayang.
- 📱 **Android Back Handler**: Handling tombol fisik *Back* Android yang nyaman (kembali dari Detail/Sub-menu ke Beranda).

---

## 🛠️ Spesifikasi Teknologi

| Komponen | Teknologi / Library | Versi |
| :--- | :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) | `v0.86.0` (React 19.2.3) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | `v5.8.3` |
| **Database Cloud** | `@react-native-firebase/firestore` | `v25.1.0` (Modular API) |
| **Autentikasi** | `@react-native-firebase/auth` + Google Sign-In | `v25.1.0` / `v16.1.2` |
| **Media Storage** | Cloudinary API (Signed SHA-1 Upload) | REST API |
| **Image Picker** | `react-native-image-picker` | `v8.2.1` |
| **Area Layar** | `react-native-safe-area-context` | `v5.8.0` |
| **Website Desa** | Portal Profil Vercel | [risetbemgtd2026.vercel.app](https://risetbemgtd2026.vercel.app/) |

---

## 📂 Struktur Proyek

```text
bemAndroid/
├── android/                         # Konfigurasi native Android
├── src/
│   ├── assets/                      # Ikon SVG & aset grafis
│   ├── features/                    # Modul Fitur Aplikasi
│   │   ├── auth/                    # Modul Autentikasi, Profil, Inbox & Bahasa
│   │   ├── products/                # Modul Katalog Produk UMKM
│   │   ├── events/                  # Modul Acara Desa
│   │   └── village/                 # Modul Profil Desa
│   ├── navigation/                  # AppNavigator.tsx
│   └── shared/                      # Colors, Cloudinary, Localization, Version Service
├── App.tsx                          # Root component
├── DOKUMENTASI.md                   # Dokumentasi teknis komprehensif
├── README.md                        # Panduan ringkas proyek
├── field.txt                        # Konfigurasi data dokumen Firestore app_config
└── rules.txt                        # Aturan keamanan Cloud Firestore
```

---

## ⚡ Cara Menjalankan Aplikasi

1. **Install dependensi:**
   ```bash
   npm install
   ```
2. **Jalankan Metro Bundler:**
   ```bash
   npm start
   ```
3. **Jalankan ke HP Android / Emulator:**
   ```bash
   npm run android
   ```
