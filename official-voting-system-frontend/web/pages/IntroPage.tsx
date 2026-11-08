// web/pages/IntroPage.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Page } from '../types';

interface IntroPageProps {
  setPage: (page: Page) => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ setPage }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(Page.Home);
    }, 3500);

    return () => {
      clearTimeout(timer);
    };
  }, [setPage]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-dmi-blue-950 via-dmi-blue-900 to-dmi-blue-950 flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-dmi-gold-500 rounded-full filter blur-3xl opacity-10 animate-pulse-subtle"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-dmi-blue-600 rounded-full filter blur-3xl opacity-10 animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Logo with Simple Elegant Glow */}
        <div className="relative mb-10 animate-fade-in-scale opacity-0">
          <div className="absolute inset-0 bg-dmi-gold-500 rounded-full filter blur-3xl opacity-40"></div>
          <img 
            src="https://res.cloudinary.com/unihousingmw/image/upload/v1757613228/cropped-MALAWI-LOGO_efmzsu.webp"
            alt="DMI Logo"
            className="relative w-32 h-32 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Title - Clean and Bold */}
        <div className="space-y-3 animate-fade-in-delay opacity-0">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-50 to-white bg-clip-text text-transparent">
              DMI-SJBU
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-dmi-gold-500"></div>
            <h2 className="text-lg sm:text-xl font-light tracking-widest text-dmi-gold-500 uppercase">
              Voting System
            </h2>
            <div className="h-px w-8 bg-dmi-gold-500"></div>
          </div>
        </div>

        {/* Simple Loading Dots */}
        <div className="mt-12 flex items-center gap-2 animate-fade-in-delay opacity-0" style={{ animationDelay: '0.3s' }}>
          <div className="w-2 h-2 bg-dmi-gold-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-dmi-gold-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-dmi-gold-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-dmi-gold-500 to-transparent opacity-60"></div>
    </div>
  );
};

export default IntroPage;