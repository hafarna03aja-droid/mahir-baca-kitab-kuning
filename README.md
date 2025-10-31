<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Mahir Baca Kitab Kuning - AI Learning Assistant

Aplikasi pembelajaran interaktif untuk memahami teks-teks klasik Arab dengan bantuan AI.

View your app in AI Studio: https://ai.studio/apps/drive/17S_Zh8BvhGUIHR-wFNAzFbpnc1Gxoo6_

## Features

- 📖 **Text Analysis**: Analisis teks Arab dengan terjemahan dan penjelasan
- 🎯 **Reading Practice**: Latihan membaca dengan feedback AI
- 💬 **Chat Assistant**: Asisten AI untuk menjawab pertanyaan
- 📚 **Dictionary Context**: Kamus kontekstual untuk pemahaman yang lebih baik
- 📊 **Progress Dashboard**: Lacak perkembangan pembelajaran

## Run Locally

**Prerequisites:** Node.js 18+

1. Clone repository:
   ```bash
   git clone https://github.com/hafarna03aja-droid/mahir-baca-kitab-kuning.git
   cd mahir-baca-kitab-kuning
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set environment variables:
   - Copy `.env.local` template
   - Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

Lihat panduan lengkap di [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hafarna03aja-droid/mahir-baca-kitab-kuning)

**Jangan lupa set environment variables di Vercel dashboard!**

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **AI**: Google Gemini API
- **Deployment**: Vercel
- **Styling**: CSS Modules
