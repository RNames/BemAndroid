# 📘 Dokumentasi Lengkap Aplikasi Produk & Acara Desa (BEM Android)

Dokumentasi ini menyajikan penjelasan menyeluruh mengenai arsitektur, modul fitur, skema database Firestore, alur data, integrasi cloud, mekanisme pembaruan aplikasi otomatis, sistem lokalisasi multibahasa, dan panduan instalasi aplikasi mobile **Portal Desa** (Katalog Produk UMKM & Acara Desa).

---

## 📑 Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Spesifikasi & Tech Stack](#2-spesifikasi--tech-stack)
3. [Arsitektur Proyek](#3-arsitektur-proyek)
4. [Skema Database Cloud Firestore](#4-skema-database-cloud-firestore)
   - [A. Koleksi `products` (Produk UMKM)](#a-koleksi-products-produk-umkm)
   - [B. Koleksi `events` (Acara Desa)](#b-koleksi-events-acara-desa)
   - [C. Koleksi `admin_users` (Akun Pengguna & Notifikasi)](#c-koleksi-admin_users-akun-pengguna--notifikasi)
   - [D. Koleksi `app_config` (Konfigurasi & Versi Aplikasi)](#d-koleksi-app_config-konfigurasi--versi-aplikasi)
5. [Detail Modul Fitur](#5-detail-modul-fitur)
   - [A. Manajemen Produk UMKM (Products Feature)](#a-manajemen-produk-umkm-products-feature)
   - [B. Manajemen Acara Desa (Events Feature)](#b-manajemen-acara-desa-events-feature)
   - [C. Autentikasi, Profil Pengguna & Sub-Menu (Auth & Profile)](#c-autentikasi-profil-pengguna--sub-menu-auth--profile)
   - [D. Sistem Pembaruan Versi Aplikasi Real Data (App Update System)](#d-sistem-pembaruan-versi-aplikasi-real-data-app-update-system)
   - [E. Sistem Lokalisasi Multibahasa Dinamis (Localization)](#e-sistem-lokalisasi-multibahasa-dinamis-localization)
   - [F. Layanan Upload Cloudinary (Shared Service)](#f-layanan-upload-cloudinary-shared-service)
   - [G. Sistem Navigasi Terpadu & Back Handler](#g-sistem-navigasi-terpadu--back-handler)
6. [Alur Kerja Data (Data Flow)](#6-alur-kerja-data-data-flow)
7. [Aturan Keamanan Firestore (Security Rules)](#7-aturan-keamanan-firestore-security-rules)
8. [Panduan Instalasi & Menjalankan Aplikasi](#8-panduan-instalasi--menjalankan-aplikasi)
9. [Konfigurasi Layanan Eksternal](#9-konfigurasi-layanan-eksternal)

---

## 1. Gambaran Umum

Aplikasi **BEM Android (Portal Desa)** adalah aplikasi mobile terpadu berbasis **React Native** dan **TypeScript** yang dibangun sebagai wadah digitalisasi katalog produk UMKM dan informasi agenda kegiatan/acara warga desa.

### Tujuan Utama:
1. **Bagi Masyarakat / Pengunjung (Guest User):**
   - **Katalog UMKM**: Menjelajahi aneka produk lokal, pencarian real-time, filter kategori dinamis, dan langsung bertransaksi via tombol **WhatsApp Direct**.
   - **Agenda Acara Desa**: Melihat jadwal kegiatan warga, waktu mulai-selesai, lokasi, dan membuka rute di **Google Maps**.
2. **Bagi Warga / Pelaku UMKM (Authenticated User):**
   - Masuk cepat dengan **Google Sign-In**.
   - Mendaftarkan produk atau mengajukan acara baru lengkap dengan foto dari **Kamera** atau **Galeri** (terunggah otomatis ke Cloudinary).
   - Mengelola produk & acara pribadi melalui menu **My Products** dan **My Events**.
   - Mengedit nama profil dan foto avatar pribadi.
   - Menerima pesan dan notifikasi resmi desa lewat **Inbox**.
3. **Pembaruan Aplikasi Otomatis (OTA / In-App Update Alert):**
   - Mendeteksi ketersediaan versi baru dari Firestore (`/app_config/version`).
   - Mengarahkan pengguna langsung ke portal website desa di Vercel (`https://risetbemgtd2026.vercel.app/`).
   - Mendukung penegakan pembaruan wajib (*Force Update*).

---

## 2. Spesifikasi & Tech Stack

| Kategori | Teknologi | Versi | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Framework Utama** | React Native | `0.86.0` | Framework mobile cross-platform |
| **UI Library** | React | `19.2.3` | Library komponen UI modern |
| **Bahasa Pemrograman** | TypeScript | `5.8.3` | Type-safety dan arsitektur kode terstruktur |
| **Database Cloud** | Firebase Firestore | `v25.1.0` | Database NoSQL real-time cloud (Modular API) |
| **Otentikasi** | Firebase Auth & Google Sign-In | `v25.1.0` / `v16.1.2` | Login satu klik akun Google |
| **Media Storage** | Cloudinary REST API | API | Cloud storage untuk hosting foto produk, acara, dan avatar |
| **Media Picker** | `react-native-image-picker` | `v8.2.1` | Akses kamera HP dan galeri gambar |
| **Area Layar & Notch** | `react-native-safe-area-context` | `v5.8.0` | Penanganan status bar, notch, dan safe-area insets |
| **Ikon Vektor** | `react-native-svg` | `v15.15.2` | Rendering aset grafis SVG responsif |
| **Pembaruan Versi** | Custom Semver + Firestore | Modular | Otomasi deteksi rilis & pengalihan website |

---

## 3. Arsitektur Proyek

Proyek menerapkan arsitektur berbasis fitur (**Feature-Driven Clean Architecture**):

```text
bemAndroid/
├── android/                         # Konfigurasi & kode native Android
├── src/
│   ├── assets/                      # Ikon SVG & aset grafis
│   ├── features/                    # Modul Fitur Aplikasi
│   │   ├── auth/                    # Modul Autentikasi, Profil & Inbox
│   │   │   ├── controllers/         # useAuthController
│   │   │   ├── models/              # User.model.ts
│   │   │   └── views/               # UserProfileScreen, AccountInfoScreen, InboxScreen, LanguageScreen, EditProfileModal, LoginModal
│   │   ├── products/                # Modul Katalog Produk UMKM
│   │   │   ├── controllers/         # useProductController
│   │   │   ├── models/              # Product.model.ts
│   │   │   └── views/               # HomeScreen, UserProductsScreen, ProductDetailScreen, ProductCard, AddProductModal
│   │   ├── events/                  # Modul Acara Desa
│   │   │   ├── controllers/         # useEventController
│   │   │   ├── models/              # Event.model.ts
│   │   │   └── views/               # UserEventsScreen, EventDetailScreen, EventCard, AddEventModal
│   │   └── village/                 # Modul Profil Identitas Desa
│   ├── navigation/                  # AppNavigator.tsx (Stack navigation & Hardware Back)
│   └── shared/                      # Komponen & Utilitas Bersama
│       ├── components/              # AppUpdateModal.tsx, FilterModal.tsx, Skeleton.tsx
│       ├── constants/               # appVersion.ts, colors.ts, fonts.ts
│       ├── localization/            # en.ts, id.ts, index.ts (Multi-Language Engine)
│       ├── services/                # cloudinary.service.ts, version.service.ts
│       └── utils/                   # format.utils.ts
├── App.tsx                          # Root component
├── DOKUMENTASI.md                   # Dokumentasi teknis komprehensif
├── README.md                        # Panduan ringkas repositori
├── field.txt                        # Referensi field konfigurasi Firestore app_config
└── rules.txt                        # Aturan keamanan Cloud Firestore
```

---

## 4. Skema Database Cloud Firestore

### A. Koleksi `products` (Produk UMKM)
Menyimpan data produk UMKM lokal:

| Field | Tipe | Deskripsi | Contoh Nilai |
| :--- | :--- | :--- | :--- |
| `id` | `string` | ID unik dokumen (`product_<timestamp>`) | `"product_1783528003153"` |
| `name` | `string` | Nama barang/produk | `"Kerupuk Singkong Renyah Dlemer"` |
| `category` | `string` | Kategori produk | `"Makanan & Minuman"` |
| `price` | `number` | Harga produk dalam Rupiah | `15000` |
| `stock` | `number` | Jumlah stok tersedia | `25` |
| `description` | `string` | Deskripsi lengkap produk | `"Kerupuk singkong olahan warga desa berkualitas super"` |
| `imageUrl` | `string` | Tautan gambar publik dari Cloudinary | `"https://res.cloudinary.com/j8waf8jp/..."` |
| `whatsappLink` | `string` | Tautan WhatsApp penjual (wa.me) | `"https://wa.me/6281234567890?text=Halo..."` |
| `approved` | `boolean` | Status persetujuan penayangan (`false` = pending, `true` = tayang) | `false` |
| `createdAt` | `number` | Waktu dibuat (epoch ms) | `1783528003153` |
| `updatedAt` | `number` | Waktu perubahan terakhir (epoch ms) | `1783528003153` |
| `createdBy` | `string` | UID Firebase Auth pemilik produk | `"vy3jWrfj8SYexqxFxMxRzjdYoDp2"` |

---

### B. Koleksi `events` (Acara Desa)
Menyimpan agenda kegiatan masyarakat desa:

| Field | Tipe | Deskripsi | Contoh Nilai |
| :--- | :--- | :--- | :--- |
| `id` | `string` | ID unik dokumen (`event_<timestamp>`) | `"event_1783528101251"` |
| `title` | `string` | Nama / judul acara | `"Festival Seni & Budaya Desa"` |
| `category` | `string` | Kategori acara (`Keagamaan`, `Olahraga`, `Kebudayaan`, `Pendidikan`, `Sosial`, `Pemerintahan`, `Lainnya`) | `"Kebudayaan"` |
| `organizer` | `string` | Penyelenggara / penanggung jawab | `"Karang Taruna & Pemdes"` |
| `date` | `number` | Waktu mulai acara (epoch ms) | `1783502880000` |
| `endDate` | `number?` | Waktu selesai opsional (epoch ms) | `1783675680000` |
| `location` | `string` | Lokasi pelaksanaan acara | `"Balai Desa / Lapangan Utama"` |
| `description` | `string` | Rincian susunan acara & ketentuan warga | `"Peringatan hari besar desa terbuka untuk umum"` |
| `imageUrl` | `string` | Foto/pamflet acara dari Cloudinary | `"https://res.cloudinary.com/j8waf8jp/..."` |
| `approved` | `boolean` | Status persetujuan penayangan (`false` = pending, `true` = tayang) | `false` |
| `createdAt` | `number` | Waktu pengajuan (epoch ms) | `1783528101251` |
| `updatedAt` | `number` | Waktu update terakhir (epoch ms) | `1783529377411` |
| `createdBy` | `string` | UID Firebase Auth pengaju acara | `"vy3jWrfj8SYexqxFxMxRzjdYoDp2"` |

---

### C. Koleksi `admin_users` (Akun Pengguna & Notifikasi)
Menyimpan profil pengguna yang masuk melalui Google Sign-In:

| Field | Tipe | Deskripsi | Contoh Nilai |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Firebase Auth UID (Primary Key) | `"vy3jWrfj8SYexqxFxMxRzjdYoDp2"` |
| `displayName` | `string` | Nama lengkap pengguna | `"Doni Kurniawan"` |
| `email` | `string` | Email akun Google | `"doni.smpn1@gmail.com"` |
| `photoUrl` | `string?` | URL avatar akun Google atau Cloudinary | `"https://res.cloudinary.com/..."` |
| `role` | `string` | Peran pengguna (`"admin"` atau `"user"`) | `"admin"` |
| `createdAt` | `number` | Waktu pendaftaran pertama (epoch ms) | `1783351120209` |
| `lastLogin` | `number` | Waktu login terakhir (epoch ms) | `1783766429572` |

#### Subkoleksi `notifications` (`/admin_users/{userId}/notifications`):
Menampung pesan resmi dari sistem desa untuk pengguna (tanpa data dummy):
- `id` (string): ID pesan
- `sender` (string): Pengirim (cth: "Pemerintah Desa")
- `category` (string): `"Notice"` / `"System"`
- `title` (string): Judul notifikasi
- `content` (string): Isi pesan lengkap
- `preview` (string): Cuplikan singkat pesan
- `createdAt` (number): Timestamp pengiriman
- `read` (boolean): Status pesan dibaca

---

### D. Koleksi `app_config` (Konfigurasi & Versi Aplikasi)
Menyimpan informasi versi aplikasi aktif untuk fitur pembaruan otomatis (dokumen: `/app_config/version`):

| Field | Tipe | Deskripsi | Nilai Aktif |
| :--- | :--- | :--- | :--- |
| `latestVersion` | `string` | Nomor versi terbaru aplikasi (semver) | `"1.0.0"` *(ubah ke `"1.1.0"` untuk rilis baru)* |
| `minVersion` | `string` | Versi minimum yang diperbolehkan | `"1.0.0"` |
| `forceUpdate` | `boolean` | Penegakan pembaruan wajib (`true` = wajib, `false` = opsional) | `false` |
| `downloadUrl` | `string` | URL tujuan tombol Update Now (Website Desa Vercel / APK Link) | `"https://risetbemgtd2026.vercel.app/"` |
| `releaseNotes` | `string` | Catatan rilis fitur baru (*What's New*) | `"• Fitur baru edit profil\n• Tampilan bahasa Inggris\n• Peningkatan stabilitas"` |

---

## 5. Detail Modul Fitur

### A. Manajemen Produk UMKM (`products` feature)
1. **Katalog Grid**: Menampilkan produk yang disetujui (`approved == true`) dalam 2 kolom responsif.
2. **Pencarian & Filter Kategori**: Filter pencarian instan dan kategori produk (*Semua*, *Makanan & Minuman*, *Kerajinan Tangan*, *Pakaian & Busana*, *Lainnya*).
3. **Detail & WhatsApp Direct**: Rincian harga, stok, status, dan tombol WhatsApp direct dengan pesan pemesanan otomatis.
4. **Pengajuan Produk Baru**: Form pendaftaran produk baru dengan upload foto ke Cloudinary (status awal `approved: false`).

### B. Manajemen Acara Desa (`events` feature)
1. **Daftar Acara Desa**: Menampilkan kartu acara interaktif ([`EventCard.tsx`](file:///d:/Project/BEM/bemAndroid/src/features/events/views/components/EventCard.tsx)) dengan tanggal terformat, penyelenggara, dan lokasi.
2. **Detail Acara**: Menampilkan hero banner foto pamflet, jadwal mulai/selesai, deskripsi, serta tombol **"Buka Petunjuk Arah di Google Maps"**.
3. **Pengajuan Acara Baru**: Pendaftaran acara warga dengan tanggal & jam mulai/selesai langsung terverifikasi oleh admin desa.

### C. Autentikasi, Profil Pengguna & Sub-Menu (Auth & Profile)
1. **Header Profil Terpusat**: Menampilkan foto profil melingkar, nama, email, badge peran (*Administrator* / *Warga Terdaftar*), dan tombol **Edit Profile**.
2. **Edit Profil ([`EditProfileModal.tsx`](file:///d:/Project/BEM/bemAndroid/src/features/auth/views/components/EditProfileModal.tsx))**:
   - Memilih foto dari Kamera atau Galeri.
   - Mengunggah foto baru ke Cloudinary dan memperbarui `displayName` serta `photoUrl` di Firestore.
3. **Informasi Akun ([`AccountInfoScreen.tsx`](file:///d:/Project/BEM/bemAndroid/src/features/auth/views/screens/AccountInfoScreen.tsx))**:
   - Menampilkan rincian data akun tanpa menampilkan UID sensitif demi keamanan.
4. **Produk Saya & Acara Saya ([`UserProductsScreen.tsx`](file:///d:/Project/BEM/bemAndroid/src/features/products/views/screens/UserProductsScreen.tsx) & [`UserEventsScreen.tsx`](file:///d:/Project/BEM/bemAndroid/src/features/events/views/screens/UserEventsScreen.tsx))**:
   - Menampilkan seluruh produk atau acara yang didaftarkan oleh pengguna yang sedang login beserta badge status (*Approved* / *Under Review*).
5. **Kotak Masuk ([`InboxScreen.tsx`](file:///d:/Project/BEM/bemAndroid/src/features/auth/views/screens/InboxScreen.tsx))**:
   - Mengambil notifikasi asli dari Firestore `/admin_users/{userId}/notifications` lengkap dengan tab filter (*All, Notice, System*) dan dialog pembaca pesan.

### D. Sistem Pembaruan Versi Aplikasi Real Data (App Update System)
- **Logika Semver ([`version.service.ts`](file:///d:/Project/BEM/bemAndroid/src/shared/services/version.service.ts))**:
  Membandingkan versi lokal [appVersion.ts](file:///d:/Project/BEM/bemAndroid/src/shared/constants/appVersion.ts) (`v1.0.0`) dengan field `latestVersion` di Firestore.
- **Pemeriksaan Otomatis saat Startup ([`AppNavigator.tsx`](file:///d:/Project/BEM/bemAndroid/src/navigation/AppNavigator.tsx))**:
  Jika `hasUpdate == true` atau `forceUpdate == true`, modal dialog [AppUpdateModal.tsx](file:///d:/Project/BEM/bemAndroid/src/shared/components/AppUpdateModal.tsx) langsung muncul saat aplikasi dibuka.
- **Pembaruan Wajib (*Force Update*)**:
  Jika `forceUpdate: true` atau versi lokal < `minVersion`, modal tidak dapat ditutup (tombol *Maybe Later* hilang dan back hardware dicegah) serta menampilkan banner peringatan merah.
- **Tautan Website Desa**:
  Menekan tombol **"Update Now"** akan membuka browser bawaan HP menuju URL website Vercel desa: `https://risetbemgtd2026.vercel.app/`.
- **Tombol Debug Profil**:
  Tombol *Check for Updates (Debug)* di bagian bawah menu profil selalu tersedia untuk menguji pengambilan data real dari Firestore kapan saja.

### E. Sistem Lokalisasi Multibahasa Dinamis (Localization)
- Engine lokalisasi terpusat pada folder `src/shared/localization/` dengan reactive hook `useTranslation()`.
- **Bahasa Default**: Disetel ke **English (US)** dan dapat diubah secara instan ke **Bahasa Indonesia** melalui tab *Profile ➔ Language*.
- Seluruh teks di navbar, appbar, search bar, filter, form input, kartu produk/acara, hingga dialog modal berubah seketika tanpa perlu restart aplikasi.
- Kategori produk/acara di database tetap konsisten, dan diterjemahkan otomatis ke bahasa aktif melalui fungsi `translateCategory()`.

### F. Layanan Upload Cloudinary (`cloudinary.service.ts`)
- Upload foto langsung dari smartphone ke Cloudinary Cloud Storage (`j8waf8jp`).
- Generator tanda tangan otentikasi SHA-1 murni JavaScript:
  $$\text{signature} = \text{SHA1}(\text{"timestamp="} + \text{timestamp} + \text{apiSecret})$$
- Menghasilkan URL HTTPS publik yang aman dan permanen.

### G. Sistem Navigasi Terpadu & Back Handler ([`AppNavigator.tsx`](file:///d:/Project/BEM/bemAndroid/src/navigation/AppNavigator.tsx))
- Mengelola stack navigasi: `'home' | 'product_detail' | 'event_detail' | 'account_info' | 'user_products' | 'user_events' | 'inbox' | 'language'`.
- Menjaga `HomeScreen` tetap terpasang di memori agar posisi scroll dan state tab tidak hilang.
- Mengintegrasikan tombol fisik hardware Back Android.

---

## 6. Alur Kerja Data (Data Flow)

```
                       [PORTAL DESA]
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
[Tab Produk UMKM]     [Tab Acara Desa]     [Tab Profil Pengguna]
       │                     │                     │
├── Grid Katalog      ├── Agenda Acara      ├── Rincian Akun & Avatar
├── Cari & Filter     ├── Cari & Filter     ├── Edit Profil (Nama/Foto)
└── Chat WhatsApp     └── Rute Google Maps  ├── Produk & Acara Saya
       │                     │              ├── Inbox Notifikasi Resmi
       └──────────────┬──────┘              ├── Pilihan Bahasa (ID/EN)
                      │                     └── Cek Update Real Data
            Tekan Tombol Tambah (+)                │
                      │                            ▼
            Pengguna Belum Login?           [Firestore /app_config/version]
                      │                            │
             ┌────────┴────────┐                   ├── latestVersion > local? -> Munculkan Update Modal
           [Ya]              [Tidak]               └── Klik Update Now -> Buka https://risetbemgtd2026.vercel.app/
             │                 │
       LoginModal       AddModal (Produk/Acara)
             │                 │
       Google Sign-In    Upload Foto Cloudinary
             │                 │
             ▼                 ▼
       Simpan Akun       Simpan ke Firestore
       /admin_users      approved: false (Pending ACC)
```

---

## 7. Aturan Keamanan Firestore (Security Rules)

Pastikan aturan pada file [rules.txt](file:///d:/Project/BEM/bemAndroid/rules.txt) telah dipublikasikan di **Firebase Console ➔ Firestore Database ➔ Rules**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/admin_users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.role == 'admin';
    }

    // 1. Profil Desa (/village_profile)
    match /village_profile/{profileId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 2. Produk UMKM (/products)
    match /products/{productId} {
      allow read: if true;
      allow create: if isAuthenticated() &&
        request.resource.data.createdBy == request.auth.uid &&
        (request.resource.data.approved == false || isAdmin());
      allow update: if isAuthenticated() && (
        isAdmin() || 
        (resource.data.createdBy == request.auth.uid && request.resource.data.approved == resource.data.approved)
      );
      allow delete: if isAuthenticated() && (
        isAdmin() || resource.data.createdBy == request.auth.uid
      );
    }

    // 3. Acara Desa (/events)
    match /events/{eventId} {
      allow read: if true;
      allow create: if isAuthenticated() &&
        request.resource.data.createdBy == request.auth.uid &&
        (request.resource.data.approved == false || isAdmin());
      allow update: if isAuthenticated() && (
        isAdmin() || 
        (resource.data.createdBy == request.auth.uid && request.resource.data.approved == resource.data.approved)
      );
      allow delete: if isAuthenticated() && (
        isAdmin() || resource.data.createdBy == request.auth.uid
      );
    }

    // 4. Akun Pengguna & Notifikasi (/admin_users)
    match /admin_users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow create, update: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow delete: if isAdmin();

      match /notifications/{notificationId} {
        allow read, update: if isAuthenticated() && isOwner(userId);
        allow create, delete: if isAdmin();
      }
    }

    // 5. Konfigurasi Versi Aplikasi (/app_config)
    match /app_config/{configId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

---

## 8. Panduan Instalasi & Menjalankan Aplikasi

1. **Install dependensi:**
   ```bash
   npm install
   ```
2. **File Kredensial Firebase:**
   Pastikan file `google-services.json` berada di `android/app/google-services.json`.
3. **Pemeriksaan Tipe TypeScript:**
   ```bash
   npx tsc --noEmit
   ```
4. **Jalankan Metro Bundler:**
   ```bash
   npm start
   ```
5. **Jalankan ke HP Android / Emulator:**
   ```bash
   npm run android
   ```

---

## 9. Konfigurasi Layanan Eksternal

- **Firebase Project ID**: `risetbemgtd2026`
- **Google OAuth Client ID**: `8000692687-lo37deu66jaij1fc0qvt6236bcb3goea.apps.googleusercontent.com`
- **Cloudinary Cloud Name**: `j8waf8jp`
- **Website Resmi Desa**: `https://risetbemgtd2026.vercel.app/`
- **WhatsApp Android 11+ Package Visibility**: Terkonfigurasi pada tag `<queries>` di `android/app/src/main/AndroidManifest.xml`.
