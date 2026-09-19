import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Phone, ChevronRight, Truck, Sparkles, ShieldCheck, Wrench, CheckCircle2, FileText } from 'lucide-react';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/ui/Button';
import { VehicleImageGallery } from '../../components/vehicles/VehicleImageGallery';
import { SpecificationTable } from '../../components/vehicles/SpecificationTable';
import { VehicleCard } from '../../components/vehicles/VehicleCard';
import { vehicleService } from '../../services/vehicleService';
import { handleDownloadBrochure } from '../../utils/brochureHelper';

export const VehicleDetailsPage = ({ overrideVehicleId }) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const targetId = overrideVehicleId || routeId || 't9-hunter';

  const [vehicle, setVehicle] = useState(null);
  const [relatedVehicles, setRelatedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const found = await vehicleService.getVehicleBySlug(targetId) || await vehicleService.getVehicleById(targetId);
        const all = await vehicleService.getVehicles();

        if (isMounted) {
          const currentVehicle = found || all[0];
          setVehicle(currentVehicle);
          setRelatedVehicles(all.filter((v) => v.id !== currentVehicle?.id).slice(0, 3));
        }
      } catch (err) {
        console.error('Failed loading vehicle details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  // Dynamic SEO Title & Meta Description update
  useEffect(() => {
    if (!vehicle) return;
    document.title = `${vehicle.name} | Khyber Motors`;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      `Discover the ${vehicle.name} ${vehicle.categoryLabel || vehicle.category}. Explore performance specs, feature overview, specification table, and contact our dealership in Peshawar.`
    );
  }, [vehicle]);

  if (loading || !vehicle) {
    return (
      <Container size="xl" className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#C8102E] border-t-transparent mb-4"></div>
        <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Loading Vehicle Details...</p>
      </Container>
    );
  }

  // Gallery array resolution
  const galleryImages = vehicle.galleryImages && vehicle.galleryImages.length > 0
    ? vehicle.galleryImages
    : vehicle.gallery && vehicle.gallery.length > 0
    ? vehicle.gallery
    : [vehicle.heroImage || vehicle.mainImage];

  const getBenefitIcon = (iconName) => {
    switch (iconName) {
      case 'Truck': return Truck;
      case 'Sparkles': return Sparkles;
      case 'ShieldCheck': return ShieldCheck;
      case 'Wrench': return Wrench;
      default: return CheckCircle2;
    }
  };

  return (
    <div className="space-y-12 py-8 pb-20 md:pb-8">
      <Container size="xl">
        {/* 1. Breadcrumb Trail */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#C8102E] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/vehicles" className="hover:text-[#C8102E] transition-colors">Vehicles</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#C8102E] font-bold">{vehicle.name}</span>
        </nav>

        {/* Hero Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* 2. Vehicle Gallery */}
          <div className="lg:col-span-7">
            <VehicleImageGallery images={galleryImages} vehicleName={vehicle.name} />
          </div>

          {/* 3. Vehicle Information & 4. CTA Area */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="gray">{vehicle.categoryLabel || vehicle.category}</Badge>
              </div>

              {/* Vehicle Title & Category */}
              <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 uppercase tracking-tight">
                {vehicle.name}
              </h1>
              <p className="text-xs font-bold text-[#C8102E] uppercase tracking-widest mt-1">
                Category: {vehicle.categoryLabel || vehicle.category}
              </p>
            </div>

            {/* Professional Description */}
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 border border-gray-200 rounded-sm">
              {vehicle.shortDescription || vehicle.overview || vehicle.tagline || 'High-performance JAC commercial vehicle.'}
            </p>

            {/* Key Spec Highlights Bar */}
            {vehicle.specs && (
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-sm border border-gray-200">
                <div>
                  <span className="text-gray-500 uppercase block font-medium">Engine</span>
                  <span className="font-bold text-gray-900">{vehicle.specs.engine || '2.0L Turbo Diesel'}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase block font-medium">Transmission</span>
                  <span className="font-bold text-gray-900">{vehicle.specs.transmission || 'Automatic / Manual'}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase block font-medium">Drive System</span>
                  <span className="font-bold text-gray-900">{vehicle.specs.driveType || '4x4 / 4x2'}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase block font-medium">Payload</span>
                  <span className="font-bold text-gray-900">
                    {vehicle.specs.payloadCapacityKg ? `${vehicle.specs.payloadCapacityKg} kg Payload` : 'Heavy Payload Capable'}
                  </span>
                </div>
              </div>
            )}

            {/* 4. Desktop CTA Area */}
            <div className="space-y-3 pt-2">
              <Button
                id="vehicle-primary-cta"
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/contact')}
                leftIcon={<Phone className="w-5 h-5" />}
              >
                Request Information & Quote
              </Button>

              {vehicle.brochureUrl && (
                <Button
                  id="vehicle-brochure-cta"
                  variant="dark"
                  size="md"
                  fullWidth
                  onClick={() => handleDownloadBrochure(vehicle.brochureUrl, `${vehicle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brochure.pdf`)}
                  leftIcon={<FileText className="w-4 h-4 text-[#C8102E]" />}
                >
                  Download Brochure
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 5. Dynamic Features Overview Section */}
        {((vehicle.featuresArray && vehicle.featuresArray.length > 0) || vehicle.features) && (
          <div className="mb-12 space-y-6">
            <SectionHeading
              badge="Model Equipment"
              title={`Features Overview - ${vehicle.name}`}
              subtitle="Explore standard equipment and technological highlights using explicit factory specifications."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vehicle.featuresArray && vehicle.featuresArray.length > 0 ? (
                vehicle.featuresArray.map((feat, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 p-5 rounded-xs space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <h3 className="text-xs font-extrabold uppercase text-gray-900">{feat.title}</h3>
                    </div>
                    {feat.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">{feat.description}</p>
                    )}
                  </div>
                ))
              ) : Array.isArray(vehicle.features) ? (
                vehicle.features.map((cat, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 p-6 rounded-sm space-y-4 shadow-2xs">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#C8102E] border-b border-gray-100 pb-2">
                      {cat.categoryName}
                    </h3>
                    <ul className="space-y-2.5 text-xs text-gray-700">
                      {cat.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        )}

        {/* 6. Specifications Section */}
        {vehicle.specs && (
          <div className="mb-12">
            <SpecificationTable specs={vehicle.specs} />
          </div>
        )}

        {/* 7. Highlights / Benefits */}
        {((vehicle.highlightsArray && vehicle.highlightsArray.length > 0) || vehicle.whyT9Benefits) && (
          <div className="mb-12 space-y-6 bg-gray-900 text-white p-8 sm:p-12 rounded-sm border-y-4 border-[#C8102E]">
            <SectionHeading
              badge="Model Strengths"
              title={`Why Choose ${vehicle.name}`}
              subtitle="Core operational advantages designed for demanding work and daily performance."
              dark
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(vehicle.highlightsArray || vehicle.whyT9Benefits).map((benefit, idx) => {
                const IconComponent = getBenefitIcon(benefit.icon);
                return (
                  <div
                    key={idx}
                    className="bg-gray-800/80 p-6 rounded-sm border border-gray-700 space-y-3 hover:border-[#C8102E] transition-colors"
                  >
                    <div className="w-10 h-10 bg-[#C8102E] text-white rounded-xs flex items-center justify-center font-bold">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 8. Request Information CTA Banner */}
        <div className="mb-12 bg-gray-950 text-white p-8 sm:p-12 rounded-sm border-l-8 border-[#C8102E] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
              Dealership Support
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Inquire About the {vehicle.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Contact our sales team for detailed specifications, pricing, and availability.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="shrink-0"
            onClick={() => navigate('/contact')}
            leftIcon={<Phone className="w-5 h-5" />}
          >
            Contact Sales Team
          </Button>
        </div>

        {/* 9. Related Vehicles */}
        <div className="space-y-6">
          <SectionHeading
            badge="Lineup Showcase"
            title="Explore Related Vehicles"
            subtitle="Compare other commercial pickup trucks and commercial haulers in our Peshawar showroom."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedVehicles.map((relVehicle) => (
              <VehicleCard
                key={relVehicle.id}
                vehicle={relVehicle}
              />
            ))}
          </div>
        </div>
      </Container>

      {/* Sticky Mobile CTA Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-gray-950 text-white p-3 border-t-2 border-[#C8102E] z-40 flex items-center justify-between gap-3 shadow-2xl">
        <div className="truncate">
          <span className="text-[10px] uppercase text-[#C8102E] font-bold block">{vehicle.categoryLabel || vehicle.category}</span>
          <span className="text-xs font-extrabold text-white truncate block">{vehicle.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/contact')}
            leftIcon={<Phone className="w-3.5 h-3.5" />}
          >
            Request Quote / Info
          </Button>

          {vehicle.brochureUrl && (
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-200 hover:bg-gray-800"
              onClick={() => handleDownloadBrochure(vehicle.brochureUrl, `${vehicle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brochure.pdf`)}
              leftIcon={<FileText className="w-3.5 h-3.5 text-[#C8102E]" />}
            >
              Brochure
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
