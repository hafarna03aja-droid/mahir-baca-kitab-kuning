# ✅ Deployment Checklist

## Pre-Deployment

- [ ] ✅ Dependencies installed (`npm install`)
- [ ] ✅ Build test passed (`npm run build`)
- [ ] ✅ Environment variables template created (`.env.local`)
- [ ] ✅ Vercel configuration created (`vercel.json`)
- [ ] ✅ Git ignore updated untuk security
- [ ] ✅ Documentation updated (`README.md`, `DEPLOYMENT.md`)

## Vercel Setup Required

- [ ] 🔑 Gemini API Key siap (dapatkan dari [AI Studio](https://aistudio.google.com/app/apikey))
- [ ] 📁 Repository di-push ke GitHub
- [ ] 🌐 Akun Vercel siap

## Deploy Steps

### Via Vercel Dashboard (Recommended)
1. [ ] Login ke [vercel.com](https://vercel.com)
2. [ ] Click "New Project"
3. [ ] Import dari GitHub repository
4. [ ] Tambah Environment Variables:
   - [ ] `GEMINI_API_KEY` = your_api_key
   - [ ] `VITE_GEMINI_API_KEY` = your_api_key
5. [ ] Click "Deploy"

### Via CLI (Alternative)
1. [ ] Install Vercel CLI: `npm i -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Deploy: `vercel`
4. [ ] Set env vars: `vercel env add GEMINI_API_KEY`
5. [ ] Set env vars: `vercel env add VITE_GEMINI_API_KEY`
6. [ ] Redeploy: `vercel --prod`

## Post-Deployment Testing

- [ ] 🌐 Website accessible di URL Vercel
- [ ] 🤖 AI features working (chat, analysis, practice)
- [ ] 📱 Responsive design check
- [ ] ⚡ Performance check (loading times)
- [ ] 🔧 All modules functional

## Troubleshooting

Jika ada masalah:

1. **Build Errors**: Check build logs di Vercel dashboard
2. **API Errors**: Verify environment variables di Vercel settings
3. **Loading Issues**: Check network tab untuk failed requests
4. **500 Errors**: Check Function logs di Vercel dashboard

## Security Notes

- ✅ `.env.local` tidak di-commit ke Git
- ✅ API keys hanya di environment variables
- ✅ `.vercel` folder di-ignore
- ✅ Production sourcemaps disabled

## Performance Optimization

- ✅ Vite bundle optimization enabled
- ✅ Static assets akan di-cache oleh Vercel CDN
- ✅ Tree shaking untuk smaller bundle size
- ✅ Code splitting otomatis

## Next Steps After Deployment

1. [ ] Setup custom domain (opsional)
2. [ ] Setup monitoring/analytics
3. [ ] Configure error tracking
4. [ ] Setup automated deployments
5. [ ] Add SSL certificate (otomatis di Vercel)