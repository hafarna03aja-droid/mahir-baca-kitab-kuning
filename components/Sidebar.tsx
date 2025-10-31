
import React from 'react';
import { Module } from '../types';

interface SidebarProps {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

const NavItem: React.FC<{
  module: Module;
  icon: string;
  label: string;
  activeModule: Module;
  setActiveModule: (module: Module) => void;
  isCollapsed: boolean;
}> = ({ module, icon, label, activeModule, setActiveModule, isCollapsed }) => {
  const isActive = activeModule === module;
  return (
    <button
      onClick={() => setActiveModule(module)}
      className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${
        isActive
          ? 'bg-teal-700 text-white'
          : 'text-stone-300 hover:bg-teal-800 hover:text-white'
      }`}
      title={label}
    >
      <i className={`fa-solid ${icon} w-6 text-center text-lg`}></i>
      <span className={`ml-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className={`flex flex-col bg-teal-900 text-white transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center justify-between p-4 h-16 border-b border-teal-800 ${isCollapsed ? 'justify-center' : ''}`}>
         <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <i className="fa-solid fa-book-quran text-2xl text-amber-300"></i>
          {!isCollapsed && <h1 className="ml-3 text-xl font-bold">Mahir Kitab</h1>}
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="md:hidden p-2 -mr-2">
            <i className={`fa-solid ${isCollapsed ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavItem module="dashboard" icon="fa-table-columns" label="Dashboard" {...{ activeModule, setActiveModule, isCollapsed }} />
        <NavItem module="text-analysis" icon="fa-file-pen" label="Analisis Teks" {...{ activeModule, setActiveModule, isCollapsed }} />
        <NavItem module="reading-practice" icon="fa-microphone-lines" label="Latihan Qira'ah" {...{ activeModule, setActiveModule, isCollapsed }} />
        <NavItem module="chat-assistant" icon="fa-robot" label="Asisten Virtual" {...{ activeModule, setActiveModule, isCollapsed }} />
        <NavItem module="dictionary-context" icon="fa-search" label="Kamus & Konteks" {...{ activeModule, setActiveModule, isCollapsed }} />
      </div>
       <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex items-center justify-center p-4 h-16 border-t border-teal-800 hover:bg-teal-800 transition-colors">
         <i className={`fa-solid ${isCollapsed ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
      </button>
    </nav>
  );
};

export default Sidebar;
