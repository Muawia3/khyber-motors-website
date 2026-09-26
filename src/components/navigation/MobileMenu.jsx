import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Phone, MessageSquare, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useContact } from '../../context/useContact';

export const MobileMenu = ({
  isOpen,
  onClose,
  navLinks,
}) => {
  const { contactData } = useContact();
  const location = useLocation();

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
