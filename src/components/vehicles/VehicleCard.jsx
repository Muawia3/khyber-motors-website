import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Gauge, Fuel, Weight, ArrowRight, Car } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../ui/Button';

import { SafeImage } from '../common/SafeImage';

export const VehicleCard = ({ vehicle }) => {
  const imageSrc = vehicle.mainImage || vehicle.heroImage;

  return (
    <div className="group bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-gray-400 hover:-translate-y-1.5 transition-all duration-300 ease-out motion-reduce:hover:transform-none">
      {/* Top Banner & Image */}
      <div>
        <div className="relative aspect-16/10 bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden flex items-center justify-center">
          {/* Badge Overlays */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
            <Badge variant="gray">{vehicle.categoryLabel}</Badge>
          </div>

          {imageSrc ? (
            <SafeImage
              src={imageSrc}
              alt={vehicle.altText || vehicle.name}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out motion-reduce:transform-none"
            />
          ) : (
            <div className="text-center p-4 space-y-2 text-gray-400">
              <Car className="w-10 h-10 mx-auto text-gray-500 stroke-[1.5]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{vehicle.name}</p>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="mb-3">
            <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors tracking-tight">
              {vehicle.name}
            </h3>
            <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-1">
              {vehicle.tagline}
            </p>
          </div>

          {/* Quick Spec Highlights Grid */}
          <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-gray-100 my-4 text-xs text-gray-700 bg-gray-50/70 p-3 rounded-xs">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#C8102E] shrink-0" />
              <span className="truncate">{vehicle.specs.displacement || vehicle.specs.engine}</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-[#C8102E] shrink-0" />
              <span className="truncate">{vehicle.specs.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C8102E] shrink-0" />
              <span className="truncate">{vehicle.specs.transmission}</span>
            </div>
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4 text-[#C8102E] shrink-0" />
              <span className="truncate">
                {vehicle.specs.payloadCapacityKg
                  ? `${vehicle.specs.payloadCapacityKg} kg Payload`
                  : `${vehicle.specs.seatingCapacity} Seats`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-2">
        <Link to={`/vehicles/${vehicle.slug}`} className="w-full">
          <Button variant="outline" size="sm" fullWidth rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            View Details
          </Button>
        </Link>
        <Link to="/contact" className="w-full">
          <Button variant="primary" size="sm" fullWidth>
            Request Info
          </Button>
        </Link>
      </div>
    </div>
  );
};
