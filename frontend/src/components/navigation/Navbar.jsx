import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Phone, ChevronDown, ChevronRight, ArrowRight, Car, Truck } from 'lucide-react';
import { Container } from '../common/Container';
import { Button } from '../ui/Button';
import { MobileMenu } from './MobileMenu';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const dropdownTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products', hasDropdown: true },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Profiles', path: '/profiles' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Close dropdown when route changes
  useEffect(() => {
    setIsProductsDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProductsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProductsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMouseEnter = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    setIsProductsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setIsProductsDropdownOpen(false);
    }, 150);
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
          <BrandLogo size="md" variant="light" to="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);

              if (link.hasDropdown) {
                return (
                  <div
                    key={link.path}
                    ref={dropdownRef}
                    className="relative group py-1"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Products Menu Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsProductsDropdownOpen((prev) => !prev)}
                      className={`text-sm font-semibold tracking-wide uppercase transition-colors relative flex items-center gap-1.5 cursor-pointer focus:outline-none ${
                        active || isProductsDropdownOpen
                          ? 'text-[#C8102E]'
                          : 'text-gray-700 hover:text-[#C8102E]'
                      }`}
                      aria-expanded={isProductsDropdownOpen}
                    >
                      <Link
                        to={link.path}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProductsDropdownOpen(false);
                        }}
                        className="hover:text-[#C8102E]"
                      >
                        {link.name}
                      </Link>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isProductsDropdownOpen ? 'rotate-180 text-[#C8102E]' : 'text-gray-400 group-hover:text-[#C8102E]'
                        }`}
                      />
                      {active && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#C8102E]" />
                      )}
                    </button>

                    {/* Invisible hover bridge to prevent accidental closure */}
                    {isProductsDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 h-3" />
                    )}

                    {/* Products Dropdown - ONLY 3 Parent Categories */}
                    {isProductsDropdownOpen && (
                      <div
                        className="absolute top-[calc(100%+0.5rem)] left-0 w-64 bg-white border border-gray-200 border-t-3 border-t-[#C8102E] rounded-xs shadow-xl z-50 animate-fadeIn py-1"
                        role="menu"
                        aria-label="Products Menu"
                      >
                        <div className="flex flex-col divide-y divide-gray-100">
                          {/* 1. JAC T9 */}
                          <Link
                            to="/products?category=jac-t9"
                            onClick={() => setIsProductsDropdownOpen(false)}
                            className="group/item flex items-center justify-between px-4 py-3 hover:bg-red-50/70 text-gray-800 hover:text-[#C8102E] transition-colors"
                            role="menuitem"
                          >
                            <div>
                              <div className="font-extrabold text-sm tracking-wide uppercase">
                                JAC T9
                              </div>
                              <div className="text-[11px] text-gray-500 font-normal">
                                Double Cabin Pickups
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover/item:text-[#C8102E] group-hover/item:translate-x-0.5 transition-all" />
                          </Link>

                          {/* 2. JAC Commercial */}
                          <Link
                            to="/products?category=jac-commercial"
                            onClick={() => setIsProductsDropdownOpen(false)}
                            className="group/item flex items-center justify-between px-4 py-3 hover:bg-red-50/70 text-gray-800 hover:text-[#C8102E] transition-colors"
                            role="menuitem"
                          >
                            <div>
                              <div className="font-extrabold text-sm tracking-wide uppercase">
                                JAC Commercial
                              </div>
                              <div className="text-[11px] text-gray-500 font-normal">
                                Cargo & Transport Trucks
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover/item:text-[#C8102E] group-hover/item:translate-x-0.5 transition-all" />
                          </Link>

                          {/* 3. Dongfeng */}
                          <Link
                            to="/products?category=dongfeng"
                            onClick={() => setIsProductsDropdownOpen(false)}
                            className="group/item flex items-center justify-between px-4 py-3 hover:bg-red-50/70 text-gray-800 hover:text-[#C8102E] transition-colors"
                            role="menuitem"
                          >
                            <div>
                              <div className="font-extrabold text-sm tracking-wide uppercase">
                                Dongfeng
                              </div>
                              <div className="text-[11px] text-gray-500 font-normal">
                                Heavy & Light Trucks
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover/item:text-[#C8102E] group-hover/item:translate-x-0.5 transition-all" />
                          </Link>
                        </div>

                        {/* All Products Footer Link */}
                        <div className="mt-1 pt-2 border-t border-gray-100 px-4 pb-1.5">
                          <Link
                            to="/products"
                            onClick={() => setIsProductsDropdownOpen(false)}
                            className="text-xs font-bold text-gray-500 hover:text-[#C8102E] flex items-center justify-between group"
                          >
                            <span>View All Products</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
