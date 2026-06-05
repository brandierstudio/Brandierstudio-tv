/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, Image, Film, Clock, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem } from '../types';
import BrandierLogo from './BrandierLogo';

interface MediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  aspectRatioClassName?: string; // e.g. "aspect-video" or "aspect-[4/3]"
  key?: React.Key;
}

export default function MediaCard({
  item,
  onSelect,
  aspectRatioClassName = 'aspect-[16/10]',
}: MediaCardProps) {
  const isVideo = item.type === 'video';
  const isMotion = item.type === 'motion';
  const isImage = item.type === 'image';
  const isComingSoon = isVideo || isMotion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="group relative bg-white border border-[#E5E7EB] rounded-[24px] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={() => onSelect(item)}
      id={`media-card-${item.id}`}
    >
      {/* Thumbnail Shell */}
      <div className={`relative ${aspectRatioClassName} w-full overflow-hidden bg-gray-50 border-b border-gray-100`}>
        {isComingSoon ? (
          <div className="absolute inset-0 bg-linear-to-br from-[#FAFAFA]/70 via-white/50 to-[#F3F4F6]/20 backdrop-blur-xs flex flex-col items-center justify-center p-4">
            {/* Subtle decorative dot grid background for artistic tech feeling */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="w-14 h-14 opacity-40 group-hover:opacity-85 group-hover:scale-110 transition-all duration-500 ease-out z-0 text-black">
              <BrandierLogo className="w-full h-full text-black" />
            </div>
          </div>
        ) : (
          <>
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Shadow overlays */}
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          </>
        )}

        {/* Category Badge - custom pill top-left */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-white/95 text-black font-semibold text-[11px] rounded-full uppercase tracking-wider backdrop-blur-xs shadow-sm border border-neutral-100">
          {isVideo && <Film className="w-3 h-3 text-black" />}
          {isMotion && <Sparkles className="w-3 h-3 text-black" />}
          {isImage && <Image className="w-3 h-3 text-black" />}
          <span>{item.category}</span>
        </div>

        {/* Premium badge - top-right if applicable */}
        {item.isPremium && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1 bg-black text-white font-mono text-[9px] rounded-sm tracking-widest uppercase shadow-sm">
            PREMIUM
          </div>
        )}

        {/* Duration badge - bottom-left */}
        {!isComingSoon && item.duration && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 px-2 py-0.5 bg-black/60 text-white font-mono text-[9px] rounded-sm backdrop-blur-xs">
            <Clock className="w-2.5 h-2.5" />
            <span>{item.duration}</span>
          </div>
        )}

        {/* BrandierStudioTV Watermark overlay - essential requirement! */}
        <div className="absolute bottom-4 right-4 z-10 select-none pointer-events-none watermark-overlay flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg backdrop-blur-md">
          <BrandierLogo className="w-3.5 h-3.5 text-white" />
          <span className="font-display font-bold text-[9px] text-white/90 tracking-widest uppercase">
            BrandierStudio<span className="text-[9px] font-mono font-normal">TV</span>
          </span>
        </div>

        {/* Hover overlay action prompt */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/5">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300 p-2.5">
            {isImage ? <ArrowUpRight className="w-5 h-5 text-black" /> : <BrandierLogo className="w-full h-full text-black animate-pulse" />}
          </div>
        </div>
      </div>

      {/* Card Info details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#7C3AED]/70 uppercase font-bold block mb-1">
            {item.type.toUpperCase()} • ACTIVE FORMULA
          </span>
          <h3 className="font-display font-bold text-base text-gray-900 group-hover:text-purple-600 leading-snug transition-colors line-clamp-2">
            {isComingSoon ? "Coming Soon" : item.title}
          </h3>
          <p className="text-xs text-gray-500 font-normal line-clamp-2 mt-2 leading-relaxed">
            {isComingSoon ? "This brand-boosting video Formulation is currently under development. Dynamic preview coming soon." : item.description}
          </p>
        </div>

        {/* Footer info containing tools used */}
        <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex gap-1 overflow-hidden shrink">
            {isComingSoon ? (
              <span className="text-[9px] px-2 py-0.5 bg-indigo-50 font-semibold text-indigo-600 rounded-sm uppercase tracking-wider">
                In Production
              </span>
            ) : (
              item.tools.slice(0, 2).map((tool, i) => (
                <span
                  key={i}
                  className="text-[9px] scrollbar-thin px-2 py-0.5 bg-gray-100 font-medium text-gray-600 rounded-sm truncate"
                >
                  {tool}
                </span>
              ))
            )}
            {!isComingSoon && item.tools.length > 2 && (
              <span className="text-[9px] px-1 py-0.5 bg-gray-100 text-gray-500 rounded-sm font-medium">
                +{item.tools.length - 2}
              </span>
            )}
          </div>
          <span className="font-sans text-[11px] font-bold text-black border-b border-black/40 group-hover:border-black shrink-0 transition-colors uppercase tracking-wider flex items-center gap-0.5 whitespace-nowrap">
            {isImage ? 'Preview' : (isComingSoon ? 'Details' : 'Watch')}
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
