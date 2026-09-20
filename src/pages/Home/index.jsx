import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Headphones,
  Wrench,
  HeartHandshake,
  ArrowRight,
  Phone,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Car,
  Settings,
  Calendar,
  Sparkles,
  Users,
  Award,
  Star,
  User,
  Quote,
} from 'lucide-react';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { VehicleCard } from '../../components/vehicles/VehicleCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/common/Badge';
import { contentService } from '../../services/contentService';
import { vehicleService } from '../../services/vehicleService';
import { heroImageService } from '../../services/heroImageService';
import { reviewService } from '../../services/reviewService';
import { DEFAULT_HOMEPAGE_CONTENT } from '../../data/homepage';
import { useContact } from '../../context/useContact';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { VehicleCardSkeleton } from '../../components/ui/Skeleton';

import { getFileUrl } from '../../utils/urlHelper';

export const HomePage = () => {
  const { contactData } = useContact();
  const navigate = useNavigate();
  const [homeContent, setHomeContent] = useState(() => contentService.getCachedHomepageContent() || DEFAULT_HOMEPAGE_CONTENT);
  const [vehicles, setVehicles] = useState(() => vehicleService.getCachedVehicles() || []);
  const [heroImageRecords, setHeroImageRecords] = useState(() => heroImageService.getCachedHeroImages() || []);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [list, content, activeHeroImgs, activeReviews] = await Promise.all([
          vehicleService.getVehicles(),
          contentService.getHomepageContent(),
          heroImageService.getHeroImages(true),
          reviewService.getReviews(true),
        ]);
        if (isMounted) {
          if (list) setVehicles(list);
          if (content) setHomeContent(content);
          if (activeHeroImgs && activeHeroImgs.length > 0) {
            setHeroImageRecords(activeHeroImgs);
          }
          if (activeReviews) setReviews(activeReviews);
        }


      } catch (err) {
        console.error('Home data load error:', err);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredPickup = homeContent?.featuredPickupId
    ? vehicles.find(
        (v) =>
          String(v.id) === String(homeContent.featuredPickupId) ||
          v.slug === homeContent.featuredPickupId
      )
    : null;


  const heroImages = heroImageRecords.length > 0
    ? heroImageRecords
    : [
        {
          url: '/Gemini_Generated_Image_9aiio29aiio29aii.jpeg',
          title: 'JAC T9 4x4 Double Cabin Pickup',
          altText: 'JAC T9 4x4 Pickup Truck in KP',
        },
      ];

  // Auto-rotate hero images every 5 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Dynamic SEO Page Title & Meta Description update
  useEffect(() => {
    document.title = "Khyber Motors | Built for Work. Ready for More.";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      'Discover powerful, dependable JAC commercial vehicles and pickup trucks designed to perform on every road. Explore JAC T9 4x4, T8 Pro, and commercial trucks.'
    );
  }, []);

  const filteredVehicles = selectedCategory === 'all'
    ? vehicles
    : vehicles.filter((v) => {
        const cat = (v.category || '').toLowerCase();
        const subcat = (v.subcategory || '').toLowerCase();
        const catLabel = (v.categoryLabel || '').toLowerCase();

        if (selectedCategory === 'passengers') {
          return cat === 'passengers' || cat === 'passenger' || cat === 'pickups' || cat === 'pickup' || catLabel.includes('passenger');
        }
        if (selectedCategory === 'light-truck') {
          return (
            (cat === 'trucks' || cat === 'truck' || cat === 'commercial') &&
            (subcat === 'light' || catLabel.includes('light') || (!subcat && !catLabel.includes('heavy')))
          );
        }
        if (selectedCategory === 'heavy-truck') {
          return (
            (cat === 'trucks' || cat === 'truck' || cat === 'commercial') &&
            (subcat === 'heavy' || catLabel.includes('heavy'))
          );
        }
        return true;
      });

  // Featured why choose us features (4 features with clean line icons)
  const whyChooseUsFeatures = [
    {
      title: 'Genuine JAC Vehicles',
      description: 'Factory-direct commercial trucks and pickups engineered for maximum payload strength and performance.',
      icon: ShieldCheck,
    },
    {
      title: 'Professional Support',
      description: 'Dedicated automotive consultants providing clear guidance for personal, fleet, and commercial needs.',
      icon: Headphones,
    },
    {
      title: 'Sales & After-Sales Service',
      description: 'Comprehensive 3S facility handling new vehicle sales, routine servicing, and original spare parts.',
      icon: Wrench,
    },
    {
      title: 'Customer-Focused Experience',
      description: 'Transparent pricing, responsive communication, and dependable long-term support for every driver.',
      icon: HeartHandshake,
    },
  ];

  // Services section (4 services cards)
  const servicesList = [
    {
      id: 'sales',
      title: 'Vehicle Sales',
      description: 'Explore our lineup of commercial pickups, heavy trucks, and utility crossovers tailored for work and transport.',
      icon: Car,
      link: '/vehicles',
    },
    {
      id: 'service',
      title: 'After-Sales Service',
      description: 'State-of-the-art 3S service bay with certified technicians, scheduled maintenance, and diagnostic tools.',
      icon: Wrench,
      link: '/services',
    },
    {
      id: 'parts',
      title: 'Spare Parts',
      description: '100% genuine JAC replacement parts, filters, and factory accessories for long-term vehicle endurance.',
      icon: Settings,
      link: '/services',
    },
    {
      id: 'support',
      title: 'Customer Support',
      description: 'Dedicated dealership support desk for vehicle inquiries, maintenance advice, and fleet consultations.',
      icon: Headphones,
      link: '/contact',
    },
  ];

  // Dealership Trust items (Strictly real commitments, no fake stats/ratings/awards)
  const trustHighlights = [
    {
      title: 'Professional Team',
      description: 'Factory-trained sales advisors and technical staff committed to delivering transparent service.',
      icon: Users,
    },
    {
      title: 'Customer Support',
      description: 'Prompt assistance for model inquiries, maintenance scheduling, and corporate fleet consultations.',
      icon: Headphones,
    },
    {
      title: 'Genuine Vehicles',
      description: 'Authentic JAC commercial trucks and 4x4 pickups backed by manufacturer warranty standards.',
      icon: ShieldCheck,
    },
    {
      title: 'After-Sales Assistance',
      description: 'Dedicated workshop support, rapid spare parts availability, and continuous maintenance care.',
      icon: Award,
    },
  ];

  const handleScrollToVehicles = () => {
    const section = document.getElementById('featured-vehicles');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/vehicles');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-950 text-white overflow-hidden border-b-4 border-[#C8102E] flex items-center min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] py-16 sm:py-20 lg:py-24">
        {/* Subtle visual overlay pattern & dark gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/65 to-gray-950/30 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-20 z-10" />

        {/* Hero Background Images Carousel (Crossfade) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroImages.map((imgObj, index) => {
            const imgSrc = typeof imgObj === 'string' ? imgObj : imgObj.url;
            const imgAlt = typeof imgObj === 'object' && imgObj.altText ? imgObj.altText : (imgObj.title || `JAC Commercial Vehicle Slide ${index + 1}`);
            return (
              <img
                key={`${imgSrc}-${index}`}
                src={getFileUrl(imgSrc)}
                alt={imgAlt}
                className={`absolute inset-0 w-full h-full object-cover object-center sm:object-right transition-opacity duration-1000 ease-in-out ${
                  index === activeSlide ? 'opacity-85 scale-105' : 'opacity-0 scale-100'
                }`}
              />
            );
          })}
        </div>

        <Container size="xl" className="relative z-20 w-full">
          <div className="max-w-3xl space-y-4 sm:space-y-6 animate-fadeInUp motion-reduce:animate-none">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C8102E]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
                {homeContent.hero.eyebrow || 'KHYBER MOTORS'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white leading-tight">
              {homeContent.hero.title || 'Built for Work. Ready for More.'}
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-lg lg:text-xl text-gray-300 leading-relaxed font-normal max-w-2xl">
              {homeContent.hero.description || 'Discover powerful, dependable commercial vehicles designed to perform on every road.'}
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Button
                id="hero-primary-cta"
                variant="primary"
                size="lg"
                onClick={handleScrollToVehicles}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Explore Vehicles
              </Button>

              <Button
                id="hero-secondary-cta"
                variant="outline"
                size="lg"
                className="border-gray-500 text-white hover:bg-gray-800 hover:border-gray-400"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>

            {/* Key Value Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-gray-800/80 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span className="font-semibold uppercase tracking-wider">Commercial Strength</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span className="font-semibold uppercase tracking-wider">Heavy Payload Ready</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span className="font-semibold uppercase tracking-wider">Factory Warranty</span>
              </div>
            </div>
          </div>
        </Container>

        {/* Hero Slider Controls & Indicators */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 bg-gray-950/75 backdrop-blur-sm border border-gray-800 px-2.5 py-1 rounded-full shadow-lg">
            <button
              onClick={() => setActiveSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
              className="p-0.5 rounded-full text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeSlide ? 'w-4 bg-[#C8102E]' : 'w-1.5 bg-gray-600 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % heroImages.length)}
              className="p-0.5 rounded-full text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 2. FEATURED VEHICLES */}
      <section id="featured-vehicles" className="scroll-mt-12">
        <AnimatedSection direction="up">
          <Container size="xl" className="space-y-8">
            <SectionHeading
              badge="Vehicle Lineup"
              title="Explore Our Vehicles"
              subtitle="Find the right JAC vehicle for your work, business, and everyday needs."
              action={
                <Link to="/vehicles">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View All Models
                  </Button>
                </Link>
              }
            />

            {/* Interactive Category Selector */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              {[
                { id: 'all', label: 'All Models' },
                { id: 'passengers', label: 'Passenger' },
                { id: 'light-truck', label: 'Light Truck' },
                { id: 'heavy-truck', label: 'Heavy Truck' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#C8102E] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Vehicle Cards Grid */}
            {vehicles.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <VehicleCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                  />
                ))}
              </div>
            )}
          </Container>
        </AnimatedSection>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="bg-gray-900 text-white py-16 sm:py-20 border-y border-gray-800">
        <Container size="xl" className="space-y-12">
          <SectionHeading
            badge="Why JAC"
            title="Why Choose Us"
            subtitle="Dependable automotive engineering paired with committed sales and service excellence."
            dark
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUsFeatures.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-800/60 p-6 rounded-sm border border-gray-700/80 hover:border-[#C8102E] transition-all duration-300 space-y-4 group"
                >
                  <div className="w-12 h-12 rounded-xs bg-[#C8102E]/10 border border-[#C8102E]/30 flex items-center justify-center text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white transition-colors duration-300">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4. FEATURED PICKUP SPOTLIGHT */}
      <Container size="xl">
        {featuredPickup ? (
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 shadow-lg">
            {/* Left: Large Vehicle Image */}
            <div className="lg:col-span-6 relative aspect-16/10 lg:aspect-auto min-h-[320px] bg-gray-900 overflow-hidden">
              <img
                src={featuredPickup.heroImage || featuredPickup.mainImage}
                alt={featuredPickup.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="red">Featured Pickup</Badge>
              </div>
              <div className="absolute bottom-4 left-4 bg-gray-950/80 backdrop-blur-xs px-3 py-1.5 rounded-xs border border-gray-800 text-white text-xs">
                <span className="font-semibold uppercase tracking-wider text-gray-300">
                  {featuredPickup.categoryLabel || featuredPickup.subcategory || 'Vehicle Spotlight'}
                </span>
              </div>
            </div>

            {/* Right: Content */}
            <div className="lg:col-span-6 p-8 lg:p-12 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
                    Featured Pickup
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
                  {featuredPickup.name}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {featuredPickup.overview || featuredPickup.shortDescription || featuredPickup.tagline}
                </p>

                {/* Specification & Feature Checklist */}
                <div className="pt-2 space-y-2.5 text-xs font-medium text-gray-800">
                  {featuredPickup.specs?.engine && (
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0" />
                      <span><strong>Engine:</strong> {featuredPickup.specs.engine}</span>
                    </div>
                  )}
                  {featuredPickup.specs?.transmission && (
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0" />
                      <span><strong>Transmission:</strong> {featuredPickup.specs.transmission}</span>
                    </div>
                  )}
                  {(featuredPickup.specs?.horsepower || featuredPickup.specs?.torque) && (
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0" />
                      <span><strong>Performance:</strong> {[featuredPickup.specs.horsepower, featuredPickup.specs.torque].filter(Boolean).join(' & ')}</span>
                    </div>
                  )}
                  {(featuredPickup.specs?.payloadCapacityKg || featuredPickup.specs?.payloadcapacitykg) && (
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0" />
                      <span><strong>Payload Capacity:</strong> {featuredPickup.specs.payloadCapacityKg || featuredPickup.specs.payloadcapacitykg} kg</span>
                    </div>
                  )}
                  {featuredPickup.specs?.safetySummary && (
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0" />
                      <span><strong>Safety:</strong> {featuredPickup.specs.safetySummary}</span>
                    </div>
                  )}
                  {featuredPickup.warranty && (
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0" />
                      <span><strong>Warranty:</strong> {featuredPickup.warranty}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center gap-4">
                <Link to={`/vehicles/${featuredPickup.slug}`}>
                  <Button
                    id="spotlight-explore-cta"
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Explore {featuredPickup.name}
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/contact')}
                >
                  Request Information
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-sm p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <Car className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                No Featured Pickup Selected
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No vehicle is currently spotlighted as the Featured Pickup on the homepage. An admin can select one in the Admin CMS.
              </p>
            </div>
            <Link to="/vehicles">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Vehicles
              </Button>
            </Link>
          </div>
        )}
      </Container>

      {/* 5. SERVICES */}
      <Container size="xl" className="space-y-12">
        <SectionHeading
          badge="Dealership Solutions"
          title="Our Services"
          subtitle="Explore comprehensive 3S services designed to keep your vehicle performing at its best."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesList.map((srv) => {
            const IconComponent = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white border border-gray-200 p-6 rounded-sm space-y-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-gray-100 text-[#C8102E] rounded-xs flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Link
                    to={srv.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8102E] hover:text-[#A80C24] transition-colors uppercase tracking-wider"
                  >
                    <span>Learn More</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      {/* 6. REQUEST INFORMATION CTA */}
      <Container size="xl">
        <div className="bg-gray-950 text-white p-8 sm:p-14 rounded-sm border-l-8 border-[#C8102E] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
              Dealership Support
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
              Ready to Explore JAC Vehicles?
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Get detailed vehicle specifications, pricing information, or fleet quotes from our sales team.
            </p>
          </div>

          <Button
            id="contact-banner-cta"
            variant="primary"
            size="lg"
            className="shrink-0"
            onClick={() => navigate('/contact')}
            rightIcon={<ChevronRight className="w-5 h-5" />}
          >
            Contact Sales Team
          </Button>
        </div>
      </Container>

      {/* 7. TRUST SECTION */}
      <section className="bg-gray-100/80 py-16 border-y border-gray-200">
        <Container size="xl" className="space-y-12">
          <SectionHeading
            badge="Dealership Standard"
            title="Built on Trust & Service"
            subtitle="Our commitment to delivering genuine commercial vehicles with transparent support."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustHighlights.map((trust, idx) => {
              const TrustIcon = trust.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-sm border border-gray-200 space-y-3 shadow-2xs"
                >
                  <div className="w-10 h-10 bg-[#C8102E]/10 text-[#C8102E] rounded-xs flex items-center justify-center">
                    <TrustIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 uppercase tracking-tight">
                    {trust.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {trust.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 7.5 CUSTOMER REVIEWS SECTION */}
      {reviews.length > 0 && (
        <section className="bg-gray-50/80 py-16 sm:py-20 border-b border-gray-200">
          <Container size="xl" className="space-y-12">
            <SectionHeading
              badge="Customer Testimonials"
              title="What Our Customers Say"
              subtitle="Verified driving and ownership experiences from JAC vehicle owners and commercial operators."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-gray-200 p-6 rounded-sm space-y-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Rating & Date Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      {rev.reviewDate && (
                        <span className="text-[11px] font-medium text-gray-400">
                          {rev.reviewDate}
                        </span>
                      )}
                    </div>

                    {/* Review text */}
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                      "{rev.reviewText}"
                    </p>
                  </div>

                  {/* Customer Info Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                    {rev.avatarUrl ? (
                      <img
                        src={rev.avatarUrl}
                        alt={rev.customerName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#C8102E]/10 text-[#C8102E] font-bold flex items-center justify-center shrink-0 border border-[#C8102E]/20 text-sm">
                        {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug">
                        {rev.customerName}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium">Verified Customer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 8. CONTACT CTA */}
      <Container size="xl" className="pb-8">
        <div className="bg-white border border-gray-200 p-8 sm:p-12 rounded-sm text-center max-w-4xl mx-auto space-y-6 shadow-sm">
          <Badge variant="red">Get in Touch</Badge>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
            Ready to Find Your JAC?
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Our sales and support team is here to assist you with vehicle specifications, commercial fleet quotes, and test drive arrangements.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              id="contact-cta-button"
              variant="dark"
              size="lg"
              onClick={() => navigate('/contact')}
              leftIcon={<Phone className="w-4 h-4" />}
            >
              Contact Us
            </Button>

            <a
              id="whatsapp-cta-button"
              href={
                contactData.whatsapp?.startsWith('http')
                  ? contactData.whatsapp
                  : `https://wa.me/${(contactData.whatsapp || '').replace(/[^0-9]/g, '')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 text-sm uppercase tracking-wider rounded-xs transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          <p className="text-[11px] text-gray-400">
            Showroom Location: {contactData.address}
          </p>
        </div>
      </Container>
    </div>
  );
};
