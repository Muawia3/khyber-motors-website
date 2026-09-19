import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car } from 'lucide-react';

export const AdminVehicleHeader = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: 'ALL VEHICLES', path: '/admin/vehicles' },
    { label: 'PASSENGERS', path: '/admin/vehicles/passengers' },
    { label: 'HEAVY TRUCKS', path: '/admin/vehicles/trucks/heavy' },
    { label: 'LIGHT TRUCKS', path: '/admin/vehicles/trucks/light' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 pt-4 pb-0 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-tight text-gray-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-[#C8102E]" />
            <span>Vehicles Management Suite</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Centralized inventory CMS for dealership commercial trucks, passenger pickups, and model specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/vehicles/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C8102E] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-red-700 transition-colors shadow-xs"
          >
            + New Vehicle Record
          </Link>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-gray-100 pt-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-[#C8102E] text-[#C8102E] bg-red-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
