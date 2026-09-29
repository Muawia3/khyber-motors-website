import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Phone, ChevronDown, ChevronRight, ArrowRight, Car, Truck } from 'lucide-react';
import { Container } from '../common/Container';
import { Button } from '../ui/Button';
import { MobileMenu } from './MobileMenu';

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

                    {/* Products Mega-Menu Dropdown */}
                    {isProductsDropdownOpen && (
                      <div
                        className="absolute top-[calc(100%+0.5rem)] -left-28 w-[720px] bg-white border border-gray-200 border-t-3 border-t-[#C8102E] rounded-xs shadow-2xl z-50 animate-fadeIn"
                        role="menu"
                        aria-label="Products Menu"
                      >
                        <div className="p-6">
                          <div className="grid grid-cols-3 gap-6 divide-x divide-gray-100">
                            {/* 1. JAC T9 Column */}
                            <div className="space-y-3">
                              <Link
                                to="/products?category=jac-t9"
                                onClick={() => setIsProductsDropdownOpen(false)}
                                className="group/cat flex items-center justify-between pb-2 border-b border-gray-100 text-gray-900 hover:text-[#C8102E] transition-colors"
                              >
                                <span className="font-extrabold text-sm uppercase tracking-wide">
                                  1. JAC T9
                                </span>
                                <span className="text-[10px] font-bold text-[#C8102E] bg-red-50 px-2 py-0.5 rounded-xs">
                                  4x4
                                </span>
                              </Link>

                              <ul className="space-y-1 text-xs">
                                <li>
                                  <Link
                                    to="/products/t9-hunter"
                                    onClick={() => setIsProductsDropdownOpen(false)}
                                    className="group/item flex items-center justify-between p-2 rounded-xs hover:bg-red-50/70 hover:text-[#C8102E] text-gray-700 font-semibold transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E]" />
                                      <span>Hunter</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[#C8102E] group-hover/item:translate-x-0.5 transition-all" />
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    to="/products/t9-frison"
                                    onClick={() => setIsProductsDropdownOpen(false)}
                                    className="group/item flex items-center justify-between p-2 rounded-xs hover:bg-red-50/70 hover:text-[#C8102E] text-gray-700 font-semibold transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E]" />
                                      <span>Frison</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[#C8102E] group-hover/item:translate-x-0.5 transition-all" />
                                  </Link>
                                </li>
                              </ul>
                            </div>

                            {/* 2. JAC Commercial Column */}
                            <div className="pl-6 space-y-3">
                              <Link
                                to="/products?category=jac-commercial"
                                onClick={() => setIsProductsDropdownOpen(false)}
                                className="group/cat flex items-center justify-between pb-2 border-b border-gray-100 text-gray-900 hover:text-[#C8102E] transition-colors"
                              >
                                <span className="font-extrabold text-sm uppercase tracking-wide">
                                  2. JAC Commercial
                                </span>
                                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-xs">
                                  Trucks
                                </span>
                              </Link>

                              <ul className="space-y-1 text-xs">
                                {[
                                  { name: 'X200', slug: 'jac-x200', tag: '1.15-Ton Deck' },
                                  { name: '1020', slug: 'jac-1020', tag: '3.5-Ton Freight' },
                                  { name: '1042', slug: 'jac-1042', tag: '14-Foot Deck' },
                                  { name: '1091', slug: 'jac-1091', tag: '17-Foot Deck' },
                                  { name: '1120', slug: 'jac-1120', tag: '20-Foot Deck' },
                                ].map((model) => (
                                  <li key={model.slug}>
                                    <Link
                                      to={`/products/${model.slug}`}
                                      onClick={() => setIsProductsDropdownOpen(false)}
                                      className="group/item flex items-center justify-between p-1.5 rounded-xs hover:bg-gray-100 hover:text-[#C8102E] text-gray-700 font-semibold transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover/item:bg-[#C8102E] transition-colors" />
                                        <span>{model.name}</span>
                                      </div>
                                      <span className="text-[10px] text-gray-400 font-mono">
                                        {model.tag}
                                      </span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* 3. Dongfeng Column */}
                            <div className="pl-6 space-y-3">
                              <Link
                                to="/products?category=dongfeng"
                                onClick={() => setIsProductsDropdownOpen(false)}
                                className="group/cat flex items-center justify-between pb-2 border-b border-gray-100 text-gray-900 hover:text-[#C8102E] transition-colors"
                              >
                                <span className="font-extrabold text-sm uppercase tracking-wide">
                                  3. Dongfeng
                                </span>
                                <span className="text-[10px] font-bold text-[#C8102E] bg-red-50 px-2 py-0.5 rounded-xs">
                                  Heavy & Light
                                </span>
                              </Link>

                              <div className="space-y-3 text-xs">
                                {/* Heavy Subcategory */}
                                <div className="space-y-1">
                                  <Link
                                    to="/products?category=dongfeng&subcategory=heavy"
                                    onClick={() => setIsProductsDropdownOpen(false)}
                                    className="font-bold text-gray-900 uppercase text-[11px] tracking-wider block hover:text-[#C8102E] transition-colors"
                                  >
                                    Heavy:
                                  </Link>
                                  <ul className="pl-2 space-y-1 border-l-2 border-red-200">
                                    <li>
                                      <Link
                                        to="/products/dongfeng-prime-mover"
                                        onClick={() => setIsProductsDropdownOpen(false)}
                                        className="group/item flex items-center justify-between py-1 px-1.5 rounded-xs hover:bg-red-50/70 hover:text-[#C8102E] text-gray-700 font-semibold transition-colors"
                                      >
                                        <span>Prime Movers</span>
                                        <ChevronRight className="w-3 h-3 text-gray-400 group-hover/item:text-[#C8102E]" />
                                      </Link>
                                    </li>
                                    <li>
                                      <Link
                                        to="/products/dongfeng-rigid"
                                        onClick={() => setIsProductsDropdownOpen(false)}
                                        className="group/item flex items-center justify-between py-1 px-1.5 rounded-xs hover:bg-red-50/70 hover:text-[#C8102E] text-gray-700 font-semibold transition-colors"
                                      >
                                        <span>Rigid</span>
                                        <ChevronRight className="w-3 h-3 text-gray-400 group-hover/item:text-[#C8102E]" />
                                      </Link>
                                    </li>
                                  </ul>
                                </div>

                                {/* Light Subcategory */}
                                <div className="pt-1 border-t border-gray-100">
                                  <Link
                                    to="/products/dongfeng-light"
                                    onClick={() => setIsProductsDropdownOpen(false)}
                                    className="group/item flex items-center justify-between p-1.5 rounded-xs hover:bg-red-50/70 hover:text-[#C8102E] text-gray-700 font-bold transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E]" />
                                      <span className="uppercase text-[11px] tracking-wider text-gray-900 group-hover/item:text-[#C8102E]">
                                        Light
                                      </span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[#C8102E]" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mega-Menu Footer Action Bar */}
                        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-medium">
                            Authorized 3S Dealership Inventory — Khyber Motors
                          </span>
                          <Link
                            to="/products"
                            onClick={() => setIsProductsDropdownOpen(false)}
                            className="font-extrabold uppercase tracking-wider text-[#C8102E] hover:text-red-700 flex items-center gap-1 group"
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
