import React from 'react';
import { Module } from '../types';
import ModuleCard from '../components/ModuleCard';

interface DashboardProps {
  setActiveModule: (module: Module) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveModule }) => {
  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <header className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-bold text-teal-900">Selamat Datang di Mahir Kitab Kuning</h2>
        <p className="text-lg text-stone-600 mt-2">Pusat belajar Anda untuk menguasai teks Arab klasik dengan bantuan AI.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModuleCard
          icon="fa-file-pen"
          title="Analisis Teks"
          description="Tempel teks Arab untuk mendapatkan terjemahan, analisis gramatikal (i'rab), dan penjelasan mendalam."
          module="text-analysis"
          onClick={setActiveModule}
        />
        <ModuleCard
          icon="fa-microphone-lines"
          title="Latihan Qira'ah"
          description="Latih bacaan Anda. Ucapkan sebuah teks dan dapatkan transkripsi real-time untuk memeriksa akurasi."
          module="reading-practice"
          onClick={setActiveModule}
        />
        <ModuleCard
          icon="fa-robot"
          title="Asisten Virtual"
          description="Tanyakan apa saja tentang tata bahasa Arab, sejarah, atau isi kitab kuning kepada asisten AI kami."
          module="chat-assistant"
          onClick={setActiveModule}
        />
        <ModuleCard
          icon="fa-search"
          title="Kamus & Konteks"
          description="Cari istilah, tokoh, atau konsep. Dapatkan jawaban akurat yang didukung oleh sumber web terkini."
          module="dictionary-context"
          onClick={setActiveModule}
        />
      </div>
    </div>
  );
};

export default Dashboard;