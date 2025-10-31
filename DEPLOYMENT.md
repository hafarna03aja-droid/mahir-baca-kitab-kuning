# Deployment Guide untuk Vercel

## Prerequisites

1. **Akun Vercel**: Pastikan Anda memiliki akun di [vercel.com](https://vercel.com)
2. **GitHub Repository**: Pastikan kode sudah di-push ke GitHub
3. **Gemini API Key**: Dapatkan dari [AI Studio](https://aistudio.google.com/app/apikey)

## Langkah-langkah Deployment

### 1. Persiapkan Environment Variables

Buat file `.env.local` di root project (sudah dibuat) dengan:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**⚠️ PENTING**: Jangan commit file `.env.local` ke GitHub!

### 2. Deploy ke Vercel

#### Opsi A: Via Vercel Dashboard (Recommended)

1. Login ke [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import repository GitHub Anda
4. Vercel akan otomatis mendeteksi ini sebagai Vite project
5. Di bagian "Environment Variables", tambahkan:
   - `GEMINI_API_KEY` = your_actual_api_key
   - `VITE_GEMINI_API_KEY` = your_actual_api_key
6. Click "Deploy"

#### Opsi B: Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables:
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add VITE_GEMINI_API_KEY
   ```

5. Redeploy untuk apply environment variables:
   ```bash
   vercel --prod
   ```

### 3. Konfigurasi Domain (Opsional)

1. Di Vercel dashboard, masuk ke project Anda
2. Pilih tab "Settings" > "Domains"
3. Tambahkan custom domain jika diperlukan

## Troubleshooting

### Masalah Environment Variables

Jika API tidak bekerja setelah deploy:

1. Pastikan environment variables sudah di-set di Vercel dashboard
2. Check di Vercel dashboard > Settings > Environment Variables
3. Pastikan tidak ada typo di nama environment variables
4. Redeploy setelah menambah/update environment variables

### Build Errors

Jika ada error saat build:

1. Test build secara lokal terlebih dahulu:
   ```bash
   npm run build
   ```

2. Pastikan semua dependencies terinstall dengan benar
3. Check console Vercel untuk error messages yang detail

### Performance Issues

1. Vercel secara otomatis mengoptimalkan build
2. File static akan di-cache oleh CDN Vercel
3. API calls akan di-optimize secara otomatis

## File Konfigurasi yang Dibuat

- `vercel.json` - Konfigurasi deployment Vercel
- `.env.local` - Template environment variables
- `.gitignore` - Updated untuk ignore file sensitive

## Tips Keamanan

1. **Jangan pernah** commit API keys ke repository
2. Gunakan environment variables untuk semua secrets
3. Regularly rotate API keys untuk keamanan
4. Monitor usage di Google AI Studio dashboard