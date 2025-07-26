import React, { useState, useCallback, useMemo, useRef } from 'react';
import { STYLE_CORES, ASPECT_RATIOS, CELESTIAL_NEON_BLUE_LIGHT, NEGATIVE_PRESETS, LOADING_TIPS, INSPIRATION_PROMPTS } from './constants';
import type { AspectRatio, StyleCore, EditableImage } from './types';
import { generateImages, enhancePrompt, generateRandomPrompt, describeImage } from './services/geminiService';
import StyleCard from './components/StyleCard';
import { WandIcon, SparklesIcon, LoadingSpinner, RetryIcon, DownloadIcon, DiceIcon, EyeIcon, LightbulbIcon, SearchIcon, MagnifyingGlassPlusIcon, UserCircleIcon } from './components/Icon';
import Lightbox from './components/Lightbox';
import Tooltip from './components/Tooltip';
import InspirationGallery from './components/InspirationGallery';
import EditAndReimagine from './components/EditAndReimagine';
import AspectRatioSelector from './components/AspectRatioSelector';
import IdentityStudio from './components/IdentityStudio';

type AppMode = 'create' | 'edit' | 'identity';

interface ControlPanelProps {
    numberOfImages: number;
    setNumberOfImages: (num: number) => void;
    aspectRatio: AspectRatio['value'];
    setAspectRatio: (value: AspectRatio['value']) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ numberOfImages, setNumberOfImages, aspectRatio, setAspectRatio }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 space-y-6 sticky top-6">
        <h2 className="text-xl font-bold text-white tracking-wider">Control Panel</h2>
        
        <Tooltip text="Generate multiple variations of your prompt at once." className="block">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Number of Images</label>
                <div className="flex items-center space-x-2">
                    {[1, 2, 4].map(num => (
                        <button key={num} onClick={() => setNumberOfImages(num)} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${numberOfImages === num ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                            {num}
                        </button>
                    ))}
                </div>
            </div>
        </Tooltip>

        <AspectRatioSelector aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />
    </div>
);

