import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Copy, Trash2, ExternalLink, Truck } from 'lucide-react';
import { AdminVehicleHeader } from '../../../components/admin/AdminVehicleHeader';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { vehicleService } from '../../../services/vehicleService';

export const HeavyTrucksList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const loadHeavyTrucks = async () => {
    const all = await vehicleService.getVehicles();
    const heavy = (all || []).filter(
      (v) => (v.category === 'trucks' || v.category === 'commercial') && v.subcategory === 'heavy'
    );
    setVehicles(heavy);
  };

  useEffect(() => {
    document.title = 'Heavy Trucks Management | Admin CMS';
    loadHeavyTrucks();
  }, []);

  const handleDuplicate = async (id) => {
    const duplicated = await vehicleService.duplicateVehicle(id);
    if (duplicated) {
      loadHeavyTrucks();
    }
  };

  const handleConfirmDelete = async () => {
    if (vehicleToDelete) {
      await vehicleService.deleteVehicle(vehicleToDelete.id);
      loadHeavyTrucks();
      setVehicleToDelete(null);
    }
  };

  const filteredVehicles = vehicles.filter((v) =>
    !searchTerm ||
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.tagline && v.tagline.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <AdminVehicleHeader />

      {/* Page Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C8102E]" />
            Heavy Trucks
          </h2>
          <p className="text-xs text-gray-500">
            Manage all heavy-duty trucks available in the dealership catalog.
          </p>
        </div>

        <Link to="/admin/vehicles/new?category=trucks&subcategory=heavy">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="uppercase font-bold tracking-wider"
          >
            + Add Heavy Truck
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="p-4 border border-gray-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search heavy trucks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="bg-gray-50 py-2 text-xs"
          />
        </div>
        <div className="text-xs text-gray-500 font-semibold">
          Total Heavy Trucks: <strong className="text-gray-900">{vehicles.length}</strong>
        </div>
      </Card>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-gray-200/80 rounded-xs shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-100/80 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Truck Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <img
                      src={vehicle.heroImage || vehicle.mainImage}
                      alt={vehicle.name}
                      className="w-14 h-10 object-cover rounded-xs border border-gray-200 bg-gray-100 shrink-0"
                    />
                  </td>
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
                  <td className="px-4 py-3">
                    <StatusBadge status={vehicle.status || 'Published'} />
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-gray-500">
                    {vehicle.updatedAt
                      ? new Date(vehicle.updatedAt).toLocaleDateString()
                      : 'Default Stock'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link to={`/vehicles/${vehicle.slug}`} target="_blank">
                        <Button variant="ghost" size="xs" leftIcon={<ExternalLink className="w-3.5 h-3.5 text-gray-500" />}>
                          View
                        </Button>
                      </Link>
                      <Link to={`/admin/vehicles/${vehicle.id}/edit`}>
                        <Button variant="outline" size="xs" leftIcon={<Edit className="w-3.5 h-3.5 text-gray-700" />}>
                          Edit
                        </Button>
                      </Link>
                      <Button variant="ghost" size="xs" onClick={() => handleDuplicate(vehicle.id)} leftIcon={<Copy className="w-3.5 h-3.5 text-gray-500" />}>
                        Copy
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => setVehicleToDelete(vehicle)} leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}>
                        Del
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500 space-y-3">
                  <div className="text-base font-extrabold text-gray-900">No Heavy Trucks Yet</div>
                  <p className="text-xs text-gray-500">Heavy trucks added by the dealership will appear here.</p>
                  <Link to="/admin/vehicles/new?category=trucks&subcategory=heavy" className="inline-block mt-2">
                    <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      + Add Heavy Truck
                    </Button>
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
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
                  <p className="text-xs font-semibold text-gray-500">Heavy Truck</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                <Link to={`/vehicles/${vehicle.slug}`} target="_blank" className="text-gray-500 underline">
                  View Public
                </Link>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/vehicles/${vehicle.id}/edit`}>
                    <Button variant="outline" size="xs">Edit</Button>
                  </Link>
                  <Button variant="ghost" size="xs" onClick={() => setVehicleToDelete(vehicle)} className="text-red-600">
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center space-y-3 bg-white border border-gray-200">
            <div className="text-base font-extrabold text-gray-900">No Heavy Trucks Yet</div>
            <p className="text-xs text-gray-500">Heavy trucks added by the dealership will appear here.</p>
            <Link to="/admin/vehicles/new?category=trucks&subcategory=heavy" className="inline-block mt-2">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                + Add Heavy Truck
              </Button>
            </Link>
          </Card>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(vehicleToDelete)}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Heavy Truck?"
        message={vehicleToDelete ? `Remove "${vehicleToDelete.name}" from Heavy Trucks catalog?` : ''}
        confirmText="Delete Truck"
      />
    </div>
  );
};
