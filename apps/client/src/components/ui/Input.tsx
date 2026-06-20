import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">{label}</label>}
        <input
          ref={ref}
          className={`w-full bg-dark-elevated border ${error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary'} rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors duration-200 shadow-inner ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-bold">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
