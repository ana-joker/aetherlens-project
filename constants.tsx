import type { StyleCore, AspectRatio } from './types';
import React from 'react';

export const STYLE_CORES: StyleCore[] = [
  {
    id: 'hyperrealism',
    name: 'Hyperrealism',
    thumbnail: 'https://picsum.photos/seed/hyperrealism/200',
    description: 'Ultra-detailed, photorealistic images that mimic high-resolution photography.',
    keywords: 'photorealistic, 8K, hyperdetailed, sharp focus, detailed skin texture, cinematic lighting, professional photography, Canon EOS 5D Mark IV, 50mm f/1.8 lens, masterpiece',
    negativeKeywords: 'painting, cartoon, illustration, anime, blurry, deformed hands, unrealistic',
  },
  {
    id: 'epic-cinema',
    name: 'Epic Cinema',
    thumbnail: 'https://picsum.photos/seed/epiccinema/200',
    description: 'Dramatic, wide-angle shots with cinematic lighting and color grading.',
    keywords: 'cinematic still from a movie, epic composition, dramatic lighting, anamorphic lens flare, wide angle shot, color graded, film grain, directed by Denis Villeneuve',
    negativeKeywords: 'flat lighting, boring, illustration, 3D render, portrait, closeup',
  },
  {
    id: 'classic-anime',
    name: 'Classic Anime',
    thumbnail: 'https://picsum.photos/seed/classicanime/200',
    description: 'Vibrant, cel-shaded art reminiscent of 90s hand-drawn anime masterpieces.',
    keywords: 'classic 90s anime style, cel-shaded, vibrant colors, hand-drawn, masterpiece, by Hayao Miyazaki, Studio Ghibli',
    negativeKeywords: 'photorealistic, 3D, realistic, photo, modern anime style',
  },
  {
    id: 'dreamy-surrealism',
    name: 'Dreamy Surrealism',
    thumbnail: 'https://picsum.photos/seed/surrealism/200',
    description: 'Ethereal, dreamlike scenes that juxtapose strange objects and concepts.',
    keywords: 'surrealism, dreamlike, ethereal, Salvador Dalí style, juxtaposition of strange objects, melting, floating, symbolic, metaphorical, subconscious mind',
    negativeKeywords: 'realistic, normal, mundane, boring, straightforward, literal',
  },
  {
    id: 'cyberpunk-art',
    name: 'Cyberpunk Art',
    thumbnail: 'https://picsum.photos/seed/cyberpunk/200',
    description: 'Futuristic cityscapes with neon lights, glowing elements, and intricate details.',
    keywords: 'cyberpunk, futuristic, neon lights, glowing elements, biomechanical, intricate details, octane render, trending on ArtStation, dystopian city',
    negativeKeywords: 'ancient, historical, realistic photo, nature, fantasy',
  },
    {
    id: 'fantasy-art',
    name: 'Fantasy Art',
    thumbnail: 'https://picsum.photos/seed/fantasy/200',
    description: 'Epic fantasy landscapes, characters, and creatures.',
    keywords: 'epic fantasy art, high fantasy, detailed illustration, lord of the rings style, magic, dragons, castles, trending on ArtStation, by Frank Frazetta',
    negativeKeywords: 'sci-fi, cyberpunk, modern, photo, realistic',
  },
  {
    id: 'gothic-noir',
    name: 'Gothic Noir',
    thumbnail: 'https://picsum.photos/seed/gothicnoir/200',
    description: 'High-contrast, dramatic scenes inspired by film noir and gothic architecture.',
    keywords: 'gothic architecture, film noir aesthetic, Blade Runner, high contrast, dramatic shadows, rain-soaked streets, desaturated colors, mysterious mood, cinematic',
    negativeKeywords: 'bright colors, sunny, cheerful, cute, cartoon, flat lighting',
  },
  {
    id: 'solarpunk',
    name: 'Solarpunk Utopia',
    thumbnail: 'https://picsum.photos/seed/solarpunk/200',
    description: 'Lush, green futures where technology and nature harmoniously coexist.',
    keywords: 'solarpunk, futuristic eco-city, organic architecture, clean energy, lush greenery, vibrant colors, optimistic, harmonious, sustainable, art nouveau',
    negativeKeywords: 'dystopian, pollution, cyberpunk, dark, concrete, barren',
  },
  {
    id: 'baroque',
    name: 'Baroque Grandeur',
    thumbnail: 'https://picsum.photos/seed/baroque/200',
    description: 'Ornate, dramatic, and emotional scenes reminiscent of Baroque paintings.',
    keywords: 'Baroque painting, chiaroscuro, dramatic lighting, rich details, ornate, emotional, masterpiece, style of Caravaggio, Rembrandt, tenebrism',
    negativeKeywords: 'minimalist, simple, modern, flat, calm, pastel colors',
  },
  {
    id: 'vintage-polaroid',
    name: 'Vintage Polaroid',
    thumbnail: 'https://picsum.photos/seed/polaroid/200',
    description: 'Nostalgic, slightly faded images with the iconic soft focus of Polaroid photos.',
    keywords: 'vintage Polaroid photo, faded colors, soft contrast, film grain, light leaks, nostalgic, 1970s aesthetic, retro, instant camera look',
    negativeKeywords: 'digital, sharp focus, vibrant colors, 4K, modern, futuristic',
  },
  {
    id: 'abstract-expressionism',
    name: 'Abstract Expressionism',
    thumbnail: 'https://picsum.photos/seed/abstract/200',
    description: 'Non-representational art focusing on emotion through color and form.',
    keywords: 'abstract expressionism, action painting, style of Jackson Pollock, non-representational, chaotic energy, splatters, drips, emotional, gestural',
    negativeKeywords: 'photorealistic, representational, figurative, calm, ordered, precise',
  },
];

