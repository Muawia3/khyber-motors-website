import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Card } from '../../components/ui/Card';

export const AdminSales = () => {
  const [sales] = useState([]);

  useEffect(() => {
    document.title = 'Sales Overview | Admin CRM';
  }, []);

  const columns = [
    {
      header: 'Sale ID',
      accessor: 'id',
      cell: (row) => <span className="font-mono text-gray-500 text-[11px]">{row.id}</span>,
    },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row) => <strong className="text-gray-900 block font-semibold">{row.customer}</strong>,
    },
    {
      header: 'Vehicle Model(s)',
      accessor: 'vehicle',
      cell: (row) => <span className="font-medium text-gray-900">{row.vehicle}</span>,
    },
    {
      header: 'Delivery Date',
      accessor: 'date',
      cell: (row) => <span className="font-mono text-xs text-gray-600">{row.date}</span>,
    },
    {
      header: 'Sales Rep',
      accessor: 'salesAgent',
      cell: (row) => <span className="text-xs text-gray-700 font-medium">{row.salesAgent}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
          Sales &amp; Delivery Log
        </h2>
        <p className="text-xs text-gray-500">
          Track completed vehicle sales transactions and fleet deliveries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border border-gray-200/80 bg-white">
          <span className="text-xs font-bold text-gray-500 uppercase">Monthly Sales Volume</span>
          <span className="text-2xl font-extrabold text-gray-900 font-mono block mt-1">{sales.length} Units</span>
          <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-xs mt-2 inline-block">
            0% Growth (0 Delivered)
          </span>
        </Card>

        <Card className="p-5 border border-gray-200/80 bg-white">
          <span className="text-xs font-bold text-gray-500 uppercase">Top Selling Model</span>
          <span className="text-2xl font-extrabold text-gray-900 block mt-1">
            {sales.length > 0 ? 'JAC T9 4x4' : 'N/A (0 Sales)'}
          </span>
          <span className="text-[10px] text-gray-500 block mt-2">0% of total sales volume</span>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={sales}
        searchKey="customer"
        searchPlaceholder="Search by customer, vehicle, or sales rep..."
        pageSize={5}
      />
    </div>
  );
};
