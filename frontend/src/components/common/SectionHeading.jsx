import React from 'react';

export const SectionHeading = ({
  badge,
  title,
  subtitle,
  align = 'left',
  action,
  dark = false,
}) => {
  const isCenter = align === 'center';
  const isRight = align === 'right';

  return (
    <div
      className={`flex flex-col mb-4 sm:mb-6 ${
        isCenter
          ? 'text-center items-center mx-auto max-w-3xl'
          : isRight
          ? 'text-right items-end ml-auto'
          : 'text-left items-start'
      }`}
    >
      <div
        className={`flex flex-col ${
          isCenter
            ? 'items-center justify-center text-center'
            : 'sm:flex-row sm:items-end sm:justify-between'
        } w-full gap-2 sm:gap-3`}
      >
        <div className={`flex flex-col ${isCenter ? 'items-center text-center mx-auto' : ''}`}>
          {badge && (
            <span className="inline-block px-2.5 py-0.5 mb-1.5 text-xs font-bold uppercase tracking-widest text-[#C8102E] bg-red-50 border border-red-100 rounded-xs">
              {badge}
            </span>
          )}
          <h2
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight uppercase ${
              dark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`mt-1.5 text-xs sm:text-sm max-w-2xl leading-relaxed ${
                isCenter ? 'mx-auto text-center' : ''
              } ${dark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className={`shrink-0 mt-2 sm:mt-0 ${isCenter ? 'mx-auto' : ''}`}>
            {action}
          </div>
        )}
      </div>
      <div
        className={`w-12 h-1 bg-[#C8102E] mt-2.5 ${
          isCenter ? 'mx-auto' : isRight ? 'ml-auto' : ''
        }`}
      />
    </div>

  );
};

