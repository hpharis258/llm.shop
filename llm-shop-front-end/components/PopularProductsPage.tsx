import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { useCart } from './contexts';

// Fix: Correctly type the array of objects by wrapping the type in parentheses.
const popularProductsData: (Omit<Product, 'imageUrl'> & { description: string })[] = [
    {
        title: "Cosmic Cat Astronaut Mug",
        price: "24.99",
        description: "A cartoon mug of a cat in an astronaut helmet floating in space."
    },
    {
        title: "Steampunk Corgi T-Shirt",
        price: "29.99",
        description: "A realistic t-shirt graphic of a Corgi wearing steampunk goggles and a top hat."
    },
    {
        title: "Watercolor Jellyfish Phone Case",
        price: "21.50",
        description: "A phone case with a beautiful watercolor painting of a translucent jellyfish."
    },
    {
        title: "Synthwave Sunset Tote Bag",
        price: "34.00",
        description: "A tote bag featuring a vibrant synthwave-style sunset with a grid landscape."
    },
    {
        title: "Pixel Art Dragon Poster",
        price: "19.99",
        description: "A poster showing a detailed pixel art rendition of a majestic green dragon."
    },
    {
        title: "Cartoon Avocado Yoga Mat",
        price: "45.75",
        description: "A yoga mat covered in a pattern of cute cartoon avocados doing yoga poses."
    }
];


// Generates a simple, consistent SVG placeholder to avoid external image dependencies.
function placeholderSvg(text: string) {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23475569" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20px" fill="%23e2e8f0" text-anchor="middle">${text}</text></svg>`;
}

const PopularProductsPage: React.FC = () => {
    const { addToCart } = useCart();
    
    const products: Product[] = popularProductsData.map(p => ({...p, imageUrl: placeholderSvg(p.description)}));

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-extrabold text-center text-slate-900 dark:text-white mb-4">
                Popular Creations
            </h2>
            <p className="text-center text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
                Discover and purchase unique products imagined by our community. These are some of our all-time favorites!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                    <ProductCard
                        key={product.title}
                        product={product}
                        onAddToCart={addToCart}
                    />
                ))}
            </div>
        </div>
    );
};

export default PopularProductsPage;