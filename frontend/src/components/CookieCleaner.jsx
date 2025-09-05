'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Jalankan hanya di path tertentu (mis: halaman login)
const INCLUDE_PATHS = [
  /^\/n\/login-admin-manual(\/|$)/,
  /^\/n\/login(\/|$)/,
];

// Pola cookie yang akan DIHAPUS (tambahkan sesuai kebutuhanmu)
const CLEAR_PATTERNS = [
  /^_ga/,          // GA4 (_ga, _ga_XXXX, dst)
  /^_gid$/,
  /^_gat/,
  /^_hj/,          // Hotjar
  /^twk_uuid_/,    // Tawk.to
  /^remember_web_/
];

// Cookie yang TIDAK dihapus (penting untuk auth/CF)
const KEEP = new Set(['gucc_session', 'XSRF-TOKEN', 'cf_clearance']);

// Helper: dapatkan daftar nama cookie yang terlihat oleh JS (bukan HttpOnly)
function getCookieNames() {
  if (typeof document === 'undefined') return [];
  const raw = document.cookie || '';
  if (!raw) return [];
  return raw.split(';').map((c) => c.trim().split('=')[0]).filter(Boolean);
}

// Coba hapus cookie dengan berbagai kombinasi path & domain
function deleteCookieEverywhere(name) {
  const expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  const basePath = '/';
  const pathVariants = Array.from(new Set([
    basePath,
    // path saat ini (barangkali cookie di-set dengan path ini)
    (typeof window !== 'undefined' ? window.location.pathname : basePath) || basePath,
  ]));

  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const domains = new Set();

  // host-only (tanpa domain=) – penting!
  domains.add(null);

  if (host) {
    // domain persis host
    domains.add(host);
    // domain dengan leading dot
    domains.add(`.${host}`);

    // coba turunan domain (mis: "gucc.gunadarma.ac.id" -> ".gunadarma.ac.id")
    const parts = host.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      const candidate = `.${parts.slice(i).join('.')}`;
      domains.add(candidate);
    }
    // kalau kamu tahu apex domain pasti:
    domains.add('.gunadarma.ac.id');
  }

  // Hapus dengan beragam kombinasi
  for (const d of domains) {
    for (const p of pathVariants) {
      const domainAttr = d ? `; domain=${d}` : '';
      // pakai SameSite/secure biar "match" karakteristik umum
      document.cookie = `${name}=; ${expires}; path=${p}${domainAttr}; samesite=lax; secure`;
    }
  }
  console.log(`[CookieCleaner] deleted cookie: ${name} (paths: ${pathVariants.join(', ')}, domains: ${Array.from(domains).join(', ')})`);
}

export default function CookieCleaner() {
  const pathname = usePathname();
  const shouldRun = INCLUDE_PATHS.some((re) => re.test(pathname || ''));

  useEffect(() => {
    if (!shouldRun) return;

    const names = getCookieNames();

    names.forEach((name) => {
      if (KEEP.has(name)) return; // Jangan hapus yang penting

      const match = CLEAR_PATTERNS.some((re) => re.test(name));
      if (match) {
        try {
          deleteCookieEverywhere(name);
          // Optional: debugging
          console.log('[CookieCleaner] deleted', name);
        } catch (_) {
          // no-op
        }
      }
    });
  }, [shouldRun]);

  return null;
}
