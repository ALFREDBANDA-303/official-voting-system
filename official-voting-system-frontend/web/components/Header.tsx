import * as React from 'react';
import { useState, useEffect } from 'react';
import { Page } from '../types';

interface HeaderProps {
  setPage: (page: Page) => void;
  isOffline: boolean;
}

const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const OfflineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728" />
  </svg>
);

const OfflineIndicator = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 backdrop-blur-sm rounded-full text-yellow-200 text-sm font-medium border border-yellow-500/30 animate-pulse" aria-live="polite" role="status">
    <OfflineIcon />
    <span>Offline Mode</span>
  </div>
);

const MobileOfflineIndicator = () => (
  <div className="flex items-center gap-2 px-4 py-2.5 text-yellow-800 bg-yellow-100 rounded-lg border border-yellow-200 animate-pulse" aria-live="polite" role="status">
    <OfflineIcon />
    <span className="font-medium">You are currently offline</span>
  </div>
);

const Header = ({ setPage, isOffline }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(Page.Home);

  const handleNavClick = (page) => {
    setPage(page);
    setActiveNav(page);
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: Page.Home, label: 'Home' },
    { id: Page.Results, label: 'Results' },
    { id: Page.Verification, label: 'Verify Vote' },
    { id: Page.MeetTheTeam, label: 'Meet The Team' }
  ];

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl relative z-30 border-b border-blue-700/50">
      <div className="container mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 sm:gap-4 group">
          <button
            onClick={() => handleNavClick(Page.Admin)}
            className="relative transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
            aria-label="Open admin dashboard"
            title="Admin"
          >
            <img
              src="https://res.cloudinary.com/unihousingmw/image/upload/v1757613228/cropped-MALAWI-LOGO_efmzsu.webp"
              alt="DMI logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-lg"
              onError={(e) => { e.currentTarget.src = '/assets/logo-fallback.png'; }}
            />
          </button>

          <div className="cursor-pointer">
            <h1
              onClick={() => handleNavClick(Page.Home)}
              onDoubleClick={() => handleNavClick(Page.AdminLogin)}
              className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
              role="link"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNavClick(Page.Home); }}
            >
              DMI-SJBU Voting System
            </h1>
            <p className="text-xs text-blue-300 font-medium hidden sm:block">Secure &amp; Transparent Elections</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2 lg:gap-4" aria-label="Main navigation">
          {isOffline && <OfflineIndicator />}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`group relative px-4 py-2 rounded-lg font-medium transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                activeNav === item.id
                  ? 'bg-yellow-500/20 text-yellow-400 scale-105'
                  : 'hover:bg-blue-700/50 hover:text-yellow-500'
              }`}
            >
              {/* Hover shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </div>
              
              {/* Active indicator */}
              {activeNav === item.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-yellow-500 rounded-full"></div>
              )}
              
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg text-white hover:bg-blue-700/50 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300 transform hover:scale-110"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <div className="transition-transform duration-300">
            {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </div>
        </button>
      </div>

      <nav
        className={`md:hidden bg-gradient-to-b from-blue-800 to-blue-900 absolute top-full left-0 w-full shadow-2xl border-t border-blue-700/50 transform transition-all duration-300 ease-out ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="px-4 py-4 space-y-2">
          {isOffline && (
            <div className="mb-3">
              <MobileOfflineIndicator />
            </div>
          )}

          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`group relative block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none overflow-hidden ${
                activeNav === item.id
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'hover:bg-blue-700/50 hover:text-yellow-500'
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: isMenuOpen ? 'slideIn 0.3s ease-out forwards' : 'none'
              }}
            >
              {/* Hover shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </div>
              
              <span className="relative z-10">
                {item.label}
                {activeNav === item.id && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500 rounded-full"></span>
                )}
              </span>
            </button>
          ))}
        </div>
      </nav>

    </header>
  );
};

export default Header;