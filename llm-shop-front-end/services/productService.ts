import { getAuth } from "firebase/auth";

export interface GeneratedProduct {
  imageUrl: string;
  title: string;
  description?: string;
  price?: string;
}
var backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5275';

export const generateProduct = async (prompt: string, style: string): Promise<GeneratedProduct> => {
    try {
        const stylePrefix = getStylePromptPrefix(style);
        const fullPrompt = `${stylePrefix} ${prompt}. The image should be high-resolution and look like it's for an e-commerce website.`;
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();

        const response = await fetch(`${backendUrl}generateProduct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ prompt, style }),
        });
        console.log("response", response);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("data", data);
        return { imageUrl: data.image, title: data.title, description: data.description, price: data.price };

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Could not generate product image.");
    }
};

const getStylePromptPrefix = (style: string): string => {
    switch (style) {
        case 'Cartoon':
            return `A vibrant, professional product photo of the following item, in a bold and clean cartoon style, on a pure white background:`;
        case 'Watercolor':
            return `A beautiful, artistic product photo of the following item, in a soft and elegant watercolor style, on a pure white background:`;
        case 'Realistic':
        default:
            return `A professional, clean product photo of the following item, on a pure white background:`;
    }
};