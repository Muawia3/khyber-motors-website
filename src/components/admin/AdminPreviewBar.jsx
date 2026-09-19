import React from 'react';
import { Eye, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

export const AdminPreviewBar = ({ onBackToEditor, vehicleName = 'Vehicle' }) => {
  return (
    <div className="sticky top-0 z-50 bg-[#111827] text-white border-b-2 border-[#C8102E] px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <span className="bg-[#C8102E] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xs flex items-center gap-1 tracking-wider shadow-xs">
          <Eye className="w-3.5 h-3.5" /> Preview Mode
        </span>
        <span className="text-xs text-gray-300 font-semibold hidden sm:inline">
          Viewing Public Layout for <strong className="text-white">{vehicleName}</strong> (Unsaved Changes)
        </span>
      </div>

      <Button
        type="button"
        variant="primary"
        size="xs"
        onClick={onBackToEditor}
        leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
      >
        Back to Editor
      </Button>
    </div>
  );
};
