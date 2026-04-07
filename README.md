# CodeKu 🚀

Platform simpan & bagikan snippet kode untuk developer — dibangun dengan Next.js, Firebase, dan Anime.js.

## ✨ Fitur Utama

- 🔐 **Autentikasi** — Register/Login dengan Firebase Auth
- 🔗 **URL Terenkripsi** — Link seperti `/code/kanuquwgsugsywhgwyagusgs` (AES-256)
- 🌙 **Dark/Light Mode** — Toggle tema dengan animasi
- 📦 **CRUD Kode** — Buat, edit, hapus, lihat kode
- 🔒 **Public & Private** — Atur visibilitas kode
- 📝 **Version Control** — Setiap edit = commit dengan pesan
- 🎨 **Syntax Highlighting** — 15+ bahasa via CodeMirror 6
- 🔍 **Explore** — Halaman publik untuk semua kode
- 👑 **Admin Panel** — Monitor users, kode, data terenkripsi
- 🛡️ **Keamanan Tinggi** — Anti-devtools, rate limiting, enkripsi E2E
- 📱 **Responsive** — Mobile-friendly

## 🚀 Deploy ke Vercel

### 1. Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Buat project baru
3. Enable **Authentication** → Email/Password
4. Buat **Firestore Database** (production mode)
5. Salin konfigurasi dari Project Settings → Web App

### 2. Konfigurasi Environment Variables

Di Vercel, tambahkan environment variables berikut:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_ENCRYPT_KEY=your-random-secret-min-32-chars
```

### 3. Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# Paste isi firestore.rules
firebase deploy --only firestore:rules
```

### 4. Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Atau connect repo GitHub ke Vercel untuk auto-deploy.

### 5. Setup Admin Account

1. Register akun pertama via web
2. Buka Firebase Console → Firestore → `users` collection
3. Temukan dokumen dengan UID Anda
4. Ubah field `role` dari `"user"` menjadi `"admin"`
5. Sekarang Anda bisa akses `/admin`

## 🏗️ Struktur Proyek

```
src/
├── components/
│   ├── Navbar.tsx          # Navbar dengan menu user
│   ├── AuthModal.tsx       # Modal login/register
│   ├── SettingsModal.tsx   # Modal pengaturan lengkap
│   ├── CodeCard.tsx        # Card preview kode
│   ├── CodeEditor.tsx      # Editor CodeMirror 6
│   └── Layout.tsx          # Layout wrapper
├── lib/
│   ├── firebase.ts         # Firebase init
│   ├── firestore.ts        # Semua operasi database
│   ├── AuthContext.tsx     # Auth state management
│   ├── ThemeContext.tsx    # Theme state
│   └── crypto.ts           # Enkripsi URL & data
├── pages/
│   ├── index.tsx           # Home page
│   ├── explore.tsx         # Explore kode publik
│   ├── dashboard.tsx       # Dashboard user
│   ├── dashboard/
│   │   ├── new.tsx         # Tambah kode baru
│   │   └── edit/[id].tsx   # Edit kode
│   ├── code/[id].tsx       # Viewer kode (URL enkripsi)
│   ├── admin/index.tsx     # Panel admin
│   └── 404.tsx
└── styles/
    └── globals.css         # Style global + grid theme
```

## 🔐 Sistem Enkripsi URL

URL kode dienkripsi menggunakan AES-256:

```
Real ID:     abc123def456
Encrypted:   kanuquwgsugsywhgwyagusgs
Final URL:   /code/kanuquwgsugsywhgwyagusgs
```

Enkripsi menggunakan `NEXT_PUBLIC_ENCRYPT_KEY` — **jangan ubah setelah deploy** karena akan merusak URL yang sudah ada!

## 🛡️ Keamanan

- ✅ Rate limiting pada login (5x/menit) dan register (3x/5 menit)
- ✅ Password di-hash Firebase Auth (bcrypt)
- ✅ Data sensitif admin dienkripsi AES-256
- ✅ Anti-devtools di production
- ✅ Firestore Security Rules ketat
- ✅ CSP headers via Next.js
- ✅ HTTPS enforced via Vercel

## 📦 Tech Stack

| Tool | Kegunaan |
|------|----------|
| Next.js 14 | Framework React |
| Firebase | Auth + Database |
| CodeMirror 6 | Code editor |
| Anime.js | Animasi |
| Tailwind CSS | Styling |
| CryptoJS | Enkripsi URL |
| Lucide React | Icons |

## 🐛 Troubleshooting

**Kode tidak bisa diakses setelah deploy**
→ Pastikan `NEXT_PUBLIC_ENCRYPT_KEY` sama di semua environment

**Firebase permission denied**
→ Deploy ulang Firestore rules dengan `firebase deploy --only firestore:rules`

**Build error TypeScript**
→ Jalankan `npm install` ulang, pastikan semua dependencies terinstall
