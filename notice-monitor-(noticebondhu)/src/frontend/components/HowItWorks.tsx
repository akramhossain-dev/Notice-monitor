/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckSquare, Search, Filter, Send, ArrowRight } from 'lucide-react';
import { Language } from '../types.js';
import { translations } from '../translations.js';

interface HowItWorksProps {
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
  const t = translations[lang];

  const steps = [
    {
      num: '০১',
      title: t.step1Title,
      desc: t.step1Desc,
      icon: CheckSquare,
      color: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
      borderLight: 'border-blue-200 dark:border-blue-800'
    },
    {
      num: '০২',
      title: t.step2Title,
      desc: t.step2Desc,
      icon: Search,
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderLight: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      num: '০৩',
      title: t.step3Title,
      desc: t.step3Desc,
      icon: Filter,
      color: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      borderLight: 'border-amber-200 dark:border-amber-800'
    },
    {
      num: '০৪',
      title: t.step4Title,
      desc: t.step4Desc,
      icon: Send,
      color: 'from-purple-500 to-indigo-500',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40',
      borderLight: 'border-purple-200 dark:border-purple-800'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.howItWorksTitle}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            {t.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col p-6 sm:p-7 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                {/* Step number badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr ${step.color} text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-mono">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
