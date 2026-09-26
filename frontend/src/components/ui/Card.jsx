import React from 'react';

export const Card = ({
  children,
  hoverable = false,
  bordered = true,
  className = '',
  ...props
}) => {
  const hoverClass = hoverable
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-gray-300'
    : '';
  const borderClass = bordered ? 'border border-gray-200' : '';

  return (
    <div
      className={`bg-white rounded-sm ${borderClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
