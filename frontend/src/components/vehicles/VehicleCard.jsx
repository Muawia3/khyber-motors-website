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
        <div className="relative aspect-video bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden flex items-center justify-center">
          {/* Badge Overlays */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5">
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
            <div className="text-center p-3 space-y-1.5 text-gray-400">
              <Car className="w-8 h-8 mx-auto text-gray-500 stroke-[1.5]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {vehicle.name}
              </p>
              <p className="text-[10px] text-gray-500">Image to be added</p>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 pb-2">
          <div className="mb-2">
            <Link to={`/products/${vehicle.slug}`}>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#C8102E] transition-colors tracking-tight">
                {vehicle.name}
              </h3>
            </Link>
            {vehicle.tagline ? (
              <p className="text-xs font-medium text-gray-500 mt-0.5 line-clamp-1">
                {vehicle.tagline}
              </p>
            ) : vehicle.overview ? (
              <p className="text-xs font-medium text-gray-500 mt-0.5 line-clamp-1">
                {vehicle.overview}
              </p>
            ) : null}
          </div>

          {/* Quick Spec Highlights Grid (Rendered only if real specs exist) */}
          {hasAnySpec && (
            <div className="grid grid-cols-2 gap-2 py-2 border-y border-gray-100 my-2.5 text-xs text-gray-700 bg-gray-50/70 px-2.5 rounded-xs">
              {engineVal && (
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                  <span className="truncate">{engineVal}</span>
                </div>
              )}
              {fuelVal && (
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                  <span className="truncate">{fuelVal}</span>
                </div>
              )}
              {transVal && (
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                  <span className="truncate">{transVal}</span>
                </div>
              )}
              {payloadVal && (
                <div className="flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
                  <span className="truncate">{payloadVal}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-4 pt-1 grid grid-cols-2 gap-2">
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
