
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="w-16 h-16 border-4 border-[var(--color-primary-500)] border-dashed rounded-full animate-spin"></div>
      <p className="text-lg font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
        Bringing your idea to life...
      </p>
       <p className="text-sm text-slate-500 dark:text-slate-400">
        This can take a moment.
      </p>
    </div>
  );
};

export default LoadingSpinner;