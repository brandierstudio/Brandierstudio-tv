/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MediaType = 'video' | 'motion' | 'image';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  videoUrl?: string; // YouTube embed ID or full URL
  instagramUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  tags: string[];
  tools: string[];
  duration?: string; // e.g. "0:45", "1:12"
  isPremium?: boolean;
  isSpotlight?: boolean;
  isComingSoon?: boolean;
  slug: string;
  createdAt: string;
  aspectRatio?: '16:9' | '9:16';
}

export type CategoryType = 
  | 'UGC Ads'
  | 'Commercials'
  | 'Fashion'
  | 'Luxury'
  | 'Automotive'
  | 'Product Ads'
  | 'Social Media Ads'
  | 'Animations'
  | 'Reels'
  | 'Product reveals'
  | 'Logo animations';

export interface FilterOptions {
  searchQuery: string;
  category: string;
  type: MediaType | 'all';
}

export interface Lead {
  email: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

