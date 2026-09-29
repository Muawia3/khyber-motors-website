import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Gauge, Fuel, Weight, ArrowRight, Car } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../ui/Button';
import { SafeImage } from '../common/SafeImage';

export const VehicleCard = ({ vehicle }) => {
  if (!vehicle) return null;
  const imageSrc = vehicle.mainImage || vehicle.heroImage;
  const specs = vehicle.specs || {};

  const engineVal = specs.displacement || specs.engine || specs.Engine || '';
  const fuelVal = specs.fuelType || specs['Fuel Type'] || specs.fuel || '';
  const transVal = specs.transmission || specs.Transmission || '';
  const payloadVal = specs.payloadCapacityKg
    ? `${specs.payloadCapacityKg} kg Payload`
    : specs.payload || specs.Payload || (specs.seatingCapacity ? `${specs.seatingCapacity} Seats` : '');

  const hasAnySpec = Boolean(engineVal || fuelVal || transVal || payloadVal);

  return (
    <div className="group bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-gray-400 hover:-translate-y-1.5 transition-all duration-300 ease-out motion-reduce:hover:transform-none h-full">
      {/* Top Banner & Image */}
      <div>
        <div className="relative aspect-16/10 bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden flex items-center justify-center">
          {/* Badge Overlays */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
            <Badge variant="gray">{vehicle.categoryLabel || vehicle.category}</Badge>
            {vehicle.brand && <Badge variant="red">{vehicle.brand}</Badge>}
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
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {vehicle.name}
              </p>
              <p className="text-[10px] text-gray-500">Image to be added</p>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="mb-3">
            <Link to={`/products/${vehicle.slug}`}>
              <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors tracking-tight">
                {vehicle.name}
              </h3>
            </Link>
            {vehicle.tagline ? (
              <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-1">
                {vehicle.tagline}
              </p>
            ) : vehicle.overview ? (
              <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-1">
                {vehicle.overview}
              </p>
            ) : null}
          </div>

          {/* Quick Spec Highlights Grid (Rendered only if real specs exist) */}
          {hasAnySpec && (
            <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-gray-100 my-4 text-xs text-gray-700 bg-gray-50/70 p-3 rounded-xs">
              {engineVal && (
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#C8102E] shrink-0" />
                  <span className="truncate">{engineVal}</span>
                </div>
              )}
              {fuelVal && (
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-[#C8102E] shrink-0" />
                  <span className="truncate">{fuelVal}</span>
                </div>
              )}
              {transVal && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C8102E] shrink-0" />
                  <span className="truncate">{transVal}</span>
                </div>
              )}
              {payloadVal && (
                <div className="flex items-center gap-2">
                  <Weight className="w-4 h-4 text-[#C8102E] shrink-0" />
                  <span className="truncate">{payloadVal}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-2">
        <Link to={`/products/${vehicle.slug}`} className="w-full">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
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

export default VehicleCard;
