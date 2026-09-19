import React from 'react';

export const LoadingState = ({
  message = 'Loading vehicle details...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-100 rounded-sm">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#C8102E] rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-gray-700 tracking-wide uppercase">{message}</p>
    </div>
  );
};
