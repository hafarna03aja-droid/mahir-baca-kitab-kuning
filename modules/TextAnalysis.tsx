import React, { useState, useRef } from 'react';
import { analyzeTextSimple, analyzeTextDeep, generateSpeech } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

// --- Audio Helper Functions for raw PCM data ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const TextAnalysis: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('Fiqh');
  const [customTopic, setCustomTopic] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);

  const topics = ['Fiqh', 'Aqidah', 'Tarikh Islam', 'Tafsir Al-Quran', 'Hadith', 'Tasawwuf'];

  const handleGenerateParagraph = async () => {
    const topicForPrompt = selectedTopic === 'custom' ? customTopic : selectedTopic;
    if (!topicForPrompt.trim()) {
      alert("Silakan pilih atau masukkan topik terlebih dahulu.");
      return;
    }

    setIsGeneratingTopic(true);
    setText('');
    const prompt = `Generate a short, intermediate-level Arabic paragraph about the topic of ${topicForPrompt}. The paragraph should be suitable for language learning and analysis, consisting of 3-4 sentences. Do not provide any translation or explanation, only the Arabic text.`;
    
    const response = await analyzeTextSimple(prompt); 
    
    setText(response);
    setIsGeneratingTopic(false);
  };

  const handleAnalyze = async (analysisType: 'translate' | 'grammar' | 'summarize') => {
    if (!text.trim()) {
      setResult("Silakan masukkan teks Arab terlebih dahulu atau buat paragraf latihan.");
      return;
    }
    setIsLoading(true);
    setResult('');
    
    let prompt = '';
    switch(analysisType) {
        case 'translate':
            prompt = `Translate the following Arabic text to Indonesian:\n\n${text}`;
            break;
        case 'grammar':
            prompt = `Lakukan analisis I'rab (tata bahasa Arab) yang sangat mendetail dan bergaya tradisional seperti di pesantren untuk teks berikut. Gunakan terminologi nahwu yang umum (misalnya, lafadz, kalimah, mabni, mu'rab, marfu', manshub, majrur) dan jelaskan dalam Bahasa Indonesia dengan format Markdown yang jelas.

Teks untuk dianalisis:
${text}

Struktur output yang WAJIB diikuti:

## 1. I'rab Lafdzy / Tafsili (Analisis per Kata)
Uraikan setiap kata (lafadz) satu per satu secara berurutan. Untuk setiap kata, berikan analisis dengan format sebagai berikut:

- **Lafadz [Kata Arabnya]:**
  - **Jenis Kalimah:** Isim / Fi'il / Harf.
  - **I'rab:** Mu'rab atau Mabni.
    - Jika Mu'rab, sebutkan keadaannya (Marfu'/Manshub/Majrur/Majzum).
    - Jika Mabni, sebutkan keadaannya (Mabni 'ala Fath/Dhamm/Kasr/Sukun).
  - **'Alamah (Tanda I'rab):** Sebutkan tandanya (misalnya: "Dhammah Zhahirah", "Fathah Muqaddarah", "Alif karena Isim Tatsniyah", "Membuang Nun").
  - **Kedudukan (Mahallul I'rab):** Jelaskan posisinya dalam kalimat (misalah: "Mubtada", "Fa'il", "Maf'ul Bih", "Mudhaf Ilaih", "Fi'il Madhi").
  - **Keterangan Tambahan:** Jika ada, jelaskan (misalnya: "Fa'ilnya berupa dhamir mustatir takdirnya هو").

**Contoh Format untuk satu kata:**
- **Lafadz الْحَمْدُ:**
  - **Jenis Kalimah:** Isim Mufrad.
  - **I'rab:** Mu'rab, Marfu'.
  - **'Alamah (Tanda I'rab):** Dhammah Zhahirah (dhammah yang tampak di akhir).
  - **Kedudukan (Mahallul I'rab):** Mubtada'.

## 2. I'rab Jaliy / Ijmali (Analisis per Kalimat)
Setelah analisis per kata, identifikasi setiap jumlah (kalimat) dalam teks.
- Tentukan jenisnya (Jumlah Ismiyyah atau Jumlah Fi'liyyah).
- Jelaskan kedudukan i'rab dari keseluruhan jumlah tersebut jika ada (misalnya: "Jumlah Fi'liyyah menempati posisi rafa' sebagai Khabar dari Mubtada'").

Pastikan penjelasan akurat, sistematis, dan mudah dipahami seolah-olah sedang mengajar santri.`;
            break;
        case 'summarize':
            prompt = `Summarize the key points of the following Arabic text in Indonesian. Use a Markdown bulleted list for clarity.\n\n${text}`;
            break;
    }

    const analysisFunction = isThinkingMode ? analyzeTextDeep : analyzeTextSimple;
    const response = await analysisFunction(prompt);
    
    setResult(response);
    setIsLoading(false);
  };

  const handleListen = async () => {
    if (!text.trim() || isSpeaking) return;

    setIsSpeaking(true);
    
    if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
    }
    
    const audioData = await generateSpeech(text);

    if (audioData) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = ctx;

        const decodedBytes = decode(audioData);
        const audioBuffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
            setIsSpeaking(false);
            if(ctx.state !== 'closed') {
               ctx.close().catch(console.error);
            }
        };
        source.start();

      } catch (error) {
        console.error("Error playing audio:", error);
        alert("Gagal memutar audio.");
        setIsSpeaking(false);
      }
    } else {
      alert("Gagal menghasilkan data audio.");
      setIsSpeaking(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!result || isLoading) return;

    const cleanText = result
      .replace(/^## (.*$)/gim, '$1\n==============================\n')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/<[^>]*>/g, '');

    const blob = new Blob([cleanText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analisis-teks.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDoc = () => {
    if (!result || isLoading) return;

    // Convert the result text (with simple markdown) to HTML
    const contentHtml = result
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');

    // Create the full HTML document structure for Word
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Analisis Teks</title>
        </head>
        <body>
          ${contentHtml}
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analisis-teks.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-teal-900">Analisis Teks</h2>
        <p className="text-lg text-stone-600 mt-1">Dapatkan pemahaman mendalam dari teks Arab dengan kekuatan AI.</p>
      </header>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col h-full">
           <div className="mb-4 p-4 bg-white border border-stone-200 rounded-lg flex flex-col sm:flex-row sm:items-end gap-4 shadow-sm">
            <div className="w-full flex-grow flex flex-col sm:flex-row gap-4">
                <div className="flex-grow w-full sm:w-auto">
                    <label htmlFor="topic-select" className="block text-sm font-bold text-stone-700 mb-1">Topik Latihan</label>
                    <select 
                        id="topic-select"
                        className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-teal-500 transition"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        disabled={isGeneratingTopic}
                    >
                        {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                        <option value="custom">Kustom...</option>
                    </select>
                </div>
                
                {selectedTopic === 'custom' && (
                  <div className="flex-grow w-full sm:w-auto animate-fade-in">
                    <label htmlFor="custom-topic-input" className="block text-sm font-bold text-stone-700 mb-1">
                      Masukkan Topik Kustom
                    </label>
                    <input
                      id="custom-topic-input"
                      type="text"
                      className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-teal-500 transition"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Contoh: Ilmu Faraid"
                      disabled={isGeneratingTopic}
                      autoFocus
                    />
                  </div>
                )}
            </div>
            <button 
              onClick={handleGenerateParagraph}
              disabled={isGeneratingTopic || (selectedTopic === 'custom' && !customTopic.trim())}
              className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-stone-400 transition-colors flex items-center justify-center"
            >
              {isGeneratingTopic 
                ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Membuat...</>
                : <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Buat Paragraf</>
              }
            </button>
          </div>
          <textarea
            dir="rtl"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="...اكتب النص العربي هنا أو buat paragraf latihan di atas"
            className="w-full flex-grow p-4 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-right text-xl leading-loose font-serif bg-white"
          />
        </div>
        
        <div id="analysis-result-panel" className="bg-white p-6 rounded-lg shadow-inner flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-200">
                <h3 className="text-xl font-bold text-teal-800">Hasil Analisis</h3>
                <div className="flex gap-2 no-print">
                   <button
                        onClick={handleDownloadTxt}
                        disabled={!result || isLoading}
                        className="px-3 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 disabled:bg-stone-400 transition-colors flex items-center text-sm"
                        title="Unduh Hasil Analisis sebagai Teks"
                    >
                        <i className="fa-solid fa-file-lines mr-2"></i>
                        .txt
                    </button>
                    <button
                        onClick={handleDownloadDoc}
                        disabled={!result || isLoading}
                        className="px-3 py-2 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 disabled:bg-stone-400 transition-colors flex items-center text-sm"
                        title="Unduh Hasil Analisis sebagai DOC"
                    >
                        <i className="fa-solid fa-file-word mr-2"></i>
                        .doc
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div
                      className="prose max-w-none text-stone-700"
                      dangerouslySetInnerHTML={{
                        __html: result
                          ? result
                              .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\n/g, '<br />')
                          : '<span class="text-stone-500">Hasil analisis akan muncul di sini.</span>'
                      }}
                    />
                )}
            </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-stone-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <label htmlFor="thinking-mode" className="flex items-center cursor-pointer">
              <div className="relative">
                <input id="thinking-mode" type="checkbox" className="sr-only" checked={isThinkingMode} onChange={() => setIsThinkingMode(!isThinkingMode)} />
                <div className="block bg-stone-400 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isThinkingMode ? 'transform translate-x-6 bg-teal-600' : ''}`}></div>
              </div>
              <div className="ml-3 text-stone-700">
                <span className="font-bold">Mode Berpikir (Analisis Mendalam)</span>
                <p className="text-sm">Gunakan model AI tercanggih untuk hasil yang lebih kompleks dan akurat.</p>
              </div>
            </label>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
             <button 
                onClick={handleListen}
                disabled={isLoading || isGeneratingTopic || !text.trim() || isSpeaking}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-stone-400 transition-colors flex items-center"
              >
                <i className={`fa-solid ${isSpeaking ? 'fa-spinner fa-spin' : 'fa-volume-high'} mr-2`}></i>
                {isSpeaking ? 'Memutar...' : 'Dengarkan Teks'}
            </button>
            <button onClick={() => handleAnalyze('grammar')} disabled={isLoading || isGeneratingTopic || !text.trim()} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-stone-400 transition-colors">
                <i className="fa-solid fa-sitemap mr-2"></i>Analisis I'rab
            </button>
            <button onClick={() => handleAnalyze('translate')} disabled={isLoading || isGeneratingTopic || !text.trim()} className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 disabled:bg-stone-400 transition-colors">
                <i className="fa-solid fa-language mr-2"></i>Terjemahkan
            </button>
             <button onClick={() => handleAnalyze('summarize')} disabled={isLoading || isGeneratingTopic || !text.trim()} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-stone-400 transition-colors">
                <i className="fa-solid fa-align-left mr-2"></i>Ringkas
            </button>
          </div>
      </div>
    </div>
  );
};

export default TextAnalysis;