/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem, Lead } from '../types';
import MediaCard from './MediaCard';
import BrandierLogo from './BrandierLogo';

interface PremiumPageProps {
  premiumCollection: MediaItem[];
  premiumUnlocked: boolean;
  onSelectMedia: (item: MediaItem) => void;
  onAddLead: (email: string) => void;
  currentEmail?: string;
  leads?: Lead[];
}

export default function PremiumPage({
  premiumCollection,
  premiumUnlocked,
  onSelectMedia,
  onAddLead,
  currentEmail,
  leads = [],
}: PremiumPageProps) {
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      onAddLead(emailInput);
      setEmailInput('');
      setSubmitting(false);
    }, 800);
  };

  const userLead = currentEmail ? leads.find(l => l.email.toLowerCase() === currentEmail.toLowerCase()) : null;
  const isPending = userLead && userLead.status === 'pending';
  const isRejected = userLead && userLead.status === 'rejected';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 space-y-12 font-sans relative">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold animate-pulse">
          <Sparkles className="w-3 h-3 text-white" />
          PREMIUM PARTNER AD ARCHIVE
        </div>
        <h1 className="font-display font-medium text-3xl sm:text-5xl text-black tracking-tight leading-none">
          Premium UGC <span className="font-serif italic font-light text-neutral-500">Campaigns</span>
        </h1>
        <p className="text-gray-500 max-w-xl text-sm sm:text-base">
          High-fashion bespoke projects, high-converting cinematic UGC ads, and secure brand-boosting video formulas.
        </p>
      </div>

      <div className="relative min-h-[400px]">
        {/* Main Grid, blurred if locked */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-700 ${!premiumUnlocked ? 'blur-lg select-none pointer-events-none opacity-20 scale-[0.98]' : ''}`}>
          {premiumCollection.map((item) => (
            <MediaCard key={item.id} item={item} onSelect={onSelectMedia} />
          ))}

          {premiumCollection.length === 0 && (
            <p className="col-span-full py-16 text-center text-gray-400">
              No premium works featured currently in store.
            </p>
          )}
        </div>

        {/* Elegant Centered Lead Unlock Overlay Card */}
        {!premiumUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md w-full bg-white/95 backdrop-blur-xl border border-neutral-200/80 p-8 sm:p-10 rounded-3xl shadow-2xl text-center space-y-6"
            >
              <div className="w-14 h-14 flex items-center justify-center mx-auto text-black">
                <BrandierLogo className="w-full h-full text-black" />
              </div>

              {isPending ? (
                <div className="space-y-6 py-4">
                  <div className="flex justify-center">
                    <Loader2 className="w-10 h-10 text-purple-650 animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-lg text-black tracking-tight">
                      Awaiting Curation Approval
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Your unlock request for <code className="bg-neutral-50 px-1.5 py-0.5 rounded text-neutral-800 font-mono font-semibold break-all">{currentEmail}</code> is currently pending review by our administrative team.
                    </p>
                    <p className="text-[11px] text-purple-600 font-medium">
                      Approval statuses sync in real-time. Please stand by or refresh shortly!
                    </p>
                  </div>
                </div>
              ) : isRejected ? (
                <div className="space-y-6 py-4">
                  <div className="flex justify-center">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-lg text-red-650 tracking-tight">
                      Access Request Rejected
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Curators declined access for <code className="bg-neutral-50 px-1.5 py-0.5 rounded text-neutral-800 font-mono font-semibold break-all">{currentEmail}</code>.
                    </p>
                    <p className="text-[11px] text-gray-500 leading-normal">
                      Please enter a valid company address, or email <strong className="text-black">brandierstudio@gmail.com</strong> for custom partner credentials.
                    </p>
                    <button
                      onClick={() => onAddLead('')}
                      className="mt-4 text-xs font-mono font-bold text-black border-b border-black hover:opacity-75 transition-opacity"
                    >
                      TRY ANOTHER WORKSPACE EMAIL
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-black tracking-tight">
                      Unlock Premium Archive
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      This selection of viral AI UGC ads & cinematic brand formulas is locked. Enter your email below to gain instant full-playback unlock.
                    </p>
                  </div>

                  <form onSubmit={handleUnlockSubmit} className="space-y-3">
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Enter your professional email..."
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          setErrorMsg('');
                        }}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-center focus:outline-none focus:ring-1 focus:ring-black focus:border-[#E5E7EB] transition-all font-medium text-black placeholder:text-gray-400"
                      />
                      {errorMsg && (
                        <p className="text-[10px] text-red-500 font-bold mt-1.5 uppercase tracking-wider">
                          {errorMsg}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 text-white font-semibold text-xs rounded-xl cursor-pointer duration-200 active:scale-98 shadow-md flex items-center justify-center gap-2 transition-transform bg-black hover:opacity-95 text-center justify-center"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          Request Access Lock Key
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase pt-2">
                ⚡ INSTANT DECISIVE SENSORY ACCESS
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
