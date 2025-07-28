# Deposit BRI - Mobile Banking Application

Aplikasi mobile banking sederhana yang dibangun dengan **HTML, CSS, dan JavaScript murni** tanpa framework frontend. Menggunakan Flask sebagai backend dan Neon Database sebagai database online.

## 🚀 Keunggulan Database Online (Neon)

✅ **Online Database**: Data tersimpan di cloud Neon Database  
✅ **Multi-Access**: Bisa diakses dari berbagai lokasi/deployment  
✅ **Scalable**: Database PostgreSQL yang powerful  
✅ **Real-time**: Data sync real-time antar session  
✅ **Persistent**: Data aman tersimpan di server cloud  

## 📱 Fitur Aplikasi

### Login System
- **Username**: Siti Aminah
- **PIN**: 112233

### Dashboard BRImo Style
- Header gradien evening dengan logo BRI
- Kartu saldo terpisah (Tabungan & Deposito)
- Menu grid 4x2 dengan ikon bulat
- Search bar untuk mencari fitur
- Catatan keuangan dengan periode otomatis
- Bottom navigation dengan tombol QRIS di tengah

### Fitur Validasi
- Sistem validasi penarikan deposito (minimal 1.5% dari deposito harus ada di tabungan)
- Progress bar kelayakan tarik deposito
- Notifikasi real-time

### Admin Panel (Kode: 011090)
- Tambah saldo tabungan dan deposito
- Kirim notifikasi ke nasabah
- Kirim popup message
- Live chat real-time
- Kirim invoice dummy via email

## 🛠 Teknologi

**Frontend**: HTML5, CSS3, JavaScript (Vanilla)  
**Backend**: Flask (Python)  
**Database**: PostgreSQL (Neon Database Online)  
**Styling**: Bootstrap 5.3 + Custom CSS  
**Icons**: Font Awesome 6.0  

## 📦 Deployment

Aplikasi siap deploy dengan:
- Database Neon PostgreSQL online
- Memerlukan DATABASE_URL environment variable
- Auto-initialization data sample saat pertama kali run
- Data tersimpan persistent di cloud database

## 🎨 Design System

Menggunakan design language BRImo dengan:
- Gradien evening header (orange ke purple)
- Kartu biru untuk balance utama
- Ikon bulat dengan shadow untuk quick menu
- Bottom navigation dengan QRIS button di tengah
- Responsive design untuk mobile (max-width: 420px)

## 🔐 Keamanan

- Session-based authentication
- PIN protection
- Admin access dengan kode rahasia
- CORS enabled untuk API calls

---

**Note**: Aplikasi ini dibuat untuk simulasi dan pembelajaran. Jangan gunakan untuk transaksi finansial yang sesungguhnya.