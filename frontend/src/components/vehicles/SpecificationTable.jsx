import React from 'react';

export const SpecificationTable = ({ specs }) => {
  if (!specs) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-200 p-6 rounded-sm text-center text-gray-400 text-xs">
        No technical specifications listed for this product yet.
      </div>
    );
  }

  // Handle both array of { name, value } and plain object { name: value }
  let entries = [];
  if (Array.isArray(specs)) {
    entries = specs.filter((s) => s && s.name && s.value && String(s.value).trim());
  } else if (typeof specs === 'object') {
    entries = Object.entries(specs)
      .filter(([key, val]) => val !== undefined && val !== null && String(val).trim() !== '')
      .map(([name, value]) => ({ name, value }));
  }

  if (entries.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-200 p-6 rounded-sm text-center text-gray-400 text-xs">
        No technical specifications listed for this product yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-xl font-bold uppercase text-gray-900">Technical Specifications</h3>
        <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
          Saved Factory Specs
        </span>
      </div>

      <div className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-2xs">
        <div className="divide-y divide-gray-100 text-xs">
          {entries.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
            >
              <span className="font-semibold text-gray-600 uppercase tracking-wide">
                {item.name.charAt(0).toUpperCase() + item.name.slice(1).replace(/([A-Z])/g, ' $1')}
              </span>
              <span className="font-bold text-gray-900 text-right">
                {String(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecificationTable;
