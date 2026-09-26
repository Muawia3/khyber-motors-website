import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { getFileUrl } from '../../utils/urlHelper';

export const SafeImage = ({
  src,
  alt = 'JAC Vehicle',
  className = '',
  loading = 'lazy',
  fallback,
  iconSize = 'w-8 h-8',
  onLoad,
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = getFileUrl(src);

  useEffect(() => {
    setHasError(false);
  }, [src, resolvedUrl]);

  const handleError = (e) => {
    if (import.meta.env.DEV) {
      console.warn(`[SafeImage] Image failed to load: "${resolvedUrl}" (original: "${src}")`);
    }
    setHasError(true);
    if (onError) onError(e);
  };

  if (!resolvedUrl || hasError) {
    if (fallback) {
      return fallback;
    }
    return (
      <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 flex flex-col items-center justify-center p-4 text-gray-400 text-center select-none ${className}`}>
        <ImageIcon className={`${iconSize} text-gray-500 mb-1 stroke-[1.5]`} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 line-clamp-1">
          {alt || 'JAC Vehicle'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      loading={loading}
      onError={handleError}
      onLoad={onLoad}
      className={className}
      {...props}
    />
  );
};

export default SafeImage;
