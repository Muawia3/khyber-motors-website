import React, { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { vehicleService } from '../../services/vehicleService';

export const AdminVehicles = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const list = await vehicleService.getVehicles();
      const formatted = (list || []).map((vh) => ({
        id: vh.id,
        name: vh.name,
        tag: vh.categoryLabel || vh.tagline || vh.category,
        category: vh.category === 'passengers' ? 'Passenger' : 'Truck',
        status: vh.status || 'Published',
      }));
      setInventory(formatted);
    } catch (err) {
      console.warn('Failed loading vehicle catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Vehicle Catalog | Admin CRM';
    loadInventory();
  }, []);

  const columns = [
    {
      header: 'Vehicle Model',
      accessor: 'name',
      cell: (row) => (
        <div>
          <strong className="text-gray-900 block font-bold text-sm">{row.name}</strong>
          <span className="text-[11px] text-gray-500">{row.tag}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row) => (
        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-xs">
          {row.category}
        </span>
      ),
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
        <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight flex items-center gap-2">
          <Car className="w-5 h-5 text-[#C8102E]" /> Vehicle Catalog Management ({inventory.length})
        </h2>
        <p className="text-xs text-gray-500">
          Monitor and manage vehicles in your catalog.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading vehicles...</div>
      ) : (
        <DataTable
          columns={columns}
          data={inventory}
          searchKey="name"
          searchPlaceholder="Search by vehicle model name or tag..."
          filterOptions={['Published', 'Draft', 'Hidden']}
          filterKey="status"
          filterLabel="Status"
          pageSize={10}
        />
      )}
    </div>
  );
};
