import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { apiFetch } from '../../services/api';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    document.title = 'Customer Directory | Admin CRM';
    const fetchCustomers = async () => {
      try {
        const res = await apiFetch('/leads');
        if (res && res.success && Array.isArray(res.data)) {
          const formatted = res.data.map((item) => ({
            id: item.id,
            name: item.name,
            phone: item.phone,
            email: item.email || 'N/A',
            vehicleInterest: item.vehicleInterest || 'JAC Vehicle',
            type: item.department ? 'Contact Form' : 'Inquiry Lead',
            lastInteraction: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'Today',
            status: item.status || 'Active',
          }));
          setCustomers(formatted);
        }
      } catch (err) {
        console.warn('Failed to load customers from backend:', err);
      }
    };
    fetchCustomers();
  }, []);

  const columns = [
    {
      header: 'Customer Name',
      accessor: 'name',
      cell: (row) => (
        <div>
          <strong className="text-gray-900 block font-bold">{row.name}</strong>
          <span className="text-[10px] text-gray-400 font-mono">{row.id} • {row.type}</span>
        </div>
      ),
    },
    {
      header: 'Phone / Contact',
      accessor: 'phone',
      cell: (row) => (
        <div>
          <span className="font-mono text-gray-800 text-xs block">{row.phone}</span>
          <span className="text-[10px] text-gray-400">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Vehicle Interest',
      accessor: 'vehicleInterest',
      cell: (row) => <span className="font-medium text-gray-900">{row.vehicleInterest}</span>,
    },
    {
      header: 'Last Interaction',
      accessor: 'lastInteraction',
      cell: (row) => <span className="text-xs text-gray-600 font-mono">{row.lastInteraction}</span>,
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
          Customer Directory
        </h2>
        <p className="text-xs text-gray-500">
          View registered leads, commercial fleet clients, and existing JAC vehicle owners.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search by customer name, phone, or vehicle interest..."
        filterOptions={['Active Lead', 'Existing Owner', 'Negotiation']}
        filterKey="status"
        filterLabel="Status"
        pageSize={5}
      />
    </div>
  );
};
