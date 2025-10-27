import React from 'react';
import { SunIcon, MoonIcon, SystemIcon } from './Icons';

export type BaseTheme = 'light' | 'dark' | 'system';
export type AccentColor = 'indigo' | 'sunset' | 'ocean';

interface AppearanceOptionProps {
  value: BaseTheme;
  currentTheme: BaseTheme;
  setTheme: (theme: BaseTheme) => void;
  label: string;
  icon: React.ReactNode;
}

const AppearanceOption: React.FC<AppearanceOptionProps> = ({ value, currentTheme, setTheme, label, icon }) => {
  const isSelected = currentTheme === value;
  return (
    <button
      onClick={() => setTheme(value)}
      className={`w-full md:w-auto flex-1 flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all duration-200 ${
        isSelected
          ? 'bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900-50)] border-[var(--color-primary-500)] shadow-lg scale-105'
          : 'bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 hover:border-[var(--color-primary-400)] hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span className="mt-2 font-semibold text-lg">{label}</span>
    </button>
  );
};

interface AccentColorOptionProps {
  value: AccentColor;
  currentColor: AccentColor;
  setColor: (color: AccentColor) => void;
  label: string;
  colorClass: string;
}

const AccentColorOption: React.FC<AccentColorOptionProps> = ({ value, currentColor, setColor, label, colorClass }) => {
    const isSelected = currentColor === value;
    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={() => setColor(value)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 border-4 ${colorClass} ${
                    isSelected ? 'border-[var(--color-primary-500)] scale-110' : 'border-transparent hover:border-slate-400'
                }`}
                aria-label={`Select ${label} theme`}
            ></button>
            <span className={`text-sm font-medium ${isSelected ? 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]' : 'text-slate-600 dark:text-slate-400'}`}>{label}</span>
        </div>
    );
}


interface SettingsPageProps {
  baseTheme: BaseTheme;
  setBaseTheme: (theme: BaseTheme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ baseTheme, setBaseTheme, accentColor, setAccentColor }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-12">
      <div>
        <h2 className="text-4xl font-extrabold text-center text-slate-900 dark:text-white mb-4">
          Settings
        </h2>
        <p className="text-center text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Customize the look and feel of yourchoicemarket.com to your preference.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            Appearance
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
            <AppearanceOption
                value="light"
                currentTheme={baseTheme}
                setTheme={setBaseTheme}
                label="Light"
                icon={<SunIcon className="w-12 h-12 text-amber-500" />}
            />
            <AppearanceOption
                value="dark"
                currentTheme={baseTheme}
                setTheme={setBaseTheme}
                label="Dark"
                icon={<MoonIcon className="w-12 h-12 text-indigo-400" />}
            />
            <AppearanceOption
                value="system"
                currentTheme={baseTheme}
                setTheme={setBaseTheme}
                label="System"
                icon={<SystemIcon className="w-12 h-12 text-slate-500" />}
            />
        </div>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 text-center">
            Selecting 'System' will automatically match your device's light or dark mode settings.
        </p>
      </div>
      
      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            Accent Color
        </h3>
        <div className="flex justify-center gap-8 md:gap-12">
            <AccentColorOption
                value="indigo"
                currentColor={accentColor}
                setColor={setAccentColor}
                label="Indigo"
                colorClass="bg-indigo-500"
            />
            <AccentColorOption
                value="sunset"
                currentColor={accentColor}
                setColor={setAccentColor}
                label="Sunset"
                colorClass="bg-orange-500"
            />
            <AccentColorOption
                value="ocean"
                currentColor={accentColor}
                setColor={setAccentColor}
                label="Ocean"
                colorClass="bg-teal-500"
            />
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;