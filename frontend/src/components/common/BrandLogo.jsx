import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandLogo component displaying both official logos:
 * 1. JAC Khyber Motors
 * 2. Ghandhara Automobiles Limited
 */
export const BrandLogo = ({
  variant = 'light',   // 'light' (for light bg), 'dark' (for dark bg, wrapped in clean white container)
  size = 'md',         // 'sm', 'md', 'lg', 'xl'
  layout = 'horizontal', // 'horizontal' | 'stacked'
  to = '/',
  className = '',
  hideLink = false,
}) => {
  const sizeMap = {
    sm: {
      jac: 'h-8 sm:h-9.5',
      ghandhara: 'h-6 sm:h-7',
      divider: 'h-6 sm:h-7',
      container: 'gap-2.5 sm:gap-3 px-3 py-1.5',
    },
    md: {
      jac: 'h-10 sm:h-12 md:h-13',
      ghandhara: 'h-7.5 sm:h-9 md:h-9.5',
      divider: 'h-8 sm:h-9 md:h-10',
      container: 'gap-3 sm:gap-3.5 px-3.5 py-2',
    },
    lg: {
      jac: 'h-14 sm:h-16 md:h-18',
      ghandhara: 'h-10 sm:h-12 md:h-13.5',
      divider: 'h-10 sm:h-12 md:h-13',
      container: 'gap-4 sm:gap-5 px-4.5 py-3',
    },
    xl: {
      jac: 'h-18 sm:h-22',
      ghandhara: 'h-13 sm:h-16',
      divider: 'h-13 sm:h-16',
      container: 'gap-5 sm:gap-6 px-6 py-4',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = layout === 'stacked' ? (
    <div
      className={`flex flex-col items-center justify-center bg-white rounded-xs shadow-xs border border-gray-100/90 p-3 space-y-2.5 w-full max-w-[250px] transition-transform duration-200 group-hover:scale-[1.02] ${className}`}
    >
      <div className="flex items-center justify-center w-full">
        <img
          src="/logos/jac-khyber-logo.png"
          alt="JAC Khyber Motors"
          className={`${currentSize.jac} w-auto object-contain shrink-0`}
          loading="eager"
        />
      </div>
      <div className="w-full border-t border-gray-100" aria-hidden="true" />
      <div className="flex items-center justify-center w-full px-1">
        <img
          src="/logos/ghandhara-logo.png"
          alt="Ghandhara Automobiles Limited"
          className={`${currentSize.ghandhara} w-auto object-contain shrink-0`}
          loading="eager"
        />
      </div>
    </div>
  ) : (
    <div
      className={`inline-flex items-center max-w-full ${
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
    <Link to={to} className="inline-flex items-center group max-w-full">
      {content}
    </Link>
  );
};

export default BrandLogo;
