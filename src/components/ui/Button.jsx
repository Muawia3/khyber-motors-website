import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#111827] rounded-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const isDarkOutline = className.includes('text-white') || className.includes('border-gray-500') || className.includes('border-gray-600');

  const variantClasses = {
    primary: 'bg-[#C8102E] text-white hover:bg-[#A80C24] active:bg-[#8A0A1D] shadow-xs',
    secondary: 'bg-[#1F2937] text-white hover:bg-[#111827] active:bg-black',
    dark: 'bg-[#111827] text-white hover:bg-black active:bg-gray-900',
    outline: isDarkOutline
      ? 'border border-gray-600 text-white bg-gray-900/90 hover:bg-gray-800 hover:border-gray-500 active:bg-black'
      : 'border border-gray-300 text-gray-800 bg-white hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100',
    'outline-dark': 'border border-gray-600 text-white bg-gray-900/90 hover:bg-gray-800 hover:border-gray-500 active:bg-black',
    ghost: 'text-gray-700 bg-transparent hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
  };

  const sizes = {
    xs: 'text-[11px] px-2.5 py-1 gap-1 uppercase tracking-wider font-semibold min-h-[32px]',
    sm: 'text-xs px-3 py-1.5 gap-1.5 uppercase tracking-wider font-semibold min-h-[36px]',
    md: 'text-sm px-4 py-2.5 gap-2 font-semibold min-h-[42px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 uppercase tracking-wider font-bold min-h-[48px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantClasses[variant] || variantClasses.primary} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
