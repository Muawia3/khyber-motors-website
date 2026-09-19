import React from 'react';

export const Textarea = React.forwardRef(
  ({ label, error, helperText, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            {label}
            {props.required && <span className="text-[#C8102E] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={`w-full px-3.5 py-2.5 bg-white border text-sm text-gray-900 rounded-xs focus:outline-none transition-colors ${
            error
              ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-300 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p id={`${textareaId}-error`} className="mt-1 text-xs text-red-600 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
