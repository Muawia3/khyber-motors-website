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
        <div className="relative h-36 sm:h-40 w-full bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden flex items-center justify-center">
          {/* Badge Overlays */}
          <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
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
            <div className="text-center p-2 space-y-1 text-gray-400">
              <Car className="w-7 h-7 mx-auto text-gray-500 stroke-[1.5]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {vehicle.name}
              </p>
              <p className="text-[10px] text-gray-500">Image to be added</p>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-3 pb-1">
          <div className="mb-1">
            <Link to={`/products/${vehicle.slug}`}>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-[#C8102E] transition-colors tracking-tight truncate">
                {vehicle.name}
              </h3>
            </Link>
            {vehicle.tagline ? (
              <p className="text-[11px] font-medium text-gray-500 mt-0.5 truncate">
                {vehicle.tagline}
              </p>
            ) : vehicle.overview ? (
              <p className="text-[11px] font-medium text-gray-500 mt-0.5 truncate">
                {vehicle.overview}
              </p>
            ) : null}
          </div>

          {/* Quick Spec Highlights Grid (Rendered only if real specs exist) */}
          {hasAnySpec && (
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 py-1 border-y border-gray-100 my-1.5 text-[11px] text-gray-600 bg-gray-50/70 px-2 rounded-xs">
              {engineVal && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Gauge className="w-3 h-3 text-[#C8102E] shrink-0" />
                  <span className="truncate">{engineVal}</span>
                </div>
              )}
              {fuelVal && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Fuel className="w-3 h-3 text-[#C8102E] shrink-0" />
                  <span className="truncate">{fuelVal}</span>
                </div>
              )}
              {transVal && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Shield className="w-3 h-3 text-[#C8102E] shrink-0" />
                  <span className="truncate">{transVal}</span>
                </div>
              )}
              {payloadVal && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Weight className="w-3 h-3 text-[#C8102E] shrink-0" />
                  <span className="truncate">{payloadVal}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-3 pt-0 grid grid-cols-2 gap-2">
        <Link to={`/products/${vehicle.slug}`} className="w-full">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            rightIcon={<ArrowRight className="w-3 h-3" />}
            className="!py-1.5 !text-xs !h-8"
          >
            Details
          </Button>
        </Link>
        <Link to="/contact" className="w-full">
          <Button variant="primary" size="sm" fullWidth className="!py-1.5 !text-xs !h-8">
            Contact
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default VehicleCard;
