

import React, { useState, useCallback, useMemo } from 'react';
import type { EditableImage, Persona, AspectRatio } from '../types';
import { generateIdentity } from '../services/geminiService';
import { LoadingSpinner, SparklesIcon, XIcon, UploadIcon, RetryIcon, DownloadIcon, UserCircleIcon, ImageStackIcon } from './Icon';
import AspectRatioSelector from './AspectRatioSelector';

const fileToEditableImage = (file: File): Promise<EditableImage> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ src: reader.result as string, name: file.name });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

interface IdentityStudioProps {
    onImageClick: (src: string) => void;
}

const MAX_IMAGES = 5;

const IdentityStudio: React.FC<IdentityStudioProps> = ({ onImageClick }) => {
    const [baseImages, setBaseImages] = useState<EditableImage[]>([]);
    const [persona, setPersona] = useState<Persona | null>(null);
    const [scenario, setScenario] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio['value']>('1:1');
    const [selectedStyle, setSelectedStyle] = useState<string>('realistic');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const handleFileChange = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newFilesArray = Array.from(files);
        if (baseImages.length + newFilesArray.length > MAX_IMAGES) {
            setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        const processedImages: EditableImage[] = [];
        for (const file of newFilesArray) {
            try {
                const newImage = await fileToEditableImage(file);
                processedImages.push(newImage);
            } catch (e) {
                setError(`Failed to read file: ${file.name}.`);
                setIsLoading(false);
                return;
            }
        }
        setBaseImages(prevImages => [...prevImages, ...processedImages]);
        setPersona(null);
        setGeneratedImage(null);
        setIsLoading(false);
    };

    const handleRemoveImage = useCallback((indexToRemove: number) => {
        setBaseImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
        setPersona(null);
        setGeneratedImage(null);
        setError(null);
    }, []);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        handleFileChange(e.dataTransfer.files);
    };
    
    const handleGenerate = useCallback(async () => {
        if (baseImages.length === 0) {
            setError('Please upload at least one base image first.');
            return;
        }
        if (!scenario.trim()) {
            setError('Please describe a scenario.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setPersona(null);
        
        const result = await generateIdentity(baseImages, scenario, aspectRatio, selectedStyle);
        setIsLoading(false);
        
        if ('error' in result) {
            setError(result.error);
        } else {
            setPersona(result.persona);
            setGeneratedImage(result.generatedImage);
        }

    }, [baseImages, scenario, aspectRatio, selectedStyle]);
    
    const dropzoneClasses = useMemo(() => `bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center transition-all duration-300 ${isDragOver ? 'animate-flicker-border' : 'hover:border-blue-600'}`, [isDragOver]);

    return (
        <div className="space-y-6">
             <div className="space-y-4">
                <label className="block text-lg font-bold text-white tracking-wider">1. Provide Identity &amp; Scenario</label>
                 {baseImages.length === 0 ? (
                    <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} className={dropzoneClasses}>
                        <div className="flex flex-col items-center">
                            <UploadIcon className={`w-10 h-10 text-gray-500 transition-colors ${isDragOver ? 'text-blue-500' : ''}`} />
                            <p className="mt-2 text-sm text-gray-400">Drag &amp; drop image(s) here (up to {MAX_IMAGES}), or</p>
                            <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e.target.files)} className="hidden" id="identity-file-upload" />
                            <label htmlFor="identity-file-upload" className="mt-2 text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer">browse your files</label>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-center">
                        {baseImages.map((image, index) => (
                            <div key={index} className="relative group w-full aspect-square">
                                <img src={image.src} alt={`Base Identity ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-lg"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <button onClick={() => handleRemoveImage(index)} className="bg-red-600/80 p-2 rounded-full text-white hover:bg-red-500 transition-colors" title="Remove Image">
                                        <XIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {baseImages.length < MAX_IMAGES && (
                            <div className="relative group w-full aspect-square border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center hover:border-blue-600 transition-colors cursor-pointer">
                                <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e.target.files)} className="hidden" id="add-more-files" />
                                <label htmlFor="add-more-files" className="flex flex-col items-center text-gray-400 hover:text-blue-400 transition-colors">
                                    <UploadIcon className="w-8 h-8" />
                                    <span className="text-xs mt-1">Add More ({MAX_IMAGES - baseImages.length} remaining)</span>
                                </label>
                            </div>
                        )}
                    </div>
                )}
                 <textarea
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Describe the new scene, style, or character role... (e.g., 'as an astronaut on Mars', 'in the style of classic anime', 'a knight in shining armor')"
                    className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 min-h-[100px] text-gray-200 placeholder-gray-500"
                    disabled={isLoading || baseImages.length === 0}
                />
            </div>
            
             <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <label className="block text-lg font-bold text-white tracking-wider mb-3">2. Choose Aspect Ratio</label>
                <AspectRatioSelector 
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    disabled={isLoading}
                />
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <label className="block text-lg font-bold text-white tracking-wider mb-3">3. Choose Generation Style</label>
                <div className="flex flex-wrap gap-3">
                    {['realistic', 'anime', 'sketch', 'cyberpunk', 'fantasy'].map(style => (
                        <button
                            key={style}
                            onClick={() => setSelectedStyle(style)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                                ${selectedStyle === style 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                                }`}
                            disabled={isLoading}
                        >
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

             <button
                onClick={handleGenerate}
                disabled={isLoading || baseImages.length === 0 || !scenario.trim()}
                className="w-full py-4 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-600 disabled:cursor-wait flex items-center justify-center shadow-lg hover:shadow-blue-500/40"
            >
                {isLoading ? <LoadingSpinner className="w-7 h-7 mr-3" /> : <SparklesIcon className="w-7 h-7 mr-3" />}
                {isLoading ? 'Synthesizing...' : 'Generate Identity'}
            </button>


            <div className="mt-8 min-h-[400px]">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <LoadingSpinner className="w-12 h-12 text-blue-500" />
                        <p className="mt-4 text-lg font-semibold animate-pulse">
                            {baseImages.length > 0 && scenario.trim() ? 'Analyzing identity and synthesizing image...' : 'Processing...'}
                        </p>
                    </div>
                )}
                {error && (
                     <div className="flex flex-col items-center justify-center h-full bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
                        <p className="text-red-400 font-semibold">Operation Failed</p>
                        <p className="text-red-300/80 text-sm mt-2">{error}</p>
                         <button onClick={() => setError(null)} className="mt-4 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                            <RetryIcon className="w-5 h-5 mr-2" /> Acknowledge
                        </button>
                    </div>
                )}
                {!isLoading && !error && generatedImage && persona && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group relative">
                           <img src={generatedImage} alt="Generated Identity" className="w-full h-full object-contain cursor-pointer" onClick={() => onImageClick(generatedImage)} />
                            <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={generatedImage} download={`aetherlens-identity-${Date.now()}.jpeg`} onClick={(e) => e.stopPropagation()} className="bg-gray-900/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-blue-600" title="Download Image">
                                   <DownloadIcon className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg flex flex-col">
                            <h3 className="font-semibold text-green-400 mb-2 text-lg flex items-center gap-2">
                                <UserCircleIcon className="w-6 h-6"/>
                                Identity Persona Sheet
                            </h3>
                            <pre className="text-sm text-gray-300 bg-black/20 p-3 rounded-md overflow-x-auto flex-grow">
                                {JSON.stringify(persona, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
                {!isLoading && !error && !generatedImage && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg py-20">
                        <ImageStackIcon className="w-16 h-16" />
                        <p className="mt-4 text-lg font-semibold">Identity Canvas</p>
                        <p className="text-sm">Please provide image(s) and a scenario to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IdentityStudio;