import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Search, Eye, Edit, Copy, Trash2, ExternalLink } from 'lucide-react';
import { AdminVehicleHeader } from '../../../components/admin/AdminVehicleHeader';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { vehicleService } from '../../../services/vehicleService';

export const PassengersList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const loadT9Products = async () => {
    const all = await vehicleService.getVehicles();
    const t9List = (all || []).filter(
      (v) =>
        v.category === 'jac-t9' ||
        v.category === 'passengers' ||
        v.category === 'pickups' ||
        v.slug?.includes('t9-') ||
        v.slug?.includes('hunter') ||
        v.slug?.includes('frison')
    );
    setVehicles(t9List);
  };

  useEffect(() => {
    document.title = 'JAC T9 Products | Admin CMS';
    loadT9Products();
  }, []);

  const handleDuplicate = async (id) => {
    const duplicated = await vehicleService.duplicateVehicle(id);
    if (duplicated) {
      loadT9Products();
    }
  };

  const handleConfirmDelete = async () => {
    if (vehicleToDelete) {
      await vehicleService.deleteVehicle(vehicleToDelete.id);
      loadT9Products();
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
            <Car className="w-5 h-5 text-[#C8102E]" />
            1. JAC T9 Series (Hunter, Frison)
          </h2>
          <p className="text-xs text-gray-500">
            Manage flagship double cabin pickup models in the product catalog.
          </p>
        </div>

        <Link to="/admin/products/new?category=jac-t9">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="uppercase font-bold tracking-wider"
          >
            + Add JAC T9 Model
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="p-4 border border-gray-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search JAC T9 models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="bg-gray-50 py-2 text-xs"
          />
        </div>

        <div className="text-xs font-semibold text-gray-500">
          Showing {filteredVehicles.length} T9 Models
        </div>
      </Card>

      {/* Table view */}
      <div className="hidden md:block bg-white border border-gray-200/80 rounded-xs shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-100/80 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Subcategory</th>
              <th className="px-4 py-3">Status</th>
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
                        /products/{vehicle.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700 capitalize">
                    {vehicle.subcategory || 'Double Cabin'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={vehicle.status || 'Published'} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link to={`/products/${vehicle.slug}`} target="_blank">
                        <Button variant="ghost" size="xs" leftIcon={<ExternalLink className="w-3.5 h-3.5 text-gray-500" />}>
                          View
                        </Button>
                      </Link>
                      <Link to={`/admin/products/${vehicle.id}/edit`}>
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
                  <p className="font-semibold text-sm">No JAC T9 products found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(vehicleToDelete)}
        title="Delete JAC T9 Model"
        message={`Are you sure you want to remove "${vehicleToDelete?.name}"?`}
        confirmText="Yes, Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setVehicleToDelete(null)}
      />
    </div>
  );
};

export default PassengersList;
