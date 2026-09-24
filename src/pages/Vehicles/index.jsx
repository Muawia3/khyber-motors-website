import React, { useState, useMemo, useEffect } from 'react';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { VehicleCard } from '../../components/vehicles/VehicleCard';
import { EmptyState } from '../../components/common/EmptyState';
import { vehicleService } from '../../services/vehicleService';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { VehicleCardSkeleton } from '../../components/ui/Skeleton';

export const VehiclesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'passengers' | 'trucks'
  const [selectedTruckSubcategory, setSelectedTruckSubcategory] = useState('all-trucks'); // 'all-trucks' | 'heavy' | 'light'
  const [vehicles, setVehicles] = useState(() => vehicleService.getCachedVehicles() || []);
  const [loading, setLoading] = useState(() => !vehicleService.getCachedVehicles()?.length);

  useEffect(() => {
    document.title = 'Explore Our Vehicles | Khyber Motors';
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      'Discover JAC vehicles designed for performance, reliability, and demanding work. Browse our passenger pickups, heavy trucks, and light commercial haulers.'
    );

    // Load from vehicle service
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const list = await vehicleService.getVehicleCards();
        if (list && list.length > 0) {
          setVehicles(list);
        }
      } catch (err) {
        console.error('Failed to load vehicles from API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Requirement 7 Debug Logging: Trace data flow page -> API response -> vehicle name -> image URL
  useEffect(() => {
    if (import.meta.env.DEV && vehicles && vehicles.length > 0) {
      const t9Hunter = vehicles.find((v) => v.slug === 't9-hunter');
      const t9Frison = vehicles.find((v) => v.slug === 't9-frison');
      console.log('--- [VehiclesPage Debug Log] ---');
      console.log('page → API response → vehicle name → image URL');
      console.log(`Vehicles → API Vehicles Count: ${vehicles.length}`);
      console.log(`Vehicles → T9 Hunter mainImage: "${t9Hunter?.mainImage}"`);
      console.log(`Vehicles → T9 Frison mainImage: "${t9Frison?.mainImage}"`);
      console.log('--------------------------------');
    }
  }, [vehicles]);

  // Filtered vehicles based on category and truck subcategory
  const filteredVehicles = useMemo(() => {
    // Only show published / non-hidden vehicles on public catalog
    const visibleVehicles = vehicles.filter(
      (v) => v.status !== 'Draft' && v.status !== 'Hidden'
    );

    if (selectedCategory === 'all') {
      return visibleVehicles;
    }

    if (selectedCategory === 'passengers') {
      return visibleVehicles.filter(
        (v) => v.category === 'passengers' || v.category === 'pickups'
      );
    }

    if (selectedCategory === 'trucks') {
      const trucksList = visibleVehicles.filter(
        (v) => v.category === 'trucks' || v.category === 'commercial'
      );

      if (selectedTruckSubcategory === 'heavy') {
        return trucksList.filter((v) => v.subcategory === 'heavy');
      }

      if (selectedTruckSubcategory === 'light') {
        return trucksList.filter((v) => v.subcategory === 'light');
      }

      return trucksList;
    }

    return visibleVehicles;
  }, [selectedCategory, selectedTruckSubcategory, vehicles]);

  // Compute dynamic empty state text
  const emptyStateContent = useMemo(() => {
    if (selectedCategory === 'trucks') {
      if (selectedTruckSubcategory === 'heavy') {
        return {
          title: 'No Heavy Trucks Yet',
          description: 'Heavy trucks added by the dealership will appear here.',
        };
      }
      if (selectedTruckSubcategory === 'light') {
        return {
          title: 'No Light Trucks Yet',
          description: 'Light trucks added by the dealership will appear here.',
        };
      }
      return {
        title: 'No Trucks Yet',
        description: 'Trucks added by the dealership will appear here.',
      };
    }

    if (selectedCategory === 'passengers') {
      return {
        title: 'No passenger vehicles available.',
        description: 'Vehicles in this category will appear here when they are added.',
      };
    }

    return {
      title: 'No Vehicles Found',
      description: 'No vehicles match the selected category filter.',
    };
  }, [selectedCategory, selectedTruckSubcategory]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedTruckSubcategory('all-trucks');
  };

  return (
    <div className="space-y-6 pt-3 pb-6">
      <Container size="xl">
        <AnimatedSection direction="up">
          {/* 1. Page Hero */}
          <SectionHeading
            badge="JAC Lineup"
            title="Explore Our Vehicles"
            subtitle="Discover JAC vehicles designed for performance, reliability, and demanding work."
            align="center"
          />
        </AnimatedSection>

        {/* 2. Vehicle Category Filter Bar */}
        <AnimatedSection direction="up" delay={100}>
          <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-sm shadow-xs mb-6 space-y-4">

            {/* Top-Level Categories */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Category:
              </div>

              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Vehicle Category Filter">
                {[
                  { id: 'all', label: 'ALL' },
                  { id: 'passengers', label: 'PASSENGERS' },
                  { id: 'trucks', label: 'TRUCKS' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      if (cat.id === 'trucks') {
                        setSelectedTruckSubcategory('all-trucks');
                      }
                    }}
                    className={`px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
                      selectedCategory === cat.id
                        ? 'bg-[#C8102E] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Truck Subcategory Folder Navigation */}
            {selectedCategory === 'trucks' && (
              <div className="pt-2 animate-fadeIn space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C8102E]"></span>
                  Select Truck Subcategory:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'all-trucks',
                      title: 'ALL TRUCKS',
                      desc: 'View all heavy and light commercial trucks',
                    },
                    {
                      id: 'heavy',
                      title: 'HEAVY',
                      desc: 'Explore our heavy-duty trucks',
                    },
                    {
                      id: 'light',
                      title: 'LIGHT',
                      desc: 'Explore our light-duty trucks',
                    },
                  ].map((sub) => {
                    const isSelected = selectedTruckSubcategory === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedTruckSubcategory(sub.id)}
                        className={`p-3.5 rounded-xs border text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
                          isSelected
                            ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-extrabold text-xs tracking-wider uppercase flex items-center justify-between">
                          <span>{sub.title}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#C8102E]"></span>}
                        </div>
                        <p className={`text-[11px] mt-1 leading-tight ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                          {sub.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Category Result Count Bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-gray-500 font-semibold uppercase tracking-wider">
          <span>Showing {loading ? '...' : filteredVehicles.length} Vehicles</span>
          {selectedCategory !== 'all' && (
            <span className="text-[#C8102E] font-bold flex items-center gap-1.5">
              <span>Filter:</span>
              <span className="uppercase font-extrabold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-xs">
                {selectedCategory === 'passengers'
                  ? 'Passengers'
                  : `Trucks → ${
                      selectedTruckSubcategory === 'heavy'
                        ? 'Heavy'
                        : selectedTruckSubcategory === 'light'
                        ? 'Light'
                        : 'All Trucks'
                    }`}
              </span>
            </span>
          )}
        </div>

        {/* 3. Vehicle Grid or Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={emptyStateContent.title}
            description={emptyStateContent.description}
            onReset={handleResetFilters}
            resetText="Show All Vehicles"
          />
        )}
      </Container>
    </div>
  );
};
