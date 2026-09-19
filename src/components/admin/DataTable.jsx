import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const DataTable = ({
  columns,
  data = [],
  searchKey = 'customerName',
  searchPlaceholder = 'Search records...',
  filterOptions = [],
  filterKey = 'status',
  filterLabel = 'Filter Status',
  actions,
  pageSize = 5,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search logic
  const filteredData = data.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      (item[searchKey] &&
        String(item[searchKey]).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.phone && item.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.vehicle && item.vehicle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterValue === 'ALL' || item[filterKey] === filterValue;

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white border border-gray-200/80 rounded-xs shadow-xs overflow-hidden">
      {/* Top Filter Bar */}
      <div className="p-4 border-b border-gray-200/80 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="bg-white py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {filterOptions.length > 0 && (
            <div className="w-44">
              <Select
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: `All ${filterLabel}s` },
                  ...filterOptions.map((opt) => ({
                    value: opt,
                    label: opt,
                  })),
                ]}
                className="bg-white py-2 text-xs"
              />
            </div>
          )}

          {actions}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-100/80 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-gray-50/80 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3.5 ${col.className || ''}`}>
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-gray-300" />
                    <p className="font-semibold text-gray-700 text-sm">No matching records found</p>
                    <p className="text-xs text-gray-400">Try adjusting your search terms or filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      <div className="p-3 border-t border-gray-200/80 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing{' '}
          <strong className="text-gray-900 font-semibold">
            {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </strong>{' '}
          to{' '}
          <strong className="text-gray-900 font-semibold">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </strong>{' '}
          of <strong className="text-gray-900 font-semibold">{filteredData.length}</strong> entries
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-1.5 rounded-xs border border-gray-300 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 font-bold text-gray-900">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-1.5 rounded-xs border border-gray-300 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
