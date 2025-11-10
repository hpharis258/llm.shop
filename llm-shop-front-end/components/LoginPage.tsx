import React, { useState } from 'react';
import { UserIcon, LockIcon } from './Icons';
import { Page } from '../types';
import { signIn, signInWithGoogle, resetPassword } from '../auth/firebaseClient';

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
    const [resetOpen, setResetOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMsg, setResetMsg] = useState<string | null>(null);
    const [resetLoading, setResetLoading] = useState(false);

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

    const handleGoogleSignUp = async () => {

            console.log("Google Sign-Up clicked");
              setError(null);
            setIsLoading(true);
            const result = await signInWithGoogle();
            console.log("Google Sign-Up result:", result);
            setIsLoading(false);
            if (result.error) {
            setError(result.error);
            return;
            }
            // on success
            onLogin();
        }

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
                                type="button"
                            >
                                Create an account
                            </button>
                        </div>

                        <div className="mt-2 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setResetOpen((v) => !v);
                                    setResetMsg(null);
                                    setResetEmail((prev) => prev || email);
                                }}
                                className="text-sm text-slate-600 dark:text-slate-300 hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {resetOpen && (
                            <div className="mt-3 p-3 rounded-md bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                                {resetMsg && (
                                    <div className="mb-2 text-sm text-emerald-700 dark:text-emerald-300">
                                        {resetMsg}
                                    </div>
                                )}
                                <label htmlFor="resetEmail" className="block text-sm font-medium text-slate-400 white:text-slate-600">
                                    Email address
                                </label>
                                <input
                                    id="resetEmail"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="mt-1 w-full p-3 bg-slate-100 white:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition"
                                    placeholder="your@email.com"
                                />
                                <div className="mt-3 flex gap-2">
                                    <button
                                        type="button"
                                        disabled={!resetEmail || resetLoading}
                                        onClick={async () => {
                                            setResetLoading(true);
                                            setResetMsg(null);
                                            const res = await resetPassword(resetEmail);
                                            setResetLoading(false);
                                            setResetMsg(
                                                res.ok
                                                    ? 'Password reset email sent. Check your inbox.'
                                                    : res.error || 'Failed to send reset email.'
                                            );
                                        }}
                                        className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] disabled:opacity-50"
                                    >
                                        {resetLoading ? 'Sending…' : 'Send reset link'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setResetOpen(false); setResetMsg(null); }}
                                        className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:underline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 text-center">
                            or
                        </div>

                        <div className="mt-2">
                            <button
                                onClick={() => handleGoogleSignUp()}
                                type="button"
                                className="w-full inline-flex items-center justify-center px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-100 text-[var(--color-primary-600)] hover:bg-slate-50 dark:hover:bg-slate-300 rounded-md shadow-sm font-medium transition"
                            >
                                <img
                                    src={'../images/google.png'}
                                    alt="Google logo"
                                    className="h-5 w-5 mr-3 hv:bg-slate-300 rounded-full"
                                />
                                <span>Sign in with Google</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;