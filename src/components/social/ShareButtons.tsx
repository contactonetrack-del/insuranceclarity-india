'use client'

import React, { useState } from 'react';
import { Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react';
import { logger } from '@/lib/logger';

type ShareButtonsProps = {
    url: string;
    title: string;
    description?: string;
    image?: string; // Critical for Pinterest
};

export function ShareButtons({ url, title, description = '', image = '' }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " - " + url)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description || title)}`,
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            logger.error({ action: 'share.copy_failed', error: err instanceof Error ? err.message : String(err) });
        }
    };

    const handleWebShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: description,
                    url,
                });
            } catch {
                // Web Share cancelled or unsupported — no action needed
            }
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-theme-secondary uppercase tracking-wider">Share this</h4>
            <div className="flex items-center gap-3 flex-wrap">
                
                {/* Twitter / X */}
                <a 
                    href={shareLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-default flex items-center justify-center text-theme-muted hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white transition-all hover:scale-110"
                    aria-label="Share on X (Twitter)"
                >
                    <Twitter className="w-4 h-4" />
                </a>

                {/* Facebook */}
                <a 
                    href={shareLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-default flex items-center justify-center text-theme-muted hover:border-blue-600 hover:text-blue-600 transition-all hover:scale-110"
                    aria-label="Share on Facebook"
                >
                    <Facebook className="w-4 h-4" />
                </a>

                {/* LinkedIn */}
                <a 
                    href={shareLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-default flex items-center justify-center text-theme-muted hover:border-blue-700 hover:text-blue-700 transition-all hover:scale-110"
                    aria-label="Share on LinkedIn"
                >
                    <Linkedin className="w-4 h-4" />
                </a>

                {/* WhatsApp */}
                <a 
                    href={shareLinks.whatsapp} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-default flex items-center justify-center text-theme-muted hover:border-green-500 hover:text-green-500 transition-all hover:scale-110"
                    aria-label="Share on WhatsApp"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </a>

                {/* Pinterest */}
                <a 
                    href={shareLinks.pinterest} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-default flex items-center justify-center text-theme-muted hover:border-rose-600 hover:text-rose-600 transition-all hover:scale-110"
                    aria-label="Save on Pinterest"
                    onClick={(e) => {
                        // Prevent sharing if no image is provided, as Pinterest requires an image
                        if (!image) {
                            e.preventDefault();
                            alert("Pinterest requires an image to pin. This content does not have a designated sharing image.");
                        }
                    }}
                >
                    {/* Custom SVG for Pinterest since Lucide doesn't have it natively */}
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none" className="css-i6dzq1">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345l-.288 1.178c-.046.182-.149.223-.339.135-1.267-.584-2.06-2.417-2.06-3.896 0-3.172 2.304-6.085 6.646-6.085 3.499 0 6.22 2.493 6.22 5.824 0 3.479-2.193 6.275-5.239 6.275-1.022 0-1.986-.531-2.316-1.161l-.634 2.414c-.229.873-.848 1.966-1.263 2.634 1.111.34 2.298.523 3.535.523 6.621 0 11.988-5.367 11.988-11.987C24.005 5.367 18.638 0 12.017 0z"/>
                    </svg>
                </a>

                {/* Copy Link */}
                <button 
                    onClick={handleCopy}
                    className={`w-10 h-10 rounded-full border border-default flex items-center justify-center transition-all hover:scale-110 ${copied ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'text-theme-muted hover:text-theme-primary'}`}
                    aria-label="Copy Link"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                </button>

                {/* Native Web Share (Visible mainly on mobile) */}
                <button 
                    onClick={handleWebShare}
                    className="md:hidden px-4 h-10 rounded-full border border-default flex items-center justify-center text-sm font-medium text-theme-secondary hover:text-theme-primary hover:border-theme-primary transition-all ml-auto"
                >
                    Share
                </button>
            </div>
        </div>
    );
}
