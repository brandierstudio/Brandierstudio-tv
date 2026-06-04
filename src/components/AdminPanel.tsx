/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Settings, 
  LogOut, 
  CheckCircle, 
  Save, 
  Sliders, 
  RefreshCw, 
  Layers, 
  FileSpreadsheet, 
  Database, 
  Link, 
  ExternalLink, 
  CloudRain, 
  Lock, 
  Mail, 
  CheckSquare 
} from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem, Lead } from '../types';
import { CATEGORIES, TOOLS, resetMediaToDefault } from '../db/mockDb';
import { googleSignIn, googleSignOut, initAuth, syncLeadsToGoogleSheet } from '../lib/firebaseAuth';
import { User } from 'firebase/auth';

interface AdminPanelProps {
  mediaItems: MediaItem[];
  onSaveItems: (items: MediaItem[]) => void;
  onNavigate: (path: string) => void;
  leads?: Lead[];
  onClearLeads?: () => void;
}

export default function AdminPanel({
  mediaItems,
  onSaveItems,
  onNavigate,
  leads = [],
  onClearLeads,
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // OAuth & Google Sheets States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [spreadsheetId, setSpreadsheetId] = useState(() => {
    return localStorage.getItem('brandier_spreadsheet_id') || '';
  });
  const [sheetStatus, setSheetStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [sheetErrorMsg, setSheetErrorMsg] = useState('');

  // Synchronize Auth listener for Sheets connection
  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken('');
      }
    );
    return () => unsub && unsub();
  }, []);

  const handleConnectStoreGoogle = async () => {
    try {
      setSheetErrorMsg('');
      const authObj = await googleSignIn();
      if (authObj) {
        setCurrentUser(authObj.user);
        setAccessToken(authObj.accessToken);
        showTemporarySuccess('Google Workspace Connected successfully!');
      }
    } catch (e: any) {
      setSheetErrorMsg(e?.message || 'Authentication rejected or failed.');
    }
  };

  const handleDisconnectGoogle = async () => {
    await googleSignOut();
    setCurrentUser(null);
    setAccessToken('');
    showTemporarySuccess('Google Workspace disconnected.');
  };

  const handleSaveSpreadsheetId = (val: string) => {
    setSpreadsheetId(val);
    localStorage.setItem('brandier_spreadsheet_id', val);
  };

  const handleSyncToSheets = async () => {
    if (!spreadsheetId) {
      setSheetErrorMsg('Please set a Spreadsheet ID first.');
      return;
    }
    if (leads.length === 0) {
      setSheetErrorMsg('No leads captured yet to sync.');
      return;
    }
    setSheetStatus('syncing');
    setSheetErrorMsg('');

    try {
      const res = await syncLeadsToGoogleSheet(spreadsheetId, leads, accessToken);
      if (res.success) {
        setSheetStatus('success');
        showTemporarySuccess(res.message);
        setTimeout(() => setSheetStatus('idle'), 4000);
      } else {
        setSheetStatus('error');
        setSheetErrorMsg(res.message);
      }
    } catch (err: any) {
      setSheetStatus('error');
      setSheetErrorMsg(err.message || 'Unknown syncing failure.');
    }
  };

  // Editing state
  const [editingItem, setEditingItem] = useState<Partial<MediaItem> | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);

  // Success messages
  const [successMsg, setSuccessMsg] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auth password logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'brandier2026' || password === 'admin') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid password. Access Denied.');
    }
  };

  // Default key tool generator
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
    if (window.confirm('Are you absolutely sure you want to delete this content listing?')) {
      const updated = mediaItems.filter((m) => m.id !== id);
      onSaveItems(updated);
      showTemporarySuccess('Content deleted successfully.');
    }
  };

  const showTemporarySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Helper validation before saving
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editingItem?.title?.trim()) errors.title = 'Title is required';
    if (!editingItem?.description?.trim()) errors.description = 'Description is required';
    if (!editingItem?.thumbnailUrl?.trim()) {
      errors.thumbnailUrl = 'Thumbnail URL is required';
    } else if (!editingItem.thumbnailUrl.startsWith('http://') && !editingItem.thumbnailUrl.startsWith('https://')) {
      errors.thumbnailUrl = 'Must be a valid web URL';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveForm = (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    if (!validateForm()) return;

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
      thumbnailUrl: editingItem!.thumbnailUrl || '',
      videoUrl: editingItem!.videoUrl || '',
      instagramUrl: editingItem!.instagramUrl || '',
      linkedinUrl: editingItem!.linkedinUrl || '',
      tiktokUrl: editingItem!.tiktokUrl || '',
      tags: editingItem!.tags || ['creative'],
      tools: editingItem!.tools || ['AI'],
      duration: editingItem!.duration || '1:00',
      isPremium: !!editingItem!.isPremium,
      slug: baseSlug,
      createdAt: editingItem!.createdAt || new Date().toISOString(),
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

  const handleResetDb = () => {
    if (window.confirm('Reset the catalog back to premium defaults? All additions will be lost.')) {
      resetMediaToDefault();
      window.location.reload();
    }
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
              className="w-full py-3 bg-black hover:bg-black/90 active:scale-98 text-white font-medium text-sm rounded-xl transition-all cursor-pointer"
            >
              Unlock Terminal
            </button>
          </form>

          {/* Quick Sandbox Help indicator */}
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              Preview Credentials
            </p>
            <p className="text-xs text-black font-semibold font-mono mt-1 select-all">
              brandier2026
            </p>
          </div>
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
            onClick={handleResetDb}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Reset storage to initial values"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Initial Seed
          </button>

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
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-black focus:outline-none"
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
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-black focus:outline-none resize-none"
                />
                {formErrors.description && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Asset Type
                  </label>
                  <select
                    value={editingItem.type || 'video'}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-black"
                  >
                    <option value="video">Video</option>
                    <option value="motion">Motion Graphic</option>
                    <option value="image">AI Image</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Category
                  </label>
                  <select
                    value={editingItem.category || CATEGORIES[0]}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-black"
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
                    Duration (e.g. 0:30)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0:30"
                    value={editingItem.duration || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6 pl-2">
                  <input
                    type="checkbox"
                    id="premium-check"
                    checked={editingItem.isPremium || false}
                    onChange={(e) => setEditingItem({ ...editingItem, isPremium: e.target.checked })}
                    className="w-4 h-4 rounded-sm border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="premium-check" className="text-xs font-mono font-bold uppercase tracking-widest text-black cursor-pointer">
                    Premium Work?
                  </label>
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
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm"
                />
                {formErrors.thumbnailUrl && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{formErrors.thumbnailUrl}</p>}
                
                {/* Visual mini preview */}
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
                    YouTube Video ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. b0uOnd6kPGA"
                    value={editingItem.videoUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, videoUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-mono"
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
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/..."
                    value={editingItem.linkedinUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm"
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
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-mono text-center"
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
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm"
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
                <th className="py-4 px-4 font-bold">Type</th>
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

                  <td className="py-4 px-4 font-mono text-xs text-gray-500 uppercase">
                    {item.type}
                  </td>

                  <td className="py-4 px-4">
                    {item.isPremium ? (
                      <span className="font-mono text-[9px] tracking-wider uppercase bg-black text-white px-2 py-0.5 rounded-sm font-semibold">
                        PREMIUM
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] tracking-wider uppercase bg-gray-100 text-gray-400 px-2 py-0.5 rounded-sm">
                        FREE
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                        title="Edit Asset"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

      {/* Google Sheets Lead Integration & Captured Leads Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pb-12">
        
        {/* 1. Google Sheets Integration Panel */}
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-black flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Google Sheets Sync
              </h2>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm tracking-wider ${
                currentUser ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-amber-100 text-amber-800'
              }`}>
                {currentUser ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Export captured user email leads in real-time to your custom Google Spreadsheet seamlessly.
            </p>

            {!currentUser ? (
              <button
                onClick={handleConnectStoreGoogle}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98 shadow-xs"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                Connect Google Account
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between text-xs font-medium text-black border border-neutral-100">
                  <div className="flex items-center gap-2">
                    {currentUser.photoURL && (
                      <img src={currentUser.photoURL} alt="Google avatar" className="w-6 h-6 rounded-full border border-neutral-200" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 leading-none">{currentUser.displayName || 'Authorized Admin'}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectGoogle}
                    className="px-2.5 py-1 text-[10px] font-mono tracking-wider bg-red-50 text-red-650 hover:bg-red-100 rounded-lg transition-colors font-bold uppercase cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                    Target Google Spreadsheet ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 1a2b3c4d5e..."
                      value={spreadsheetId}
                      onChange={(e) => handleSaveSpreadsheetId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-205 rounded-xl text-xs font-mono text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Found in your Google Sheet URL: <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-600 font-mono break-all select-all">/spreadsheets/d/<span className="text-purple-600 font-bold">SPREADSHEET_ID</span>/edit</code>
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-semibold">
                    Queue: {leads.length} leads pending
                  </div>

                  <button
                    onClick={handleSyncToSheets}
                    disabled={sheetStatus === 'syncing' || !spreadsheetId}
                    className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                  >
                    {sheetStatus === 'syncing' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Sync to Sheets
                      </>
                    )}
                  </button>
                </div>

                {sheetErrorMsg && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-750 text-xs font-medium font-sans rounded-xl leading-normal">
                    ⚠️ Sync Error: {sheetErrorMsg}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-[9px] text-gray-400 font-mono tracking-widest text-center mt-3 uppercase">
            ⚡ Direct Secure API Transfer
          </div>
        </div>

        {/* 2. List of Captured Lead Emails */}
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-black flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                Live Leads Register
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-sm font-semibold">
                {leads.length} CAPTURES
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Real-time audit log of local email registrations submitted from locked premium sections.
            </p>

            <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 no-scrollbar">
              {leads.map((lead, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-neutral-50/50 transition-colors">
                  <span className="font-medium text-black select-all">{lead.email}</span>
                  <span className="font-mono text-[9px] text-gray-400">
                    {new Date(lead.timestamp).toLocaleDateString()} {new Date(lead.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}

              {leads.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No email registrations recorded yet.
                </div>
              )}
            </div>
          </div>

          {leads.length > 0 && onClearLeads && (
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  if (window.confirm('Are you absolutely sure you want to purge all locally tracked leads?')) {
                    onClearLeads();
                    showTemporarySuccess('Leads purged.');
                  }
                }}
                className="text-[10px] font-mono tracking-widest uppercase font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
              >
                Clear local register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
