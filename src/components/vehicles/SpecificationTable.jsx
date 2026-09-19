import React from 'react';

export const SpecificationTable = ({ specs }) => {
  if (!specs) return null;

  const specGroups = [
    {
      title: 'Engine & Performance',
      items: [
        { label: 'Engine Type', value: specs.engine },
        { label: 'Displacement', value: specs.displacement },
        { label: 'Maximum Power', value: specs.horsepower },
        { label: 'Maximum Torque', value: specs.torque },
        { label: 'Fuel Type', value: specs.fuelType },
      ],
    },
    {
      title: 'Transmission & Drivetrain',
      items: [
        { label: 'Transmission', value: specs.transmission },
        { label: 'Drive System', value: specs.driveType },
      ],
    },
    {
      title: 'Dimensions & Capacities',
      items: [
        { label: 'Overall Dimensions', value: specs.dimensions || 'To be confirmed by dealership' },
        { label: 'Wheelbase', value: specs.wheelbase || 'To be confirmed by dealership' },
        { label: 'Ground Clearance', value: specs.groundClearance || 'To be confirmed by dealership' },
        { label: 'Seating Capacity', value: `${specs.seatingCapacity} Persons` },
        { label: 'Payload Capacity', value: specs.payloadCapacityKg ? `${specs.payloadCapacityKg} kg` : 'To be confirmed by dealership' },
        { label: 'Towing Capacity', value: specs.towingCapacityKg || 'To be confirmed by dealership' },
        { label: 'Fuel Tank Capacity', value: specs.fuelTankCapacityLiters ? `${specs.fuelTankCapacityLiters} Liters` : 'To be confirmed by dealership' },
      ],
    },
    {
      title: 'Safety & Assistance',
      items: [
        { label: 'Safety Equipment Summary', value: specs.safetySummary || 'To be confirmed by dealership' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-xl font-bold uppercase text-gray-900">Technical Specifications</h3>
        <span className="text-[11px] text-gray-500 italic">
          *Values marked "To be confirmed by dealership" require official invoice specification verification.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {specGroups.map((group, idx) => (
          <div key={idx} className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-2xs">
            <div className="bg-gray-900 text-white p-3 text-xs font-extrabold uppercase tracking-wider">
              {group.title}
            </div>
            <div className="divide-y divide-gray-100 text-xs">
              {group.items.map((item, itemIdx) => {
                const isTbc = item.value === 'To be confirmed by dealership';
                return (
                  <div key={itemIdx} className="p-3 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                    <span className="font-medium text-gray-500">{item.label}</span>
                    <span className={`font-semibold text-right ${isTbc ? 'text-gray-400 italic font-normal' : 'text-gray-900'}`}>
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
