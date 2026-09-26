import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const FeatureEditor = ({ features = [], onChange }) => {
  const handleAddRow = () => {
    onChange([...features, { title: '', description: '' }]);
  };

  const handleRemoveRow = (index) => {
    const updated = features.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleRowChange = (index, key, val) => {
    const updated = features.map((row, idx) => {
      if (idx === index) {
        return { ...row, [key]: val };
      }
      return row;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Vehicle Features & Equipment Editor
          </label>
          <p className="text-[11px] text-gray-500">
            Manage safety, comfort, technology, and performance features.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={handleAddRow}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          + Add Feature
        </Button>
      </div>

      {features.length > 0 ? (
        <div className="space-y-3">
          {features.map((row, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 rounded-xs border border-gray-200/80"
            >
              <div className="w-full sm:w-5/12">
                <Input
                  placeholder="Feature Name (e.g. 10.4-inch Touchscreen)"
                  value={row.title}
                  onChange={(e) => handleRowChange(idx, 'title', e.target.value)}
                  className="bg-white py-1.5 text-xs"
                />
              </div>
              <div className="w-full sm:w-6/12">
                <Input
                  placeholder="Short Description (Optional)"
                  value={row.description}
                  onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                  className="bg-white py-1.5 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRow(idx)}
                className="text-gray-400 hover:text-red-600 p-2 shrink-0 transition-colors"
                title="Delete Feature"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xs text-center text-xs text-gray-500">
          No features added yet. Click "+ Add Feature" to add items.
        </div>
      )}
    </div>
  );
};
