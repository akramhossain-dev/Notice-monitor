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
    totalNoticesFound: 0
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
    totalNoticesFound: 0
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
    totalNoticesFound: 0
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
    totalNoticesFound: 0
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
    totalNoticesFound: 0
  }
];

// Notices are populated only by verified scraper runs so demo content is never
// presented as current operational data.
export const SEED_NOTICES: Notice[] = [];
