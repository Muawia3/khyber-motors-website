import React from 'react';

export const Checkbox = React.forwardRef(
  ({ label, error, helperText, className = '', id, required = false, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5">
            <input
              id={checkboxId}
              ref={ref}
              type="checkbox"
              required={required}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${checkboxId}-error` : undefined}
              className={`w-4 h-4 text-[#C8102E] bg-white border rounded-xs focus:ring-2 focus:ring-[#111827] focus:outline-none transition-colors cursor-pointer accent-[#C8102E] ${
                error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
              } ${className}`}
              {...props}
            />
          </div>
          {label && (
            <label htmlFor={checkboxId} className="text-xs text-gray-700 font-medium cursor-pointer select-none leading-tight">
              {label}
              {required && <span className="text-[#C8102E] ml-1">*</span>}
            </label>
          )}
        </div>
        {error ? (
          <p id={`${checkboxId}-error`} className="mt-1.5 text-xs text-red-600 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
