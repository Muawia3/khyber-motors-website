import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Copy, Trash2, MoreVertical, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { AdminVehicleHeader } from '../../../components/admin/AdminVehicleHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { vehicleService } from '../../../services/vehicleService';

export const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'passengers' | 'trucks'
  const [truckTypeFilter, setTruckTypeFilter] = useState('ALL'); // 'ALL' | 'heavy' | 'light'
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Deletion modal state
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Load vehicles from local storage / dataset / API
  const loadVehicles = async () => {
    const list = await vehicleService.getVehicles();
    setVehicles(list || []);
  };

  useEffect(() => {
    document.title = 'Vehicles Catalog | Admin CMS';
    loadVehicles();
  }, []);

  // Duplicate handler
  const handleDuplicate = async (id) => {
    const duplicated = await vehicleService.duplicateVehicle(id);
    if (duplicated) {
      loadVehicles();
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (vehicleToDelete) {
      await vehicleService.deleteVehicle(vehicleToDelete.id);
      loadVehicles();
      setVehicleToDelete(null);
    }
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      !searchTerm ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.category && v.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.tagline && v.tagline.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'ALL' ||
      v.category === categoryFilter ||
      (categoryFilter === 'passengers' && (v.category === 'pickups' || v.category === 'Passenger')) ||
      (categoryFilter === 'trucks' && (v.category === 'commercial' || v.category === 'Truck'));

    const matchesTruckType =
      categoryFilter !== 'trucks' ||
      truckTypeFilter === 'ALL' ||
      v.subcategory === truckTypeFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      v.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesTruckType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <AdminVehicleHeader />

      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
            Vehicles Catalog
          </h2>
          <p className="text-xs text-gray-500">
            Manage vehicle models and listings.
          </p>
        </div>

        <Link to="/admin/vehicles/new">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="uppercase font-bold tracking-wider"
          >
            + Add Vehicle
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 border border-gray-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="bg-gray-50 py-2 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <div className="w-36">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                const val = e.target.value;
                setCategoryFilter(val);
                if (val !== 'trucks') {
                  setTruckTypeFilter('ALL');
                }
              }}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'passengers', label: 'Passenger' },
                { value: 'trucks', label: 'Truck' },
              ]}
              className="bg-gray-50 py-1.5 text-xs border-gray-200"
            />
          </div>

          {categoryFilter === 'trucks' && (
            <div className="w-36 animate-fadeIn">
              <Select
                value={truckTypeFilter}
                onChange={(e) => setTruckTypeFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Trucks' },
                  { value: 'heavy', label: 'Heavy' },
                  { value: 'light', label: 'Light' },
                ]}
                className="bg-gray-50 py-1.5 text-xs border-gray-200 font-semibold text-[#C8102E]"
              />
            </div>
          )}

          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'Published', label: 'Published' },
                { value: 'Draft', label: 'Draft' },
              ]}
              className="bg-gray-50 py-1.5 text-xs border-gray-200"
            />
          </div>
        </div>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200/80 rounded-xs shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-100/80 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Vehicle Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* Image Column */}
                  <td className="px-4 py-3">
                    <img
                      src={vehicle.heroImage || vehicle.mainImage}
                      alt={vehicle.name}
                      className="w-14 h-10 object-cover rounded-xs border border-gray-200 bg-gray-100 shrink-0"
                    />
                  </td>

                  {/* Vehicle Name Column */}
                  <td className="px-4 py-3">
                    <div>
                      <strong className="text-gray-900 block font-bold text-sm">
                        {vehicle.name}
                      </strong>
                      <span className="text-[10px] text-gray-400 font-mono">
                        /{vehicle.slug}
                      </span>
                    </div>
                  </td>

                  {/* Category Column */}
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {vehicle.categoryLabel || (vehicle.category === 'passengers' ? 'Passenger' : 'Truck')}
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-3">
                    <StatusBadge status={vehicle.status || 'Published'} />
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3 text-right relative">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link to={`/vehicles/${vehicle.slug}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="xs"
                          title="View Public Page"
                          leftIcon={<ExternalLink className="w-3.5 h-3.5 text-gray-500" />}
                        >
                          View
                        </Button>
                      </Link>

                      <Link to={`/admin/vehicles/${vehicle.id}/edit`}>
                        <Button
                          variant="outline"
                          size="xs"
                          leftIcon={<Edit className="w-3.5 h-3.5 text-gray-700" />}
                        >
                          Edit
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDuplicate(vehicle.id)}
                        title="Duplicate Vehicle"
                        leftIcon={<Copy className="w-3.5 h-3.5 text-gray-500" />}
                      >
                        Copy
                      </Button>

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setVehicleToDelete(vehicle)}
                        title="Delete Vehicle"
                        leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}
                      >
                        Del
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No matching vehicles found in catalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="p-4 border border-gray-200 bg-white space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={vehicle.heroImage || vehicle.mainImage}
                alt={vehicle.name}
                className="w-16 h-12 object-cover rounded-xs border border-gray-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{vehicle.name}</h3>
                  <StatusBadge status={vehicle.status || 'Published'} />
                </div>
                <p className="text-xs text-gray-500 font-semibold">
                  {vehicle.categoryLabel || vehicle.category}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
              <Link to={`/vehicles/${vehicle.slug}`} target="_blank" className="text-gray-500 underline">
                View Public
              </Link>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="xs" onClick={() => handleDuplicate(vehicle.id)}>
                  Duplicate
                </Button>
                <Link to={`/admin/vehicles/${vehicle.id}/edit`}>
                  <Button variant="outline" size="xs">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setVehicleToDelete(vehicle)}
                  className="text-red-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(vehicleToDelete)}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Vehicle?"
        message={
          vehicleToDelete
            ? `This action will remove "${vehicleToDelete.name}" from the dealership catalog.`
            : 'This action will remove this vehicle from the dealership catalog.'
        }
        confirmText="Delete Vehicle"
      />
    </div>
  );
};
