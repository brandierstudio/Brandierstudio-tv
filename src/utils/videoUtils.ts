/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility functions for video link parsing and thumbnail extraction.
 */

export const getYoutubeId = (url: string | undefined): string | null => {
  if (!url) return null;
  const cleanUrl = url.trim();
  
  // If it's already just an 11 character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  
  // Capture: youtube.com/watch?v=ID, youtube.com/embed/ID, youtube.com/v/ID, youtube.com/shorts/ID, youtube.com/live/ID, youtu.be/ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/;
  const match = cleanUrl.match(regExp);
  
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  
  return null;
};

export const getVimeoId = (url: string | undefined): string | null => {
  if (!url) return null;
  const cleanUrl = url.trim();
  const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  return (vimeoMatch && vimeoMatch[1]) ? vimeoMatch[1] : null;
};

/**
 * Robustly resolves thumbnail from given thumbnail URL or video URL.
 * Never returns Unsplash images. Instead, uses YouTube auto-thumbnails, Vimeo posters,
 * or custom brand SVG/canvas placeholders as fallbacks.
 */
export const getResolvedThumbnail = (
  thumbnailUrl: string | undefined,
  videoUrl: string | undefined,
  title: string = 'Video Preview',
  category: string = 'Brandier'
): string => {
  const cleanThumb = thumbnailUrl?.trim();
  const cleanVid = videoUrl?.trim();
  
  // 1. Check if the provided thumbnail URL is a YouTube link/id itself
  const ytThumbId = getYoutubeId(cleanThumb);
  if (ytThumbId) {
    return `https://img.youtube.com/vi/${ytThumbId}/hqdefault.jpg`;
  }
  
  // 2. If thumbnail is a Vimeo link, we can extract vimeo id
  const vimeoThumbId = getVimeoId(cleanThumb);
  if (vimeoThumbId) {
    return `https://vumbnail.com/${vimeoThumbId}.jpg`;
  }
  
  // 3. If thumbnail is a valid direct image URL, return it
  if (cleanThumb && (
    cleanThumb.startsWith('http://') || 
    cleanThumb.startsWith('https://') || 
    cleanThumb.startsWith('data:image/')
  ) && !cleanThumb.includes('youtube.com') && !cleanThumb.includes('youtu.be') && !cleanThumb.includes('vimeo.com')) {
    return cleanThumb;
  }
  
  // 4. If thumbnail is empty or invalid, try to get from videoUrl
  if (cleanVid) {
    const ytId = getYoutubeId(cleanVid);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
    
    const vimeoId = getVimeoId(cleanVid);
    if (vimeoId) {
      return `https://vumbnail.com/${vimeoId}.jpg`;
    }
  }
  
  // 5. Fallback - NEVER return standard unsplash. Return a stunning, premium SVG/CSS data URI mockup
  // that serves as a high-fidelity placeholder with the custom video's metadata on it!
  const label = title ? title.slice(0, 30) + (title.length > 30 ? '...' : '') : 'Active UGC Stream';
  const catLabel = category ? category.toUpperCase() : 'BRANDIER';
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23111827"/>
        <stop offset="50%" stop-color="%231F2937"/>
        <stop offset="100%" stop-color="%230F172A"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="%2310B981"/>
        <stop offset="100%" stop-color="%233B82F6"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(%23g)"/>
    <circle cx="44" cy="44" r="16" fill="url(%23accent)" opacity="0.15"/>
    <circle cx="400" cy="225" r="50" fill="url(%23accent)" opacity="0.85"/>
    <polygon points="388,205 388,245 422,225" fill="%23FFFFFF"/>
    <rect x="0" y="440" width="800" height="10" fill="url(%23accent)"/>
    <text x="400" y="320" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23FFFFFF" text-anchor="middle">${encodeURIComponent(label)}</text>
    <text x="400" y="355" font-family="monospace" font-weight="900" font-size="14" fill="%2310B981" text-anchor="middle" letter-spacing="4">${encodeURIComponent(catLabel)}</text>
  </svg>`;
};
