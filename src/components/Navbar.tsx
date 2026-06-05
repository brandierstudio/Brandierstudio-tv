/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Menu, X, Sparkles, Play, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BrandierLogo from './BrandierLogo';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onSearchClick: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function Navbar({
  currentPath,
  onNavigate,
  onSearchClick,
  searchQuery,
  onSearchChange,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Videos', path: '/videos' },
    { name: 'Motion', path: '/motion' },
    { name: 'Images', path: '/images' },
    { name: 'Premium', path: '/premium' },
    { name: 'About', path: '/about' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* L&R alignment: Left logo */}
            <div className="flex items-center gap-12">
              <button
                onClick={() => handleLinkClick('/')}
                className="flex items-center gap-3 group text-left cursor-pointer"
                id="navbar-logo-btn"
              >
                <div className="w-10 h-10 flex items-center justify-center text-black transition-transform duration-300 group-hover:scale-105">
                  <BrandierLogo className="w-full h-full text-black" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-lg tracking-tight text-black leading-none flex items-center gap-1">
                    BrandierStudio<span className="font-mono text-xs px-1.5 py-0.5 bg-black text-white rounded-md tracking-widest uppercase">TV</span>
                  </span>
                  <span className="text-[10px] purple-blush-text font-bold tracking-widest uppercase mt-0.5 animate-pulse">
                    AI UGC Ads & Commercials
                  </span>
                </div>
              </button>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => {
                  const isActive = currentPath === link.path;
                  return (
                    <button
                      key={link.path}
                      onClick={() => handleLinkClick(link.path)}
                      className={`font-sans text-sm font-medium transition-colors relative py-1.5 cursor-pointer ${
                        isActive ? 'text-black font-semibold' : 'text-gray-500 hover:text-black'
                      }`}
                      id={`nav-link-${link.name.toLowerCase()}`}
                    >
                      {link.name}
                      {isActive && (
                        <motion.div
                          layoutId="navIndicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              {/* Desktop Inline Search search button */}
              <div className="hidden lg:flex items-center relative w-64">
                <input
                  type="text"
                  placeholder="Search masterpieces..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onClick={onSearchClick}
                  className="w-full pl-9 pr-4 py-2 border border-var(--color-brand-border) rounded-2xl bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                  id="navbar-desktop-search"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              </div>

              {/* Mobile and general search trigger */}
              <button
                onClick={onSearchClick}
                className="lg:hidden p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 cursor-pointer"
                aria-label="Search"
                id="search-trigger-mobile"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Hidden Admin Entry Link with custom key visual (Subtle access point) */}
              <button
                onClick={() => handleLinkClick('/admin')}
                className={`p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black cursor-pointer ${
                  currentPath === '/admin' ? 'text-black bg-gray-100' : ''
                }`}
                title="Admin Portal"
                id="admin-portal-link"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>

              {/* Mobile Hamburger menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 cursor-pointer"
                aria-label="Mobile Menu"
                id="mobile-menu-trigger"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Mobile Sheet Drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 p-6 flex flex-col shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <span className="font-display font-bold text-lg tracking-tight">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 cursor-pointer"
                  id="mobile-drawer-close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile routing links list */}
              <ul className="flex flex-col gap-5 flex-1">
                {navLinks.map((link) => {
                  const isActive = currentPath === link.path;
                  return (
                    <li key={link.path}>
                      <button
                        onClick={() => handleLinkClick(link.path)}
                        className={`w-full text-left text-lg font-medium py-2 rounded-xl transition-all flex items-center justify-between ${
                          isActive ? 'text-black pl-2 font-bold bg-gray-50' : 'text-gray-500 hover:text-black hover:pl-2'
                        }`}
                        id={`mobile-nav-${link.name.toLowerCase()}`}
                      >
                        {link.name}
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-black mr-2" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Sidebar stats or credits */}
              <div className="mt-auto border-t border-gray-100 pt-6">
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-medium tracking-wider">
                    BRANDIERSTUDIOTV
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    AI Content. Motion. Creativity.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
