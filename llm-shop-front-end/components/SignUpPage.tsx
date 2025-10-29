import React, { useState } from 'react';
import { UserIcon, LockIcon } from './Icons';
import { signUp } from '../auth/firebaseClient';
import { Page } from '../types';

interface SignUpPageProps {
    onLogin: () => void;
    reason?: string;
    onNavigate: (page: Page) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onLogin, reason, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Password requirements
    const passwordRequirements = [
        { check: (p: string) => p.length >= 6, text: "At least 6 characters long" },
        { check: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p), text: "Contains a special character (!@#$%^&*)" },
        { check: (p: string) => /[0-9]/.test(p), text: "Contains a number" },
        { check: (p: string) => /[A-Z]/.test(p), text: "Contains an uppercase letter" },
    ];

    const meetsAllRequirements = (p: string) => passwordRequirements.every(req => req.check(p));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== passwordRepeat) {
            setError("Passwords do not match");
            return;
        }

        if (!meetsAllRequirements(password)) {
            setError("Please meet all password requirements");
            return;
        }

        setIsLoading(true);
        try {
            const result = await signUp(email, password);
            if (result.error) {
                setError(result.error);
            } else {
                onLogin();
                onNavigate('home');
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
                    Sign Up
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
                                placeholder="Create a strong password"
                            />
                        </div>
                        <div className="mt-2 space-y-2">
                            {passwordRequirements.map((req, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                        req.check(password) 
                                            ? 'bg-green-500 dark:bg-green-600' 
                                            : 'bg-slate-200 dark:bg-slate-700'
                                    }`}>
                                        {req.check(password) && (
                                            <span className="text-white text-xs">✓</span>
                                        )}
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        {req.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="passwordRepeat" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Confirm Password
                        </label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                id="passwordRepeat"
                                value={passwordRepeat}
                                onChange={(e) => setPasswordRepeat(e.target.value)}
                                required
                                className="pl-10 w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition"
                                placeholder="Repeat your password"
                            />
                        </div>
                        {password && passwordRepeat && password !== passwordRepeat && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                Passwords do not match
                            </p>
                        )}
                    </div>
                    <div>
                         <button
                            type="submit"
                            disabled={!email || !password || !passwordRepeat || password !== passwordRepeat || !meetsAllRequirements(password) || isLoading}
                            className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Creating account...' : 'Sign Up'}
                        </button>
                        <div className="mt-2 text-center">
                            <button
                                onClick={() => onNavigate('login')}
                                type="button"
                                className="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium"
                            >
                                Already have an account? Log in
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;