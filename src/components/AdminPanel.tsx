/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  CheckCircle, 
  Save, 
  Layers, 
  Mail, 
  CheckSquare,
  X,
  FileVideo,
  Monitor
} from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem, Lead } from '../types';
import { CATEGORIES, TOOLS } from '../db/mockDb';

const getYoutubeId = (url: string | undefined): string | null => {
  if (!url) return null;
  const cleanUrl = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return (ytMatch && ytMatch[1]) ? ytMatch[1] : null;
};

interface AdminPanelProps {
  mediaItems: MediaItem[];
  onSaveItems: (items: MediaItem[]) => void;
  onNavigate: (path: string) => void;
  leads?: Lead[];
  onClearLeads?: () => void;
  onApproveLead?: (email: string) => void;
  onRejectLead?: (email: string) => void;
}

export default function AdminPanel({
  mediaItems,
  onSaveItems,
  onNavigate,
  leads = [],
  onClearLeads,
  onApproveLead,
  onRejectLead,
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState<Partial<MediaItem> | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);

  // Safe inline confirmation states (bypasses iframe blocker popups)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [confirmPurgeLeads, setConfirmPurgeLeads] = useState(false);

  // Success messages
  const [successMsg, setSuccessMsg] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auth login action
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'brandier2026') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid password. Access Denied.');
    }
  };

  const handleAddNewContentClick = () => {
    const newItem: Partial<MediaItem> = {
      id: `media-${Date.now()}`,
      type: 'video',
      title: '',
      description: '',
      category: CATEGORIES[0],
      thumbnailUrl: '',
      videoUrl: '',
      instagramUrl: '',
      linkedinUrl: '',
      tiktokUrl: '',
      tags: [],
      tools: [],
      duration: '1:00',
      isPremium: false,
      isSpotlight: false,
      isComingSoon: false,
      aspectRatio: '16:9'
    };
    setEditingItem(newItem);
    setIsEditingNew(true);
    setFormErrors({});
  };

  const handleEditClick = (item: MediaItem) => {
    setEditingItem({ ...item });
    setIsEditingNew(false);
    setFormErrors({});
  };

  const handleDeleteClick = (id: string) => {
    const updated = mediaItems.filter((m) => m.id !== id);
    onSaveItems(updated);
    showTemporarySuccess('Content deleted successfully.');
    setDeleteConfirmId(null);
  };

  const showTemporarySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editingItem?.title?.trim()) errors.title = 'Title is required';
    if (!editingItem?.description?.trim()) errors.description = 'Description is required';
    return Object.keys(errors).length === 0;
  };

  const handleSaveForm = (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    
    let resolvedThumbnailUrl = editingItem?.thumbnailUrl?.trim() || '';
    const ytThumbId = getYoutubeId(resolvedThumbnailUrl);
    
    if (ytThumbId) {
      resolvedThumbnailUrl = `https://img.youtube.com/vi/${ytThumbId}/hqdefault.jpg`;
    } else if (!resolvedThumbnailUrl && editingItem?.videoUrl) {
      const ytId = getYoutubeId(editingItem.videoUrl);
      if (ytId) {
        resolvedThumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }
    }
    
    if (!resolvedThumbnailUrl) {
      resolvedThumbnailUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
    }

    const errors: Record<string, string> = {};
    if (!editingItem?.title?.trim()) errors.title = 'Title is required';
    if (!editingItem?.description?.trim()) errors.description = 'Description is required';
    if (!resolvedThumbnailUrl.startsWith('http://') && !resolvedThumbnailUrl.startsWith('https://')) {
      errors.thumbnailUrl = 'Must be a valid web URL';
    }
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const baseSlug = (editingItem?.title || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-');

    const finalizedItem: MediaItem = {
      id: editingItem!.id || `media-${Date.now()}`,
      type: editingItem!.type || 'video',
      title: editingItem!.title || '',
      description: editingItem!.description || '',
      category: editingItem!.category || CATEGORIES[0],
      thumbnailUrl: resolvedThumbnailUrl,
      videoUrl: editingItem!.videoUrl || '',
      instagramUrl: editingItem!.instagramUrl || '',
      linkedinUrl: editingItem!.linkedinUrl || '',
      tiktokUrl: editingItem!.tiktokUrl || '',
      tags: editingItem!.tags || ['creative'],
      tools: editingItem!.tools || ['AI'],
      duration: editingItem!.duration || '1:00',
      isPremium: !!editingItem!.isPremium,
      isSpotlight: !!editingItem!.isSpotlight,
      isComingSoon: !!editingItem!.isComingSoon,
      slug: baseSlug,
      createdAt: editingItem!.createdAt || new Date().toISOString(),
      aspectRatio: editingItem!.aspectRatio || '16:9'
    };

    let updatedList: MediaItem[];
    if (isEditingNew) {
      updatedList = [finalizedItem, ...mediaItems];
    } else {
      updatedList = mediaItems.map((m) => (m.id === finalizedItem.id ? finalizedItem : m));
    }

    onSaveItems(updatedList);
    setEditingItem(null);
    showTemporarySuccess(`Content ${isDraft ? 'saved as Draft' : 'published successfully'}!`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-40 pb-24 flex items-center justify-center px-4 font-sans bg-[#F6F7F8]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white rounded-[24px] p-8 border border-[#E5E7EB] shadow-xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-xl text-black">
              BrandierStudioTV Portal
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Access is restricted to authorized administrative curators.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-1.5 font-bold">
                Administrative Code
              </label>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-mono tracking-widest text-center"
                autoFocus
              />
              {loginError && (
                <p className="text-xs text-red-500 font-semibold mt-1.5 text-center">
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-black/95 active:scale-98 text-white font-medium text-sm rounded-xl transition-all cursor-pointer"
            >
              Unlock Terminal
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-8 mb-10">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
            SECURE MANAGEMENT CONSOLE
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-black tracking-tight flex items-center gap-2">
            BrandierStudioTV Studio
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddNewContentClick}
            className="px-4 py-2 bg-black hover:bg-black/95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-transform duration-300 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Curate Asset
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl cursor-pointer hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-medium"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Editing Dialog Modal Workspace */}
      {editingItem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 mb-12 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-display font-bold text-lg text-black">
              {isEditingNew ? 'Curate New Media Creation' : `Edit: ${editingItem.title}`}
            </h3>
            <button
              onClick={() => setEditingItem(null)}
              className="text-xs font-mono font-bold text-gray-400 hover:text-black cursor-pointer"
            >
              CANCEL
            </button>
          </div>

          <form onSubmit={(e) => handleSaveForm(e, false)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Col settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aura of Chronos — Luxury Timepiece UGC Ad"
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-black focus:outline-none focus:border-black"
                />
                {formErrors.title && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your design aesthetics, process..."
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-black focus:outline-none resize-none focus:border-black"
                />
                {formErrors.description && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Asset Type & Display Tab
                  </label>
                  <select
                    value={editingItem.type || 'video'}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                  >
                    <option value="video">Video (Shows in Videos Tab & Homepage Spotlight)</option>
                    <option value="motion">Motion Graphic (Shows in Motion Graphics Tab)</option>
                    <option value="image">AI Image (Shows in AI Concept Images Tab)</option>
                  </select>
                  <span className="text-[10px] text-gray-400 mt-1 block leading-normal">
                    This selection controls which tab/page your content is routed to automatically.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Category Type
                  </label>
                  <select
                    value={editingItem.category || CATEGORIES[0]}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Frame Aspect Ratio
                  </label>
                  <select
                    value={editingItem.aspectRatio || '16:9'}
                    onChange={(e) => setEditingItem({ ...editingItem, aspectRatio: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                  >
                    <option value="16:9">Horizontal (16:9)</option>
                    <option value="9:16">Vertical (9:16 Short/Story)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-6 pl-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="premium-check"
                      checked={editingItem.isPremium || false}
                      onChange={(e) => setEditingItem({ ...editingItem, isPremium: e.target.checked })}
                      className="w-4 h-4 rounded-sm border-gray-300 text-black focus:ring-black cursor-pointer"
                    />
                    <label htmlFor="premium-check" className="text-[11px] font-mono font-bold uppercase tracking-wider text-black cursor-pointer select-none">
                      Premium Lock Archive
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="spotlight-check"
                      checked={editingItem.isSpotlight || false}
                      onChange={(e) => setEditingItem({ ...editingItem, isSpotlight: e.target.checked })}
                      className="w-4 h-4 rounded-sm border-gray-300 text-purple-600 focus:ring-purple-600 cursor-pointer"
                    />
                    <label htmlFor="spotlight-check" className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 cursor-pointer flex items-center gap-1 select-none animate-pulse">
                      ⚡ Pin to Hero Spotlight
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="coming-soon-check"
                      checked={editingItem.isComingSoon || false}
                      onChange={(e) => setEditingItem({ ...editingItem, isComingSoon: e.target.checked })}
                      className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                    />
                    <label htmlFor="coming-soon-check" className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 cursor-pointer select-none">
                      ⏳ Mark as Coming Soon
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col Links & Tools */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Thumbnail Image URL (Unsplash or any URL)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={editingItem.thumbnailUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, thumbnailUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                
                {editingItem.videoUrl && getYoutubeId(editingItem.videoUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      const ytId = getYoutubeId(editingItem.videoUrl);
                      if (ytId) {
                        setEditingItem({
                          ...editingItem,
                          thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                        });
                      }
                    }}
                    className="mt-1.5 text-[10px] font-mono font-bold text-purple-600 hover:text-purple-800 transition-colors inline-flex items-center gap-1 uppercase tracking-wider bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md border border-purple-150 cursor-pointer"
                  >
                    ✨ Auto-Fetch YouTube Thumbnail
                  </button>
                )}
                
                {formErrors.thumbnailUrl && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{formErrors.thumbnailUrl}</p>}
                
                {editingItem.thumbnailUrl && editingItem.thumbnailUrl.startsWith('http') && (
                  <div className="mt-2 text-[10px] flex items-center gap-2 text-gray-400">
                    <span className="font-mono">Preview:</span>
                    <img
                      src={editingItem.thumbnailUrl}
                      alt="Thumbnail mini preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-8 rounded-sm object-cover border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                    YouTube URL or ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. dQw4w9WgXcQ"
                    value={editingItem.videoUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, videoUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-mono focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={editingItem.instagramUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, instagramUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Duration (e.g. 0:30)
                  </label>
                  <input
                    type="text"
                    placeholder="0:45"
                    value={editingItem.duration || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                    TikTok URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://tiktok.com/@..."
                    value={editingItem.tiktokUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, tiktokUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-mono text-center focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Tags & Tools */}
              <div>
                <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Select AI tools Used ({editingItem.tools?.length || 0} chosen)
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-3 bg-gray-50 border border-[#E5E7EB] rounded-xl">
                  {TOOLS.map((tool) => {
                    const itemTools = editingItem.tools || [];
                    const isChecked = itemTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => {
                          const nextTools = isChecked
                            ? itemTools.filter((t) => t !== tool)
                            : [...itemTools, tool];
                          setEditingItem({ ...editingItem, tools: nextTools });
                        }}
                        className={`text-[10px] uppercase tracking-widest font-mono px-2 py-1 rounded-sm border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-black text-white border-black font-semibold'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-black'
                        }`}
                      >
                        {tool}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Custom Hashtags (comma separated strings)
                </label>
                <input
                  type="text"
                  placeholder="e.g. luxury, watch, commercial, brandier"
                  value={(editingItem.tags || []).join(', ')}
                  onChange={(e) => {
                    const cleanTags = e.target.value
                      .split(',')
                      .map((t) => t.trim().toLowerCase())
                      .filter(Boolean);
                    setEditingItem({ ...editingItem, tags: cleanTags });
                  }}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            {/* Dashboard Save triggers */}
            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={(e) => handleSaveForm(e, true)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl cursor-pointer"
              >
                Save Draft
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-black hover:bg-black/95 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                Publish Live
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Database Listing Table */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] overflow-hidden shadow-xs">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-black flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-500" /> Active Media Library Directory
          </h2>
          <span className="font-mono text-xs px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-sm font-semibold">
            {mediaItems.length} Products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-mono text-gray-400 uppercase tracking-widest bg-gray-50/40">
                <th className="py-4 px-6 font-bold">Concept details</th>
                <th className="py-4 px-4 font-bold">Category</th>
                <th className="py-4 px-4 font-bold">Aspect</th>
                <th className="py-4 px-4 font-bold">Access</th>
                <th className="py-4 px-6 text-right font-bold w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {mediaItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-10 rounded-lg object-cover border border-gray-100"
                    />
                    <div className="max-w-[280px] sm:max-w-[400px]">
                      <p className="font-semibold text-gray-900 group-hover:text-black line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5 max-w-sm truncate">
                        slug: /{item.slug}
                      </p>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 font-medium rounded-sm">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-mono text-xs text-gray-500">
                    {item.aspectRatio || '16:9'}
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div>
                        {item.isPremium ? (
                          <span className="font-mono text-[9px] tracking-wider uppercase bg-black text-white px-2 py-0.5 rounded-sm font-semibold">
                            PREMIUM
                          </span>
                        ) : (
                          <span className="font-mono text-[9px] tracking-wider uppercase bg-gray-100 text-gray-400 px-2 py-0.5 rounded-sm">
                            FREE
                          </span>
                        )}
                      </div>
                      {item.isSpotlight && (
                        <div>
                          <span className="inline-flex items-center gap-0.5 font-mono text-[8.5px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-1 rounded-sm uppercase tracking-wide">
                            ⚡ Spotlight
                          </span>
                        </div>
                      )}
                      {item.isComingSoon && (
                        <div>
                          <span className="inline-flex items-center gap-0.5 font-mono text-[8.5px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1 rounded-sm uppercase tracking-wide">
                            ⏳ Coming Soon
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10px] text-red-500 font-mono font-bold animate-pulse mr-1">Confirm delete?</span>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-[10px] rounded-lg transition-all cursor-pointer"
                          title="Yes, delete"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[10px] rounded-lg transition-all cursor-pointer"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                          title="Edit Asset"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {mediaItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No matching assets in database directory. Click Curate Asset above to design one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Captured Leads Review & Approval Terminal */}
      <div className="mt-12 bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6 mb-6">
          <div className="space-y-1">
            <h2 className="font-display font-semibold text-lg text-black flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-650" />
              Subscriber Premium Approval Console
            </h2>
            <p className="text-xs text-gray-500 font-normal">
              Manage premium subscriber requests: approve registrations instantly to unlock their access profile.
            </p>
          </div>
          <span className="font-mono text-xs px-3 py-1 bg-purple-50 text-purple-750 font-bold rounded-full border border-purple-100">
            {leads.length} Subscribers Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-mono text-gray-400 uppercase tracking-widest bg-gray-50/30">
                <th className="py-3 px-4 font-bold">Subscriber Email</th>
                <th className="py-3 px-4 font-bold">Registered Date</th>
                <th className="py-3 px-4 font-bold">Current Status</th>
                <th className="py-3 px-4 text-right font-bold w-48">Approval Decisive Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-4 px-4 font-medium text-black select-all">
                    {lead.email}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-gray-400">
                    {new Date(lead.timestamp).toLocaleDateString()} {new Date(lead.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-4 px-4">
                    {lead.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[9px] font-bold text-emerald-800 bg-emerald-100 rounded-full">
                        ACTIVE APPROVED
                      </span>
                    ) : lead.status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[9px] font-bold text-red-800 bg-red-100 rounded-full">
                        REJECTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[9px] font-bold text-amber-800 bg-amber-100 rounded-full animate-pulse">
                        PENDING APPROVAL
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {lead.status !== 'approved' && onApproveLead && (
                        <button
                          onClick={() => {
                            onApproveLead(lead.email);
                            showTemporarySuccess(`Approved premium access for ${lead.email}`);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] rounded-lg cursor-pointer transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {lead.status !== 'rejected' && onRejectLead && (
                        <button
                          onClick={() => {
                            onRejectLead(lead.email);
                            showTemporarySuccess(`Rejected premium access for ${lead.email}`);
                          }}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-650 font-semibold text-[10px] rounded-lg cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 italic">
                    No subscriber email requests logged currently.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {leads.length > 0 && onClearLeads && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            {confirmPurgeLeads ? (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest animate-pulse">Are you absolutely sure?</span>
                <button
                  onClick={() => {
                    onClearLeads();
                    showTemporarySuccess('All leads purged successfully.');
                    setConfirmPurgeLeads(false);
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-[9px] font-bold tracking-wider uppercase rounded-lg cursor-pointer transition-colors"
                >
                  Confirm Purge
                </button>
                <button
                  onClick={() => setConfirmPurgeLeads(false)}
                  className="px-3 py-1.5 bg-gray-150 hover:bg-gray-200 text-gray-700 font-mono text-[9px] font-bold tracking-wider uppercase rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmPurgeLeads(true)}
                className="text-[10px] font-mono tracking-widest uppercase font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
              >
                Purge All Registers
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
