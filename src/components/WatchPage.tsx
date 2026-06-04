/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Share2, Sparkles, ExternalLink, Youtube, Instagram, Linkedin, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem } from '../types';
import MediaCard from './MediaCard';
import BrandierLogo from './BrandierLogo';

interface WatchPageProps {
  item: MediaItem;
  allMedia: MediaItem[];
  onNavigate: (path: string) => void;
  onSelectItem: (item: MediaItem) => void;
}

export default function WatchPage({
  item,
  allMedia,
  onNavigate,
  onSelectItem,
}: WatchPageProps) {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top view smoothly when route or selection updates
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [item.id]);

  const sameTypeRelated = allMedia
    .filter((m) => m.id !== item.id && (m.type === item.type || m.isPremium === item.isPremium))
    .slice(0, 3);

  const fallbackRelated = allMedia.filter((m) => m.id !== item.id).slice(0, 3);
  const relatedItems = sameTypeRelated.length > 0 ? sameTypeRelated : fallbackRelated;

  const isVideo = item.type === 'video' || item.type === 'motion';
  const isComingSoon = item.type === 'video' || item.type === 'motion';
  const youtubeVideoId = item.videoUrl || 'dQw4w9WgXcQ'; // Fallback video ID

  return (
    <div ref={topRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 font-sans">
      {/* Back to library button */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate(item.type === 'video' ? '/videos' : item.type === 'motion' ? '/motion' : '/images')}
          className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors cursor-pointer"
          id="back-to-library-btn"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Library
        </button>
      </div>

      {/* Main Single Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Playable Stage Area */}
        <div className="lg:col-span-2 space-y-8">
          {isComingSoon ? (
            <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-gradient-to-br from-[#FAFAFA]/70 via-white/50 to-[#F3F4F6]/20 border border-neutral-200/50 shadow-2xl flex flex-col items-center justify-center p-8 text-center group">
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
              <div className="w-24 h-24 mb-6 tracking-normal hover:rotate-6 duration-300 transition-transform">
                <BrandierLogo className="w-full h-full text-purple-600 animate-pulse" usePurpleGradient={true} />
              </div>
              <h2 className="font-display font-medium text-2xl text-black tracking-tight leading-none">
                Coming Soon
              </h2>
              <p className="text-xs text-gray-500 max-w-sm mt-3 leading-relaxed">
                The high-end AI video creative formulation for this campaign is in active render. Standing by for launch.
              </p>

              {/* Watermark overlay */}
              <div className="absolute bottom-6 right-6 select-none pointer-events-none watermark-overlay flex items-center gap-1.5 px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md">
                <BrandierLogo className="w-4 h-4 text-white" />
                <span className="font-display font-bold text-xs text-white/95 tracking-widest uppercase">
                  BrandierStudio<span className="font-mono text-xs font-normal">TV</span>
                </span>
              </div>
            </div>
          ) : (
            /* Elegant Image Showcase Stage with Watermark */
            <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-gray-50 border border-brand-border shadow-xl flex items-center justify-center">
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-white"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* Watermark overlay */}
              <div className="absolute bottom-6 right-6 select-none pointer-events-none watermark-overlay flex items-center gap-1.5 px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md">
                <BrandierLogo className="w-4 h-4 text-white" />
                <span className="font-display font-bold text-xs text-white/95 tracking-widest uppercase">
                  BrandierStudio<span className="font-mono text-xs font-normal">TV</span>
                </span>
              </div>
            </div>
          )}

          {/* Core Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#7C3AED] uppercase px-2.5 py-1 bg-purple-50 rounded-sm">
                {item.type} • Active Formula
              </span>
              {item.isPremium && (
                <span className="text-[10px] font-mono tracking-widest font-bold bg-black text-white px-2 py-0.5 rounded-sm">
                  PREMIUM SHOWCASE
                </span>
              )}
              {!isComingSoon && item.duration && (
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Length: {item.duration}
                </span>
              )}
              {isComingSoon && (
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-sm font-semibold tracking-wide uppercase">
                  In Production status
                </span>
              )}
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900 tracking-tight leading-tight">
              {isComingSoon ? 'Coming Soon' : item.title}
            </h1>

            <p className="text-base text-gray-600 font-normal leading-relaxed whitespace-pre-line pt-2">
              {isComingSoon ? 'The luxury bespoke video UGC assets and custom motion graphics for this showcase are under final rendering cycles. Stay tuned for instant launch updates.' : item.description}
            </p>
          </div>
        </div>

        {/* Info & Secondary Sidebar Meta-data */}
        <div className="space-y-8">
          {/* Action Hub / Watch on YouTube Option */}
          {isVideo && (
            <div className="bg-white border border-brand-border rounded-[24px] p-6 space-y-4 shadow-sm">
              <h3 className="font-display font-bold text-sm text-black uppercase tracking-wider">
                Direct Viewing Options
              </h3>
              {isComingSoon ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    This selection is currently in preparation. Stand by for the launch of interactive streaming links.
                  </p>
                  <div className="w-full text-center px-4 py-3 bg-neutral-100 text-neutral-400 font-semibold text-xs border border-neutral-150 rounded-xl cursor-not-allowed select-none uppercase tracking-wider">
                    Viewing Offline
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Unlock high bit-rate stream quality directly on official client channels.
                  </p>
                  <div className="grid grid-cols-1 gap-2.5 pt-2">
                    <a
                      href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-sm w-full"
                      id="watch-on-youtube-btn"
                    >
                      <Youtube className="w-4 h-4 fill-white text-red-600" />
                      Watch on YouTube
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>

                    {item.instagramUrl && (
                      <a
                        href={item.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-black/90 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-sm w-full"
                        id="watch-on-instagram-btn"
                      >
                        <Instagram className="w-4 h-4" />
                        Watch on Instagram
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Watch On / Social Platform Community Links */}
          <div className="bg-white border border-brand-border rounded-[24px] p-6 space-y-5 shadow-sm">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-black">
              Distributed Creative Platforms
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-gray-400" /> YouTube Channel
                </span>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-black hover:underline flex items-center gap-1.5"
                >
                  Visit Channel <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-gray-400" /> Instagram Feed
                </span>
                <a
                  href={item.instagramUrl || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-black hover:underline flex items-center gap-1.5"
                >
                  @BrandierStudio <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-gray-400" /> LinkedIn Network
                </span>
                <a
                  href={item.linkedinUrl || "https://linkedin.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-black hover:underline flex items-center gap-1.5"
                >
                  Brandier Studio <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <Send className="w-4 h-4 text-gray-400" /> TikTok Stream
                </span>
                <a
                  href={item.tiktokUrl || "https://tiktok.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-black hover:underline flex items-center gap-1.5"
                >
                  @brandierstudiotv <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* AI Tech-Stack details */}
          <div className="bg-white border border-brand-border rounded-[24px] p-6 space-y-4 shadow-sm">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Tech-Stack Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.tools.map((tool, index) => (
                <span
                  key={index}
                  className="text-xs px-3 py-1 bg-gray-50 text-gray-700 border border-gray-100 rounded-lg font-semibold"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Tags collection */}
          <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 space-y-3 shadow-xs">
            <h3 className="font-display font-medium text-xs text-gray-500 uppercase tracking-widest">
              Classifications & Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 text-gray-400 hover:text-black transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Visual Curations Sections */}
      <div className="mt-24 border-t border-brand-border pt-16">
        <h2 className="font-display font-bold text-2xl tracking-tight text-black mb-12 flex items-center gap-3">
          <Sparkles className="w-6 h-6 fill-black" /> Related Masterpieces
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedItems.map((related) => (
            <MediaCard key={related.id} item={related} onSelect={onSelectItem} />
          ))}
        </div>
      </div>
    </div>
  );
}
