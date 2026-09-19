import React from 'react';
import { SearchX } from 'lucide-react';
import { Button } from '../ui/Button';

export const EmptyState = ({
  title = 'No Vehicles Match Your Search',
  description = 'Try adjusting your filters or category selection to explore available JAC models.',
  onReset,
  resetText = 'Clear All Filters',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-200 rounded-sm">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
        <SearchX className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-md">{description}</p>
      {onReset && (
        <div className="mt-6">
          <Button variant="outline" size="sm" onClick={onReset}>
            {resetText}
          </Button>
        </div>
      )}
    </div>
  );
};
