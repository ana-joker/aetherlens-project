import React from 'react';
import { LightbulbIcon } from './Icon';

interface InspirationPrompt {
  title: string;
  prompt: string;
}

interface InspirationGalleryProps {
  prompts: InspirationPrompt[];
  onSelectPrompt: (prompt: string) => void;
}

const InspirationGallery: React.FC<InspirationGalleryProps> = ({ prompts, onSelectPrompt }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
      <h3 className="flex items-center text-lg font-bold text-white tracking-wider mb-3">
        <LightbulbIcon className="w-6 h-6 mr-2 text-yellow-300" />
        Inspiration Gallery
      </h3>
      <div className="space-y-3 max-h-[calc(80vh - 400px)] overflow-y-auto pr-2">
        {prompts.length > 0 ? (
          prompts.map((item, index) => (
            <div 
              key={index} 
              className="bg-gray-800 p-3 rounded-md border border-gray-700 group hover:border-blue-600 transition-all duration-200 cursor-pointer hover:bg-gray-700/50 transform hover:-translate-y-0.5" 
              onClick={() => onSelectPrompt(item.prompt)}
              title="Click to use this prompt"
            >
              <p className="text-sm font-semibold text-gray-200">{item.title}</p>
              <p className="text-xs text-gray-400 mt-1 truncate group-hover:whitespace-normal group-hover:text-gray-300 transition-all">{item.prompt}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No matching inspirations found.</p>
        )}
      </div>
    </div>
  );
};

export default InspirationGallery;