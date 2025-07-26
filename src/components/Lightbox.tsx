import React, { useEffect } from 'react';
import { XIcon } from './Icon';

interface LightboxProps {
  imageUrl: string;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors z-50"
        aria-label="Close image viewer"
      >
        <XIcon className="w-8 h-8" />
      </button>

      {/* This div prevents clicks on the image from closing the modal */}
      <div className="relative p-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Enlarged view"
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl shadow-black/50"
        />
      </div>
    </div>
  );
};

export default Lightbox;
