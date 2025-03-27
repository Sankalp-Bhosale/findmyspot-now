
import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, iconPosition = 'left', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordType = type === 'password';

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-sm font-medium text-parking-dark">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-parking-gray">
              {icon}
            </div>
          )}
          
          <input
            type={isPasswordType ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              "w-full px-4 py-3 rounded-lg border border-parking-lightgray bg-white transition-colors",
              "focus:border-parking-yellow focus:outline-none",
              "placeholder:text-parking-gray/60",
              icon && iconPosition === 'left' ? 'pl-10' : '',
              icon && iconPosition === 'right' || isPasswordType ? 'pr-10' : '',
              error ? 'border-parking-error' : '',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {icon && iconPosition === 'right' && !isPasswordType && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-parking-gray">
              {icon}
            </div>
          )}
          
          {isPasswordType && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-parking-gray"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-parking-error mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
