import React, { useState } from 'react';
import { UserIcon, LockIcon } from './Icons';
import { Page } from '../types';
import { signIn } from '../auth/firebaseClient';

interface LoginPageProps {
    onLogin: () => void;
    reason?: string;
    onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, reason, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        try {
            const result = await signIn(email, password);
            if (result.error) {
                setError(result.error);
            } else {
                onLogin();
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto animate-fade-in">
            <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                {reason && (
                    <div className="mb-4 text-center p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
                        <p className="text-sm text-blue-800 dark:text-blue-200">{reason}</p>
                    </div>
                )}
                <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-6">
                    Sign In
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email
                        </label>
                        <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="pl-10 w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Password
                        </label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pl-10 w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>
                    <div>
                         <button
                            type="submit"
                            disabled={!email || !password || isLoading}
                            className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <div className="mt-2 text-center">
                            <button
                                onClick={() => window.location.href = '/signup'}
                                className="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium"
                            >
                                Create an account
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;