import React from 'react';

const AboutPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-extrabold text-center text-slate-900 dark:text-white mb-6">Welcome to the Future of Shopping</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6 bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <p>
                    At <span className="font-bold text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)]">yourchoicemarket.com</span>, we believe that the perfect product is one that comes directly from your imagination. Have you ever wished for a coffee mug with a lazy sloth in a spacesuit, or a t-shirt featuring a philosophical slice of pizza? Now, you don't just have to dream it—you can create it.
                </p>
                <p>
                    Our revolutionary platform harnesses the power of cutting-edge generative AI to bring your ideas to life. Simply describe the product you want, choose an artistic style, and watch as our AI crafts a unique, high-quality image of your creation in seconds.
                </p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 !mb-4">How It Works</h3>
                <ol className="list-decimal pl-5 space-y-2">
                    <li><strong className="font-semibold">Describe:</strong> Go to our 'Create' page and type a detailed description of your desired product into the text box. The more descriptive you are, the better the result!</li>
                    <li><strong className="font-semibold">Style:</strong> Select an artistic style that matches your vision, whether it's photorealistic, a playful cartoon, or an elegant watercolor painting.</li>
                    <li><strong className="font-semibold">Create:</strong> Hit the "Create My Product" button. Our AI will get to work, generating a one-of-a-kind product image and title just for you.</li>
                    <li><strong className="font-semibold">Purchase:</strong> Love what you see? You can purchase your custom item right away. Each product is made to order, ensuring it's as unique as the idea that inspired it.</li>
                </ol>
                <p className="!mt-8">
                    We're not just a store; we're a canvas for your creativity. So go ahead, let your imagination run wild. The perfect product is waiting to be invented by you.
                </p>
            </div>
        </div>
    );
};

export default AboutPage;