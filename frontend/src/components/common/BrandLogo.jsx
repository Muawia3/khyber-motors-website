import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandLogo component displaying both official logos:
 * 1. JAC Khyber Motors
 * 2. Ghandhara Automobiles Limited
 */
export const BrandLogo = ({
  variant = 'light', // 'light' (for light bg), 'dark' (for dark bg, wrapped in clean white container for high contrast)
  size = 'md',       // 'sm', 'md', 'lg'
  to = '/',
  className = '',
  hideLink = false,
}) => {
  const sizeMap = {
    sm: {
      jac: 'h-6 sm:h-7',
      ghandhara: 'h-4 sm:h-5',
      divider: 'h-4 sm:h-5',
      container: 'gap-2 px-2 py-1',
    },
    md: {
      jac: 'h-8 sm:h-10',
      ghandhara: 'h-6 sm:h-7.5',
      divider: 'h-6 sm:h-7',
      container: 'gap-2.5 sm:gap-3 px-2.5 py-1.5',
    },
    lg: {
      jac: 'h-10 sm:h-12',
      ghandhara: 'h-7 sm:h-9',
      divider: 'h-7 sm:h-8',
      container: 'gap-3 sm:gap-4 px-3 py-2',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div
      className={`inline-flex items-center ${
        variant === 'dark'
          ? `bg-white rounded-xs shadow-xs border border-gray-100 ${currentSize.container}`
          : `items-center gap-2.5 sm:gap-3`
      } ${className}`}
    >
      <img
        src="/logos/jac-khyber-logo.png"
        alt="JAC Khyber Motors"
        className={`${currentSize.jac} w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105`}
        loading="eager"
      />
      <div
        className={`${currentSize.divider} w-px bg-gray-300 shrink-0`}
        aria-hidden="true"
      />
      <img
        src="/logos/ghandhara-logo.png"
        alt="Ghandhara Automobiles Limited"
        className={`${currentSize.ghandhara} w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105`}
        loading="eager"
      />
    </div>
  );

  if (hideLink) {
    return content;
  }

  return (
    <Link to={to} className="inline-flex items-center group">
      {content}
    </Link>
  );
};

export default BrandLogo;
