(function () {
  'use strict';

  const PLACEHOLDER_RE = /^\[[^\]]+\]$/;

  function isPlaceholder(value) {
    return !value || PLACEHOLDER_RE.test(String(value).trim());
  }

  function getConfig() {
    return typeof CIA_CONFIG !== 'undefined' ? CIA_CONFIG : null;
  }

  function siteOrigin() {
    const cfg = getConfig();
    if (cfg && cfg.domain) return cfg.domain.replace(/\/$/, '');
    return window.location.origin;
  }

  function absoluteUrl(path) {
    const origin = siteOrigin();
    if (!path) return origin + '/';
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith('/') ? path : '/' + path;
    return origin + normalized;
  }

  function currentPageUrl() {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.getAttribute('href')) {
      const href = canonical.getAttribute('href');
      if (/^https?:\/\//i.test(href)) return href;
      return absoluteUrl(href);
    }
    const path = window.location.pathname.replace(/index\.html$/, '');
    return absoluteUrl(path.endsWith('/') ? path : path + '/');
  }

  function setMeta(attr, key, value) {
    if (!value) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  function patchMetaTags() {
    const cfg = getConfig();
    const pageUrl = currentPageUrl();
    const ogImage = absoluteUrl((cfg && cfg.defaultOgImage) || '/assets/og/og-image.jpg');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', pageUrl);

    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    if (cfg && cfg.siteName) setMeta('property', 'og:site_name', cfg.siteName);

    setMeta('name', 'twitter:image', ogImage);
  }

  function buildFaqSchema() {
    const items = document.querySelectorAll('#faq-accordion .accordion__item');
    if (!items.length) return null;

    const mainEntity = [];
    items.forEach((item) => {
      const trigger = item.querySelector('.accordion__trigger');
      const content = item.querySelector('.accordion__content');
      if (!trigger || !content) return;
      const question = trigger.textContent.replace(/\s+/g, ' ').trim();
      const answer = content.textContent.replace(/\s+/g, ' ').trim();
      if (!question || !answer) return;
      mainEntity.push({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      });
    });

    if (!mainEntity.length) return null;
    return {
      '@type': 'FAQPage',
      '@id': currentPageUrl() + '#faq',
      mainEntity,
    };
  }

  function enrichOrganization(node, cfg, origin) {
    if (!node || node['@type'] !== 'Organization') return;
    node.url = origin + '/';
    if (!isPlaceholder(cfg.phone)) node.telephone = cfg.phone;
    if (!isPlaceholder(cfg.email)) node.email = cfg.email;
    if (!isPlaceholder(cfg.address)) {
      node.address = { '@type': 'PostalAddress', streetAddress: cfg.address, addressCountry: 'RU' };
    }
    if (cfg.areaServedSchema) node.areaServed = cfg.areaServedSchema;
  }

  function enrichProfessionalService(node, cfg, origin) {
    if (!node || node['@type'] !== 'ProfessionalService') return;
    node.url = origin + '/';
    if (cfg.areaServedSchema) node.areaServed = cfg.areaServedSchema;
    if (!isPlaceholder(cfg.phone)) node.telephone = cfg.phone;
    node.availableChannel = [
      { '@type': 'ServiceChannel', serviceType: 'Online', availableLanguage: 'Russian' },
      { '@type': 'ServiceChannel', serviceType: 'OnSite', availableLanguage: 'Russian', areaServed: cfg.areaServedSchema || 'Россия' },
    ];
  }

  function patchJsonLd() {
    const cfg = getConfig();
    const origin = siteOrigin();
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    scripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@graph']) {
          data['@graph'].forEach((node) => {
            if (node.url && typeof node.url === 'string' && node.url.startsWith('/')) {
              node.url = absoluteUrl(node.url);
            }
            if (node['@id'] && String(node['@id']).startsWith('/')) {
              node['@id'] = absoluteUrl(node['@id']);
            }
            enrichOrganization(node, cfg || {}, origin);
            enrichProfessionalService(node, cfg || {}, origin);
          });
          const faq = buildFaqSchema();
          if (faq) {
            const hasFaq = data['@graph'].some((n) => n['@type'] === 'FAQPage');
            if (!hasFaq) data['@graph'].push(faq);
          }
          script.textContent = JSON.stringify(data);
        } else {
          if (cfg) {
            data.url = origin + '/';
            if (cfg.areaServedSchema) data.areaServed = cfg.areaServedSchema;
          }
          script.textContent = JSON.stringify(data);
        }
      } catch (_) { /* ignore */ }
    });

    const hasLd = scripts.length > 0;
    const faqOnly = buildFaqSchema();
    if (!hasLd && faqOnly) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [faqOnly] });
      document.head.appendChild(script);
    }
  }

  function boot() {
    patchMetaTags();
    patchJsonLd();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
