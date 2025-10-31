import React, { useState } from 'react';
import { generateGroundedResponse } from '../services/geminiService';
import { GroundingChunk } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import SourceLink from '../components/SourceLink';

const DictionaryContext: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; sources: GroundingChunk[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);
    const prompt = `Provide a detailed explanation for the term/concept "${query}" in the context of Islamic studies and Kitab Kuning. Format the output clearly in Indonesian using Markdown. Use headings for sections (e.g., ## Definisi), bold for key terms (e.g., **Istilah Penting**), and bullet points for examples or key points.`;
    const response = await generateGroundedResponse(prompt);
    setResult(response);
    setIsLoading(false);
  };

  const renderMarkdown = (markdownText: string) => {
    if (!markdownText) return "";
    
    let html = markdownText
      .replace(/^## (.*$)/gim, '<h3 class="text-xl font-bold text-teal-800 mt-5 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-teal-700">$1</strong>')
      .replace(/^\* (.*$)/gim, '<div class="flex items-start pl-2 my-1"><span class="text-teal-500 font-bold mr-3 mt-1">&#8226;</span><p class="flex-1">$1</p></div>')
      .replace(/\n/g, '<br />');

    // Cleanup extra breaks before styled elements
    html = html.replace(/<br \/>(<h3|<div)/g, '$1');
    html = html.replace(/(<\/div>)<br \/>/g, '$1');

    return html;
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-teal-900">Kamus & Konteks</h2>
        <p className="text-lg text-stone-600 mt-1">Cari istilah, tokoh, atau konsep dan dapatkan jawaban yang didukung oleh web.</p>
      </header>

      <div className="w-full max-w-2xl mx-auto mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: 'Imam Syafi'i' atau 'Qiyas'..."
            className="w-full p-3 border-none focus:ring-0 text-lg bg-transparent"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-stone-400 transition-colors"
          >
             <i className="fa-solid fa-search"></i>
          </button>
        </form>
      </div>

      <div className="flex-grow bg-white p-6 rounded-lg shadow-inner overflow-y-auto">
        {isLoading && <LoadingSpinner />}
        {!isLoading && !result && (
          <div className="flex flex-col items-center justify-center h-full text-center text-stone-500">
            <i className="fa-solid fa-book-open text-5xl mb-4"></i>
            <p>Hasil pencarian akan ditampilkan di sini.</p>
          </div>
        )}
        {result && (
          <div>
            <div 
              className="text-stone-800" 
              dangerouslySetInnerHTML={{ __html: renderMarkdown(result.text) }} 
            />

            {result.sources && result.sources.length > 0 && (
              <div className="mt-8 pt-4 border-t">
                <h4 className="font-bold text-teal-800 mb-3">Sumber:</h4>
                <div className="space-y-2">
                  {result.sources.map((chunk, index) => (
                    <SourceLink key={index} chunk={chunk} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DictionaryContext;