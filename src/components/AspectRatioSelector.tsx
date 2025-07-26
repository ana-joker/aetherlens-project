import React from 'react';
import { ASPECT_RATIOS } from '../constants';
import type { AspectRatio } from '../types';
import Tooltip from './Tooltip';

interface AspectRatioSelectorProps {
    aspectRatio: AspectRatio['value'];
    setAspectRatio: (value: AspectRatio['value']) => void;
    disabled?: boolean;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ aspectRatio, setAspectRatio, disabled }) => {
    return (
        <Tooltip text="Choose the final shape of your generated images." className="block">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map(ar => (
                         <button
                            key={ar.id}
                            onClick={() => setAspectRatio(ar.value)}
                            title={ar.label}
                            disabled={disabled}
                            className={`flex flex-col justify-center items-center p-2 rounded-md transition-colors ${
                                aspectRatio === ar.value
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed`}
                         >
                            {ar.icon}
                            <span className="text-xs mt-1">{ar.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </Tooltip>
    );
};

export default AspectRatioSelector;
