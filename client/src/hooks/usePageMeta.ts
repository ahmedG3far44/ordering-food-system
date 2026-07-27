import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
}

const BASE_URL = 'https://food.njerka.xyz';

function setOrUpdateMeta(selector: string, attrs: Record<string, string>) {
  let el = document.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = document.createElement('meta');
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    document.head.appendChild(el);
  } else {
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
  }
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    document.title = meta.title;

    setOrUpdateMeta('meta[name="description"]', { name: 'description', content: meta.description ?? '' });
    setOrUpdateMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title });
    setOrUpdateMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description ?? '' });
    setOrUpdateMeta('meta[property="og:type"]', { property: 'og:type', content: meta.ogType ?? 'website' });
    setOrUpdateMeta('meta[property="og:url"]', { property: 'og:url', content: window.location.href });
    setOrUpdateMeta('meta[property="og:image"]', { property: 'og:image', content: meta.ogImage ?? `${BASE_URL}/favicon.svg` });
    setOrUpdateMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setOrUpdateMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
    setOrUpdateMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description ?? '' });
    setOrUpdateMeta('link[rel="canonical"]', { rel: 'canonical', href: `${BASE_URL}${window.location.pathname}` });
  }, [meta.title, meta.description, meta.ogImage, meta.ogType]);
}
