/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MediaItem } from '../types';

export const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'vid-1',
    type: 'video',
    title: 'Aura of Chronos — Luxury Timepiece UGC Ad',
    description: 'An emotionally resonant, high-contrast visual showcasing a mechanical masterpiece in deep sand. Created with premium AI camera techniques tracking the intricate gold gears and crystal reflections to evoke timeless elegance.',
    category: 'Luxury',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'U6P9N6yWhzE', // Aesthetic Watch
    instagramUrl: 'https://instagram.com/brandierstudiotv',
    linkedinUrl: 'https://linkedin.com/company/brandierstudiotv',
    tiktokUrl: 'https://tiktok.com/@brandierstudiotv',
    tags: ['luxury', 'watch', 'ugc-ad', 'product', 'cinematic'],
    tools: ['Midjourney v6', 'Runway Gen-3', 'ElevenLabs', 'Premiere Pro'],
    duration: '0:30',
    isPremium: true,
    slug: 'aura-of-chronos-luxury-timepiece',
    createdAt: '2026-05-15T12:00:00Z'
  },
  {
    id: 'vid-2',
    type: 'video',
    title: 'Specter GT — Electric Hypercar Launch',
    description: 'Autonomous hypercar rendering slicing through neon-lit rainy Tokyo streets. Designed to emphasize aerodynamics, fluid speed reflections, and lightning-fast electric acceleration in a modern high-fashion aesthetic.',
    category: 'Automotive',
    thumbnailUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'b0uOnd6kPGA', // Porsche Cyberpunk aesthetic
    instagramUrl: 'https://instagram.com/brandierstudiotv',
    tiktokUrl: 'https://tiktok.com/@brandierstudiotv',
    tags: ['automotive', 'ev', 'hypercar', 'tokyo', 'neon'],
    tools: ['Midjourney v6', 'Luma Dream Machine', 'Sora AI', 'After Effects'],
    duration: '1:00',
    isPremium: true,
    slug: 'specter-gt-electric-hypercar-launch',
    createdAt: '2026-06-01T14:30:00Z'
  },
  {
    id: 'vid-3',
    type: 'video',
    title: 'Nouveau Chic — Neo-Tokyo Summer Collection',
    description: 'A vibrant AI-UGC fashion film capturing stunning cyber-punk tailored apparel against floating digital banners. Models in futuristic luxury streetwear walking through hyper-refracting holographic rain.',
    category: 'Fashion',
    thumbnailUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
    videoUrl: '2g811Eo7K8U', // Cyberpunk city vibes / drone
    instagramUrl: 'https://instagram.com/brandierstudiotv',
    linkedinUrl: 'https://linkedin.com/company/brandierstudiotv',
    tags: ['fashion', 'streetwear', 'cyberpunk', 'modeling', 'ugc'],
    tools: ['Magnific AI', 'Runway Gen-3', 'Udium Music', 'CapCut'],
    duration: '0:45',
    isPremium: false,
    slug: 'nouveau-chic-neo-tokyo-fashion',
    createdAt: '2026-05-28T09:15:00Z'
  },
  {
    id: 'vid-4',
    type: 'video',
    title: 'Elysian Essence — Minimalist Parfum Reveal',
    description: 'High-end beauty product ad presenting a crystal perfume bottle floating inside swirling liquid pastel marble waves. Focuses on premium glass refraction and organic movement.',
    category: 'Product Ads',
    thumbnailUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop',
    videoUrl: '3_668pL0dmo', // Fluid physics simulation
    instagramUrl: 'https://instagram.com/brandierstudiotv',
    tiktokUrl: 'https://tiktok.com/@brandierstudiotv',
    tags: ['parfum', 'cosmetics', 'fluid-dynamics', 'luxury', 'commercial'],
    tools: ['Stable Diffusion XL', 'Heuristic Render', 'Runway Gen-3', 'After Effects'],
    duration: '0:15',
    isPremium: false,
    slug: 'elysian-essence-parfum-reveal',
    createdAt: '2026-06-03T18:00:00Z'
  },
  {
    id: 'motion-1',
    type: 'motion',
    title: 'Holographic Liquid Marble Loop',
    description: 'Hypnotic metallic oil liquid simulation cycling endlessly in shimmering spectral gradients. This aesthetic was integrated into luxury apparel presentations and tech-stack intros.',
    category: 'Animations',
    thumbnailUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop',
    videoUrl: '3_668pL0dmo', // Liquid marble 3D vibe
    instagramUrl: 'https://instagram.com/brandierstudiotv',
    tags: ['motion-graphics', 'loop', 'holographic', 'abstract', 'ambient'],
    tools: ['Cinema 4D', 'Redshift', 'Stable Video Diffusion'],
    duration: '0:10',
    isPremium: false,
    slug: 'holographic-liquid-marble-loop',
    createdAt: '2026-05-10T15:20:00Z'
  },
  {
    id: 'motion-2',
    type: 'motion',
    title: 'Brandier Elite Monolith Reveal',
    description: 'A striking logo cinematic animation where metallic Obsidian slabs emerge from mirror-finished basalt obsidian tiles. Features soft raytracing, volumetric lens flares, and deep sub-bass sound design.',
    category: 'Logo animations',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'tO01J-M3g0U', // Golden obsidian landscape vibe
    tags: ['intro', 'logo-reveal', 'brand-identity', '3d', 'premium'],
    tools: ['Blender 4.1', 'Midjourney v6', 'Luma Dream Machine'],
    duration: '0:08',
    isPremium: true,
    slug: 'brandier-elite-monolith-reveal',
    createdAt: '2026-05-22T10:45:00Z'
  },
  {
    id: 'motion-3',
    type: 'motion',
    title: 'Ascending Lines in Zero-Gravity',
    description: 'Architectural abstract wireframes floating upward in a quiet, zero-gravity vacuum chamber. Perfect backdrops for tech landing pages and futuristic editorial title card slides.',
    category: 'Animations',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'LygfR7-SjZg', // Flowing camera lines
    instagramUrl: 'https://instagram.com/brandierstudiotv',
    tags: ['motion-graphics', 'abstract', 'technology', 'particles', 'loop'],
    tools: ['After Effects', 'Pika Labs', 'Tripo3D'],
    duration: '0:12',
    isPremium: false,
    slug: 'ascending-lines-zero-gravity',
    createdAt: '2026-05-18T16:10:00Z'
  },
  {
    id: 'img-1',
    type: 'image',
    title: 'The Silent Aviator',
    description: 'Extravagant high-definition architectural shot of a brutalist luxury villa built over jagged volcanic coastal cliffs. Rendered at golden hour, capturing hyper-detailed salt-mist spray and complex glass refractions.',
    category: 'Luxury',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    tags: ['architecture', 'luxury', 'villa', 'coastline', 'photorealism'],
    tools: ['Midjourney v6', 'Magnific AI Upcrest'],
    isPremium: true,
    slug: 'silent-aviator-brutalist-villa',
    createdAt: '2026-05-02T08:00:00Z'
  },
  {
    id: 'img-2',
    type: 'image',
    title: 'Cybernetic Nomad Portrait',
    description: 'An elegant studio portrait of a cybernetic augmented wanderer with custom chromatic liquid gold visor inserts and bespoke fabric textures. Minimal white studio lighting.',
    category: 'Fashion',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    tags: ['cyberpunk', 'fashion', 'clothing', 'makeup', 'model'],
    tools: ['Midjourney v6', 'Photoshop AI Generative Fill'],
    isPremium: false,
    slug: 'cybernetic-nomad-portrait',
    createdAt: '2026-05-14T11:40:00Z'
  },
  {
    id: 'img-3',
    type: 'image',
    title: 'Nebula Genesis Explorer',
    description: 'A striking surreal visual featuring an astronaut standing amidst glowing crystalline fauna under a beautiful swirling pink-purple cosmic gas cloud.',
    category: 'Commercials',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=800&auto=format&fit=crop',
    tags: ['cosmic', 'space', 'astronaut', 'surrealism', 'fantasy'],
    tools: ['DALL-E 3', 'Adobe Firefly'],
    isPremium: false,
    slug: 'nebula-genesis-explorer',
    createdAt: '2026-05-20T19:25:00Z'
  },
  {
    id: 'img-4',
    type: 'image',
    title: 'Fluorescent Neon Shibuya Reflections',
    description: 'Cinematic composition highlighting hyper-realistic wet asphalt reflections, glowing storefront signages, and abstract human silhouettes walking under a soft rain canopy.',
    category: 'Social Media Ads',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    tags: ['tokyo', 'neon', 'rain', 'night', 'reflections'],
    tools: ['Midjourney v6', 'Krea AI Upcrest'],
    isPremium: false,
    slug: 'neon-shibuya-reflections',
    createdAt: '2026-06-02T22:30:00Z'
  },
  {
    id: 'img-5',
    type: 'image',
    title: 'Monolithic Quartz Sanctum',
    description: 'Macro scale architectural detail of a monolithic pure white quartz wall inside a minimalist museum, bathed in sharp direct desert sunlight. Features absolute stillness and deep contrast shadows.',
    category: 'Luxury',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    tags: ['quartz', 'interior-design', 'minimalism', 'architectural-render', 'sculpture'],
    tools: ['Midjourney v6', 'Corona Render'],
    isPremium: true,
    slug: 'monolithic-quartz-sanctum',
    createdAt: '2026-05-27T14:15:00Z'
  }
];

