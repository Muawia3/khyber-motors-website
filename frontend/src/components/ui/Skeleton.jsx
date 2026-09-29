import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`bg-gray-200/80 animate-pulse rounded-xs ${className}`}
      {...props}
    />
  );
};

export const VehicleCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col justify-between shadow-xs">
      <div className="aspect-video bg-gray-200/90 animate-pulse" />
      <div className="p-4 pb-2 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
        </div>
      </div>
      <div className="p-4 pt-1 grid grid-cols-2 gap-2">
        <Skeleton className="h-8 w-full rounded-xs" />
        <Skeleton className="h-8 w-full rounded-xs" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 4, cols = 4 }) => {
  return (
    <div className="space-y-3 p-4 bg-white border border-gray-200 rounded-xs">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3 border-b border-gray-100 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
