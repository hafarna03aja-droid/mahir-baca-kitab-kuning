
import React from 'react';
import { GroundingChunk } from '../types';

interface SourceLinkProps {
  chunk: GroundingChunk;
  index: number;
}

const SourceLink: React.FC<SourceLinkProps> = ({ chunk, index }) => {
  if (!chunk.web) return null;

  return (
    <a
      href={chunk.web.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center bg-stone-100 hover:bg-stone-200 p-2 rounded-lg transition-colors duration-200 text-sm"
    >
      <span className="bg-teal-600 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-xs mr-3">{index + 1}</span>
      <p className="text-teal-700 truncate hover:underline">{chunk.web.title || chunk.web.uri}</p>
    </a>
  );
};

export default SourceLink;
