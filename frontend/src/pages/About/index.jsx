import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Users,
  Phone,
  Calendar,
  ArrowRight,
  Clock,
  Wrench,
  Sparkles
} from 'lucide-react';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { contentService } from '../../services/contentService';
import { useContact } from '../../context/useContact';
import { AnimatedSection } from '../../components/common/AnimatedSection';

import { DEFAULT_ABOUT_CONTENT } from '../../data/about';

const ICON_MAP = {
  ShieldCheck: ShieldCheck,
  Building2: Building2,
  Wrench: Wrench,
  Users: Users,
  Phone: Phone,
  Sparkles: Sparkles,
};

export const AboutPage = () => {
  const { contactData } = useContact();
  const [aboutContent, setAboutContent] = useState(DEFAULT_ABOUT_CONTENT);

  useEffect(() => {
    document.title = 'About Our Dealership | Khyber Motors';
    let isMounted = true;
    const load = async () => {
      try {
        const data = await contentService.getAboutContent();
        if (isMounted && data) {
          setAboutContent(data);
        }
      } catch (err) {
        console.warn('Failed to fetch About content:', err);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const facilityOverviewItems = aboutContent?.facilityOverview || [
    { title: '3S Integrated Facility', description: 'Sales showroom, aftersales service workshop, and genuine parts counter under one roof.' },
    { title: 'Diagnostic & Service Machinery', description: 'Computerized diagnostic bay tools, hydraulic vehicle lifts, and alignment stations.' },
    { title: 'Customer Hospitality Lounge', description: 'Air-conditioned executive waiting lounge with transparent workshop view and refreshments.' }
  ];

  const commitmentCards = aboutContent?.commitment?.cards || [
    { title: 'Authentic Manufacturer Parts', description: 'We utilize only 100% genuine factory OEM parts and approved lubricants, ensuring safety, durability, and factory warranty compliance.', iconName: 'ShieldCheck' },
    { title: 'Transparent Operations', description: 'Every vehicle consultation, cost estimate, and maintenance recommendation is communicated clearly without hidden charges or unverified fees.', iconName: 'Building2' },
    { title: 'Professional Standards', description: 'Our technicians and sales advisors undergo continuous technical training according to standard JAC Motors operational guidelines.', iconName: 'Wrench' }
  ];

  const advantageItems = aboutContent?.whyUs?.advantages || [
    { title: 'Full 3S Facility Integration', description: 'Consolidated showroom sales, after-sales service, and spare parts under a single facility for simplified customer management.' },
    { title: 'Commercial Fleet Expertise', description: 'Specialized fleet consultation for logistics businesses, commercial haulers, and corporate organizations.' },
    { title: 'Warranty Claim Support', description: 'Official factory warranty handling, diagnostic reporting, and replacement part processing for covered components.' },
    { title: 'Direct Helpline & Support Desk', description: 'Dedicated telephone and digital help channels for prompt customer assistance and service appointment scheduling.' }
  ];

  const departmentCards = aboutContent?.teamStructure?.departments || [
    { title: 'Dealership Management', role: 'Executive Direction', description: 'Oversees facility operations, manufacturer compliance, and customer satisfaction standards.', iconName: 'Users' },
    { title: 'Sales & Fleet Advisory', role: 'Commercial Consultants', description: 'Guides individual buyers and corporate clients through vehicle selection, options, and test drives.', iconName: 'Building2' },
    { title: 'Service & Workshop Engineers', role: 'Technical Operations', description: 'Certified mechanics executing computerized diagnostics, maintenance, and major overhauls.', iconName: 'Wrench' },
    { title: 'Customer Support Desk', role: 'Client Relations', description: 'Handles appointments, phone inquiries, warranty documentation, and customer feedback.', iconName: 'Phone' }
  ];

  return (
    <div className="space-y-8 pt-3 pb-6 bg-gray-50/50 min-h-screen">
      <Container size="xl">
        {/* Page Hero */}
        <AnimatedSection direction="up">
          <SectionHeading
            badge="Official Representation"
            title={aboutContent?.hero?.title || "About Our Dealership"}
            subtitle={aboutContent?.hero?.subtitle || "Authorized 3S Dealership (Sales, Service & Spare Parts) providing professional automotive solutions, double cabin pickups, and commercial transport support."}
            align="center"
          />
        </AnimatedSection>

        {/* Section 1: Who We Are */}
        <div className="my-6 sm:my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 bg-white p-6 sm:p-8 rounded-xs border border-gray-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C8102E] uppercase tracking-wider">
              <Building2 className="w-4 h-4" /> Section 1 — Who We Are
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">
              {aboutContent?.whoWeAre?.heading || aboutContent?.whoWeAre?.title || "Authorized Automotive & Commercial Vehicle Representative"}
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {aboutContent?.whoWeAre?.description || aboutContent?.whoWeAre?.content1 || "Khyber Motors operates as an authorized 3S dealership facility offering comprehensive vehicle sales, maintenance servicing, and factory genuine spare parts distribution."}
            </p>
            {(aboutContent?.whoWeAre?.paragraph2 || aboutContent?.whoWeAre?.content2) && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {aboutContent?.whoWeAre?.paragraph2 || aboutContent?.whoWeAre?.content2}
              </p>
            )}

            {aboutContent?.whoWeAre?.notice && (
              <div className="p-4 bg-gray-50 border-l-4 border-[#C8102E] text-xs text-gray-600 space-y-1">
                <strong className="text-gray-900 block font-semibold">Official Notice:</strong>
                <p>{aboutContent?.whoWeAre?.notice}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-[#111827] text-white p-6 sm:p-8 rounded-xs space-y-6 shadow-sm border border-gray-800">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Sparkles className="w-5 h-5 text-[#C8102E]" />
              <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
                Facility Overview
              </h3>
            </div>

            <div className="space-y-4 text-xs text-gray-300">
              {facilityOverviewItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">{item.title}</strong>
                    <span className="text-gray-400">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Our Commitment */}
        <div className="my-12">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
              Section 2 — Core Principles
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
              {aboutContent?.commitment?.heading || "Our Commitment to Quality & Transparency"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {commitmentCards.map((card, idx) => {
              const CardIcon = ICON_MAP[card.iconName] || (idx % 2 === 0 ? ShieldCheck : Building2);
              return (
                <Card key={idx} className={`p-6 space-y-3 border-t-4 ${idx === 1 ? 'border-gray-900' : 'border-[#C8102E]'} bg-white`}>
                  <div className={`w-10 h-10 ${idx === 1 ? 'bg-gray-100 text-gray-900' : 'bg-red-50 text-[#C8102E]'} rounded-xs flex items-center justify-center font-bold`}>
                    <CardIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 uppercase">{card.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Section 3: Why Customers Choose Us */}
        <div className="my-12 bg-white p-6 sm:p-10 rounded-xs border border-gray-200/80 shadow-sm">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
              Section 3 — Advantages
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
              {aboutContent?.whyUs?.heading || "Why Customers Choose Us"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advantageItems.map((adv, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xs border border-gray-100">
                <div className="w-8 h-8 bg-[#C8102E] text-white rounded-xs flex items-center justify-center font-bold shrink-0 text-xs">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase">{adv.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Our Team */}
        <div className="my-12">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
              Section 4 — Organizational Departments
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
              {aboutContent?.teamStructure?.heading || "Our Professional Team Structure"}
            </h2>
            <p className="text-xs text-gray-500 max-w-xl mx-auto mt-1">
              {aboutContent?.teamStructure?.subtitle || "Departmental overview with placeholder management roles ready for verified staff designations."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {departmentCards.map((dept, idx) => {
              const DeptIcon = ICON_MAP[dept.iconName] || [Users, Building2, Wrench, Phone][idx % 4];
              return (
                <Card key={idx} className="p-5 text-center bg-white border border-gray-200/80">
                  <div className="w-12 h-12 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DeptIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase">{dept.title}</h4>
                  <p className="text-[11px] text-[#C8102E] font-semibold uppercase mt-0.5">{dept.role}</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {dept.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Section 5: Location */}
        <div className="my-12">
          <Card className="p-6 sm:p-8 bg-[#111827] text-white border border-gray-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C8102E]">
                  Section 5 — Facility Location
                </span>
                <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">
                  {aboutContent?.location?.heading || "Dealership Address & Operating Schedule"}
                </h3>
                <div className="space-y-2 text-xs text-gray-300 pt-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
                    <span>{contactData.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#C8102E] shrink-0" />
                    <span>{aboutContent?.location?.schedule || "Showroom Hours: Mon – Sat (9:00 AM – 7:00 PM)"}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-3 justify-end">
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button variant="primary" size="md" fullWidth leftIcon={<MapPin className="w-4 h-4" />}>
                    View Location Map
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Section 6: Contact CTA */}
        <div className="my-12 bg-gradient-to-r from-[#111827] via-gray-900 to-[#111827] text-white p-8 sm:p-12 rounded-xs border-l-4 border-[#C8102E] text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
              Section 6 — Get Started
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
              {aboutContent?.cta?.heading || "Ready to Experience JAC Performance?"}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {aboutContent?.cta?.subtitle || "Visit our showroom to inspect our commercial vehicle lineup or speak with a representative today."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/test-drive">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Calendar className="w-5 h-5" />}
                className="py-3.5 px-8 text-sm uppercase font-bold tracking-wider"
              >
                Book a Test Drive
              </Button>
            </Link>

            <Link to="/contact">
              <Button
                variant="outline"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="py-3.5 px-8 text-sm uppercase font-bold tracking-wider text-white border-white hover:bg-white/10"
              >
                Contact Sales Team
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};
