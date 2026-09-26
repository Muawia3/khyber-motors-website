import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Phone } from 'lucide-react';
import { Container } from '../common/Container';
import { Button } from '../ui/Button';
import { MobileMenu } from './MobileMenu';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Profiles', path: '/profiles' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#0f172a] text-white text-xs py-2 border-b border-gray-800/80">
        <Container size="xl" className="flex items-center justify-between">
          <div className="text-[11px] text-gray-400 font-medium">
            Khyber Motors Peshawar — Official 3S Dealership Portal
          </div>
        </Container>
      </div>

      {/* Main Navbar */}
      <div className="py-3.5">
        <Container size="xl" className="flex items-center justify-between">
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-[#C8102E] text-white font-extrabold px-3 py-1.5 text-2xl tracking-tighter uppercase rounded-xs shadow-xs group-hover:bg-[#A80C24] transition-colors">
              JAC
            </div>
            <div className="flex flex-col border-l border-gray-300 pl-3">
              <span className="font-extrabold text-lg tracking-tight text-gray-900 leading-tight">
                KHYBER MOTORS
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-[#C8102E] uppercase">
                3S Dealership KP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold tracking-wide uppercase transition-colors relative py-1 ${
                    active
                      ? 'text-[#C8102E]'
                      : 'text-gray-700 hover:text-[#C8102E]'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8102E]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Link to="/contact">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Phone className="w-4 h-4" />}
                >
                  Contact Us
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-sm cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </Container>
      </div>

      {/* Mobile Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
      />
    </header>
  );
};
