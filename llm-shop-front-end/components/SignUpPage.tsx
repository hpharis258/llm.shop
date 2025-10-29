import React, { useState } from 'react';
import { UserIcon, LockIcon } from './Icons';
import {signUp} from '../auth/firebaseClient'
//import {}

interface SignUpPageProps {
    onLogin: () => void;
    reason?: string;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onLogin, reason }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordRepeat) {
            alert("Passwords do not match!");
            return;
        }
        // For this demo, any username/password is valid
        if (username && password && password === passwordRepeat) {
            //onLogin();
            signUp(username, password);
            console.log('User signed up:', username);
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
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            email
                        </label>
                        <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="pl-10 w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition"
                                placeholder="user@mail.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                                placeholder="********"
                            />
                        </div>
                    </div>
                      <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Repeat Password
                        </label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                id="password"
                                value={passwordRepeat}
                                onChange={(e) => setPasswordRepeat(e.target.value)}
                                required
                                className="pl-10 w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition"
                                placeholder="********"
                            />
                        </div>
                    </div>
                    <div>
                         <button
                            type="submit"
                            disabled={!username || !password}
                            className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Sign Up
                        </button>
                        <div className="mt-2 text-center">
                            <a
                                href="/login"
                                className="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium"
                            >
                                Already have an account? Log in
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;