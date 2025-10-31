
import React from 'react';
import { Module } from '../types';

interface ModuleCardProps {
  icon: string;
  title: string;
  description: string;
  module: Module;
  onClick: (module: Module) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ icon, title, description, module, onClick }) => {
  return (
    <button
      onClick={() => onClick(module)}
      className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start h-full"
    >
      <div className="bg-teal-100 text-teal-700 rounded-full p-3 mb-4">
        <i className={`fa-solid ${icon} text-2xl w-8 h-8 flex items-center justify-center`}></i>
      </div>
      <h3 className="text-xl font-bold text-teal-800 mb-2">{title}</h3>
      <p className="text-stone-600 flex-grow">{description}</p>
    </button>
  );
};

export default ModuleCard;
