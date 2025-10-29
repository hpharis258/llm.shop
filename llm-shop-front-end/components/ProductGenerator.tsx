import React from 'react';

interface ProductGeneratorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const styleOptions = ['Realistic', 'Cartoon', 'Watercolor'];

const ProductGenerator: React.FC<ProductGeneratorProps> = ({ prompt, setPrompt, selectedStyle, setSelectedStyle, onGenerate, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(prompt);
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <form onSubmit={handleSubmit}>
        <div>
            <label htmlFor="product-prompt" className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Product Description
            </label>
            <textarea
            id="product-prompt"
            rows={3}
            className="w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition duration-150 ease-in-out text-base placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="e.g., a cup with a santa hat"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            />
        </div>

        <div className="mt-4">
            <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                Artistic Style
            </label>
            <div className="flex flex-wrap gap-2">
                {styleOptions.map((style) => (
                    <button
                        key={style}
                        type="button"
                        onClick={() => setSelectedStyle(style)}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-[var(--color-primary-500)] disabled:cursor-not-allowed ${
                            selectedStyle === style
                            ? 'bg-[var(--color-primary-600)] text-white shadow'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                    >
                        {style}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Create My Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductGenerator;