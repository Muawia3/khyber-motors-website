import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Truck, ArrowLeft } from 'lucide-react';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { VehicleCard } from '../../components/vehicles/VehicleCard';
import { vehicleService } from '../../services/vehicleService';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { VehicleCardSkeleton } from '../../components/ui/Skeleton';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all'; // 'all' | 'jac-t9' | 'jac-commercial' | 'dongfeng'
  const initialSubcategory = searchParams.get('subcategory') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDongfengTab, setSelectedDongfengTab] = useState(
    initialCategory === 'dongfeng' && (initialSubcategory === 'heavy' || initialSubcategory === 'light')
      ? initialSubcategory
      : 'all'
  );
  const [selectedT9Tab, setSelectedT9Tab] = useState(
    initialCategory === 'jac-t9' && (initialSubcategory === 'hunter' || initialSubcategory === 'frison')
      ? initialSubcategory
      : 'all'
  );
  const [selectedCommercialTab, setSelectedCommercialTab] = useState(
    initialCategory === 'jac-commercial' && initialSubcategory !== 'all' ? initialSubcategory : 'all'
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const contentRef = useRef(null);

  // Sync category & subcategory from URL parameters whenever searchParams changes
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const sub = searchParams.get('subcategory') || 'all';

    setSelectedCategory(cat);

    if (cat === 'dongfeng') {
      setSelectedDongfengTab(sub === 'heavy' || sub === 'light' ? sub : 'all');
    } else if (cat === 'jac-t9') {
      setSelectedT9Tab(sub === 'hunter' || sub === 'frison' ? sub : 'all');
    } else if (cat === 'jac-commercial') {
      setSelectedCommercialTab(sub !== 'all' ? sub : 'all');
    }
  }, [searchParams]);

  useEffect(() => {
    let pageTitle = 'Products Catalog | Khyber Motors Peshawar';
    if (selectedCategory === 'jac-t9') {
      pageTitle = 'JAC T9 Series | Khyber Motors Peshawar';
    } else if (selectedCategory === 'jac-commercial') {
      pageTitle = 'JAC Commercial Trucks | Khyber Motors Peshawar';
    } else if (selectedCategory === 'dongfeng') {
      pageTitle = 'Dongfeng Trucks (Heavy & Light) | Khyber Motors Peshawar';
    }
    document.title = pageTitle;

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
        const list = await vehicleService.getVehicleCards(true);
        setProducts(list || []);
      } catch (err) {
        console.error('Failed to load products from database:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  // Specific vehicles mapped directly from real database products
  const t9Hunter = useMemo(
    () => products.find((p) => p.slug === 't9-hunter' || p.id === 'jac-t9-hunter'),
    [products]
  );
  const t9Frison = useMemo(
    () => products.find((p) => p.slug === 't9-frison' || p.id === 'jac-t9-frison'),
    [products]
  );

  const commercialVehicles = useMemo(
    () =>
      products.filter(
        (p) =>
          p.category === 'jac-commercial' ||
          (p.brand === 'JAC' && (p.category === 'trucks' || p.category === 'commercial')) ||
          ['jac-x200', 'jac-1020', 'jac-1042', 'jac-1091', 'jac-1120'].includes(p.slug)
      ),
    [products]
  );

  const dfPrimeMover = useMemo(
    () =>
      products.find(
        (p) => p.slug === 'dongfeng-prime-mover' || p.id === 'dongfeng-prime-mover'
      ),
    [products]
  );
  const dfRigid = useMemo(
    () =>
      products.find(
        (p) => p.slug === 'dongfeng-rigid' || p.id === 'dongfeng-rigid'
      ),
    [products]
  );
  const dfLight = useMemo(
    () =>
      products.find(
        (p) => p.slug === 'dongfeng-light' || p.id === 'dongfeng-light'
      ),
    [products]
  );

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: catId });
    }
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8 pt-4 pb-16">
      <Container size="xl">
        <div ref={contentRef}>
          {/* ========================================================================= */}
          {/* 1. DONGFENG PAGE */}
          {/* ========================================================================= */}
          {selectedCategory === 'dongfeng' && (
            <AnimatedSection direction="up">
              <div className="space-y-10">
                {/* Header with Main Categories Tabs at the Top */}
                <div className="border-b border-gray-200 pb-6 bg-white p-6 rounded-xs shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        <Link
                          to="/products"
                          onClick={() => handleSelectCategory('all')}
                          className="hover:text-[#C8102E] flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>All Products</span>
                        </Link>
                        <span>/</span>
                        <span className="text-[#C8102E]">Dongfeng</span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Dongfeng Trucks
                      </h1>
                      <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
                        Commercial heavy haulage, rigid industrial tippers, and light cargo distribution fleet engineered with proven durability and Cummins powertrain performance.
                      </p>
                    </div>

                    {/* Main Categories at Top: Heavy and Light */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-100 p-1.5 rounded-sm border border-gray-200">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 px-2 py-1">
                        Category:
                      </span>
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedDongfengTab('all')}
                          className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                            selectedDongfengTab === 'all'
                              ? 'bg-[#C8102E] text-white shadow-xs'
                              : 'text-gray-700 hover:text-gray-900 bg-white/70 sm:bg-transparent'
                          }`}
                        >
                          All Dongfeng
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDongfengTab('heavy')}
                          className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                            selectedDongfengTab === 'heavy'
                              ? 'bg-[#C8102E] text-white shadow-xs'
                              : 'text-gray-700 hover:text-gray-900 bg-white/70 sm:bg-transparent'
                          }`}
                        >
                          Heavy
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDongfengTab('light')}
                          className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                            selectedDongfengTab === 'light'
                              ? 'bg-[#C8102E] text-white shadow-xs'
                              : 'text-gray-700 hover:text-gray-900 bg-white/70 sm:bg-transparent'
                          }`}
                        >
                          Light
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HEAVY CATEGORY SECTION */}
                {(selectedDongfengTab === 'all' || selectedDongfengTab === 'heavy') && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#C8102E]" />
                        <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-gray-900">
                          Dongfeng Heavy
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Prime Movers & Rigid
                      </span>
                    </div>

                    {/* Under Heavy: Two Side-by-Side Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      {/* Side 1: Prime Movers */}
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                            <Link
                              to="/products/dongfeng-prime-mover"
                              className="block group"
                            >
                              <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                                Prime Movers
                              </h3>
                            </Link>
                          </div>
                          <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-xs">
                            Tractor Head
                          </span>
                        </div>

                        {/* Clickable Product Card */}
                        {loading ? (
                          <VehicleCardSkeleton />
                        ) : dfPrimeMover ? (
                          <VehicleCard vehicle={dfPrimeMover} />
                        ) : (
                          <div className="border-2 border-dashed border-gray-200 rounded-sm p-6 text-center text-gray-400 bg-gray-50/50">
                            <Truck className="w-7 h-7 text-gray-300 mx-auto mb-1 stroke-[1.5]" />
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                              Prime Movers Not Added Yet
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              This model will appear once created or published from the Admin panel.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Side 2: Rigid */}
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                            <Link
                              to="/products/dongfeng-rigid"
                              className="block group"
                            >
                              <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                                Rigid
                              </h3>
                            </Link>
                          </div>
                          <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-xs">
                            Dump & Tipper
                          </span>
                        </div>

                        {/* Clickable Product Card */}
                        {loading ? (
                          <VehicleCardSkeleton />
                        ) : dfRigid ? (
                          <VehicleCard vehicle={dfRigid} />
                        ) : (
                          <div className="border-2 border-dashed border-gray-200 rounded-sm p-6 text-center text-gray-400 bg-gray-50/50">
                            <Truck className="w-7 h-7 text-gray-300 mx-auto mb-1 stroke-[1.5]" />
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                              Rigid Trucks Not Added Yet
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              This model will appear once created or published from the Admin panel.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* LIGHT CATEGORY SECTION */}
                {(selectedDongfengTab === 'all' || selectedDongfengTab === 'light') && (
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-gray-900" />
                        <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-gray-900">
                          Dongfeng Light
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Distribution & Logistics
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-900" />
                            <Link
                              to="/products/dongfeng-light"
                              className="block group"
                            >
                              <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                                Light Commercial
                              </h3>
                            </Link>
                          </div>
                          <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-xs">
                            Cargo Truck
                          </span>
                        </div>

                        {/* Clickable Product Card */}
                        {loading ? (
                          <VehicleCardSkeleton />
                        ) : dfLight ? (
                          <VehicleCard vehicle={dfLight} />
                        ) : (
                          <div className="border-2 border-dashed border-gray-200 rounded-sm p-6 text-center text-gray-400 bg-gray-50/50">
                            <Truck className="w-7 h-7 text-gray-300 mx-auto mb-1 stroke-[1.5]" />
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                              Light Truck Not Added Yet
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              This model will appear once created or published from the Admin panel.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* ========================================================================= */}
          {/* 2. JAC T9 PAGE */}
          {/* ========================================================================= */}
          {selectedCategory === 'jac-t9' && (
            <AnimatedSection direction="up">
              <div className="space-y-10">
                {/* Header */}
                <div className="border-b border-gray-200 pb-6 bg-white p-6 rounded-xs shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        <Link
                          to="/products"
                          onClick={() => handleSelectCategory('all')}
                          className="hover:text-[#C8102E] flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>All Products</span>
                        </Link>
                        <span>/</span>
                        <span className="text-[#C8102E]">JAC T9</span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        JAC T9 Series
                      </h1>
                      <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
                        Flagship 2.0L CTI Turbo Diesel 4x4 Double Cabin Pickups engineered for luxury executive ride and unstoppable off-road capability.
                      </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-sm border border-gray-200">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 px-2 py-1">
                        Model:
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedT9Tab('all')}
                        className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                          selectedT9Tab === 'all'
                            ? 'bg-[#C8102E] text-white shadow-xs'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        All T9
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedT9Tab('hunter')}
                        className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                          selectedT9Tab === 'hunter'
                            ? 'bg-[#C8102E] text-white shadow-xs'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        Hunter
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedT9Tab('frison')}
                        className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                          selectedT9Tab === 'frison'
                            ? 'bg-[#C8102E] text-white shadow-xs'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        Frison
                      </button>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Model Categories: Hunter & Frison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {/* Model 1: Hunter */}
                  {(selectedT9Tab === 'all' || selectedT9Tab === 'hunter') && (
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                          <Link to="/products/t9-hunter" className="block group">
                            <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                              Hunter
                            </h3>
                          </Link>
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-xs">
                          Executive 4x4
                        </span>
                      </div>

                      {/* Clickable Product Card */}
                      {loading ? (
                        <VehicleCardSkeleton />
                      ) : t9Hunter ? (
                        <VehicleCard vehicle={t9Hunter} />
                      ) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-sm p-6 text-center text-gray-400 bg-gray-50/50">
                          <Truck className="w-7 h-7 text-gray-300 mx-auto mb-1 stroke-[1.5]" />
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                            JAC T9 Hunter Not Added Yet
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            This model will appear once created or published from the Admin panel.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Model 2: Frison */}
                  {(selectedT9Tab === 'all' || selectedT9Tab === 'frison') && (
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-700" />
                          <Link to="/products/t9-frison" className="block group">
                            <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                              Frison
                            </h3>
                          </Link>
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-xs">
                          Utility 4x4
                        </span>
                      </div>

                      {/* Clickable Product Card */}
                      {loading ? (
                        <VehicleCardSkeleton />
                      ) : t9Frison ? (
                        <VehicleCard vehicle={t9Frison} />
                      ) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-sm p-6 text-center text-gray-400 bg-gray-50/50">
                          <Truck className="w-7 h-7 text-gray-300 mx-auto mb-1 stroke-[1.5]" />
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                            JAC T9 Frison Not Added Yet
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            This model will appear once created or published from the Admin panel.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ========================================================================= */}
          {/* 3. JAC COMMERCIAL PAGE */}
          {/* ========================================================================= */}
          {selectedCategory === 'jac-commercial' && (
            <AnimatedSection direction="up">
              <div className="space-y-10">
                {/* Header */}
                <div className="border-b border-gray-200 pb-6 bg-white p-6 rounded-xs shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        <Link
                          to="/products"
                          onClick={() => handleSelectCategory('all')}
                          className="hover:text-[#C8102E] flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>All Products</span>
                        </Link>
                        <span>/</span>
                        <span className="text-[#C8102E]">JAC Commercial</span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        JAC Commercial Trucks
                      </h1>
                      <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
                        Official 3S commercial cargo deck lineup ranging from nimble 1.15-ton city trucks to 20-foot heavy-duty freight haulers.
                      </p>
                    </div>

                    {/* Filter Tabs for Models: X200, 1020, 1042, 1091, 1120 */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-sm border border-gray-200">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 px-2 py-1">
                        Model:
                      </span>
                      {[
                        { id: 'all', label: 'All Commercial' },
                        { id: 'x200', label: 'X200' },
                        { id: '1020', label: '1020' },
                        { id: '1042', label: '1042' },
                        { id: '1091', label: '1091' },
                        { id: '1120', label: '1120' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedCommercialTab(m.id)}
                          className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                            selectedCommercialTab === m.id
                              ? 'bg-[#C8102E] text-white shadow-xs'
                              : 'text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5 Models Grid: X200, 1020, 1042, 1091, 1120 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <VehicleCardSkeleton key={i} />)
                  ) : commercialVehicles.filter(
                      (v) =>
                        selectedCommercialTab === 'all' ||
                        v.slug.toLowerCase().includes(selectedCommercialTab.toLowerCase())
                    ).length > 0 ? (
                    commercialVehicles
                      .filter(
                        (v) =>
                          selectedCommercialTab === 'all' ||
                          v.slug.toLowerCase().includes(selectedCommercialTab.toLowerCase())
                      )
                      .map((truck) => (
                        <div key={truck.slug || truck.id} className="flex flex-col justify-between">
                          <VehicleCard vehicle={truck} />
                        </div>
                      ))
                  ) : (
                    <div className="col-span-full py-12 text-center bg-white p-8 rounded-sm border-2 border-dashed border-gray-200 text-gray-500 text-sm">
                      <Truck className="w-10 h-10 text-gray-300 mx-auto mb-2 stroke-[1.5]" />
                      <p className="font-extrabold uppercase text-gray-800 text-xs">
                        No Commercial Models Added Yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Commercial trucks (X200, 1020, 1042, 1091, 1120) can be added or published from the Admin panel.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ========================================================================= */}
          {/* 4. ALL PRODUCTS VIEW (When landing on /products without category) */}
          {/* ========================================================================= */}
          {selectedCategory === 'all' && (
            <div className="space-y-10">
              <AnimatedSection direction="up">
                <SectionHeading
                  badge="Product Lineup"
                  title="Our Products"
                  subtitle="Select a parent category below to explore dedicated commercial and passenger lineups."
                  align="center"
                />
              </AnimatedSection>

              {/* 3 Main Parent Categories Selector */}
              <AnimatedSection direction="up" delay={80}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category 1: JAC T9 */}
                  <div
                    onClick={() => handleSelectCategory('jac-t9')}
                    className="bg-white border-2 border-gray-200 rounded-sm p-6 hover:border-[#C8102E] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-[#C8102E] text-white text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider rounded-xs">
                          Category 1
                        </span>
                        <span className="text-xs font-bold text-gray-400">Hunter & Frison</span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                        JAC T9
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Flagship 2.0L CTI Turbo Diesel 4x4 Double Cabin Pickups built for luxury executive comfort and off-road supremacy.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-extrabold text-[#C8102E]">
                      <span>Open JAC T9 Page</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Category 2: JAC Commercial */}
                  <div
                    onClick={() => handleSelectCategory('jac-commercial')}
                    className="bg-white border-2 border-gray-200 rounded-sm p-6 hover:border-[#C8102E] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-gray-900 text-white text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider rounded-xs">
                          Category 2
                        </span>
                        <span className="text-xs font-bold text-gray-400">5 Models</span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                        JAC Commercial
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Dependable cargo deck trucks engineered for intra-city distribution and regional freight haulage (X200, 1020, 1042, 1091, 1120).
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-extrabold text-[#C8102E]">
                      <span>Open JAC Commercial Page</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Category 3: Dongfeng */}
                  <div
                    onClick={() => handleSelectCategory('dongfeng')}
                    className="bg-white border-2 border-gray-200 rounded-sm p-6 hover:border-[#C8102E] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-[#C8102E] text-white text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider rounded-xs">
                          Category 3
                        </span>
                        <span className="text-xs font-bold text-gray-400">Heavy & Light</span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900 group-hover:text-[#C8102E] transition-colors">
                        Dongfeng
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        High-capacity Prime Movers, heavy-duty Rigid chassis dump tippers, and light commercial distribution transport.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-extrabold text-[#C8102E]">
                      <span>Open Dongfeng Page</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Complete Lineup Below */}
              <AnimatedSection direction="up" delay={120}>
                <div className="pt-6 border-t border-gray-200 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C8102E]" />
                      <span>Complete Vehicle Inventory</span>
                    </h2>
                    <span className="text-xs font-bold text-gray-400">
                      {products.length} Models Available
                    </span>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <VehicleCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : products.filter((p) => p.status !== 'Draft' && p.status !== 'Hidden').length >
                    0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {products
                        .filter((p) => p.status !== 'Draft' && p.status !== 'Hidden')
                        .map((product) => (
                          <VehicleCard
                            key={product.id || product.slug}
                            vehicle={product}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-white p-8 rounded-sm border-2 border-dashed border-gray-200 text-gray-500 text-sm">
                      <Truck className="w-10 h-10 text-gray-300 mx-auto mb-2 stroke-[1.5]" />
                      <p className="font-extrabold uppercase text-gray-800 text-xs">
                        No Products in Catalog
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Products can be added from the Admin panel.
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ProductsPage;
