import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const HighlightsEditor = ({ highlights = [], onChange }) => {
  const handleAddRow = () => {
    onChange([...highlights, { title: '', description: '', icon: 'ShieldCheck' }]);
  };

  const handleRemoveRow = (index) => {
    const updated = highlights.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleRowChange = (index, key, val) => {
    const updated = highlights.map((row, idx) => {
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
            Vehicle Key Highlights (4 Highlight Cards)
          </label>
          <p className="text-[11px] text-gray-500">
            Showcase core value propositions (e.g. Capability, Comfort, Practicality).
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={handleAddRow}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          + Add Highlight
        </Button>
      </div>

      {highlights.length > 0 ? (
        <div className="space-y-3">
          {highlights.map((row, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 rounded-xs border border-gray-200/80"
            >
              <div className="w-full sm:w-4/12">
                <Input
                  placeholder="Highlight Title (e.g. Capability)"
                  value={row.title}
                  onChange={(e) => handleRowChange(idx, 'title', e.target.value)}
                  className="bg-white py-1.5 text-xs"
                />
              </div>
              <div className="w-full sm:w-7/12">
                <Input
                  placeholder="Highlight Description"
                  value={row.description}
                  onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                  className="bg-white py-1.5 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRow(idx)}
                className="text-gray-400 hover:text-red-600 p-2 shrink-0 transition-colors"
                title="Delete Highlight"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xs text-center text-xs text-gray-500">
          No key highlights added yet. Click "+ Add Highlight" to add items.
        </div>
      )}
    </div>
  );
};
