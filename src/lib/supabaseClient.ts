import { createClient } from "@supabase/supabase-js";
import { MediaItem, Lead } from "../types";

// Fallbacks are derived matching backend config for robust client-side cloud connectivity
const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || "https://fctalnchvojgqhkezope.supabase.co";
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || "sb_publishable_wijjU8m2n4D5jYbmoTrNgA_zYemfvii";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Resilient Bidirectional Translators
export function mapRowToMediaItem(row: any): MediaItem {
  const tagsParsed = Array.isArray(row.tags) 
    ? row.tags 
    : (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || []);
  const toolsParsed = Array.isArray(row.tools) 
    ? row.tools 
    : (typeof row.tools === 'string' ? JSON.parse(row.tools) : row.tools || []);

  return {
    id: row.id,
    type: row.type || 'video',
    title: row.title || '',
    description: row.description || '',
    category: row.category || '',
    thumbnailUrl: row.thumbnailUrl || row.thumbnail_url || row.thumbnailurl || '',
    videoUrl: row.videoUrl || row.video_url || row.videourl || '',
    instagramUrl: row.instagramUrl || row.instagram_url || row.instagramurl || '',
    linkedinUrl: row.linkedinUrl || row.linkedin_url || row.linkedinurl || '',
    tiktokUrl: row.tiktokUrl || row.tiktok_url || row.tiktokurl || '',
    tags: Array.isArray(tagsParsed) ? tagsParsed : [],
    tools: Array.isArray(toolsParsed) ? toolsParsed : [],
    duration: row.duration || '',
    isPremium: row.isPremium !== undefined ? row.isPremium : (row.is_premium !== undefined ? row.is_premium : (row.ispremium !== undefined ? row.ispremium : false)),
    isSpotlight: row.isSpotlight !== undefined ? row.isSpotlight : (row.is_spotlight !== undefined ? row.is_spotlight : (row.isspotlight !== undefined ? row.isspotlight : false)),
    isComingSoon: row.isComingSoon !== undefined ? row.isComingSoon : (row.is_coming_soon !== undefined ? row.is_coming_soon : (row.iscomingsoon !== undefined ? row.iscomingsoon : false)),
    slug: row.slug || '',
    createdAt: row.createdAt || row.created_at || row.createdat || new Date().toISOString(),
    aspectRatio: row.aspectRatio || row.aspect_ratio || row.aspectratio || '16:9',
  };
}

export function mapMediaItemToRow(item: MediaItem) {
  return {
    id: item.id,
    type: item.type || 'video',
    title: item.title || '',
    description: item.description || '',
    category: item.category || '',
    thumbnail_url: item.thumbnailUrl || '',
    video_url: item.videoUrl || '',
    instagram_url: item.instagramUrl || '',
    linkedin_url: item.linkedinUrl || '',
    tiktok_url: item.tiktokUrl || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    tools: Array.isArray(item.tools) ? item.tools : [],
    duration: item.duration || '',
    is_premium: !!item.isPremium,
    is_spotlight: !!item.isSpotlight,
    is_coming_soon: !!item.isComingSoon,
    slug: item.slug || '',
    created_at: item.createdAt || new Date().toISOString(),
    aspect_ratio: item.aspectRatio || '16:9',
  };
}

export function mapRowToLead(row: any): Lead {
  return {
    email: row.email,
    timestamp: row.timestamp || row.created_at || row.createdat || new Date().toISOString(),
    status: (row.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected',
  };
}

export function mapLeadToRow(lead: Lead) {
  return {
    email: lead.email,
    timestamp: lead.timestamp || new Date().toISOString(),
    status: lead.status || "pending"
  };
}
