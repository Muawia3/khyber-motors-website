import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Phone, MessageSquare, MapPin, Calendar, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useContact } from '../../context/useContact';

export const MobileMenu = ({
  isOpen,
  onClose,
  navLinks,
}) => {
  const { contactData } = useContact();
  const location = useLocation();
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset accordion when closed
  useEffect(() => {
    if (!isOpen) {
      setIsProductsExpanded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sliding Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-[#111827] text-white shadow-2xl z-10 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900">
            <div className="flex items-center gap-2">
              <span className="bg-[#C8102E] text-white font-extrabold text-lg px-2.5 py-1 uppercase rounded-xs">
                JAC
              </span>
              <span className="font-extrabold text-sm tracking-tight text-white uppercase">
                Peshawar
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-sm cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1">
            {navLinks.map((link) => {
              const active =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);

              if (link.hasDropdown) {
                return (
                  <div key={link.path} className="flex flex-col">
                    <div
                      className={`flex items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                        active || isProductsExpanded
                          ? 'bg-[#C8102E] text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-[#C8102E]'
                      }`}
                    >
                      <Link
                        to={link.path}
                        onClick={onClose}
                        className="grow hover:underline"
                      >
                        {link.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setIsProductsExpanded((prev) => !prev)}
                        className="p-1 -mr-1 text-white/80 hover:text-white cursor-pointer focus:outline-none"
                        aria-label="Toggle Products hierarchy"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isProductsExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Expandable Hierarchy - ONLY 3 Parent Categories */}
                    {isProductsExpanded && (
                      <div className="mt-1 ml-2 pl-3 border-l-2 border-red-800/60 py-2 space-y-2 text-xs bg-gray-900/60 rounded-xs px-2">
                        {/* 1. JAC T9 */}
                        <Link
                          to="/products?category=jac-t9"
                          onClick={onClose}
                          className="flex items-center justify-between py-2 px-2 text-gray-200 hover:text-[#C8102E] hover:bg-gray-800/50 rounded-xs font-bold uppercase tracking-wide"
                        >
                          <span>1. JAC T9</span>
                          <span className="text-[10px] text-gray-400 font-normal">Pickups</span>
                        </Link>

                        {/* 2. JAC Commercial */}
                        <Link
                          to="/products?category=jac-commercial"
                          onClick={onClose}
                          className="flex items-center justify-between py-2 px-2 text-gray-200 hover:text-[#C8102E] hover:bg-gray-800/50 rounded-xs font-bold uppercase tracking-wide"
                        >
                          <span>2. JAC Commercial</span>
                          <span className="text-[10px] text-gray-400 font-normal">Trucks</span>
                        </Link>

                        {/* 3. Dongfeng */}
                        <Link
                          to="/products?category=dongfeng"
                          onClick={onClose}
                          className="flex items-center justify-between py-2 px-2 text-gray-200 hover:text-[#C8102E] hover:bg-gray-800/50 rounded-xs font-bold uppercase tracking-wide"
                        >
                          <span>3. Dongfeng</span>
                          <span className="text-[10px] text-gray-400 font-normal">Heavy & Light</span>
                        </Link>

                        {/* View All */}
                        <div className="pt-2 border-t border-gray-800">
                          <Link
                            to="/products"
                            onClick={onClose}
                            className="text-[#C8102E] font-bold uppercase tracking-wider block py-1 hover:text-red-400"
                          >
                            View All Products →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                    active
                      ? 'bg-[#C8102E] text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-[#C8102E]'
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Contact & CTA */}
        <div className="p-5 border-t border-gray-800 bg-gray-950 flex flex-col gap-4">
          <Link to="/contact" onClick={onClose} className="w-full">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<Phone className="w-4 h-4" />}
            >
              Contact Us
            </Button>
          </Link>

          <div className="space-y-2 text-xs text-gray-400 pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C8102E]" />
              <span>{contactData.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp: {contactData.whatsapp}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
              <span className="line-clamp-2">{contactData.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
