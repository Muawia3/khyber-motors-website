import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Copy, Trash2, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react';
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
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'jac-t9' | 'jac-commercial' | 'dongfeng'
  const [subcategoryFilter, setSubcategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Deletion modal state
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Load vehicles from local storage / dataset / API
  const loadVehicles = async () => {
    const list = await vehicleService.getVehicles();
    setVehicles(list || []);
  };

  useEffect(() => {
    document.title = 'Products Catalog | Admin CMS';
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

  // Reorder Handler (Move Up or Down)
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredVehicles.length) return;

    const reorderedList = [...filteredVehicles];
    const temp = reorderedList[index];
    reorderedList[index] = reorderedList[targetIndex];
    reorderedList[targetIndex] = temp;

    // Assign new sequential displayOrder
    const payload = reorderedList.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1,
    }));

    await vehicleService.reorderVehicles(payload);
    loadVehicles();
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      !searchTerm ||
      (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.category && v.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.subcategory && v.subcategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.tagline && v.tagline.toLowerCase().includes(searchTerm.toLowerCase()));

    const cat = (v.category || '').toLowerCase();
    const brand = (v.brand || '').toLowerCase();
    const slug = (v.slug || '').toLowerCase();

    let matchesCategory = true;
    if (categoryFilter !== 'ALL') {
      if (categoryFilter === 'jac-t9') {
        matchesCategory = cat === 'jac-t9' || cat === 'passengers' || slug.includes('t9-');
      } else if (categoryFilter === 'jac-commercial') {
        matchesCategory =
          cat === 'jac-commercial' ||
          (brand === 'jac' && (cat === 'trucks' || cat === 'commercial')) ||
          ['jac-x200', 'jac-1020', 'jac-1042', 'jac-1091', 'jac-1120'].includes(slug);
      } else if (categoryFilter === 'dongfeng') {
        matchesCategory = cat === 'dongfeng' || brand === 'dongfeng' || slug.includes('dongfeng');
      }
    }

    let matchesSubcategory = true;
    if (subcategoryFilter !== 'ALL') {
      matchesSubcategory =
        (v.subcategory || '').toLowerCase() === subcategoryFilter.toLowerCase() ||
        slug.includes(subcategoryFilter.toLowerCase());
    }

    const matchesStatus =
      statusFilter === 'ALL' ||
      (v.status && v.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <AdminVehicleHeader />

      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold uppercase text-gray-900 tracking-tight">
            Products Catalog
          </h2>
          <p className="text-xs text-gray-500">
            Manage product models, order, images, specifications, and brochures.
          </p>
        </div>

        <Link to="/admin/products/new">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="uppercase font-bold tracking-wider"
          >
            + Add Product
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 border border-gray-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="bg-gray-50 py-2 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <div className="w-44">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                const val = e.target.value;
                setCategoryFilter(val);
                setSubcategoryFilter('ALL');
              }}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'jac-t9', label: '1. JAC T9' },
                { value: 'jac-commercial', label: '2. JAC Commercial' },
                { value: 'dongfeng', label: '3. Dongfeng' },
              ]}
              className="bg-gray-50 py-1.5 text-xs border-gray-200"
            />
          </div>

          {/* Dynamic Subcategory Filter */}
          {categoryFilter === 'jac-t9' && (
            <div className="w-36 animate-fadeIn">
              <Select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All T9 Models' },
                  { value: 'hunter', label: 'Hunter' },
                  { value: 'frison', label: 'Frison' },
                ]}
                className="bg-gray-50 py-1.5 text-xs border-gray-200 font-semibold text-[#C8102E]"
              />
            </div>
          )}

          {categoryFilter === 'jac-commercial' && (
            <div className="w-40 animate-fadeIn">
              <Select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Commercial' },
                  { value: 'x200', label: 'X200' },
                  { value: '1020', label: '1020' },
                  { value: '1042', label: '1042' },
                  { value: '1091', label: '1091' },
                  { value: '1120', label: '1120' },
                ]}
                className="bg-gray-50 py-1.5 text-xs border-gray-200 font-semibold text-[#C8102E]"
              />
            </div>
          )}

          {categoryFilter === 'dongfeng' && (
            <div className="w-36 animate-fadeIn">
              <Select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Dongfeng' },
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
              <th className="px-3 py-3 w-16 text-center">Order</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Category & Hierarchy</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle, index) => (
                <tr key={vehicle.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* Order / Reorder Column */}
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[11px] font-bold text-gray-600">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === filteredVehicles.length - 1}
                        title="Move Down"
                        className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Image Column */}
                  <td className="px-4 py-3">
                    <img
                      src={vehicle.heroImage || vehicle.mainImage}
                      alt={vehicle.name}
                      className="w-14 h-10 object-cover rounded-xs border border-gray-200 bg-gray-100 shrink-0"
                    />
                  </td>

                  {/* Product Name Column */}
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

                  {/* Category Column */}
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-xs bg-gray-100 text-gray-800">
                      {vehicle.categoryLabel || vehicle.category}
                      {vehicle.subcategory ? ` → ${vehicle.subcategory}` : ''}
                      {vehicle.subSubcategory ? ` (${vehicle.subSubcategory})` : ''}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-3">
                    <StatusBadge status={vehicle.status || 'Published'} />
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3 text-right relative">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link to={`/products/${vehicle.slug}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="xs"
                          title="View Public Page"
                          leftIcon={<ExternalLink className="w-3.5 h-3.5 text-gray-500" />}
                        >
                          View
                        </Button>
                      </Link>

                      <Link to={`/admin/products/${vehicle.id}/edit`}>
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
                        title="Duplicate Product"
                        leftIcon={<Copy className="w-3.5 h-3.5 text-gray-500" />}
                      >
                        Copy
                      </Button>

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setVehicleToDelete(vehicle)}
                        title="Delete Product"
                        leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}
                        className="hover:bg-red-50"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-500">
                  <p className="font-semibold text-sm">No products found matching filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle, index) => (
            <div
              key={vehicle.id}
              className="bg-white border border-gray-200/80 p-4 rounded-xs shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={vehicle.heroImage || vehicle.mainImage}
                    alt={vehicle.name}
                    className="w-14 h-10 object-cover rounded-xs border border-gray-200 bg-gray-100"
                  />
                  <div>
                    <strong className="text-gray-900 block font-bold text-sm">
                      {vehicle.name}
                    </strong>
                    <span className="text-[10px] text-gray-500 font-semibold block">
                      {vehicle.categoryLabel || vehicle.category}
                    </span>
                  </div>
                </div>

                <StatusBadge status={vehicle.status || 'Published'} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-500 disabled:opacity-20 border rounded-xs"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === filteredVehicles.length - 1}
                    className="p-1 text-gray-500 disabled:opacity-20 border rounded-xs"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/products/${vehicle.slug}`} target="_blank" className="text-xs text-gray-500 underline">
                    Public
                  </Link>

                  <Link to={`/admin/products/${vehicle.id}/edit`}>
                    <Button variant="outline" size="xs">
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setVehicleToDelete(vehicle)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-xs">
            <p className="font-semibold text-sm">No products found matching filters.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(vehicleToDelete)}
        title="Delete Product"
        message={`Are you sure you want to remove "${vehicleToDelete?.name}"? This action will remove the product model from the catalog.`}
        confirmText="Yes, Delete Product"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setVehicleToDelete(null)}
      />
    </div>
  );
};

export default VehicleList;
