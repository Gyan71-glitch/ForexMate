"use client";
import React from 'react';

export function DevBanner() {
  // Check if we are in dev environment or if dev tools are enabled
  const showBanner = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';

  if (!showBanner) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white py-1 px-4 text-center text-xs font-black tracking-widest select-none shadow-sm flex items-center justify-center gap-2 relative z-50">
      <span>⚡</span>
      <span>DEVELOPMENT MODE ACTIVE</span>
      <span>•</span>
      <span>DEVELOPER PANEL ENABLED</span>
      <span>⚡</span>
    </div>
  );
}
