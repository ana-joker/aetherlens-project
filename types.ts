import React from 'react';

export interface StyleCore {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  keywords: string;
  negativeKeywords: string;
}

export interface AspectRatio {
  id:string;
  label: string;
  value: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  icon: React.ReactNode;
}

export interface EditableImage {
  src: string; // base64 data URL
  name: string; // filename
}

export interface Persona {
  hair: string;
  eyes: string;
  beard: string;
  faceShape: string;
  uniqueFeatures: string[];
  gender: string;
  age: number;
}