/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Website, Notice } from './types.js';

export const SEED_WEBSITES: Website[] = [
  {
    id: 'dhaka-education-board',
    name: 'Board of Intermediate and Secondary Education, Dhaka',
    nameBn: 'মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
    url: 'https://dhakaeducationboard.gov.bd/',
    selector: '#noticelist a, .noticelist a, .views-field-title a, a[href*="notice"], table tr td a',
    category: 'board',
    intervalMinutes: 15,
    enabled: true,
    isJsHeavy: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastCheckStatus: 'success',
    lastCheckedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    totalNoticesFound: 5
  },
  {
    id: 'national-university-bd',
    name: 'National University Bangladesh',
    nameBn: 'জাতীয় বিশ্ববিদ্যালয়, বাংলাদেশ',
    url: 'https://www.nu.ac.bd/recent-notices.php',
    selector: 'table.table a, .notice-board a, a[href*="notice"], .content-area a',
    category: 'university',
    intervalMinutes: 60,
    enabled: true,
    isJsHeavy: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastCheckStatus: 'success',
    lastCheckedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    totalNoticesFound: 4
  },
  {
    id: 'dshe-gov-bd',
    name: 'Directorate of Secondary and Higher Education (DSHE)',
    nameBn: 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (মাউশি)',
    url: 'https://dshe.gov.bd/',
    selector: '.notices a, #notices a, table tr td a, a[href*="notice"]',
    category: 'government',
    intervalMinutes: 60,
    enabled: true,
    isJsHeavy: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastCheckStatus: 'success',
    lastCheckedAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    totalNoticesFound: 3
  },
  {
    id: 'bteb-gov-bd',
    name: 'Bangladesh Technical Education Board (BTEB)',
    nameBn: 'বাংলাদেশ কারিগরি শিক্ষা বোর্ড',
    url: 'https://bteb.gov.bd/',
    selector: '.notice_table a, table tr td a, a[href*="notice"]',
    category: 'board',
    intervalMinutes: 360,
    enabled: true,
    isJsHeavy: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastCheckStatus: 'success',
    lastCheckedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    totalNoticesFound: 3
  },
  {
    id: 'bpsc-gov-bd',
    name: 'Bangladesh Public Service Commission (BPSC)',
    nameBn: 'বাংলাদেশ সরকারি কর্ম কমিশন (বিপিএসসি)',
    url: 'https://bpsc.gov.bd/',
    selector: '#notices a, .notice-list a, table tr td a',
    category: 'public_service',
    intervalMinutes: 60,
    enabled: true,
    isJsHeavy: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastCheckStatus: 'success',
    lastCheckedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    totalNoticesFound: 3
  }
];

export const SEED_NOTICES: Notice[] = [
  {
    id: 'notice-deb-2026-01',
    websiteId: 'dhaka-education-board',
    websiteName: 'Board of Intermediate and Secondary Education, Dhaka',
    websiteNameBn: 'মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
    title: '২০২৬ সালের এইচএসসি পরীক্ষার ফরম পূরণের বর্ধিত সময়সূচি সংক্রান্ত জরুরি বিজ্ঞপ্তি',
    link: 'https://dhakaeducationboard.gov.bd/notice/hsc-2026-form-fillup-extension.pdf',
    detectedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    publishDate: '১৬ অক্টোবর ২০২৬',
    isInitialRun: false,
    category: 'board'
  },
  {
    id: 'notice-deb-2026-02',
    websiteId: 'dhaka-education-board',
    websiteName: 'Board of Intermediate and Secondary Education, Dhaka',
    websiteNameBn: 'মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
    title: 'এসএসসি পরীক্ষা ২০২৬ এর ব্যবহারিক পরীক্ষার সংশোধিত নম্বর প্রদান ও কেন্দ্র তালিকা',
    link: 'https://dhakaeducationboard.gov.bd/notice/ssc-practical-marks-center-list.pdf',
    detectedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    publishDate: '১৫ অক্টোবর ২০২৬',
    isInitialRun: false,
    category: 'board'
  },
  {
    id: 'notice-nu-2026-01',
    websiteId: 'national-university-bd',
    websiteName: 'National University Bangladesh',
    websiteNameBn: 'জাতীয় বিশ্ববিদ্যালয়, বাংলাদেশ',
    title: '২০২৪-২০২৫ শিক্ষাবর্ষে মাস্টার্স (নিয়মিত) ভর্তি কার্যক্রমে রিলিজ স্লিপের মেধা তালিকা প্রকাশ',
    link: 'https://www.nu.ac.bd/notice/masters-admission-release-slip-merit-list-2026.pdf',
    detectedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    publishDate: '১৬ অক্টোবর ২০২৬',
    isInitialRun: false,
    category: 'university'
  },
  {
    id: 'notice-nu-2026-02',
    websiteId: 'national-university-bd',
    websiteName: 'National University Bangladesh',
    websiteNameBn: 'জাতীয় বিশ্ববিদ্যালয়, বাংলাদেশ',
    title: 'ডিগ্রী পাস ও সার্টিফিকেট কোর্স ৩য় বর্ষ পরীক্ষা-২০২৪ এর চূড়ান্ত পরীক্ষার সময়সূচি',
    link: 'https://www.nu.ac.bd/notice/degree-pass-3rd-year-exam-routine.pdf',
    detectedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    publishDate: '১৪ অক্টোবর ২০২৬',
    isInitialRun: false,
    category: 'university'
  },
  {
    id: 'notice-dshe-2026-01',
    websiteId: 'dshe-gov-bd',
    websiteName: 'Directorate of Secondary and Higher Education (DSHE)',
    websiteNameBn: 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (মাউশি)',
    title: 'বেসরকারি শিক্ষা প্রতিষ্ঠানের শিক্ষক-কর্মচারীদের সেপ্টেম্বর ২০২৬ মাসের এমপিও চেক ছাড়করণ',
    link: 'https://dshe.gov.bd/notice/mpo-september-2026-disbursement.pdf',
    detectedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    publishDate: '১৫ অক্টোবর ২০২৬',
    isInitialRun: false,
    category: 'government'
  },
  {
    id: 'notice-bpsc-2026-01',
    websiteId: 'bpsc-gov-bd',
    websiteName: 'Bangladesh Public Service Commission (BPSC)',
    websiteNameBn: 'বাংলাদেশ সরকারি কর্ম কমিশন (বিপিএসসি)',
    title: '৪৭তম বিসিএস পরীক্ষা-২০২৬ এর প্রিলিমিনারি টেস্টের আসন বিন্যাস ও নির্দেশনা',
    link: 'https://bpsc.gov.bd/site/notices/47th-bcs-preliminary-seat-plan.pdf',
    detectedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    publishDate: '১৬ অক্টোবর ২০২৬',
    isInitialRun: false,
    category: 'public_service'
  },
  {
    id: 'notice-bteb-2026-01',
    websiteId: 'bteb-gov-bd',
    websiteName: 'Bangladesh Technical Education Board (BTEB)',
    websiteNameBn: 'বাংলাদেশ কারিগরি শিক্ষা বোর্ড',
    title: 'ডিপ্লোমা ইন ইঞ্জিনিয়ারিং ১ম, ৩য়, ৫ম ও ৭ম পর্ব সমাপনী পরীক্ষা ২০২৬ এর সংশোধিত রুটিন',
    link: 'https://bteb.gov.bd/site/notices/diploma-engineering-routine-2026.pdf',
    detectedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    publishDate: '১৩ অক্টোবর ২০২৬',
    isInitialRun: false,
    category: 'board'
  }
];
