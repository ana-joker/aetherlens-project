import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, className }) => {
  return (
    <div className={`relative group ${className || ''}`}>
      {children}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs px-3 py-1.5 text-sm font-medium text-white bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform-gpu group-hover:scale-100 scale-95 group-hover:-translate-y-1 pointer-events-none z-10">
        {text}
        <svg className="absolute text-gray-900/80 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
};

export default Tooltip;
