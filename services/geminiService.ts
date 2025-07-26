
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { AspectRatio, Persona, EditableImage } from '../types';

if (!process.env.API_KEY) {
  // This key is for client-side calls that are still being made (e.g., enhance prompt).
  // The backend for identity generation would have its own key, or preferably,
  // ALL calls would go through a backend to hide the key.
  // We leave this for the remaining direct calls.
  console.warn("API_KEY environment variable not set for client-side operations.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImages = async (
  prompt: string,
  numberOfImages: number,
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
) => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt,
      config: {
        numberOfImages,
        outputMimeType: 'image/jpeg',
        aspectRatio,
      },
    });

    return response.generatedImages.map(
      (img) => `data:image/jpeg;base64,${img.image.imageBytes}`
    );
  } catch (error) {
    console.error("Error generating images:", error);
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: "An unknown error occurred during image generation." };
  }
};

export const enhancePrompt = async (prompt: string) => {
    if (!prompt.trim()) {
        return { error: "Prompt cannot be empty." };
    }

    const systemInstruction = `You are The Prompt Alchemist. Your task is to take a user's simple prompt and transform it into a rich, detailed, and evocative description suitable for a powerful AI image generator. 
    - Analyze the user's core idea.
    - Enhance it with sensory details, artistic terms, camera angles, lighting styles, and composition keywords.
    - The output should be a single, cohesive, and powerful prompt string. Do NOT add any preamble or explanation. Just return the enhanced prompt.
    - For example, if the user prompt is "a knight in a forest", a good enhanced prompt would be: "An epic cinematic shot of a lone knight in weathered steel armor, standing amidst a misty, ancient redwood forest. Sunbeams pierce through the dense canopy, illuminating dust motes in the air. Close-up on the knight's determined face, a single scar across his cheek. Photorealistic, 8K, dramatic lighting."`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                thinkingConfig: { thinkingBudget: 0 } // For faster response
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: "An unknown error occurred while enhancing the prompt." };
    }
};

export const generateRandomPrompt = async () => {
    const systemInstruction = `You are an idea generator for an AI artist. Generate a single, random, creative, and visually interesting prompt for an AI image generator. The prompt should be a short phrase or sentence. Do not add any preamble or explanation. Just return the prompt. Examples: "a crystal fox drinking from a bioluminescent river", "a steampunk library on Mars", "a knight made of constellations".`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a new prompt.",
            config: {
                systemInstruction,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating random prompt:", error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: "An unknown error occurred while generating a prompt." };
    }
};

export const describeImage = async (base64Image: string, mimeType: string) => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType,
            },
        };
        const textPart = {
            text: "Analyze this image in detail. Generate a rich, descriptive prompt that could be used to recreate it with an AI image generator. Focus on subject, setting, style, composition, lighting, and mood. The output should be a single, cohesive, and powerful prompt string. Do NOT add any preamble or explanation.",
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error describing image:", error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: "An unknown error occurred while analyzing the image." };
    }
};

export const reimaginePromptFromImages = async (base64Images: {data: string, mimeType: string}[], userPrompt: string) => {
    try {
        const imageParts = base64Images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType }}));
        
        const systemInstruction = `You are a visual fusion artist. Your task is to analyze the provided base images and a user's text prompt.
        - First, understand the core subjects, styles, colors, and compositions of each image.
        - Then, understand the user's desired transformation or combination from their text prompt.
        - Finally, synthesize all of this information into a single, new, rich, and detailed prompt for an AI image generator. This new prompt should creatively merge the key elements from the base images with the user's request.
        - Do NOT add any preamble or explanation. Just return the new, synthesized prompt.`;
        
        const textPart = { text: `User request: "${userPrompt}"` };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [...imageParts, textPart] },
            config: { systemInstruction }
        });
        
        return response.text.trim();

    } catch (error) {
        console.error("Error reimagining prompt:", error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: "An unknown error occurred while reimagining the prompt." };
    }
};

export const createUpscalePrompt = async (base64Image: string, mimeType: string) => {
    try {
        const imagePart = { inlineData: { data: base64Image, mimeType } };
        const systemInstruction = `You are an image enhancement specialist. Analyze the provided image and generate a new, highly-detailed prompt to recreate it at a much higher quality. 
        - Deconstruct the image into its core components: subject, environment, composition, and style.
        - Enhance the description with specific, professional keywords for achieving ultra-realism and detail. 
        - Add terms like: "hyper-detailed, photorealistic, 8K resolution, professional photography, sharp focus, intricate details, cinematic lighting, masterpiece, octane render".
        - The final output must be only the prompt string, without any preamble.`;
        
        const textPart = { text: "Analyze and create an upscale prompt for this image." };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: { systemInstruction }
        });
        
        return response.text.trim();

    } catch (error) {
        console.error("Error creating upscale prompt:", error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: "An unknown error occurred while creating the upscale prompt." };
    }
};


/**
 * **DEPRECATED client-side implementation:**
 * The original client-side implementation was flawed as it relied on a text-based
 * 'Persona Sheet' which fails to capture the unique biometric identity of a face.
 * This resulted in generating generic faces that matched the description but not the person.
 * 
 * **NEW Backend-driven approach:**
 * This function now calls a dedicated backend endpoint. This backend is expected to use
 * advanced techniques like face embedding extraction (e.g., via insightface/ArcFace) and
 * identity-preserving generation models (e.g., InstantID, IP-Adapter on Stable Diffusion)
 * to ensure the generated face is a true likeness of the input images. This is the correct
 * and robust way to solve the identity preservation problem.
 */
export const generateIdentity = async (
    baseImages: EditableImage[],
    scenario: string,
    aspectRatio: AspectRatio['value'],
    selectedStyle: string,
): Promise<{ persona: Persona; generatedImage: string; } | { error: string; }> => {
    try {
        if (baseImages.length === 0) {
            throw new Error("No base images have been provided for identity generation.");
        }
        if (!scenario.trim()) {
            throw new Error("A scenario description is required.");
        }

        const formData = new FormData();
        formData.append('scenario', scenario);
        formData.append('aspectRatio', aspectRatio);
        formData.append('style', selectedStyle);

        // Convert base64 EditableImages to Blobs and append to FormData
        await Promise.all(baseImages.map(async (image) => {
            const response = await fetch(image.src);
            const blob = await response.blob();
            // The backend will receive these files under the 'images' field
            formData.append('images', blob, image.name);
        }));

        // This endpoint is hypothetical and assumes a backend server is running.
        // The backend should handle file parsing, face embedding, and image generation.
        const response = await fetch('/api/generate-identity', {
            method: 'POST',
            body: formData,
            // Note: Don't set 'Content-Type' header manually for FormData,
            // the browser does it automatically with the correct boundary.
        });

        if (!response.ok) {
            let errorMsg = `Server error: ${response.status} ${response.statusText}`;
            try {
                 const errorData = await response.json();
                 errorMsg = errorData.error || errorMsg;
            } catch (e) {
                // Could not parse JSON, use the status text.
            }
            throw new Error(errorMsg);
        }

        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }
        
        // The backend is expected to return a result in this shape
        return result;

    } catch (error) {
        console.error("Error in generateIdentity flow:", error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: "An unknown error occurred during identity generation." };
    }
};
