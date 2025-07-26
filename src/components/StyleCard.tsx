import React from 'react';
import type { StyleCore } from '../types';
import { CELESTIAL_NEON_BLUE_LIGHT } from '../constants';

interface StyleCardProps {
  styleCore: StyleCore;
  isActive: boolean;
  isSuggested: boolean;
  onClick: (id: string) => void;
}

const StyleCard: React.FC<StyleCardProps> = ({ styleCore, isActive, isSuggested, onClick }) => {
  const activeClasses = 'border-blue-500 shadow-lg shadow-blue-500/30';
  
  return (
    <div
      onClick={() => onClick(styleCore.id)}
      className={`bg-gray-800 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl ${
        isActive ? activeClasses : 'border-gray-700 hover:border-blue-600'
      } ${isSuggested && !isActive ? 'animate-pulse-glow' : ''}`}
      style={{
        boxShadow: isActive ? `0 0 15px ${CELESTIAL_NEON_BLUE_LIGHT}` : 'none'
      }}
    >
      <img src={styleCore.thumbnail} alt={styleCore.name} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg text-white">{styleCore.name}</h3>
        <p className="text-sm text-gray-400 mt-1 h-10">{styleCore.description}</p>
      </div>
    </div>
  );
};

export default StyleCard;
