/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Youtube, Instagram, Linkedin } from 'lucide-react';
import BrandierLogo from './BrandierLogo';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Videos', path: '/videos' },
    { name: 'Motion', path: '/motion' },
    { name: 'Images', path: '/images' },
    { name: 'Premium Collection', path: '/premium' },
    { name: 'About Agency', path: '/about' },
  ];

  return (
    <footer className="bg-white border-t border-brand-border mt-32 relative z-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-3 cursor-pointer group text-left"
              id="footer-logo-btn"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-sm p-1">
                <BrandierLogo className="w-full h-full text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-black flex items-center gap-1">
                BrandierStudio<span className="font-mono text-xs px-1.5 py-0.5 bg-black text-white rounded-md tracking-widest uppercase">TV</span>
              </span>
            </button>
            <p className="text-sm text-gray-500 max-w-sm font-medium leading-relaxed">
              Curating the absolute peak of artificial intelligence cinematography, UGC ad creatives, high-fashion storytelling, and responsive motion graphics.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-all"
                aria-label="YouTube"
                id="footer-youtube-link"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-all"
                aria-label="Instagram"
                id="footer-instagram-link"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-all"
                aria-label="LinkedIn"
                id="footer-linkedin-link"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Sitemaps */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-black mb-4">
              Explore Library
            </h3>
            <ul className="space-y-2.5">
              {links.slice(0, 4).map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => onNavigate(link.path)}
                    className="text-sm text-gray-500 hover:text-black transition-colors cursor-pointer text-left"
                    id={`footer-nav-${link.path.replace('/', '') || 'home'}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Agency */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-black mb-4">
              Studio
            </h3>
            <ul className="space-y-2.5">
              {links.slice(4).map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => onNavigate(link.path)}
                    className="text-sm text-gray-500 hover:text-black transition-colors cursor-pointer text-left"
                    id={`footer-nav-${link.path.replace('/', '')}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('/admin')}
                  className="text-sm text-gray-400 hover:text-black transition-colors cursor-pointer text-left hidden-admin-footer"
                  id="footer-admin-link"
                >
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} BrandierStudioTV. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1.5 font-sans">
            AI Content. Motion. Creativity.
          </p>
        </div>
      </div>
    </footer>
  );
}
