import React, { useState } from 'react';
import ProductGenerator from './ProductGenerator';
import ProductDisplay from './ProductDisplay';
import { generateProductImage, generateProductTitle } from '../services/geminiService';
import { useCart } from './contexts';

const CreatePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);
  
  const { addToCart } = useCart();

  const handleGenerate = async (currentPrompt: string) => {
    if (!currentPrompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedTitle(null);

    try {
      const [imageUrl, title] = await Promise.all([
        generateProductImage(currentPrompt, selectedStyle),
        generateProductTitle(currentPrompt)
      ]);
      
      setGeneratedImage(imageUrl);
      setGeneratedTitle(title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setGeneratedImage(null);
    setGeneratedTitle(null);
    setError(null);
    setPrompt('');
  };

  return (
    <div className="space-y-8">
      <ProductGenerator
        prompt={prompt}
        setPrompt={setPrompt}
        selectedStyle={selectedStyle}
        setSelectedStyle={setSelectedStyle}
        onGenerate={handleGenerate}
        isLoading={isLoading}
      />
      {(isLoading || error || generatedImage) && (
        <ProductDisplay
          imageUrl={generatedImage}
          title={generatedTitle}
          isLoading={isLoading}
          error={error}
          onStartOver={handleStartOver}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default CreatePage;