export const CATEGORIES: string[] = [
  'UGC Ads',
  'Commercials',
  'Fashion',
  'Luxury',
  'Automotive',
  'Product Ads',
  'Social Media Ads',
  'Animations',
  'Reels',
  'Product reveals',
  'Logo animations'
];

export const TOOLS: string[] = [
  'Midjourney v6',
  'Runway Gen-3',
  'Luma Dream Machine',
  'Sora AI',
  'Magnific AI',
  'ElevenLabs',
  'After Effects',
  'Cinema 4D',
  'Blender 4.1',
  'Krea AI',
  'Adobe Firefly',
  'Photoshop AI'
];

export function getStoredMedia(): MediaItem[] {
  if (typeof window === 'undefined') return DEFAULT_MEDIA_ITEMS;
  const stored = localStorage.getItem('brandier_media_items');
  if (!stored) {
    localStorage.setItem('brandier_media_items', JSON.stringify(DEFAULT_MEDIA_ITEMS));
    return DEFAULT_MEDIA_ITEMS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_MEDIA_ITEMS;
  }
}

export function saveStoredMedia(items: MediaItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('brandier_media_items', JSON.stringify(items));
  }
}

export function resetMediaToDefault() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('brandier_media_items', JSON.stringify(DEFAULT_MEDIA_ITEMS));
  }
}
