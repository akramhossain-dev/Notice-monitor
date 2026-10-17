/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, Globe, Moon, Sun, Shield, Menu, X, FileText, CheckCircle2, Radio } from 'lucide-react';
import { Language, Theme, PageView } from '../types.js';
import { translations } from '../translations.js';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  activeSitesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  currentPage,
  setCurrentPage,
  activeSitesCount = 5
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const t = translations[lang];

  const toggleLanguage = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { id: 'home' as PageView, label: t.navHome, icon: Radio },
    { id: 'subscribe' as PageView, label: t.navSubscribe, icon: Bell, highlight: true },
    { id: 'notices' as PageView, label: t.navNotices, icon: FileText },
    { id: 'admin' as PageView, label: t.navAdmin, icon: Shield }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setCurrentPage('home')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {t.brandName}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
                  {t.navLiveStatus}
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t.brandTagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  } ${
                    item.highlight && !isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : ''
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white">
                      Free
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Language Toggle, Theme Toggle, Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-base font-semibold ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                    Free Alert
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
