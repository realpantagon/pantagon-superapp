import type { InputHTMLAttributes } from 'react';
import { cn } from '../utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error 
            ? 'border-red-500 dark:border-red-500' 
            : 'border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
          'placeholder-gray-400 dark:placeholder-gray-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
