import React from 'react';

const STATUS_STYLES = {
  // Lead Statuses
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Contacted: 'bg-purple-50 text-purple-700 border-purple-200',
  'Follow-up': 'bg-amber-50 text-amber-700 border-amber-200',
  Qualified: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Lost: 'bg-gray-100 text-gray-600 border-gray-200',

  // Vehicle / Customer Statuses
  Published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Draft: 'bg-amber-50 text-amber-700 border-amber-200',
  Hidden: 'bg-gray-100 text-gray-600 border-gray-200',
  'Active Lead': 'bg-blue-50 text-blue-700 border-blue-200',
  'Existing Owner': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Negotiation: 'bg-purple-50 text-purple-700 border-purple-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
};

export const StatusBadge = ({ status, className = '' }) => {
  const style = STATUS_STYLES[status] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-xs text-[11px] font-bold border uppercase tracking-wider ${style} ${className}`}
    >
      {status}
    </span>
  );
};
