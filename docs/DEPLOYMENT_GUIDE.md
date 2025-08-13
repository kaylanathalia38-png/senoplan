# 🚀 PANDUAN DEPLOYMENT SENOPLAN - STEP BY STEP

## 📋 OVERVIEW
Deployment Senoplan Betting Platform dengan real-time sync:
- **Admin Dashboard** → Netlify (admin-senoplan.netlify.app)
- **Player Dashboard** → Netlify (senoplan.netlify.app)  
- **Database** → Supabase Cloud (real-time sync)

---

## **STEP 1: PERSIAPAN AKUN (5 menit)**

### 1.1 Setup GitHub
- Buka [GitHub.com](https://github.com)
- Klik **"Sign up"** (jika belum ada) atau **"Sign in"**
- Verifikasi email jika diminta

### 1.2 Setup Netlify  
- Buka [Netlify.com](https://netlify.com)
- Klik **"Sign up"**
- **Pilih "Sign up with GitHub"** (recommended)
- Authorize Netlify untuk akses GitHub

### 1.3 Setup Supabase
- Buka [Supabase.com](https://supabase.com)
- Klik **"Start your project"**
- **Pilih "Sign up with GitHub"**
- Authorize Supabase untuk akses

---

## **STEP 2: SETUP SUPABASE DATABASE (10 menit)**

### 2.1 Create New Project
- Di dashboard Supabase, klik **"New Project"**
- Organization: **Personal** (default)
- Project name: **"senoplan"**
- Database password: **CATAT PASSWORD INI!** (contoh: `SenoAdmin123!`)
- Region: **Southeast Asia (Singapore)**
- Klik **"Create new project"**
- **Tunggu ~2 menit** setup selesai

### 2.2 Copy API Keys (SANGAT PENTING!)
- Klik **"Settings"** → **"API"**
- **Copy & simpan di notepad:**
```
Project URL: https://xxx.supabase.co
Anon public key: eyJxxx...
Service role key: eyJxxx...
```

### 2.3 Import Database Schema
Di Supabase SQL Editor, jalankan 3 file SQL dalam urutan ini:

**1. schema.sql:**
- Klik **"SQL Editor"** → **"New query"**
- Copy-paste isi file `database/schema.sql`
- Klik **"Run"** (tunggu sampai selesai)

**2. sample_data.sql:**
- **"New query"** lagi
- Copy-paste isi file `database/sample_data.sql`
- Klik **"Run"**

**3. rls_policies.sql:**
- **"New query"** lagi
- Copy-paste isi file `database/rls_policies.sql`
- Klik **"Run"**

### 2.4 Setup Authentication
- Klik **"Authentication"** → **"Settings"**
- **Enable email confirmations**: OFF (untuk testing)
- Save configuration

---

## **STEP 3: UPLOAD KE GITHUB (5 menit)**

### 3.1 Create Repository
- Di GitHub, klik tombol hijau **"New"**
- Repository name: **"senoplan"**
- Description: **"Senoplan Betting Platform - Real-time Admin & Player Dashboard"**
- Pilih **Public** (recommended)
- **JANGAN centang** "Initialize with README"
- Klik **"Create repository"**

### 3.2 Upload Files
- Extract folder `senoplan-github` yang sudah disiapkan
- Di halaman GitHub repository yang baru:
- Klik **"uploading an existing file"**
- Drag & drop **SEMUA folder** (admin-dashboard/, player-dashboard/, database/, docs/)
- Commit message: **"Initial deployment setup"**
- Klik **"Commit changes"**

### 3.3 Verify Upload
- Refresh halaman GitHub
- Pastikan ada folder: `admin-dashboard/`, `player-dashboard/`, `database/`
- Klik masuk ke setiap folder, pastikan file lengkap

---

## **STEP 4: DEPLOY ADMIN DASHBOARD (8 menit)**

### 4.1 Create New Site di Netlify
- Di Netlify dashboard, klik **"Add new site"**
- Pilih **"Import an existing project"**
- Pilih **"Deploy with GitHub"**
- Pilih repository **"senoplan"**

### 4.2 Configure Build Settings
- **Base directory**: `admin-dashboard`
- **Build command**: `npm run build`
- **Publish directory**: `admin-dashboard/dist`
- Klik **"Deploy site"**

### 4.3 Setup Environment Variables
- Tunggu deploy selesai (2-3 menit)
- Klik **"Site settings"** → **"Environment variables"**
- Add variables:
```
VITE_SUPABASE_URL = [URL dari step 2.2]
VITE_SUPABASE_ANON_KEY = [Anon key dari step 2.2]
VITE_SUPABASE_SERVICE_ROLE_KEY = [Service key dari step 2.2]
```

### 4.4 Redeploy & Test
- Klik **"Deploys"** → **"Trigger deploy"**
- Tunggu selesai, klik URL site
- **Test login**: ID = `1111`, Password = `anakrumahan123`

---

## **STEP 5: DEPLOY PLAYER DASHBOARD (8 menit)**

### 5.1 Create Second Site
- Kembali ke Netlify dashboard
- Klik **"Add new site"** lagi
- **"Import an existing project"** → GitHub → **"senoplan"**

### 5.2 Configure Build Settings
- **Base directory**: `player-dashboard`
- **Build command**: `npm run build`
- **Publish directory**: `player-dashboard/dist`
- Klik **"Deploy site"**

### 5.3 Setup Environment Variables
- Sama seperti step 4.3, tapi **TANPA SERVICE_ROLE_KEY**:
```
VITE_SUPABASE_URL = [URL dari step 2.2]
VITE_SUPABASE_ANON_KEY = [Anon key dari step 2.2]
```

### 5.4 Test Player Dashboard
- Klik URL site yang baru
- Test register user baru
- Test login dengan user yang dibuat

---

## **STEP 6: TESTING REAL-TIME SYNC (5 menit)**

### 6.1 Buka Kedua Dashboard
- **Tab 1**: Admin dashboard (login: 1111/anakrumahan123)
- **Tab 2**: Player dashboard (register/login sebagai player)

### 6.2 Test Real-time Features
- Di player: register user baru → cek muncul di admin
- Di admin: start timer → cek countdown di player
- Di player: place bet → cek muncul di admin
- Di admin: broadcast message → cek muncul di player

### 6.3 Verify Multi-user
- Buka tab ketiga: player dashboard (incognito)
- Register user kedua
- Pastikan data user 1 ≠ data user 2
- Pastikan admin bisa lihat kedua user

---

## 🚨 TROUBLESHOOTING

### Build Error di Netlify:
- Check environment variables spelling
- Pastikan semua `VITE_` prefix benar
- Clear cache: Netlify → Deploys → Clear cache and retry

### Database Error:
- Check Supabase project masih aktif
- Verify API keys masih valid
- Check RLS policies di Supabase → Authentication

### Real-time Tidak Sync:
- Check network connection
- Verify Supabase realtime enabled
- Check browser console untuk error

---

## 📋 CHECKLIST FINAL

- [ ] Supabase project created & configured
- [ ] GitHub repository uploaded
- [ ] Admin dashboard deployed & tested
- [ ] Player dashboard deployed & tested  
- [ ] Real-time sync working
- [ ] Multi-user sessions working
- [ ] Admin login: 1111/anakrumahan123 ✓
- [ ] Player registration/login ✓
- [ ] Timer synchronization ✓
- [ ] Betting system ✓

## 🎯 EXISTING UI PRESERVED

- **Player**: ID 4022, Saldo 990K, betting grid 0-9
- **Admin**: Login 1111/anakrumahan123, existing admin panel
- **Same colors, layouts, interactions**

---

**🎉 SELAMAT! Senoplan Betting Platform sudah live dengan real-time sync!**
