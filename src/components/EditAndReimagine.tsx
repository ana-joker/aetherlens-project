import React, { useState, useCallback, useMemo } from 'react';
import type { EditableImage, AspectRatio } from '../types';
import { generateImages, reimaginePromptFromImages, createUpscalePrompt } from '../services/geminiService';
import { LoadingSpinner, SparklesIcon, XIcon, UploadIcon, RetryIcon, DownloadIcon } from './Icon';
import { LOADING_TIPS } from '../constants';
import AspectRatioSelector from './AspectRatioSelector';

const fileToEditableImage = (file: File): Promise<EditableImage> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ src: reader.result as string, name: file.name });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const ImagePreview: React.FC<{ image: EditableImage; onRemove: () => void }> = ({ image, onRemove }) => (
    <div className="relative group bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <img src={image.src} alt={image.name} className="w-full h-32 object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button onClick={onRemove} className="bg-red-600/80 p-2 rounded-full text-white hover:bg-red-500 transition-colors" title="Remove Image">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
        <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate" title={image.name}>
            {image.name}
        </p>
    </div>
);

interface EditAndReimagineProps {
    initialImages: EditableImage[];
    onImageClick: (src: string) => void;
}

const EditAndReimagine: React.FC<EditAndReimagineProps> = ({ initialImages, onImageClick }) => {
    const [baseImages, setBaseImages] = useState<EditableImage[]>(initialImages);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio['value']>('1:1');
    const [currentLoadingTip, setCurrentLoadingTip] = useState('');

    const handleFileChange = async (files: FileList | null) => {
        if (!files) return;
        try {
            const newImages = await Promise.all(Array.from(files).map(fileToEditableImage));
            setBaseImages(prev => [...prev, ...newImages]);
        } catch (e) {
            setError('Failed to read one or more files.');
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        handleFileChange(e.dataTransfer.files);
    };

    const handleGenerate = useCallback(async (mode: 'reimagine' | 'upscale') => {
        if (baseImages.length === 0) {
            setError('Please upload at least one base image.');
            return;
        }

        const randomTip = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
        setCurrentLoadingTip(randomTip);
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            let finalPrompt = '';
            if (mode === 'reimagine') {
                if (!prompt) {
                    setError('Please enter a prompt to reimagine the image(s).');
                    setIsLoading(false);
                    return;
                }
                const imageParts = baseImages.map(img => {
                    const mimeType = img.src.match(/data:(.*);base64/)?.[1] || 'image/jpeg';
                    return {
                        data: img.src.split(',')[1],
                        mimeType,
                    };
                });
                const result = await reimaginePromptFromImages(imageParts, prompt);
                if (typeof result === 'string') {
                    finalPrompt = result;
                } else {
                    throw new Error(result.error);
                }
            } else { // upscale
                const firstImage = baseImages[0];
                const mimeType = firstImage.src.match(/data:(.*);base64/)?.[1] || 'image/jpeg';
                 const result = await createUpscalePrompt(firstImage.src.split(',')[1], mimeType);
                 if (typeof result === 'string') {
                    finalPrompt = result;
                } else {
                    throw new Error(result.error);
                }
            }
            
            const imageResult = await generateImages(finalPrompt, 1, aspectRatio);
            if (Array.isArray(imageResult)) {
                setGeneratedImages(imageResult);
            } else {
                throw new Error(imageResult.error);
            }

        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }

    }, [baseImages, prompt, aspectRatio]);
    
    const dropzoneClasses = useMemo(() => {
        let base = 'bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center transition-all duration-300';
        if (isDragOver) {
            base += ' animate-flicker-border';
        } else {
            base += ' hover:border-blue-600';
        }
        return base;
    }, [isDragOver]);

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-lg font-bold text-white tracking-wider mb-3">Base Images</label>
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    className={dropzoneClasses}
                >
                    <div className="flex flex-col items-center">
                        <UploadIcon className={`w-10 h-10 text-gray-500 transition-colors ${isDragOver ? 'text-blue-500' : ''}`} />
                        <p className="mt-2 text-sm text-gray-400">Drag & drop images here, or</p>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files)}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="mt-2 text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer">
                            browse your files
                        </label>
                    </div>
                </div>
                {baseImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {baseImages.map((img, index) => (
                            <ImagePreview key={index} image={img} onRemove={() => setBaseImages(prev => prev.filter((_, i) => i !== index))} />
                        ))}
                    </div>
                )}
            </div>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how to reimagine the image(s)... (e.g., 'turn the person into a robot', 'change the style to cyberpunk')"
                className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 min-h-[100px] text-gray-200 placeholder-gray-500"
            />
            
             <div className="flex flex-wrap gap-4">
                <button
                    onClick={() => handleGenerate('reimagine')}
                    disabled={isLoading || baseImages.length === 0}
                    className="flex-1 py-3 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-blue-500/40 disabled:shadow-none min-w-[200px]"
                >
                    <SparklesIcon className="w-6 h-6 mr-3" />
                    Reimagine
                </button>
                <button
                    onClick={() => handleGenerate('upscale')}
                    disabled={isLoading || baseImages.length === 0}
                    className="flex-1 py-3 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-green-500/40 disabled:shadow-none min-w-[200px]"
                >
                    <SparklesIcon className="w-6 h-6 mr-3" />
                    Refine & Upscale
                </button>
             </div>
            
            <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <AspectRatioSelector 
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    disabled={isLoading}
                />
            </div>


            {/* Display Area */}
            <div className="mt-8 min-h-[400px]">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <LoadingSpinner className="w-12 h-12 text-blue-500" />
                        <p className="mt-4 text-lg font-semibold animate-pulse">Engaging Visual Cortex...</p>
                         <p className="text-sm italic mt-2 max-w-md">Whisper from the Aether: "{currentLoadingTip}"</p>
                    </div>
                )}
                {error && (
                    <div className="flex flex-col items-center justify-center h-full bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
                        <p className="text-red-400 font-semibold">Generation Failed</p>
                        <p className="text-red-300/80 text-sm mt-2">{error}</p>
                         <button
                            onClick={() => setError(null)}
                            className="mt-4 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <RetryIcon className="w-5 h-5 mr-2" />
                            Acknowledge & Retry
                        </button>
                    </div>
                )}
                {!isLoading && !error && generatedImages.length > 0 && (
                    <div className="grid grid-cols-1 gap-4">
                        {generatedImages.map((src, index) => (
                             <div key={index} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group relative">
                                <img src={src} alt={`Reimagined image ${index + 1}`} className="w-full h-full object-contain cursor-pointer" onClick={() => onImageClick(src)} />
                                 <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={src}
                                        download={`aetherlens-reimagined-${Date.now()}-${index + 1}.jpeg`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-gray-900/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-blue-600"
                                        title="Download Image"
                                    >
                                       <DownloadIcon className="w-5 h-5" />
                                    </a>
                                </div>
                             </div>
                        ))}
                    </div>
                )}
                {!isLoading && !error && generatedImages.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg py-20">
                        <SparklesIcon className="w-16 h-16" />
                        <p className="mt-4 text-lg font-semibold">The Alchemist's Canvas</p>
                        <p className="text-sm">Reimagined results will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditAndReimagine;
