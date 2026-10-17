/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Share2, Calendar, FileText, ChevronLeft, ChevronRight, Check, Filter } from 'lucide-react';
import { Language, NoticeItem, WebsitePublic } from '../types.js';
import { translations } from '../translations.js';

interface NoticesViewProps {
  lang: Language;
  websites: WebsitePublic[];
}

export const NoticesView: React.FC<NoticesViewProps> = ({ lang, websites }) => {
  const t = translations[lang];

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedWebsiteId) params.append('websiteId', selectedWebsiteId);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('page', currentPage.toString());
      params.append('limit', '8');

      const res = await fetch(`/api/notices?${params.toString()}`);
      const data = await res.json();
      setNotices(data.notices || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [currentPage, selectedWebsiteId, selectedCategory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchNotices();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleShare = (notice: NoticeItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${notice.title}\nমূল নোটিশ: ${notice.link}`);
      setCopiedId(notice.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const formatDetectionDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const categories = [
    { id: 'all', label: t.catAll },
    { id: 'board', label: t.catBoard },
    { id: 'university', label: t.catUniversity },
    { id: 'government', label: t.catGovernment },
    { id: 'public_service', label: t.catPublicService }
  ];

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.noticesTitle}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          {t.noticesSubtitle}
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.searchNoticePlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Website Dropdown */}
          <div className="w-full md:w-72">
            <select
              value={selectedWebsiteId}
              onChange={e => {
                setSelectedWebsiteId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{t.filterAllSites}</option>
              {websites.map(site => (
                <option key={site.id} value={site.id}>
                  {lang === 'bn' ? site.nameBn : site.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'ফিল্টার:' : 'Filter:'}
          </span>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t.totalItems}: {total}
          </span>
        </div>
      </div>

      {/* Notices Feed */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'নোটিশ লোড হচ্ছে...' : 'Loading notices...'}
          </p>
        </div>
      ) : notices.length === 0 ? (
        <div className="py-16 text-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {t.noNoticesFound}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.noNoticesSub}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map(notice => (
            <div
              key={notice.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {lang === 'bn' ? notice.websiteNameBn : notice.websiteName}
                  </span>
                  {notice.publishDate && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{notice.publishDate}</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    • {t.detectedBadge} {formatDetectionDate(notice.detectedAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {notice.title}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
                <button
                  onClick={() => handleShare(notice)}
                  title={t.shareNoticeBtn}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {copiedId === notice.id ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>

                <a
                  href={notice.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                >
                  <span>{t.openNoticeBtn}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.pagePrev}</span>
          </button>

          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t.pageOf} {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <span>{t.pageNext}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
