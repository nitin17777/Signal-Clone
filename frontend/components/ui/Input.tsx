import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        {label && <label className="text-xs font-medium text-text-secondary">{label}</label>}
        <input
          ref={ref}
          className={`w-full rounded-panel bg-bg-panel px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary border border-neutral-700 focus:border-accent-blue focus:outline-none transition-colors disabled:opacity-50 ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
