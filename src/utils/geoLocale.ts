/**
 * Geo-Location & Language Detection Utility
 * Automatically detects whether user is from Bangladesh (Bangla) or India (Hindi)
 * using Timezone, Navigator Language, and Background IP Geolocation.
 */

import { useState, useEffect } from 'react';

export type GeoLang = 'bn' | 'hi';

export interface LocalizedText {
  proTraderLine1: string;
  proTraderLine2: string;
  wingo30sLine1: string;
  wingo30sLine2: string;
  analysisText: string;
  allWinningTraders: string;
  allWinningSubtitle: string;
  momentumIndicator: string;
  momentumSubtitle: string;
  langName: string;
  flag: string;
}

export const STRINGS: Record<GeoLang, LocalizedText> = {
  bn: {
    proTraderLine1: 'সেরা ৬টি উইনিং সিগন্যাল',
    proTraderLine2: 'টপ একুরেসি লাইভ প্রেডিকশন',
    wingo30sLine1: 'আল্ট্রা ফাস্ট সিগন্যাল',
    wingo30sLine2: '৩০ সেকেন্ড লাইভ প্রেডিকশন',
    analysisText: 'মোমেন্টাম রেজোন্যান্স ৯৯% অ্যাক্টিভ',
    allWinningTraders: 'অল উইনিং ট্রেডার',
    allWinningSubtitle: 'টপ একুরেসি উইনিং মডেল লাইভ স্ট্রিম',
    momentumIndicator: 'মোমেন্টাম এআই ইন্ডিকেটর',
    momentumSubtitle: 'হাই একুরেসি লাইভ সিগন্যাল প্রোফাইল',
    langName: 'বাংলা',
    flag: '🇧🇩',
  },
  hi: {
    proTraderLine1: 'शीर्ष 6 विनिंग सिग्नल',
    proTraderLine2: 'टॉप एक्यूरेसी लाइव प्रेडिक्शन',
    wingo30sLine1: 'अल्ट्रा फास्ट सिग्नल',
    wingo30sLine2: '30 सेकंड लाइव प्रेडिक्शन',
    analysisText: 'मोमेंटम रेजोनेंस 99% एक्टिव',
    allWinningTraders: 'ऑल विनिंग ट्रेडर्स',
    allWinningSubtitle: 'टॉप एक्यूरेसी विनिंग मॉडल लाइव स्ट्रीम',
    momentumIndicator: 'मोमेंटम एआई इंडिकेटर',
    momentumSubtitle: 'हाई एक्यूरेसी लाइव सिग्नल प्रोफाइल',
    langName: 'हिन्दी',
    flag: '🇮🇳',
  },
};

/**
 * Fast synchronous detection using browser timezone and navigator language
 */
export function getInitialGeoLang(): GeoLang {
  if (typeof window === 'undefined') return 'bn';

  try {
    const saved = localStorage.getItem('user_geo_lang');
    if (saved === 'bn' || saved === 'hi') {
      return saved as GeoLang;
    }

    // 1. Timezone detection (fastest, 100% reliable in browser)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) {
      return 'hi';
    }
    if (tz.includes('Dhaka') || tz.includes('Bangladesh')) {
      return 'bn';
    }

    // 2. Navigator languages
    const navLangs = (navigator.languages || [navigator.language || '']).join(',').toLowerCase();
    if (navLangs.includes('hi') || navLangs.includes('in')) {
      return 'hi';
    }
    if (navLangs.includes('bn') || navLangs.includes('bd')) {
      return 'bn';
    }
  } catch {
    // fallback
  }

  return 'bn';
}

/**
 * React hook for live geo-detected language
 */
export function useGeoLanguage() {
  const [lang, setLang] = useState<GeoLang>(getInitialGeoLang);

  useEffect(() => {
    // Background IP Geo-verification
    const detectCountry = async () => {
      try {
        const res = await fetch('https://api.country.is/', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const country = String(data?.country || '').toUpperCase();
          if (country === 'IN') {
            setLang('hi');
            localStorage.setItem('user_geo_lang', 'hi');
          } else if (country === 'BD') {
            setLang('bn');
            localStorage.setItem('user_geo_lang', 'bn');
          }
        }
      } catch {
        // Fallback to secondary geo service if blocked
        try {
          const res2 = await fetch('https://ipwho.is/');
          if (res2.ok) {
            const data2 = await res2.json();
            const country2 = String(data2?.country_code || '').toUpperCase();
            if (country2 === 'IN') {
              setLang('hi');
              localStorage.setItem('user_geo_lang', 'hi');
            } else if (country2 === 'BD') {
              setLang('bn');
              localStorage.setItem('user_geo_lang', 'bn');
            }
          }
        } catch {
          // Keep timezone detected default
        }
      }
    };

    detectCountry();
  }, []);

  const changeLang = (newLang: GeoLang) => {
    setLang(newLang);
    localStorage.setItem('user_geo_lang', newLang);
  };

  return {
    lang,
    strings: STRINGS[lang],
    changeLang,
  };
}
