// web/components/Footer.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Page } from '../types';

interface FooterProps {
  setPage: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ setPage }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-dmi-blue-950 via-dmi-blue-900 to-dmi-blue-950 text-white mt-auto overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-dmi-gold-500 rounded-full filter blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-dmi-blue-600 rounded-full filter blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
      </div>

      <div className="h-1 bg-gradient-to-r from-dmi-blue-800 via-dmi-gold-500 to-dmi-blue-800" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-dmi-gold-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <img
                  src="https://res.cloudinary.com/unihousingmw/image/upload/v1757613228/cropped-MALAWI-LOGO_efmzsu.webp"
                  alt="DMI Logo"
                  className="relative w-12 h-12 object-contain transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-dmi-gold-500 to-yellow-300 bg-clip-text text-transparent">DMI-SJBU</h3>
                <p className="text-xs text-dmi-blue-300">Voting System</p>
              </div>
            </div>
            <p className="text-sm text-dmi-blue-300 leading-relaxed">
              Empowering democratic participation through secure, transparent, and innovative digital voting solutions.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-dmi-gold-500 rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <button onClick={() => setPage(Page.Home)} className="group flex items-center gap-2 text-sm text-dmi-blue-300 hover:text-dmi-gold-500 transition-all duration-200">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setPage(Page.Results)} className="group flex items-center gap-2 text-sm text-dmi-blue-300 hover:text-dmi-gold-500 transition-all duration-200">
                  Results
                </button>
              </li>
              <li>
                <button onClick={() => setPage(Page.Verification)} className="group flex items-center gap-2 text-sm text-dmi-blue-300 hover:text-dmi-gold-500 transition-all duration-200">
                  Verify Vote
                </button>
              </li>
              <li>
                <button onClick={() => setPage(Page.CandidateGallery)} className="group flex items-center gap-2 text-sm text-dmi-blue-300 hover:text-dmi-gold-500 transition-all duration-200">
                  Candidate Gallery
                </button>
              </li>
              <li>
                <button onClick={() => setPage(Page.MeetTheTeam)} className="group flex items-center gap-2 text-sm text-dmi-blue-300 hover:text-dmi-gold-500 transition-all duration-200">
                  Meet The Team
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-dmi-gold-500 rounded-full" />
              Key Features
            </h3>
            <ul className="space-y-3">
              {[
                'End-to-End Encryption',
                'Real-time Updates',
                'Vote Verification',
                'Mobile Optimized'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-dmi-blue-300">
                  <svg className="w-4 h-4 text-dmi-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-dmi-gold-500 rounded-full" />
              Developed By
            </h3>
            <div className="p-4 bg-gradient-to-br from-dmi-blue-800/50 to-dmi-blue-900/50 rounded-lg border border-dmi-blue-700/50 backdrop-blur-sm">
              <p className="text-sm font-semibold text-dmi-gold-500 mb-1">DMI-SJBU</p>
              <p className="text-xs text-dmi-blue-200 mb-3">Science & Engineering Club</p>
              <div className="pt-3 border-t border-dmi-blue-700/50">
                <p className="text-xs text-dmi-blue-300 flex items-center gap-2">Innovate tomorrow, today at Mangochi.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dmi-blue-700/50" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-gradient-to-r from-transparent via-dmi-blue-900 to-transparent">
              <svg className="w-6 h-6 text-dmi-gold-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: 'Secure', desc: '256-bit Encryption' },
              { label: 'Transparent', desc: 'Open Results' },
              { label: 'Fast', desc: 'Real-time Processing' },
              { label: 'Verified', desc: 'Auditable System' }
            ].map((badge, idx) => (
              <div key={idx} className="group flex items-center gap-3 px-4 py-2 bg-dmi-blue-800/30 hover:bg-dmi-blue-800/50 rounded-lg border border-dmi-blue-700/50 hover:border-dmi-gold-500/50 transition-all duration-300 cursor-default">
                <div className="w-2 h-2 rounded-full bg-dmi-gold-500 group-hover:scale-125 transition-transform" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">{badge.label}</p>
                  <p className="text-xs text-dmi-blue-300">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-dmi-blue-400">
            <div className="flex items-center gap-2">
              <span>© {currentYear} DMI-SJBU. All Rights Reserved.</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <button onClick={() => setPage(Page.HowToVote)} className="hover:text-dmi-gold-500 transition-colors">How To Use</button>
              <span className="text-dmi-blue-600">•</span>
              <button onClick={() => setPage(Page.PrivacyPolicy)} className="hover:text-dmi-gold-500 transition-colors">Privacy Policy</button>
              <span className="text-dmi-blue-600">•</span>
              <button onClick={() => setPage(Page.TermsOfUse)} className="hover:text-dmi-gold-500 transition-colors">Terms of Service</button>
              <span className="text-dmi-blue-600">•</span>
              <button onClick={() => setPage(Page.ContactHelp)} className="hover:text-dmi-gold-500 transition-colors">Help Center</button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-gradient-to-r from-dmi-blue-900 via-dmi-gold-500 to-dmi-blue-900" />
    </footer>
  );
};

export default Footer;
