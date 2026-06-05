/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  getStoredMedia, 
  saveStoredMedia, 
  CATEGORIES 
} from './db/mockDb';
import { MediaItem, Lead } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MediaCard from './components/MediaCard';
import WatchPage from './components/WatchPage';
import AdminPanel from './components/AdminPanel';
import PremiumPage from './components/PremiumPage';
import BrandierLogo from './components/BrandierLogo';
import { 
  Sparkles, 
  Play, 
  Search as SearchIcon, 
  X, 
  Compass, 
  Tv2, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Globe, 
  Mail,
  ChevronRight,
  User,
  ExternalLink,
  Layers,
  Flame,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Simple client-side router based on URL hash patterns
function parseHashRoute() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/watch/')) {
    const slug = hash.replace('#/watch/', '');
    return { path: '/watch', params: { slug } };
  }
  return { path: hash.replace('#', '') || '/', params: {} };
}

export default function App() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [route, setRoute] = useState<{ path: string; params: Record<string, string> }>({ path: '/', params: {} });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Leads & Premium Locker state
  const [premiumUnlocked, setPremiumUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('brandier_premium_unlocked') === 'true';
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('brandier_leads') || '[]');
    } catch {
      return [];
    }
  });

  const handleAddLead = (email: string) => {
    const newLead: Lead = { email, timestamp: new Date().toISOString() };
    const updated = [newLead, ...leads];
    setLeads(updated);
    localStorage.setItem('brandier_leads', JSON.stringify(updated));
    localStorage.setItem('brandier_premium_unlocked', 'true');
    setPremiumUnlocked(true);
    
    // Dispatch custom event to notify listening frames or sync immediately
    window.dispatchEvent(new CustomEvent('brandier_lead_captured', { detail: newLead }));
  };

  const handleClearLeads = () => {
    setLeads([]);
    localStorage.removeItem('brandier_leads');
  };

  // States for general filters
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('All');
  
  // Image modal preview state
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  
  // State for interactive hero project spotlight
  const [heroActiveIndex, setHeroActiveIndex] = useState(0);

  // Load items on mount
  useEffect(() => {
    setMediaItems(getStoredMedia());

    // Router synchronization
    const handleHashChange = () => {
      setRoute(parseHashRoute());
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial load
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update URL hash when triggered locally
  const navigateTo = (path: string, params: Record<string, string> = {}) => {
    if (path === '/watch' && params.slug) {
      window.location.hash = `#/watch/${params.slug}`;
    } else {
      window.location.hash = `#${path}`;
    }
  };

  const handleSaveItems = (updated: MediaItem[]) => {
    setMediaItems(updated);
    saveStoredMedia(updated);
  };

  const handleSelectMedia = (item: MediaItem) => {
    if (item.type === 'image') {
      setSelectedImage(item);
    } else {
      navigateTo('/watch', { slug: item.slug });
    }
  };

  // Filter lists based on global search & custom categories
  const filteredSearchItems = searchQuery.trim() === '' 
    ? [] 
    : mediaItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // Categories helper
  const featuredVideoAds = mediaItems.filter(m => m.type === 'video' && m.category === 'UGC Ads');
  const latestCreations = [...mediaItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Specific list collections
  const videosCollection = mediaItems.filter(m => m.type === 'video');
  const filteredVideos = videoCategoryFilter === 'All' 
    ? videosCollection 
    : videosCollection.filter(m => m.category === videoCategoryFilter);

  const motionCollection = mediaItems.filter(m => m.type === 'motion');
  const imagesCollection = mediaItems.filter(m => m.type === 'image');
  const premiumCollection = mediaItems.filter(m => m.isPremium);

  // Layout page components
  const renderPage = () => {
    switch (route.path) {
      case '/':
        return renderHome();
      case '/videos':
        return renderVideosPage();
      case '/motion':
        return renderMotionPage();
      case '/images':
        return renderImagesPage();
      case '/premium':
        return (
          <PremiumPage 
            premiumCollection={premiumCollection}
            premiumUnlocked={premiumUnlocked}
            onSelectMedia={handleSelectMedia}
            onAddLead={handleAddLead}
          />
        );
      case '/about':
        return renderAboutPage();
      case '/admin':
        return (
          <AdminPanel 
            mediaItems={mediaItems} 
            onSaveItems={handleSaveItems} 
            onNavigate={(p) => navigateTo(p)} 
            leads={leads}
            onClearLeads={handleClearLeads}
          />
        );
      case '/watch':
        const slug = route.params.slug;
        const targetItem = mediaItems.find(m => m.slug === slug);
        if (targetItem) {
          return (
            <WatchPage 
              item={targetItem} 
              allMedia={mediaItems} 
              onNavigate={(p) => navigateTo(p)} 
              onSelectItem={handleSelectMedia} 
            />
          );
        }
        return (
          <div className="py-40 text-center font-sans">
            <h2 className="text-xl font-bold">Asset not found</h2>
            <button onClick={() => navigateTo('/')} className="mt-4 px-4 py-2 bg-black text-white rounded-lg">
              Return Home
            </button>
          </div>
        );
      default:
        return renderHome();
    }
  };

  // --- HOME PAGE TAB ---
  const renderHome = () => {
    // Dynamic selector for 3 top-tier spotlight campaigns
    const spotlightItems = mediaItems.filter(m => 
      ['aura-of-chronos-luxury-timepiece', 'specter-gt-electric-hypercar-launch', 'nouveau-chic-neo-tokyo-fashion'].includes(m.slug)
    ).slice(0, 3);
    
    const activeSpotlightList = spotlightItems.length === 3 ? spotlightItems : mediaItems.slice(0, 3);
    const featuredItem = activeSpotlightList[heroActiveIndex] || activeSpotlightList[0];

    return (
      <div className="space-y-24 font-sans pb-24">
        {/* Artistic-themed Home Hero Section */}
        <section className="relative overflow-hidden pt-12 lg:pt-16 pb-16 px-6 sm:px-12 max-w-7xl mx-auto rounded-[32px] bg-white border border-[#E5E7EB] shadow-xs">
          {/* Faint Abstract Background Grid Decorator */}
          <div className="absolute inset-0 opacity-4 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Glowing Ambient Light Orbs underneath (Artistic Purple Blush Accent) */}
          <div className="absolute -top-16 -right-16 w-96 h-96 rounded-full bg-linear-to-br from-indigo-200/40 via-purple-100/30 to-pink-100/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-96 h-96 rounded-full bg-linear-to-br from-purple-200/30 via-fuchsia-100/20 to-indigo-100/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content Column */}
            <div className="col-span-1 lg:col-span-5 space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full border border-neutral-200/60"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold purple-blush-text animate-pulse">
                  AI UGC ADVERTISERS
                </span>
              </motion.div>

              <div className="space-y-3">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="font-display font-medium text-4xl sm:text-5xl lg:text-6xl text-black tracking-tight leading-[1.05]"
                >
                  BrandierStudio<span className="font-light italic font-serif text-purple-600">TV</span>
                  <span className="block mt-3 text-transparent bg-clip-text purple-blush-bg font-bold text-3xl sm:text-4xl lg:text-5xl">
                    High-End AI UGC Ads
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-xs text-neutral-450 max-w-sm leading-relaxed"
                >
                  We craft high-converting AI UGC adverts & commercials with custom high-fidelity brand aesthetics.
                </motion.p>
              </div>

              {/* Action Buttons styled cleanly */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4"
              >
                <button
                  onClick={() => navigateTo('/videos')}
                  className="px-6 py-3 bg-black hover:bg-neutral-900 text-white font-semibold text-sm rounded-xl cursor-pointer duration-200 flex items-center gap-2 shadow-xs transition-colors"
                  id="hero-explore-library-btn"
                >
                  <Compass className="w-4 h-4" />
                  Explore Library
                </button>

                <button
                  onClick={() => navigateTo('/premium')}
                  className="px-6 py-3 bg-white hover:bg-neutral-50 border border-neutral-200 text-black font-semibold text-sm rounded-xl cursor-pointer duration-200 flex items-center gap-2 shadow-xs transition-colors"
                  id="hero-premium-btn"
                >
                  <Tv2 className="w-4 h-4" />
                  Premium Collection
                </button>
              </motion.div>

              {/* Spotlight Pagination Controls (Artistic Selector) */}
              {activeSpotlightList.length > 0 && (
                <div className="pt-6 border-t border-neutral-100 flex flex-col gap-3">
                  <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
                    SPOTLIGHT ARCHIVES
                  </span>
                  <div className="flex flex-col gap-2">
                    {activeSpotlightList.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setHeroActiveIndex(idx)}
                        className={`text-left text-xs font-mono py-1.5 px-3 rounded-lg flex items-center justify-between transition-all duration-300 ${
                          heroActiveIndex === idx
                            ? 'bg-neutral-100 text-black font-bold pl-5'
                            : 'text-neutral-400 hover:text-black hover:bg-neutral-50/50'
                        }`}
                        id={`hero-spotlight-btn-${idx}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] text-neutral-300">0{idx + 1}</span>
                          <span className="truncate max-w-[200px]">{item.title}</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-neutral-400">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Spotlight Showcase container styled elegantly */}
            <div className="col-span-1 lg:col-span-7 relative">
              <AnimatePresence mode="wait">
                {featuredItem && (
                  <motion.div
                    key={featuredItem.id}
                    initial={{ opacity: 0, scale: 0.98, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98, x: -20 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="group relative bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-md flex flex-col cursor-pointer"
                    onClick={() => handleSelectMedia(featuredItem)}
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-[#FAFAFA]">
                      {featuredItem && (featuredItem.type === 'video' || featuredItem.type === 'motion') ? (
                        <div className="absolute inset-0 bg-linear-to-br from-[#FAFAFA]/70 via-white/50 to-[#F3F4F6]/20 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
                          <div className="w-16 h-16 opacity-40 group-hover:opacity-85 group-hover:scale-110 transition-all duration-500 ease-out z-0 text-black">
                            <BrandierLogo className="w-full h-full text-black" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={featuredItem.thumbnailUrl}
                            alt={featuredItem.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                          />
                          {/* Overlays */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-70" />
                        </>
                      )}

                      {/* Floating Category Pinned */}
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-white/95 text-black font-semibold text-[11px] rounded-full uppercase tracking-wider shadow-sm border border-neutral-100">
                        <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
                        <span>Featured {featuredItem.category}</span>
                      </div>

                      {/* Hot indicator or premium */}
                      {featuredItem.isPremium && (
                        <div className="absolute top-4 right-4 z-10 font-mono text-[9px] bg-black text-white px-2.5 py-1 tracking-widest rounded-sm uppercase font-semibold">
                          PREMIUM
                        </div>
                      )}

                      {/* Watermark brand overlay */}
                      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg backdrop-blur-md">
                        <BrandierLogo className="w-3.5 h-3.5 text-white" />
                        <span className="font-display font-bold text-[9px] text-white/90 tracking-widest uppercase">
                          BrandierStudio<span className="text-[9px] font-mono font-normal">TV</span>
                        </span>
                      </div>

                      {/* Play action overlay button */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-14 h-14 rounded-full bg-white/95 hover:bg-white text-black flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 duration-300 p-3.5">
                          <BrandierLogo className="w-full h-full text-black animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Metadata summary */}
                    <div className="p-6 space-y-3 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-widest text-[#7C3AED]/80 uppercase font-bold">
                          CAMPAIGN FOCUS: {featuredItem.type.toUpperCase()} • ACTIVE FORMULA
                        </span>
                        {featuredItem.type !== 'video' && featuredItem.type !== 'motion' && featuredItem.duration && (
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-sm">
                            {featuredItem.duration} MINSEC
                          </span>
                        )}
                        {(featuredItem.type === 'video' || featuredItem.type === 'motion') && (
                          <span className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-sm uppercase tracking-wider">
                            In Production
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-lg text-black tracking-tight leading-snug group-hover:text-purple-600 transition-colors">
                        {(featuredItem.type === 'video' || featuredItem.type === 'motion') ? "Coming Soon" : featuredItem.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-normal line-clamp-2">
                        {(featuredItem.type === 'video' || featuredItem.type === 'motion') ? "This creative brand-boosting UGC campaign formulation is currently under development. Detailed preview coming soon." : featuredItem.description}
                      </p>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <div className="flex gap-1.5 overflow-hidden">
                          {(featuredItem.type === 'video' || featuredItem.type === 'motion') ? (
                            <span className="text-[9px] px-2 py-0.5 bg-neutral-50 text-neutral-400 rounded-sm font-semibold uppercase tracking-wider border border-neutral-150">
                              Active Pipeline
                            </span>
                          ) : (
                            featuredItem.tools.slice(0, 3).map((tool, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] px-2 py-0.5 bg-neutral-50 border border-neutral-150 text-neutral-500 rounded-sm font-medium"
                              >
                                {tool}
                              </span>
                            ))
                          )}
                        </div>
                        <span className="text-xs font-semibold text-black flex items-center gap-1 group-hover:underline">
                          {(featuredItem.type === 'video' || featuredItem.type === 'motion') ? "Details" : "Launch Masterpiece"} <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </section>


        {/* --- MOBILE ONLY NETFLIX/APPLE TV HORIZONTAL CHANNELS --- */}
        <section className="block lg:hidden max-w-7xl mx-auto px-4 space-y-12">
          {/* channel 1: FEATURED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-black">Featured Assets</h2>
              <button onClick={() => navigateTo('/videos')} className="text-xs font-semibold text-gray-500 flex items-center">
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
              {featuredVideoAds.map(item => (
                <div key={item.id} className="w-[80vw] sm:w-[50vw] shrink-0 snap-start">
                  <MediaCard item={item} onSelect={handleSelectMedia} aspectRatioClassName="aspect-[16/10]" />
                </div>
              ))}
            </div>
          </div>

          {/* channel 2: LATEST CREATIONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-black">Latest Catalog</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
              {latestCreations.slice(0, 5).map(item => (
                <div key={item.id} className="w-[80vw] sm:w-[50vw] shrink-0 snap-start">
                  <MediaCard item={item} onSelect={handleSelectMedia} aspectRatioClassName="aspect-[16/10]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- DESKTOP DETAILED GRID SECTIONS --- */}
        {/* DESKTOP INTEGRATED AD SHOWCASE (SIMPLIFIED) */}
        <section className="hidden lg:block max-w-7xl mx-auto px-4 space-y-10">
          <div className="flex items-end justify-between border-b border-brand-border pb-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-gray-400 font-bold uppercase block mb-1">
                PREMIUM RELEASES
              </span>
              <h2 className="font-display font-bold text-2xl text-black">
                Latest UGC Campaigns
              </h2>
            </div>
            <button
              onClick={() => navigateTo('/videos')}
              className="text-xs font-semibold purple-blush-text hover:opacity-80 flex items-center gap-1 cursor-pointer transition-opacity"
            >
              Browse All UGC Ads <ArrowRight className="w-4 h-4 text-purple-600 animate-pulse" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVideoAds.slice(0, 3).map((item) => (
              <MediaCard key={item.id} item={item} onSelect={handleSelectMedia} />
            ))}
          </div>
        </section>

        {/* Content type highlights */}
        <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: "Videos & Commercials", 
              desc: "From social first TikTok ads to absolute cinematic luxury video promotions.", 
              count: videosCollection.length, 
              path: "/videos" 
            },
            { 
              title: "Perfect Motion Graphics", 
              desc: "Unending ambient loops, futuristic logo animations, and smooth kinetic visuals.", 
              count: motionCollection.length, 
              path: "/motion" 
            },
            { 
              title: "Aesthetic AI Images", 
              desc: "Midjourney masterpieces and precise high-fashion concept compositions.", 
              count: imagesCollection.length, 
              path: "/images" 
            }
          ].map((block, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-brand-border rounded-[24px] p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >
              <div>
                <span className="font-mono text-xs text-gray-450 font-bold uppercase block mb-1">
                  {block.count} Masterpieces
                </span>
                <h3 className="font-display font-bold text-lg text-black mb-3">
                  {block.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-normal">
                  {block.desc}
                </p>
              </div>

              <button
                onClick={() => navigateTo(block.path)}
                className="mt-6 text-sm font-semibold text-black hover:underline cursor-pointer flex items-center gap-1 text-left"
              >
                Launch Catalog <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </section>
      </div>
    );
  };

  // --- VIDEOS PAGE ---
  const renderVideosPage = () => {
    const videoCategories = ['All', 'UGC Ads', 'Commercials', 'Fashion', 'Luxury', 'Automotive', 'Product Ads', 'Social Media Ads'];
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 space-y-12 font-sans">
        <div className="space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase block">
            AI CINEMATOGRAPHY
          </span>
          <h1 className="font-display font-medium text-3xl sm:text-5xl text-black tracking-tight leading-none">
            Videos & <span className="font-serif italic font-light text-neutral-500">Commercials</span>
          </h1>
          <p className="text-gray-500 max-w-xl text-sm sm:text-base leading-relaxed">
            UGC ads, high-fashion branding campaigns, and responsive product reveals crafted using top-tier AI pipelines.
          </p>
        </div>

        {/* Custom video categories filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-gray-150">
          {videoCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setVideoCategoryFilter(cat)}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
                videoCategoryFilter === cat
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((item) => (
            <MediaCard key={item.id} item={item} onSelect={handleSelectMedia} />
          ))}

          {filteredVideos.length === 0 && (
            <p className="col-span-full py-16 text-center text-gray-400">
              No matching video assets found under category {videoCategoryFilter}.
            </p>
          )}
        </div>
      </div>
    );
  };

  // --- MOTION PAGE ---
  const renderMotionPage = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 space-y-12 font-sans">
        <div className="space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase block">
            KINETIC & AMBIENT
          </span>
          <h1 className="font-display font-medium text-3xl sm:text-5xl text-black tracking-tight leading-none">
            Motion Graphics & <span className="font-serif italic font-light text-neutral-500">Loops</span>
          </h1>
          <p className="text-gray-500 max-w-xl text-sm leading-relaxed">
            Stunning endless loops, kinetic reveals, dynamic product backdrops and brand animations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {motionCollection.map((item) => (
            <MediaCard key={item.id} item={item} onSelect={handleSelectMedia} />
          ))}

          {motionCollection.length === 0 && (
            <p className="col-span-full py-16 text-center text-gray-400">
              No motion graphics added yet. Please curate some.
            </p>
          )}
        </div>
      </div>
    );
  };

  // --- IMAGES PAGE (Pinterest-style Masonry) ---
  const renderImagesPage = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 space-y-12 font-sans">
        <div className="space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase block">
            HIGH-ACCURACY COMPOSITIONS
          </span>
          <h1 className="font-display font-medium text-3xl sm:text-5xl text-black tracking-tight leading-none">
            AI Concept <span className="font-serif italic font-light text-neutral-500">Visuals</span>
          </h1>
          <p className="text-gray-500 max-w-xl text-sm leading-relaxed">
            Pinterest-style high fashion and editorial concepts created using Midjourney's latest camera pipelines. Click any asset to preview.
          </p>
        </div>

        {/* Pinterest-style Masonry Columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {imagesCollection.map((item) => (
            <div 
              key={item.id} 
              onClick={() => handleSelectMedia(item)}
              className="break-inside-avoid relative bg-white border border-[#E5E7EB] rounded-[24px] overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              id={`masonry-image-${item.id}`}
            >
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full object-cover rounded-[24px] group-hover:scale-101 transition-transform duration-500"
              />
              
              {/* Overlay info */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end text-white">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/70 block mb-1">
                  {item.category}
                </span>
                <h3 className="font-display font-bold text-base tracking-tight leading-tight">
                  {item.title}
                </h3>
                <div className="mt-3 flex items-center justify-between text-[11px] text-white/80">
                  <span className="font-mono">Explore Details</span>
                  {item.isPremium && (
                    <span className="bg-white text-black px-1.5 py-0.5 rounded-sm text-[8px] font-bold">PREMIUM</span>
                  )}
                </div>
              </div>

              {/* Default persistent Category label in case hover is off */}
              <div className="absolute top-4 left-4 z-10 px-2.5 py-0.5 bg-black/50 hover:bg-black text-white text-[9px] tracking-wider uppercase rounded-sm backdrop-blur-xs font-mono font-bold">
                {item.category}
              </div>
            </div>
          ))}

          {imagesCollection.length === 0 && (
            <p className="py-16 text-center text-gray-400 col-span-full">
              No architectural or concept images added yet.
            </p>
          )}
        </div>
      </div>
    );
  };

  // --- ABOUT PAGE ---
  const renderAboutPage = () => {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 space-y-20 font-sans">
        {/* Intro */}
        <div className="space-y-6 text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase block">
            ABOUT DIRECTORY
          </span>
          <h1 className="font-display font-medium text-4xl sm:text-6xl text-black tracking-tight leading-none">
            BrandierStudio<span className="font-serif italic font-light text-neutral-500">TV</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            We operate at the vanguard of cinematic automation. We couple high-end human art direction with state-of-the-art AI generation pipelines.
          </p>
        </div>

        {/* Dynamic Process Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-b border-gray-150 py-12">
          {[
            { 
              step: "01", 
              title: "Creative Storyboarding", 
              desc: "Deep human intent conceptualization using textual style pairing and layout rules." 
            },
            { 
              step: "02", 
              title: "Cinematic Synthesis", 
              desc: "Deploying high-fidelity tools like Midjourney XL, Runway Gen-3, and Sora to render fluid assets." 
            },
            { 
              step: "03", 
              title: "Premium Post-Production", 
              desc: "Upscaling using Magnific AI, color grading, and composing custom spatial audio." 
            }
          ].map((item, index) => (
            <div key={index} className="space-y-3">
              <span className="font-mono text-3xl font-light text-gray-300 block">
                {item.step}
              </span>
              <h3 className="font-display font-bold text-base text-black">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Contact links and story channels */}
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-8 sm:p-12 space-y-8">
          <div className="space-y-3">
            <h2 className="font-display font-semibold text-lg text-black">
              Agency Mission
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-normal">
              Our ultimate objective is transforming product stories through stunning, ultra-premium motion aesthetics. We bypass bulk workflows to focus completely on distinct, memory-inducing cinematic experiences.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-8 space-y-6">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#151515]">
              Get In Touch With Curators
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-normal">
              <a 
                href="mailto:brandierstudio@gmail.com" 
                className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-purple-600 hover:bg-[#FAF9FF] transition-all font-medium group"
                id="contact-email-link"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center text-[#7C3AED] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-mono font-bold uppercase tracking-wider">Email Inquiry</p>
                  <p className="text-black font-semibold group-hover:text-purple-600 transition-colors">brandierstudio@gmail.com</p>
                </div>
              </a>

              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-purple-600 hover:bg-[#FAF9FF] transition-all font-medium group"
                id="contact-linkedin-link"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center text-[#7C3AED] transition-colors">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-mono font-bold uppercase tracking-wider">Agency Network</p>
                  <p className="text-black font-semibold group-hover:text-purple-600 transition-colors">Brandier studio</p>
                </div>
              </a>

              <a 
                href="https://anasbinmehboob.github.io/brandier-studio/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-purple-100 bg-[#FAF9FF] rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all font-medium group sm:col-span-1"
                id="contact-website-link"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-purple-500 text-[10px] font-mono font-bold uppercase tracking-wider">Official Site</p>
                  <p className="text-purple-900 font-bold">brandier-studio</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F7F8] text-[#111111] flex flex-col justify-between selection:bg-black selection:text-white relative">
      
      {/* Premium Navbar */}
      <Navbar
        currentPath={route.path}
        onNavigate={(p) => navigateTo(p)}
        onSearchClick={() => setSearchModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          if (val.trim() !== '') setSearchModalOpen(true);
        }}
      />

      {/* Main Container Switcher with page transition animations */}
      <main className="flex-grow pt-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={route.path + (route.params.slug || '')}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer rendering */}
      <Footer onNavigate={(p) => navigateTo(p)} />

      {/* --- LIVE INTERACTIVE GLOBAL SEARCH MODAL --- */}
      <AnimatePresence>
        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 font-sans">
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchModalOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-md"
            />

            {/* Main overlay search visual */}
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-[24px] shadow-2xl p-6 overflow-hidden max-h-[80vh] flex flex-col"
            >
              {/* Top search box input */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <SearchIcon className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Query titles, classifications, tools, tags (#fashion...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-base bg-transparent border-0 focus:outline-none focus:ring-0 text-black font-medium leading-none"
                  autoFocus
                />
                <button
                  onClick={() => setSearchModalOpen(false)}
                  className="p-1 px-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-400 hover:text-black cursor-pointer transition-colors"
                >
                  ESC
                </button>
              </div>

              {/* Live matching listings */}
              <div className="flex-grow overflow-y-auto space-y-6">
                {searchQuery.trim() === '' ? (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <Tv2 className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Search Studio Archives</p>
                    <p className="text-xs text-gray-400 font-normal max-w-xs mx-auto leading-relaxed">
                      Enter a keyword to locate campaigns, videos, high-fashion styles, and tools used.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[10px] font-mono tracking-widest text-gray-400 font-bold uppercase">
                      Matching Assets ({filteredSearchItems.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredSearchItems.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => {
                            setSearchModalOpen(false);
                            handleSelectMedia(item);
                          }}
                          className="flex gap-3 p-2 bg-gray-50 border border-gray-100/50 rounded-2xl hover:border-black cursor-pointer group transition-all"
                        >
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-20 h-14 rounded-xl object-cover border border-gray-200"
                          />
                          <div className="flex flex-col justify-center min-w-0">
                            <span className="text-[8px] font-mono tracking-wider text-gray-400 uppercase font-bold">
                              {item.type}
                            </span>
                            <h4 className="text-xs font-semibold text-gray-900 group-hover:text-black line-clamp-1 leading-snug">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      ))}

                      {filteredSearchItems.length === 0 && (
                        <p className="text-xs text-gray-500 italic py-8 text-center col-span-full">
                          No matching assets in catalog.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- IMAGE MODAL PREVIEW --- */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Close modal overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white border border-[#E5E7EB] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh]"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer transition-colors"
                aria-label="Close Preview"
                id="image-preview-close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Massive image left */}
              <div className="md:w-3/5 bg-gray-50 flex items-center justify-center max-h-[40vh] md:max-h-[85vh]">
                <img
                  src={selectedImage.thumbnailUrl}
                  alt={selectedImage.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-white"
                />
              </div>

              {/* Details info right */}
              <div className="md:w-2/5 p-8 flex flex-col justify-between overflow-y-auto max-h-[45vh] md:max-h-[85vh]">
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-[#111111] uppercase font-bold py-0.5 px-2 bg-gray-100 rounded-sm">
                      {selectedImage.category}
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-black tracking-tight leading-tight pt-1">
                      {selectedImage.title}
                    </h2>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed font-normal">
                    {selectedImage.description}
                  </p>

                  {/* AI Tools Used list */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                      AI GENERATION WORKSPACE
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedImage.tools.map((tool, idx) => (
                        <span 
                          key={idx}
                          className="text-[10px] font-sans font-semibold px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-750 rounded-lg"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metadata Classifications */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedImage.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Distributed Platforms Option */}
                <div className="border-t border-gray-100 pt-6 mt-6 space-y-3">
                  <h4 className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                    Distributed Channels
                  </h4>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-gray-100 hover:border-black rounded-lg text-gray-500 hover:text-black transition-all"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-gray-100 hover:border-black rounded-lg text-gray-500 hover:text-black transition-all"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
