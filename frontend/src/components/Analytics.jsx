'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // contoh: G-XXXXXXX

// opsional: jangan load GA di halaman login (biar cookie GA tidak ikut)
const EXCLUDE_PATHS = [/^\/n\/login-admin-manual(\/|$)/];

export default function Analytics() {
  const pathname = usePathname();
  const excluded = EXCLUDE_PATHS.some((re) => re.test(pathname || ''));

  if (!GA_ID || excluded) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            cookie_domain: 'gucc.gunadarma.ac.id'
          });
        `}
      </Script>
    </>
  );
}