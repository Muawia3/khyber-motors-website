import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const SpecificationEditor = ({ specifications = [], onChange }) => {
  const handleAddRow = () => {
    onChange([...specifications, { name: '', value: '' }]);
  };

  const handleRemoveRow = (index) => {
    const updated = specifications.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleRowChange = (index, key, val) => {
    const updated = specifications.map((row, idx) => {
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
            Technical Specifications Table Editor
          </label>
          <p className="text-[11px] text-gray-500">
            Add unlimited custom specification fields (e.g. Engine, Transmission, Payload, Towing).
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={handleAddRow}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          + Add Specification
        </Button>
      </div>

      {specifications.length > 0 ? (
        <div className="space-y-3">
          {specifications.map((row, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 rounded-xs border border-gray-200/80"
            >
              <div className="w-full sm:w-1/2">
                <Input
                  placeholder="Specification Name (e.g. Engine)"
                  value={row.name}
                  onChange={(e) => handleRowChange(idx, 'name', e.target.value)}
                  className="bg-white py-1.5 text-xs"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <Input
                  placeholder="Specification Value (e.g. 2.0L Turbo Diesel)"
                  value={row.value}
                  onChange={(e) => handleRowChange(idx, 'value', e.target.value)}
                  className="bg-white py-1.5 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRow(idx)}
                className="text-gray-400 hover:text-red-600 p-2 shrink-0 transition-colors"
                title="Delete Specification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xs text-center text-xs text-gray-500">
          No technical specifications added yet. Click "+ Add Specification" to create rows.
        </div>
      )}
    </div>
  );
};
