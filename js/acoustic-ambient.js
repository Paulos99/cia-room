(function () {
  'use strict';

  const SVG = {
    ripples:
      '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true"><circle cx="60" cy="60" r="18" stroke="currentColor" stroke-width="0.8" opacity="0.65"/><circle cx="60" cy="60" r="32" stroke="currentColor" stroke-width="0.55" opacity="0.42"/><circle cx="60" cy="60" r="46" stroke="currentColor" stroke-width="0.4" opacity="0.28"/><circle cx="60" cy="60" r="58" stroke="currentColor" stroke-width="0.3" opacity="0.16"/><circle cx="60" cy="60" r="2.5" fill="currentColor" opacity="0.85"/></svg>',
    wave:
      '<svg viewBox="0 0 220 72" fill="none" aria-hidden="true"><path d="M0 36 C18 8 36 8 54 36 S90 64 108 36 S144 8 162 36 S198 64 220 36" stroke="currentColor" stroke-width="0.9" opacity="0.7"/><path d="M0 52 C18 24 36 24 54 52 S90 68 108 52 S144 24 162 52 S198 68 220 52" stroke="currentColor" stroke-width="0.55" opacity="0.38"/></svg>',
    spectrum:
      '<svg viewBox="0 0 96 110" fill="none" aria-hidden="true"><rect x="4" y="62" width="7" height="48" rx="1" fill="currentColor" opacity="0.35"/><rect x="17" y="44" width="7" height="66" rx="1" fill="currentColor" opacity="0.5"/><rect x="30" y="28" width="7" height="82" rx="1" fill="currentColor" opacity="0.62"/><rect x="43" y="18" width="7" height="92" rx="1" fill="currentColor" opacity="0.75"/><rect x="56" y="34" width="7" height="76" rx="1" fill="currentColor" opacity="0.55"/><rect x="69" y="50" width="7" height="60" rx="1" fill="currentColor" opacity="0.42"/><rect x="82" y="66" width="7" height="44" rx="1" fill="currentColor" opacity="0.3"/><line x1="2" y1="108" x2="94" y2="108" stroke="currentColor" stroke-width="0.4" opacity="0.25"/></svg>',
    field:
      '<svg viewBox="0 0 180 130" fill="none" aria-hidden="true"><path d="M8 112 C48 42 78 38 172 18" stroke="currentColor" stroke-width="0.65" opacity="0.55"/><path d="M8 92 C52 34 86 30 172 10" stroke="currentColor" stroke-width="0.5" opacity="0.38"/><path d="M8 72 C56 28 94 24 172 4" stroke="currentColor" stroke-width="0.4" opacity="0.24"/><circle cx="172" cy="18" r="2" fill="currentColor" opacity="0.7"/></svg>',
    path:
      '<svg viewBox="0 0 150 90" fill="none" aria-hidden="true"><path d="M12 45 C40 12 70 12 98 45 S130 78 138 45" stroke="currentColor" stroke-width="0.7" stroke-dasharray="5 5" opacity="0.5"/><circle cx="12" cy="45" r="4" fill="currentColor" opacity="0.8"/><circle cx="75" cy="45" r="3" stroke="currentColor" stroke-width="0.7" fill="none" opacity="0.65"/><circle cx="138" cy="45" r="4" fill="currentColor" opacity="0.8"/></svg>',
    ring:
      '<svg viewBox="0 0 110 110" fill="none" aria-hidden="true"><path d="M55 14 A41 41 0 1 1 22 78" stroke="currentColor" stroke-width="0.85" opacity="0.6"/><path d="M55 22 A33 33 0 1 1 28 72" stroke="currentColor" stroke-width="0.45" opacity="0.32"/><line x1="55" y1="55" x2="78" y2="30" stroke="currentColor" stroke-width="0.7" opacity="0.55"/><circle cx="55" cy="55" r="2.5" fill="currentColor" opacity="0.75"/><text x="18" y="96" fill="currentColor" font-family="IBM Plex Mono, monospace" font-size="7" opacity="0.4">dB</text></svg>',
    isoline:
      '<svg viewBox="0 0 140 100" fill="none" aria-hidden="true"><ellipse cx="70" cy="50" rx="58" ry="34" stroke="currentColor" stroke-width="0.45" opacity="0.28"/><ellipse cx="70" cy="50" rx="42" ry="24" stroke="currentColor" stroke-width="0.55" opacity="0.42"/><ellipse cx="70" cy="50" rx="26" ry="14" stroke="currentColor" stroke-width="0.7" opacity="0.58"/><ellipse cx="70" cy="50" rx="10" ry="5" stroke="currentColor" stroke-width="0.85" opacity="0.72"/></svg>',
    microphone:
      '<svg viewBox="0 0 80 120" fill="none" aria-hidden="true"><rect x="30" y="8" width="20" height="44" rx="10" stroke="currentColor" stroke-width="1.1" opacity="0.75"/><path d="M16 52 C16 68 28 78 40 78 C52 78 64 68 64 52" stroke="currentColor" stroke-width="0.9" opacity="0.6"/><line x1="40" y1="78" x2="40" y2="98" stroke="currentColor" stroke-width="0.9" opacity="0.55"/><line x1="26" y1="98" x2="54" y2="98" stroke="currentColor" stroke-width="0.9" opacity="0.55"/><path d="M22 36 C22 22 30 14 40 14" stroke="currentColor" stroke-width="0.5" opacity="0.35" stroke-dasharray="3 3"/><circle cx="40" cy="30" r="3" fill="currentColor" opacity="0.5"/></svg>',
    chart:
      '<svg viewBox="0 0 160 100" fill="none" aria-hidden="true"><line x1="12" y1="88" x2="148" y2="88" stroke="currentColor" stroke-width="0.6" opacity="0.35"/><line x1="12" y1="12" x2="12" y2="88" stroke="currentColor" stroke-width="0.6" opacity="0.35"/><path d="M20 72 L44 58 L68 64 L92 38 L116 46 L140 22" stroke="currentColor" stroke-width="1.1" opacity="0.72"/><path d="M20 80 L44 70 L68 74 L92 56 L116 62 L140 44" stroke="currentColor" stroke-width="0.7" stroke-dasharray="4 4" opacity="0.4"/><circle cx="92" cy="38" r="3" fill="currentColor" opacity="0.65"/><circle cx="140" cy="22" r="3" fill="currentColor" opacity="0.65"/><text x="18" y="98" fill="currentColor" font-family="IBM Plex Mono, monospace" font-size="6" opacity="0.45">до / после</text></svg>',
    floorplan:
      '<svg viewBox="0 0 140 110" fill="none" aria-hidden="true"><rect x="10" y="12" width="120" height="86" rx="2" stroke="currentColor" stroke-width="0.85" opacity="0.55"/><line x1="70" y1="12" x2="70" y2="98" stroke="currentColor" stroke-width="0.55" opacity="0.4"/><line x1="10" y1="58" x2="130" y2="58" stroke="currentColor" stroke-width="0.55" opacity="0.4"/><rect x="78" y="20" width="44" height="30" stroke="currentColor" stroke-width="0.45" opacity="0.35"/><rect x="18" y="66" width="40" height="24" stroke="currentColor" stroke-width="0.45" opacity="0.35"/><circle cx="52" cy="36" r="2" fill="currentColor" opacity="0.55"/><path d="M78 50 L130 50" stroke="currentColor" stroke-width="0.35" stroke-dasharray="3 3" opacity="0.3"/></svg>',
    blueprint:
      '<svg viewBox="0 0 130 100" fill="none" aria-hidden="true"><rect x="14" y="10" width="102" height="72" stroke="currentColor" stroke-width="0.7" opacity="0.5"/><line x1="14" y1="28" x2="116" y2="28" stroke="currentColor" stroke-width="0.4" opacity="0.3"/><line x1="14" y1="46" x2="90" y2="46" stroke="currentColor" stroke-width="0.4" opacity="0.3"/><line x1="14" y1="64" x2="104" y2="64" stroke="currentColor" stroke-width="0.4" opacity="0.3"/><path d="M30 82 L50 62 L74 70 L98 48" stroke="currentColor" stroke-width="0.8" opacity="0.6"/><circle cx="50" cy="62" r="2.5" fill="currentColor" opacity="0.55"/><circle cx="98" cy="48" r="2.5" fill="currentColor" opacity="0.55"/></svg>',
    report:
      '<svg viewBox="0 0 90 110" fill="none" aria-hidden="true"><rect x="18" y="8" width="54" height="72" rx="3" stroke="currentColor" stroke-width="0.8" opacity="0.55"/><line x1="28" y1="26" x2="62" y2="26" stroke="currentColor" stroke-width="0.5" opacity="0.35"/><line x1="28" y1="38" x2="58" y2="38" stroke="currentColor" stroke-width="0.5" opacity="0.35"/><line x1="28" y1="50" x2="54" y2="50" stroke="currentColor" stroke-width="0.5" opacity="0.35"/><rect x="28" y="58" width="28" height="14" rx="1" stroke="currentColor" stroke-width="0.45" opacity="0.4"/><path d="M36 92 L45 84 L54 92" stroke="currentColor" stroke-width="0.6" opacity="0.4"/></svg>',
  };

  const FLOAT_ZONES = [
    {
      section: '#hero',
      items: [
        { type: 'wave', size: 'lg', depth: 'far', x: '4%', y: '68%', drift: { y: -8, x: 6, duration: 8.5 }, parallax: { y: 90, x: 28, rotate: 2 }, hideMobile: true },
        { type: 'isoline', size: 'sm', depth: 'mid', x: '8%', y: '32%', drift: { y: -10, duration: 7 }, parallax: { y: 55, x: 14, rotate: 4 } },
      ],
    },
    {
      section: '#about-cia',
      items: [
        { type: 'field', size: 'lg', depth: 'far', x: '90%', y: '16%', drift: { y: -10, duration: 9 }, parallax: { y: 95, x: -28, rotate: -5 }, hideMobile: true },
        { type: 'report', size: 'md', depth: 'mid', x: '3%', y: '58%', drift: { y: -9, duration: 7 }, parallax: { y: 75, x: 18, rotate: 3 } },
      ],
    },
    {
      section: '#why',
      items: [
        { type: 'path', size: 'lg', depth: 'mid', x: '88%', y: '24%', drift: { y: -11, x: -5, duration: 7.5 }, parallax: { y: 105, x: -26, rotate: -3 } },
        { type: 'ripples', size: 'sm', depth: 'far', x: '4%', y: '76%', drift: { y: -7, duration: 8 }, parallax: { y: 55, x: 14, rotate: 2 }, hideMobile: true },
      ],
    },
    {
      section: '#services',
      items: [
        { type: 'floorplan', size: 'lg', depth: 'mid', x: '92%', y: '14%', drift: { y: -10, rotate: -2, duration: 8 }, parallax: { y: 75, x: -18, rotate: -3 }, hideMobile: true },
        { type: 'microphone', size: 'md', depth: 'mid', x: '3%', y: '68%', drift: { y: -12, duration: 6.5 }, parallax: { y: 65, x: 16, rotate: 3 } },
      ],
    },
    {
      section: '#system',
      items: [
        { type: 'floorplan', size: 'md', depth: 'mid', x: '6%', y: '22%', drift: { y: -9, duration: 7.5 }, parallax: { y: 70, x: 22, rotate: 4 } },
        { type: 'path', size: 'sm', depth: 'far', x: '92%', y: '48%', drift: { y: -7, duration: 8 }, parallax: { y: 45, x: -16, rotate: -2 }, hideMobile: true },
      ],
    },
    {
      section: '#process',
      items: [
        { type: 'microphone', size: 'md', depth: 'mid', x: '93%', y: '20%', drift: { y: -10, duration: 7 }, parallax: { y: 70, x: -16, rotate: -4 }, hideMobile: true },
      ],
    },
    {
      section: '#result',
      items: [
        { type: 'chart', size: 'sm', depth: 'far', x: '4%', y: '86%', drift: { y: -6, duration: 8 }, parallax: { y: 35, x: 10, rotate: 2 } },
      ],
    },
    {
      section: '#objects',
      items: [
        { type: 'floorplan', size: 'md', depth: 'far', x: '86%', y: '30%', drift: { y: -10, duration: 8 }, parallax: { y: 65, x: -24, rotate: -3 }, hideMobile: true },
        { type: 'isoline', size: 'sm', depth: 'mid', x: '4%', y: '68%', drift: { y: -8, duration: 7 }, parallax: { y: 48, x: 16, rotate: 3 } },
      ],
    },
    {
      section: '#approach',
      items: [
        { type: 'ring', size: 'sm', depth: 'far', x: '5%', y: '74%', drift: { y: -8, duration: 8.5 }, parallax: { y: 38, x: 12, rotate: 3 }, hideMobile: true },
      ],
    },
    {
      section: '#lead',
      items: [
        { type: 'microphone', size: 'sm', depth: 'far', x: '8%', y: '12%', drift: { y: -7, duration: 9 }, parallax: { y: 40, x: 12, rotate: 2 }, hideMobile: true },
        { type: 'blueprint', size: 'md', depth: 'mid', x: '88%', y: '58%', drift: { y: -9, duration: 7.5 }, parallax: { y: 55, x: -18, rotate: -4 } },
      ],
    },
  ];

  const MARKER_ZONES = [
    { section: '#why', markers: [{ type: 'dash', depth: 2, x: 0.06, y: 0.82 }] },
    { section: '#services', markers: [{ type: 'tick', depth: 1, x: 0.1, y: 0.2 }] },
    { section: '#system', markers: [{ type: 'ring', depth: 2, x: 0.92, y: 0.55 }] },
  ];

  const DEPTH_LIFT = [0.18, 0.42, 0.68];

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isMobile() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function canParallax() {
    return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion();
  }

  function zoneOpacity(rect) {
    const vh = window.innerHeight;
    if (rect.bottom < 0 || rect.top > vh) return 0;
    const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    const ratio = visible / Math.max(1, Math.min(rect.height, vh));
    const center = rect.top + rect.height * 0.5;
    const centerWeight = 1 - Math.min(1, Math.abs(center - vh * 0.5) / (vh * 0.65));
    return Math.min(1, ratio * 1.2) * (0.55 + centerWeight * 0.45);
  }

  function createFloat(item) {
    const wrap = document.createElement('div');
    wrap.className = [
      'acoustic-float',
      `acoustic-float--${item.size || 'md'}`,
      `acoustic-float--depth-${item.depth || 'mid'}`,
      item.type ? `acoustic-float--type-${item.type}` : '',
      item.hideMobile ? 'acoustic-float--hide-mobile' : '',
    ]
      .filter(Boolean)
      .join(' ');
    wrap.style.left = item.x;
    wrap.style.top = item.y;

    const parallax = document.createElement('div');
    parallax.className = 'acoustic-float__parallax';

    const drift = document.createElement('div');
    drift.className = 'acoustic-float__drift';
    const d = item.drift || {};
    if (d.x) drift.style.setProperty('--drift-x', `${d.x}px`);
    if (d.y) drift.style.setProperty('--drift-y', `${d.y}px`);
    if (d.rotate) {
      drift.style.setProperty('--drift-rotate-from', '0deg');
      drift.style.setProperty('--drift-rotate-to', `${d.rotate}deg`);
    }
    if (d.duration) drift.style.setProperty('--drift-duration', `${d.duration}s`);
    if (d.delay) drift.style.setProperty('--drift-delay', `${d.delay}s`);

    drift.innerHTML = SVG[item.type] || SVG.wave;
    parallax.appendChild(drift);
    wrap.appendChild(parallax);
    return { wrap, parallax };
  }

  function mountSectionFloats() {
    FLOAT_ZONES.forEach((zone) => {
      const section = document.querySelector(zone.section);
      if (!section) return;

      const layer = document.createElement('div');
      layer.className = 'section-acoustic';
      layer.setAttribute('aria-hidden', 'true');

      zone.items.forEach((item) => {
        const { wrap } = createFloat(item);
        layer.appendChild(wrap);
      });

      section.prepend(layer);
    });
  }

  function bindFloatParallax() {
    if (!canParallax()) return;

    gsap.registerPlugin(ScrollTrigger);

    FLOAT_ZONES.forEach((zone) => {
      const section = document.querySelector(zone.section);
      if (!section) return;

      const floats = section.querySelectorAll('.acoustic-float');
      floats.forEach((floatEl, index) => {
        const item = zone.items[index];
        if (!item || (item.hideMobile && isMobile())) return;

        const parallaxEl = floatEl.querySelector('.acoustic-float__parallax');
        if (!parallaxEl) return;

        const p = item.parallax || {};
        const scrub = isMobile() ? 0.4 : 0.85;

        gsap.fromTo(
          parallaxEl,
          {
            y: -(p.y || 60) * 0.35,
            x: -(p.x || 0) * 0.35,
            rotation: -(p.rotate || 0) * 0.4,
          },
          {
            y: (p.y || 60) * 0.65,
            x: (p.x || 0) * 0.65,
            rotation: (p.rotate || 0) * 0.6,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub,
            },
          }
        );
      });
    });
  }

  function createMarker(cfg) {
    const el = document.createElement('div');
    el.className = `acoustic-marker acoustic-marker--${cfg.type} acoustic-marker--depth-${cfg.depth}`;
    el.style.setProperty('--float-dur', `${4.5 + Math.random() * 3}s`);
    el.style.setProperty('--float-delay', `${Math.random() * 2}s`);
    el.style.setProperty('--float-amp', `${4 + cfg.depth * 2}px`);
    if (cfg.rotate) el.style.setProperty('--marker-rotate', `${cfg.rotate}deg`);
    el.innerHTML = '<span class="acoustic-marker__glyph"></span>';
    return el;
  }

  function mountFixedMarkers() {
    const root = document.getElementById('acoustic-ambient');
    if (!root || prefersReducedMotion()) return;

    if (isMobile()) {
      root.hidden = true;
      return;
    }

    MARKER_ZONES.forEach((zone) => {
      const section = document.querySelector(zone.section);
      if (!section) return;

      zone.markers.forEach((cfg) => {
        const marker = createMarker(cfg);
        root.appendChild(marker);

        if (!canParallax()) {
          marker.style.opacity = '0';
          return;
        }

        const lift = DEPTH_LIFT[cfg.depth] || 0.4;

        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.55,
          onUpdate: () => {
            const rect = section.getBoundingClientRect();
            const x = rect.left + rect.width * cfg.x;
            const y = rect.top + rect.height * cfg.y;
            const suspend = (window.innerHeight * 0.5 - y) * lift * 0.12;

            gsap.set(marker, {
              x,
              y: y + suspend,
              opacity: zoneOpacity(rect),
            });
          },
        });
      });
    });
  }

  function boot() {
    mountSectionFloats();
    mountFixedMarkers();
    bindFloatParallax();

    if (typeof ScrollTrigger !== 'undefined') {
      window.addEventListener('load', () => ScrollTrigger.refresh());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
