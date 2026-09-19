import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
  Share2,
} from 'lucide-react';
import { Container } from '../common/Container';
import { useContact } from '../../context/useContact';
import { socialLinkService } from '../../services/socialLinkService';
import { SocialIcon } from '../common/SocialIcons';
import { VEHICLES } from '../../data/vehicles';

export const Footer = () => {
  const { contactData } = useContact();
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchSocial = async () => {
      try {
        const links = await socialLinkService.getSocialLinks(true);
        if (isMounted && links && links.length > 0) {
          setSocialLinks(links);
        }
      } catch (err) {
        console.warn('Footer social fetch notice:', err);
      }
    };
    fetchSocial();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-3.5 h-3.5" />;
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5" />;
      case 'messagesquare':
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5" />;
      case 'linkedin':
        return <Linkedin className="w-3.5 h-3.5" />;
      case 'twitter':
      case 'x':
        return <Twitter className="w-3.5 h-3.5" />;
      default:
        return <Globe className="w-3.5 h-3.5" />;
    }
  };

  return (
    <footer className="bg-[#111827] text-white border-t-4 border-[#C8102E] pt-12 pb-6">
      <Container size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
          {/* Column 1: Dealership Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#C8102E] text-white font-extrabold px-3 py-1 text-2xl tracking-tighter uppercase rounded-xs">
                JAC
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white uppercase">
                  KHYBER MOTORS
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-[#C8102E] uppercase">
                  {contactData.status || 'Authorized 3S Facility'}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {contactData.footerText || contactData.tagline}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-900 p-2.5 rounded-xs border border-gray-800">
              <ShieldCheck className="w-4 h-4 text-[#C8102E] shrink-0" />
              <span>Full Factory Warranty & Genuine Spare Parts Guaranteed</span>
            </div>

            {/* Social Media Links */}
            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {socialLinks
                  .filter((item) =>
                    ['tiktok', 'instagram', 'facebook', 'whatsapp'].some((p) =>
                      p === (item.platform || '').toLowerCase()
                    )
                  )
                  .map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-900 hover:bg-[#C8102E] text-gray-300 hover:text-white rounded-xs transition-colors flex items-center justify-center"
                      title={item.platform}
                    >
                      <SocialIcon name={item.platform} icon={item.icon} className="w-4 h-4" colored={false} />
                    </a>
                  ))}
              </div>
            ) : (
              contactData.social && (
                <div className="flex items-center gap-2 pt-1">
                  {contactData.social.tiktok && (
                    <a
                      href={contactData.social.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-900 hover:bg-[#C8102E] text-gray-300 hover:text-white rounded-xs transition-colors"
                      title="TikTok"
                    >
                      <SocialIcon name="TikTok" className="w-4 h-4" colored={false} />
                    </a>
                  )}
                  {contactData.social.instagram && (
                    <a
                      href={contactData.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-900 hover:bg-[#C8102E] text-gray-300 hover:text-white rounded-xs transition-colors"
                      title="Instagram"
                    >
                      <SocialIcon name="Instagram" className="w-4 h-4" colored={false} />
                    </a>
                  )}
                  {contactData.social.facebook && (
                    <a
                      href={contactData.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-900 hover:bg-[#C8102E] text-gray-300 hover:text-white rounded-xs transition-colors"
                      title="Facebook"
                    >
                      <SocialIcon name="Facebook" className="w-4 h-4" colored={false} />
                    </a>
                  )}
                  {contactData.social.whatsapp && (
                    <a
                      href={
                        contactData.social.whatsapp.startsWith('http')
                          ? contactData.social.whatsapp
                          : `https://wa.me/${contactData.social.whatsapp.replace(/[^0-9]/g, '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-900 hover:bg-emerald-600 text-gray-300 hover:text-white rounded-xs transition-colors"
                      title="WhatsApp"
                    >
                      <SocialIcon name="WhatsApp" className="w-4 h-4" colored={false} />
                    </a>
                  )}
                </div>
              )
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-white mb-4 border-b border-gray-800 pb-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              {[
                { name: 'Home', path: '/' },
                { name: 'Vehicle Catalog', path: '/vehicles' },
                { name: 'Flagship JAC T9 4x4', path: '/vehicles/t9' },
                { name: '3S Service & Maintenance', path: '/services' },
                { name: 'About Dealership', path: '/about' },
                { name: 'Contact & Location', path: '/contact' },
                { name: 'Admin CRM Portal', path: '/admin' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className="hover:text-[#C8102E] transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-[#C8102E]" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Featured Vehicles */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-white mb-4 border-b border-gray-800 pb-2">
              JAC Lineup
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              {VEHICLES.map((v) => (
                <li key={v.id}>
                  <Link
                    to={`/vehicles/${v.slug}`}
                    className="hover:text-[#C8102E] transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3 text-[#C8102E]" />
                      {v.name}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">{v.categoryLabel}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Dealership Contact & Business Hours */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-white mb-4 border-b border-gray-800 pb-2">
              Peshawar Dealership Contact
            </h4>

            <div className="space-y-3 text-xs text-gray-300">
              <a
                href={
                  contactData.mapLink ||
                  'https://www.google.com/maps/search/?api=1&query=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-[#C8102E] transition-colors group"
                title="Open in Google Maps"
              >
                <MapPin className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>{contactData.address}</span>
              </a>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span>{contactData.phone}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>WhatsApp: {contactData.whatsapp}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C8102E] shrink-0" />
                <span>{contactData.email}</span>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-gray-800">
                <Clock className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Business Hours:</p>
                  {(contactData.businessHours || []).map((h, i) => (
                    <p key={i} className="text-gray-400">
                      {h.days}: {h.hours}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>
            © {new Date().getFullYear()} {contactData.name || 'Khyber Motors'}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-200 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-200 cursor-pointer">3S Warranty Disclosures</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
