# Wedding Planner Antariksa & Sofiya — Fullstack Next.js

Aplikasi perencana pernikahan modern berbasis **Next.js 16 (App Router)**, **React 19**, **TypeScript**, dan **MySQL**.

## Fitur Utama & Modul (Full CRUD)
1. **Beranda (`/beranda`)**: Dashboard eksekutif, live countdown detik, ringkasan tabungan vs estimasi, progress per PIC, dan 4 tombol Akses Cepat.
2. **Checklist (`/checklist`)**: CRUD tugas persiapan (150 tugas bawaan), filter status, PIC, kategori, dan template bawaan.
3. **Estimasi Pengeluaran (`/anggaran`)**: CRUD kategori anggaran, item estimasi, dan pencatatan riwayat realisasi pembayaran (DP/Lunas).
4. **Savings & Dana Nikah (`/tabungan`)**: Portofolio tabungan, alokasi instrumen investasi (Deposito, SBN, Reksadana, Saham), riwayat mutasi kas, rekap kontribusi pasangan, pencatatan pencairan dana (*anti-double counting*).
5. **Mahar & Seserahan (`/mahar` atau `/mahar-seserahan`)**: CRUD daftar barang mahar & seserahan, status pembelian, dan estimasi biaya (terpisah dari anggaran utama).
6. **Acara & Rundown (`/acara`)**: CRUD jadwal agenda Akad & Resepsi, waktu, lokasi, PIC lapangan, dan template rundown.
7. **Vendor (`/vendor`)**: CRUD vendor, rincian paket, kontak PIC, harga, DP, dan integrasi bukti kontrak/pembayaran.
8. **Tamu Undangan (`/tamu`)**: CRUD daftar tamu, kelompok/pihak (Antariksa/Sofiya), RSVP, jumlah pax konfirmasi hadir, dan nomor meja.
9. **Dokumen Persyaratan (`/dokumen`)**: Tracking 34 dokumen KUA & sipil, checklist ketersediaan, berkas wajib/kondisional, dan lampiran berkas dari modul lain.
10. **Catatan Tindak Lanjut (`/catatan`)**: CRUD catatan ide, hasil musyawarah keluarga, topik pembahasan, dan indikator tanggal terlambat.
11. **Pengaturan Sistem (`/pengaturan`)**: Konfigurasi nama mempelai, tanggal acara, target dana, ekspor cadangan JSON, dan info sesi login.
12. **Autentikasi & Login (`/login`)**: Role-based access (Owner, Editor, Viewer) dengan proteksi session cookie HMAC-SHA256.

## Prasyarat
- Node.js 18+ (atau Node 20+)
- MySQL Server (lokal atau cloud/VPS)

## Konfigurasi Database (.env.local)
Salin `.env.example` ke `.env.local` dan sesuaikan koneksi database MySQL:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=wedding-plan
DB_SSL=false
WP_EDIT_PASSCODE=
WP_SESSION_SECRET=ganti-dengan-string-acak-panjang
```

## Inisialisasi & Seeding Data
1. Buat tabel database (`planner_documents` dan `planner_uploads`):
   ```bash
   npm run db:init
   ```
2. Isi data awal dari snapshot JSON (150 checklist, 82 tamu, 47 seserahan, dll):
   ```bash
   npm run db:seed
   ```

## Menjalankan Aplikasi
- **Development**:
  ```bash
  npm run dev
  ```
  Buka [http://localhost:3000](http://localhost:3000) di browser.
- **Build Produksi**:
  ```bash
  npm run build
  npm run start
  ```
- **Lint & Typecheck**:
  ```bash
  npm run lint
  ```
# -1-Wedding-Plan-Putri