interface ImageDisplayProps {
    isLoading: boolean;
    error: string | null;
    generatedImages: string[];
    numberOfImages: number;
    handleGenerate: () => void;
    onImageClick: (src: string) => void;
    onRefineAndUpscale: (src: string) => void;
    loadingTip: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ isLoading, error, generatedImages, numberOfImages, handleGenerate, onImageClick, onRefineAndUpscale, loadingTip }) => (
    <div className="mt-8 min-h-[400px]">
        {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <LoadingSpinner className="w-12 h-12 text-blue-500" />
                <p className="mt-4 text-lg font-semibold animate-pulse">Synthesizing Aether...</p>
                <p className="text-sm italic mt-2 max-w-md">Whisper from the Aether: "{loadingTip}"</p>
            </div>
        )}
        {error && (
            <div className="flex flex-col items-center justify-center h-full bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
                <p className="text-red-400 font-semibold">Generation Failed</p>
                <p className="text-red-300/80 text-sm mt-2">{error}</p>
                 <button
                    onClick={handleGenerate}
                    className="mt-4 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    <RetryIcon className="w-5 h-5 mr-2" />
                    Try Again
                </button>
            </div>
        )}
        {!isLoading && !error && generatedImages.length > 0 && (
            <div className={`grid gap-4 ${numberOfImages === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {generatedImages.map((src, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group relative">
                       <img src={src} alt={`Generated image ${index + 1}`} className="w-full h-full object-contain cursor-pointer" onClick={() => onImageClick(src)} />
                       <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button
                                onClick={(e) => { e.stopPropagation(); onRefineAndUpscale(src); }}
                                className="bg-green-600/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-green-500"
                                title="Refine & Upscale"
                           >
                               <MagnifyingGlassPlusIcon className="w-5 h-5" />
                           </button>
                           <a
                                href={src}
                                download={`aetherlens-${Date.now()}-${index + 1}.jpeg`}
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
                <p className="mt-4 text-lg font-semibold">Your Creative Canvas</p>
                <p className="text-sm">Generated images will appear here.</p>
            </div>
        )}
    </div>
);


const App: React.FC = () => {
    const [mode, setMode] = useState<AppMode>('create');
    const [prompt, setPrompt] = useState<string>('');
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [activeStyleId, setActiveStyleId] = useState<string | null>(null);
    const [numberOfImages, setNumberOfImages] = useState<number>(1);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio['value']>('1:1');
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
    const [isGeneratingRandomPrompt, setIsGeneratingRandomPrompt] = useState<boolean>(false);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentLoadingTip, setCurrentLoadingTip] = useState<string>('');
    const [filterTerm, setFilterTerm] = useState<string>('');
    const [imagesToEdit, setImagesToEdit] = useState<EditableImage[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeStyle = useMemo(() => STYLE_CORES.find(s => s.id === activeStyleId), [activeStyleId]);

    const filteredStyleCores = useMemo(() => {
        if (!filterTerm) return STYLE_CORES;
        const lowercasedFilter = filterTerm.toLowerCase();
        return STYLE_CORES.filter(core => 
            core.name.toLowerCase().includes(lowercasedFilter) ||
            core.description.toLowerCase().includes(lowercasedFilter) ||
            core.keywords.toLowerCase().includes(lowercasedFilter)
        );
    }, [filterTerm]);

    const filteredInspirations = useMemo(() => {
        if (!filterTerm) return INSPIRATION_PROMPTS;
        const lowercasedFilter = filterTerm.toLowerCase();
        return INSPIRATION_PROMPTS.filter(prompt =>
            prompt.title.toLowerCase().includes(lowercasedFilter) ||
            prompt.prompt.toLowerCase().includes(lowercasedFilter)
        );
    }, [filterTerm]);


    const suggestedStyleId = useMemo(() => {
        const p = prompt.toLowerCase();
        if (!p) return null;
        if (/\b(photo|realistic|photograph|8k|canon|dslr)\b/.test(p)) return 'hyperrealism';
        if (/\b(anime|manga|ghibli|waifu|cel-shaded)\b/.test(p)) return 'classic-anime';
        if (/\b(cyberpunk|neon|futuristic|dystopian|blade runner)\b/.test(p)) return 'cyberpunk-art';
        if (/\b(fantasy|dragon|castle|sword|magic|elf|dwarf)\b/.test(p)) return 'fantasy-art';
        if (/\b(cinematic|movie|dramatic|epic)\b/.test(p)) return 'epic-cinema';
        if (/\b(polaroid|vintage|retro|1970s|faded)\b/.test(p)) return 'vintage-polaroid';
        if (/\b(gothic|noir|dark|shadows|rain)\b/.test(p)) return 'gothic-noir';
        if (/\b(baroque|ornate|rembrandt|caravaggio)\b/.test(p)) return 'baroque';
        return null;
    }, [prompt]);

    const handleStyleClick = (id: string) => {
        setActiveStyleId(prevId => (prevId === id ? null : id));
    };

    const handleEnhancePrompt = useCallback(async () => {
        if (!prompt || isEnhancing) return;
        setIsEnhancing(true);
        setError(null);
        const result = await enhancePrompt(prompt);
        if (typeof result === 'string') {
            setPrompt(result);
        } else if (result.error) {
            setError(result.error);
        }
        setIsEnhancing(false);
    }, [prompt, isEnhancing]);

    const handleRandomPrompt = useCallback(async () => {
        setIsGeneratingRandomPrompt(true);
        setError(null);
        const result = await generateRandomPrompt();
        if (typeof result === 'string') {
            setPrompt(result);
        } else if (result.error) {
            setError(result.error);
        }
        setIsGeneratingRandomPrompt(false);
    }, []);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleImageFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError("Please select an image file.");
            return;
        }

        setIsAnalyzingImage(true);
        setError(null);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            if (base64String) {
                const result = await describeImage(base64String, file.type);
                if (typeof result === 'string') {
                    setPrompt(result);
                } else if (result.error) {
                    setError(result.error);
                }
            }
            setIsAnalyzingImage(false);
        };
        reader.onerror = () => {
            setError("Failed to read the image file.");
            setIsAnalyzingImage(false);
        };
        reader.readAsDataURL(file);
        
        event.target.value = '';
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt to generate images.");
            return;
        }
        
        const randomTip = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
        setCurrentLoadingTip(randomTip);

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        let finalPrompt = prompt;
        if (activeStyle) {
            finalPrompt = `${activeStyle.keywords}, ${prompt}`;
        }
        
        let negatives = [];
        if (activeStyle?.negativeKeywords) {
            negatives.push(activeStyle.negativeKeywords);
        }
        if (negativePrompt) {
            negatives.push(negativePrompt);
        }

        if (negatives.length > 0) {
            finalPrompt += `. Avoid the following: ${negatives.join(', ')}.`;
        }

        const result = await generateImages(finalPrompt, numberOfImages, aspectRatio);

        if (Array.isArray(result)) {
            setGeneratedImages(result);
        } else if ('error' in result) {
            setError(result.error);
        }
        setIsLoading(false);
    }, [prompt, negativePrompt, activeStyle, numberOfImages, aspectRatio]);

    const anyLoading = isLoading || isEnhancing || isGeneratingRandomPrompt || isAnalyzingImage;

    const handleCloseLightbox = () => {
        setSelectedImage(null);
    };

    const handleSelectInspiration = (inspirationPrompt: string) => {
        setPrompt(inspirationPrompt);
    };

    const applyNegativePreset = (value: string) => {
        setNegativePrompt(prev => {
            if (!prev) return value;
            const existing = prev.split(',').map(s => s.trim()).filter(Boolean);
            const toAdd = value.split(',').map(s => s.trim()).filter(Boolean);
            const combined = [...new Set([...existing, ...toAdd])];
            return combined.join(', ');
        });
    };

    const handleModeChange = (newMode: AppMode) => {
        if (newMode === 'edit' && mode !== 'edit') {
            setImagesToEdit([]);
        }
        setMode(newMode);
    };
    
    const handleRefineAndUpscale = (src: string) => {
        setImagesToEdit([{ src, name: `generated-${Date.now()}.jpeg` }]);
        setMode('edit');
    };

    const MainContent = () => {
        switch (mode) {
            case 'create':
                return (
                    <>
                        <div className="space-y-4">
                            <div className="relative">
                               <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your vision... or get inspired..."
                                    className="w-full p-4 pr-28 pb-14 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 min-h-[120px] text-gray-200 placeholder-gray-500"
                               />
                               <button 
                                    onClick={handleEnhancePrompt} 
                                    disabled={anyLoading}
                                    title="Use Prompt Alchemist"
                                    className="absolute top-3 right-3 flex items-center space-x-2 bg-blue-700 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed group"
                                >
                                    {isEnhancing ? <LoadingSpinner className="w-5 h-5"/> : <WandIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                                    <span className="text-sm font-semibold hidden sm:inline">Alchemist</span>
                               </button>
                               <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    <button
                                        onClick={handleRandomPrompt}
                                        disabled={anyLoading}
                                        title="Spark of Inspiration (Random Prompt)"
                                        className="bg-gray-700/80 backdrop-blur-sm p-2 rounded-full hover:bg-gray-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed group"
                                    >
                                        {isGeneratingRandomPrompt ? <LoadingSpinner className="w-5 h-5 text-white"/> : <DiceIcon className="w-5 h-5 text-gray-300 group-hover:text-white" />}
                                    </button>
                                    <button
                                        onClick={triggerFileInput}
                                        disabled={anyLoading}
                                        title="Aether's Eye (Analyze Image)"
                                        className="bg-gray-700/80 backdrop-blur-sm p-2 rounded-full hover:bg-gray-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed group"
                                    >
                                        {isAnalyzingImage ? <LoadingSpinner className="w-5 h-5 text-white"/> : <EyeIcon className="w-5 h-5 text-gray-300 group-hover:text-white" />}
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageFileChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/webp"
                                    />
                               </div>
                            </div>
                             <div className="space-y-2">
                                <textarea
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                    placeholder="Negative prompt: what to avoid... (e.g., blurry, text, watermark)"
                                    className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-300 min-h-[60px] text-gray-300 placeholder-gray-500 text-sm"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {NEGATIVE_PRESETS.map(preset => (
                                        <Tooltip key={preset.name} text={`Adds: ${preset.value}`} className="block">
                                            <button
                                                onClick={() => applyNegativePreset(preset.value)}
                                                className="text-xs font-semibold bg-gray-700 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-600 hover:text-white transition-all"
                                            >
                                               + Avoid {preset.name}
                                            </button>
                                        </Tooltip>
                                    ))}
                                </div>
                             </div>
                        </div>
                        
                        <button 
                            onClick={handleGenerate} 
                            disabled={anyLoading}
                            className="w-full mt-6 py-4 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-wait flex items-center justify-center shadow-lg hover:shadow-blue-500/40 disabled:shadow-none"
                            style={{ boxShadow: !isLoading ? `0 0 15px ${CELESTIAL_NEON_BLUE_LIGHT}` : 'none' }}
                        >
                            {isLoading ? <LoadingSpinner className="w-7 h-7 mr-3" /> : <SparklesIcon className="w-7 h-7 mr-3" />}
                            {isLoading ? 'Synthesizing...' : 'Synthesize Aether'}
                        </button>
                        
                       <ImageDisplay 
                            isLoading={isLoading}
                            error={error}
                            generatedImages={generatedImages}
                            numberOfImages={numberOfImages}
                            handleGenerate={handleGenerate}
                            onImageClick={setSelectedImage}
                            onRefineAndUpscale={handleRefineAndUpscale}
                            loadingTip={currentLoadingTip}
                       />
                    </>
                );
            case 'edit':
                return <EditAndReimagine initialImages={imagesToEdit} onImageClick={setSelectedImage} />;
            case 'identity':
                return <IdentityStudio onImageClick={setSelectedImage} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">AetherLens</span>
                </h1>
                <p className="text-gray-400 mt-2 text-lg">Transforming Aether to Vision</p>
            </header>
            
            <div className="mb-8 flex justify-center">
                <div className="bg-gray-800 p-1 rounded-lg flex space-x-1">
                    <button onClick={() => handleModeChange('create')} className={`px-4 sm:px-6 py-2 rounded-md font-semibold transition-colors flex items-center gap-2 ${mode === 'create' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <SparklesIcon className="w-5 h-5" /> Create
                    </button>
                     <button onClick={() => handleModeChange('edit')} className={`px-4 sm:px-6 py-2 rounded-md font-semibold transition-colors flex items-center gap-2 ${mode === 'edit' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <WandIcon className="w-5 h-5" /> Edit
                    </button>
                    <button onClick={() => handleModeChange('identity')} className={`px-4 sm:px-6 py-2 rounded-md font-semibold transition-colors flex items-center gap-2 ${mode === 'identity' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <UserCircleIcon className="w-5 h-5" /> Identity
                    </button>
                </div>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel - Only in Create/Identity Modes */}
                <aside className={`lg:col-span-3 ${mode === 'edit' && 'hidden lg:block lg:opacity-30 lg:pointer-events-none'}`}>
                     {mode === 'create' && (
                        <ControlPanel 
                            numberOfImages={numberOfImages}
                            setNumberOfImages={setNumberOfImages}
                            aspectRatio={aspectRatio}
                            setAspectRatio={setAspectRatio}
                        />
                     )}
                     {/* Placeholder for potential Identity mode controls */}
                     {mode === 'identity' && <div className="h-full" />}
                </aside>
                
                {/* Center Content */}
                <div className="lg:col-span-6">
                   <MainContent />
                </div>

                {/* Right Panel - Only in Create Mode */}
                <aside className={`lg:col-span-3 ${mode !== 'create' && 'hidden lg:block lg:opacity-30 lg:pointer-events-none'}`}>
                    <div className="space-y-6 sticky top-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Filter styles & inspirations..."
                                value={filterTerm}
                                onChange={(e) => setFilterTerm(e.target.value)}
                                className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 text-gray-200 placeholder-gray-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-500" />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white tracking-wider">Style Cores</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                                {filteredStyleCores.length > 0 ? filteredStyleCores.map(style => (
                                    <StyleCard 
                                        key={style.id} 
                                        styleCore={style} 
                                        isActive={activeStyleId === style.id} 
                                        isSuggested={suggestedStyleId === style.id && !filterTerm}
                                        onClick={handleStyleClick} 
                                    />
                                )) : (
                                    <p className="text-sm text-gray-500 text-center col-span-full py-4">No matching styles found.</p>
                                )}
                             </div>
                         </div>
                         <InspirationGallery prompts={filteredInspirations} onSelectPrompt={handleSelectInspiration} />
                    </div>
                </aside>
            </main>

            {selectedImage && <Lightbox imageUrl={selectedImage} onClose={handleCloseLightbox} />}
        </div>
    );
};

export default App;