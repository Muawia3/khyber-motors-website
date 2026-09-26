import React from 'react';

export const Badge = ({
  children,
  variant = 'red',
  size = 'md',
}) => {
  const variants = {
    red: 'bg-[#C8102E] text-white',
    dark: 'bg-[#111827] text-white',
    gray: 'bg-gray-100 text-gray-800 border border-gray-200',
    green: 'bg-emerald-700 text-white',
    outline: 'border border-[#C8102E] text-[#C8102E] bg-white',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 font-bold uppercase tracking-wider',
  };

  return (
    <span className={`inline-flex items-center rounded-xs ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