export const ASPECT_RATIOS: AspectRatio[] = [
    { id: '1:1', label: 'Square', value: '1:1', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 1v10h10V4H4z" clipRule="evenodd" /></svg> },
    { id: '16:9', label: 'Landscape', value: '16:9', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V5zm2 0a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg> },
    { id: '9:16', label: 'Portrait', value: '9:16', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" transform="rotate(90 10 10)"><path d="M2 5a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V5zm2 0a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg> },
];

export const NEGATIVE_PRESETS = [
  { name: 'Realism', value: 'ugly, deformed, noisy, blurry, distorted, grainy, plastic, fake, cartoon, 3d render, painting, illustration, anime' },
  { name: 'Anime', value: 'photorealistic, photo, 3d, realism, ugly, deformed, noisy, blurry, watermark' },
  { name: 'Text', value: 'text, watermark, signature, letters, words, font, typography' },
];

export const LOADING_TIPS = [
    "Try combining two different Style Cores in your prompt for unique results.",
    "Use 'cinematic lighting' or 'dramatic lighting' to create more impactful scenes.",
    "The 'Aether's Eye' tool can deconstruct an image into a detailed prompt. Try it with your favorite art!",
    "Negative prompts are powerful. Use them to remove elements you don't want, like 'text' or 'blurry'.",
    "Keywords like 'trending on ArtStation' or 'masterpiece' can often boost the quality of fantasy and sci-fi art.",
    "For portraits, try specifying emotions or expressions like 'a look of serene contemplation'.",
    "The 'Prompt Alchemist' can often reveal more creative ways to phrase your ideas.",
    "Experiment with different aspect ratios to change the entire composition and feel of your image."
];

export const INSPIRATION_PROMPTS = [
    { title: 'Cosmic Leviathan', prompt: 'A colossal space whale swimming through a vibrant nebula, its skin shimmering with constellations, epic sci-fi art, masterpiece, 8K, cinematic.' },
    { title: 'Steampunk Treehouse', prompt: 'An incredibly detailed steampunk treehouse city, with brass pipes and glowing gears, nestled in a giant ancient tree, fantasy art, volumetric lighting.' },
    { title: 'Floating Market', prompt: 'A bustling floating market in a serene, sun-drenched Ghibli-style river city, Studio Ghibli anime style, warm and inviting, detailed.' },
    { title: 'Gothic Android', prompt: 'A portrait of a beautiful android with porcelain skin and intricate gothic filigree, sitting in a dimly lit Victorian room, dramatic lighting, photorealistic.' },
    { title: 'Cyber-Samurai Duel', prompt: 'A samurai with a laser katana dueling a robot ninja on a rooftop in a rainy, neon-lit cyberpunk Tokyo, dynamic action shot, Blade Runner aesthetic.' },
];


export const CELESTIAL_NEON_BLUE = "rgb(29 78 216)"; // blue-700
export const CELESTIAL_NEON_BLUE_LIGHT = "rgb(59 130 246)"; // blue-500