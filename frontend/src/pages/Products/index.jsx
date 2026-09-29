import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, ChevronRight, Layers, ArrowRight, Check } from 'lucide-react';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { VehicleCard } from '../../components/vehicles/VehicleCard';
import { EmptyState } from '../../components/common/EmptyState';
import { vehicleService } from '../../services/vehicleService';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { VehicleCardSkeleton } from '../../components/ui/Skeleton';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all'; // 'all' | 'jac-t9' | 'jac-commercial' | 'dongfeng'
  const initialSubcategory = searchParams.get('subcategory') || 'all';
  const initialSubSubcategory = searchParams.get('subSubcategory') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(initialSubSubcategory);

  const [products, setProducts] = useState(() => vehicleService.getCachedVehicles() || []);
  const [loading, setLoading] = useState(() => !vehicleService.getCachedVehicles()?.length);

  const productGridRef = useRef(null);

  useEffect(() => {
    document.title = 'Products Catalog | Khyber Motors Peshawar';
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      'Explore official commercial and passenger products from JAC Motors and Dongfeng at Khyber Motors Peshawar. Discover the JAC T9, JAC Commercial, and Dongfeng lineups.'
    );

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const list = await vehicleService.getVehicleCards();
        if (list && list.length > 0) {
          setProducts(list);
        }
      } catch (err) {
        console.error('Failed to load products from API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const hierarchy = useMemo(() => vehicleService.getHierarchy(), []);

  // Filtered products based on hierarchy
  const filteredProducts = useMemo(() => {
    const visible = products.filter(
      (p) => p.status !== 'Draft' && p.status !== 'Hidden'
    );

    if (selectedCategory === 'all') {
      return visible;
    }

    return visible.filter((p) => {
      // 1. JAC T9 category filter
      if (selectedCategory === 'jac-t9') {
        const matchesCategory =
          p.category === 'jac-t9' ||
          p.category === 'passengers' ||
          p.slug === 't9-hunter' ||
          p.slug === 't9-frison';

        if (!matchesCategory) return false;

        if (selectedSubcategory !== 'all') {
          return (
            (p.subcategory || '').toLowerCase() === selectedSubcategory.toLowerCase() ||
            p.slug.includes(selectedSubcategory.toLowerCase())
          );
        }
        return true;
      }

      // 2. JAC Commercial category filter
      if (selectedCategory === 'jac-commercial') {
        const matchesCategory =
          p.category === 'jac-commercial' ||
          (p.brand === 'JAC' && (p.category === 'trucks' || p.category === 'commercial')) ||
          ['jac-x200', 'jac-1020', 'jac-1042', 'jac-1091', 'jac-1120'].includes(p.slug);

        if (!matchesCategory) return false;

        if (selectedSubcategory !== 'all') {
          return (
            (p.subcategory || '').toLowerCase() === selectedSubcategory.toLowerCase() ||
            p.slug.toLowerCase().includes(selectedSubcategory.toLowerCase())
          );
        }
        return true;
      }

      // 3. Dongfeng category filter
      if (selectedCategory === 'dongfeng') {
        const matchesBrandOrCat =
          p.brand === 'Dongfeng' ||
          p.category === 'dongfeng' ||
          p.slug.toLowerCase().includes('dongfeng');

        if (!matchesBrandOrCat) return false;

        if (selectedSubcategory === 'heavy') {
          const isHeavy =
            (p.subcategory || '').toLowerCase() === 'heavy' ||
            p.slug.includes('prime-mover') ||
            p.slug.includes('rigid');

          if (!isHeavy) return false;

          if (selectedSubSubcategory === 'prime-movers') {
            return (
              (p.subSubcategory || '').toLowerCase() === 'prime-movers' ||
              p.slug.includes('prime-mover')
            );
          }
          if (selectedSubSubcategory === 'rigid') {
            return (
              (p.subSubcategory || '').toLowerCase() === 'rigid' ||
              p.slug.includes('rigid')
            );
          }
          return true;
        }

        if (selectedSubcategory === 'light') {
          return (
            (p.subcategory || '').toLowerCase() === 'light' ||
            p.slug.includes('light')
          );
        }

        return true;
      }

      return true;
    });
  }, [products, selectedCategory, selectedSubcategory, selectedSubSubcategory]);

  const handleSelectHierarchyCategory = (catId, subId = 'all', subSubId = 'all') => {
    setSelectedCategory(catId);
    setSelectedSubcategory(subId);
    setSelectedSubSubcategory(subSubId);

    // Update query params
    const params = {};
    if (catId !== 'all') params.category = catId;
    if (subId !== 'all') params.subcategory = subId;
    if (subSubId !== 'all') params.subSubcategory = subSubId;
    setSearchParams(params);

    if (productGridRef.current) {
      productGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedSubSubcategory('all');
    setSearchParams({});
  };

  return (
    <div className="space-y-8 pt-4 pb-12">
      <Container size="xl">
        {/* 1. Page Header */}
        <AnimatedSection direction="up">
          <SectionHeading
            badge="Product Lineup"
            title="Our Products"
            subtitle="Browse our comprehensive range of commercial trucks and double cabin pickups."
            align="center"
          />
        </AnimatedSection>

        {/* 2. Primary Product Structure / Hierarchy List (Shown First as requested) */}
        <AnimatedSection direction="up" delay={80}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C8102E]" />
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-900">
                  Select Product Category
                </h2>
              </div>
              <span className="text-[11px] text-gray-500 font-semibold hidden sm:inline">
                Click a category below to explore its models
              </span>
            </div>

            {/* 3 Main Hierarchy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Category 1: JAC T9 */}
              <div
                onClick={() => handleSelectHierarchyCategory('jac-t9')}
                className={`relative p-5 rounded-xs border-2 transition-all cursor-pointer group flex flex-col justify-between ${
                  selectedCategory === 'jac-t9'
                    ? 'border-[#C8102E] bg-white shadow-lg -translate-y-1'
                    : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#C8102E] text-white text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider rounded-xs">
                      1. JAC T9
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">2 Models</span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                    JAC T9 Series
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Flagship 2.0L Turbo Diesel 4x4 Double Cabin Pickups.
                  </p>

                  {/* Subcategories list */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Models:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHierarchyCategory('jac-t9', 'hunter');
                        }}
                        className={`text-left text-xs font-bold px-2.5 py-1.5 rounded-xs transition-colors border flex items-center justify-between ${
                          selectedCategory === 'jac-t9' && selectedSubcategory === 'hunter'
                            ? 'bg-[#C8102E] text-white border-[#C8102E]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span>Hunter</span>
                        <ChevronRight className="w-3 h-3 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHierarchyCategory('jac-t9', 'frison');
                        }}
                        className={`text-left text-xs font-bold px-2.5 py-1.5 rounded-xs transition-colors border flex items-center justify-between ${
                          selectedCategory === 'jac-t9' && selectedSubcategory === 'frison'
                            ? 'bg-[#C8102E] text-white border-[#C8102E]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span>Frison</span>
                        <ChevronRight className="w-3 h-3 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-[#C8102E]">
                  <span>Explore JAC T9</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Category 2: JAC Commercial */}
              <div
                onClick={() => handleSelectHierarchyCategory('jac-commercial')}
                className={`relative p-5 rounded-xs border-2 transition-all cursor-pointer group flex flex-col justify-between ${
                  selectedCategory === 'jac-commercial'
                    ? 'border-[#C8102E] bg-white shadow-lg -translate-y-1'
                    : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#111827] text-white text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider rounded-xs">
                      2. JAC Commercial
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">5 Models</span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                    JAC Commercial Trucks
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Dependable cargo deck trucks ranging from 1.15 to 8.0 ton capacity.
                  </p>

                  {/* Subcategories list */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Models:
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['X200', '1020', '1042', '1091', '1120'].map((model) => {
                        const isSubSelected =
                          selectedCategory === 'jac-commercial' &&
                          selectedSubcategory === model.toLowerCase();
                        return (
                          <button
                            key={model}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectHierarchyCategory('jac-commercial', model.toLowerCase());
                            }}
                            className={`text-center text-xs font-bold px-2 py-1.5 rounded-xs transition-colors border ${
                              isSubSelected
                                ? 'bg-[#C8102E] text-white border-[#C8102E]'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {model}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-[#C8102E]">
                  <span>Explore JAC Commercial</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Category 3: Dongfeng */}
              <div
                onClick={() => handleSelectHierarchyCategory('dongfeng')}
                className={`relative p-5 rounded-xs border-2 transition-all cursor-pointer group flex flex-col justify-between ${
                  selectedCategory === 'dongfeng'
                    ? 'border-[#C8102E] bg-white shadow-lg -translate-y-1'
                    : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#C8102E] text-white text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider rounded-xs">
                      3. Dongfeng
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">Heavy & Light</span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                    Dongfeng Logistics
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Heavy-duty Prime Movers, Rigid industrial tippers, and Light trucks.
                  </p>

                  {/* Subcategories list */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Hierarchy:
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectHierarchyCategory('dongfeng', 'heavy', 'prime-movers');
                          }}
                          className={`text-xs font-bold px-2 py-1 rounded-xs transition-colors border flex-1 text-center ${
                            selectedCategory === 'dongfeng' &&
                            selectedSubcategory === 'heavy' &&
                            selectedSubSubcategory === 'prime-movers'
                              ? 'bg-[#C8102E] text-white border-[#C8102E]'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          Heavy: Prime Movers
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectHierarchyCategory('dongfeng', 'heavy', 'rigid');
                          }}
                          className={`text-xs font-bold px-2 py-1 rounded-xs transition-colors border flex-1 text-center ${
                            selectedCategory === 'dongfeng' &&
                            selectedSubcategory === 'heavy' &&
                            selectedSubSubcategory === 'rigid'
                              ? 'bg-[#C8102E] text-white border-[#C8102E]'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          Heavy: Rigid
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHierarchyCategory('dongfeng', 'light');
                        }}
                        className={`w-full text-xs font-bold px-2 py-1 rounded-xs transition-colors border text-center ${
                          selectedCategory === 'dongfeng' && selectedSubcategory === 'light'
                            ? 'bg-[#C8102E] text-white border-[#C8102E]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        Dongfeng Light
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-[#C8102E]">
                  <span>Explore Dongfeng</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* 3. Interactive Filter Bar & Subcategory Selector */}
        <AnimatedSection direction="up" delay={120}>
          <div ref={productGridRef} className="bg-white border border-gray-200 p-4 sm:p-5 rounded-sm shadow-xs mb-6 space-y-4">
            {/* Top Level Category Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Filter by Category:
              </div>

              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Product Category Filter">
                {[
                  { id: 'all', label: 'All Products' },
                  { id: 'jac-t9', label: '1. JAC T9' },
                  { id: 'jac-commercial', label: '2. JAC Commercial' },
                  { id: 'dongfeng', label: '3. Dongfeng' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectHierarchyCategory(cat.id, 'all', 'all')}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
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

            {/* Subcategory Level Navigation for JAC T9 */}
            {selectedCategory === 'jac-t9' && (
              <div className="pt-2 animate-fadeIn space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C8102E]"></span>
                  Select JAC T9 Model:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All JAC T9' },
                    { id: 'hunter', label: 'Hunter' },
                    { id: 'frison', label: 'Frison' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-xs border transition-colors cursor-pointer ${
                        selectedSubcategory === sub.id
                          ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subcategory Level Navigation for JAC Commercial */}
            {selectedCategory === 'jac-commercial' && (
              <div className="pt-2 animate-fadeIn space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C8102E]"></span>
                  Select Commercial Model:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All JAC Commercial' },
                    { id: 'x200', label: 'X200 (1.15-Ton)' },
                    { id: '1020', label: '1020 (3.5-Ton)' },
                    { id: '1042', label: '1042 (14-Foot)' },
                    { id: '1091', label: '1091 (17-Foot)' },
                    { id: '1120', label: '1120 (20-Foot)' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-xs border transition-colors cursor-pointer ${
                        selectedSubcategory === sub.id
                          ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subcategory Level Navigation for Dongfeng */}
            {selectedCategory === 'dongfeng' && (
              <div className="pt-2 animate-fadeIn space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C8102E]"></span>
                  Select Dongfeng Category:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Dongfeng' },
                    { id: 'heavy', label: 'Heavy' },
                    { id: 'light', label: 'Light' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubcategory(sub.id);
                        if (sub.id !== 'heavy') {
                          setSelectedSubSubcategory('all');
                        }
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-xs border transition-colors cursor-pointer ${
                        selectedSubcategory === sub.id
                          ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Sub-subcategory for Dongfeng Heavy: Prime Movers vs Rigid */}
                {selectedSubcategory === 'heavy' && (
                  <div className="pl-3 border-l-2 border-[#C8102E] animate-fadeIn space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                      Dongfeng Heavy Subcategory:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'All Heavy Trucks' },
                        { id: 'prime-movers', label: 'Prime Movers' },
                        { id: 'rigid', label: 'Rigid' },
                      ].map((subSub) => (
                        <button
                          key={subSub.id}
                          type="button"
                          onClick={() => setSelectedSubSubcategory(subSub.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xs border transition-colors cursor-pointer ${
                            selectedSubSubcategory === subSub.id
                              ? 'bg-[#C8102E] text-white border-[#C8102E]'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {subSub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* 4. Products Result Count & Active Filter Indicator */}
        <div className="flex items-center justify-between mb-6 text-xs text-gray-500 font-semibold uppercase tracking-wider">
          <span>Showing {loading ? '...' : filteredProducts.length} Products</span>
          {selectedCategory !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-[#C8102E] font-bold">Filter:</span>
              <span className="uppercase font-extrabold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-xs">
                {selectedCategory === 'jac-t9'
                  ? `JAC T9 ${selectedSubcategory !== 'all' ? `→ ${selectedSubcategory}` : ''}`
                  : selectedCategory === 'jac-commercial'
                  ? `JAC Commercial ${selectedSubcategory !== 'all' ? `→ ${selectedSubcategory}` : ''}`
                  : `Dongfeng ${selectedSubcategory !== 'all' ? `→ ${selectedSubcategory}` : ''} ${
                      selectedSubSubcategory !== 'all' ? `→ ${selectedSubSubcategory}` : ''
                    }`}
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[10px] text-gray-400 hover:text-[#C8102E] underline cursor-pointer ml-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* 5. Products Grid or Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
            {filteredProducts.map((product) => (
              <VehicleCard
                key={product.id}
                vehicle={product}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Products Found"
            description="No products match the selected category filter."
            onReset={handleResetFilters}
            resetText="Show All Products"
          />
        )}
      </Container>
    </div>
  );
};

export default ProductsPage;
