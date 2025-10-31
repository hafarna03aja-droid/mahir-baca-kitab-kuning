
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './modules/Dashboard';
import TextAnalysis from './modules/TextAnalysis';
import ChatAssistant from './modules/ChatAssistant';
import ReadingPractice from './modules/ReadingPractice';
import DictionaryContext from './modules/DictionaryContext';
import { Module } from './types';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard setActiveModule={setActiveModule} />;
      case 'text-analysis':
        return <TextAnalysis />;
      case 'chat-assistant':
        return <ChatAssistant />;
      case 'reading-practice':
        return <ReadingPractice />;
      case 'dictionary-context':
        return <DictionaryContext />;
      default:
        return <Dashboard setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="flex h-screen bg-stone-100 font-sans">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderModule()}
        </main>
        <footer className="text-center p-3 bg-stone-200 text-stone-500 text-xs border-t border-stone-300">
          © 24 Learning Centre
        </footer>
      </div>
    </div>
  );
};

export default App;