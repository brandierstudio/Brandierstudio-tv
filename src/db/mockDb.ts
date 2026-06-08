/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MediaItem } from '../types';
import defaultItems from './media-items.json';

export const DEFAULT_MEDIA_ITEMS: MediaItem[] = defaultItems as MediaItem[];

export const CATEGORIES: string[] = [
  'AI UGC',
  'Commercial',
  'Unboxing',
  'Product Review',
  'Tutorials',
  'Virtual Try On',
  'Pro Try On',
  'TV Spot',
  'Wild Card'
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
