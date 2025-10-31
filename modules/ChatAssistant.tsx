import React, { useState, useRef, useEffect } from 'react';
import { getChatStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GenerateContentResponse } from '@google/genai';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const renderMarkdown = (markdownText: string) => {
    if (!markdownText) return "";

    let html = markdownText
      .replace(/```([\s\S]*?)```/g, (_, code) => {
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre class="bg-stone-800 text-white p-3 rounded-md my-2 text-sm overflow-x-auto"><code>${escapedCode.trim()}</code></pre>`;
      })
      .replace(/^## (.*$)/gim, '<h3 class="text-xl font-bold text-teal-800 mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-teal-700">$1</strong>')
      .replace(/^\* (.*$)/gim, '<div class="flex items-start pl-2 my-1"><span class="text-teal-500 font-bold mr-3 mt-1">&#8226;</span><p class="flex-1">$1</p></div>')
      .replace(/\n/g, '<br />');

    html = html.replace(/<br \/>(<h3|<div|<pre)/g, '$1');
    html = html.replace(/(<\/div>|<\/pre>)<br \/>/g, '$1');

    return html;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await getChatStream(input);
      let modelResponse = '';
      setMessages((prev) => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        modelResponse += chunkText;
        setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = modelResponse;
            return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { role: 'model', text: "Maaf, terjadi kesalahan. Coba lagi nanti." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg animate-fade-in">
      <header className="p-4 border-b">
        <h2 className="text-2xl font-bold text-teal-900">Asisten Virtual</h2>
        <p className="text-stone-600">Tanyakan apapun seputar studi Islam dan kitab kuning.</p>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto bg-stone-50">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl p-3 rounded-xl shadow ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-stone-200 text-stone-800'}`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                  />
                )}
              </div>
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
            <div className="flex justify-start">
              <div className="max-w-lg p-3 rounded-xl shadow bg-stone-200 text-stone-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-stone-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-stone-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-stone-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pertanyaan Anda..."
            className="flex-1 p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-stone-400 transition-colors"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant;