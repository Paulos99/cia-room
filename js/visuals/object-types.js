(function () {
  'use strict';

  const SCHEMATICS = {
    apartment: {
      viewBox: '0 0 320 180',
      html: () => CIAViz.arrowMarkers('oa') + `
        <text x="16" y="20" class="viz-label viz-label--title">КВАРТИРА · НЕСКОЛЬКО ПУТЕЙ ШУМА</text>
        ${CIAViz.roomBlock(24, 56, 76, 54, 'соседи', true)}
        <text x="62" y="48" class="viz-label viz-label--caption" text-anchor="middle">источник</text>
        <rect x="138" y="40" width="18" height="108" class="viz-zone" rx="2"/>
        <text x="147" y="162" class="viz-label viz-label--active" text-anchor="middle">стена</text>
        ${CIAViz.roomBlock(218, 56, 78, 54, 'где слышно', false)}
        <path class="obj-path viz-path" d="M100 84 H138" marker-end="url(#oa)"/>
        <path class="viz-path" d="M156 84 H218" marker-end="url(#oa)"/>
        <path class="viz-path viz-path--soft" d="M100 68 H124 V36 H268 V56" marker-end="url(#oas)"/>
        <text x="108" y="78" class="viz-label viz-label--caption">прямо</text>
        <text x="178" y="32" class="viz-label viz-label--caption">обходом</text>
        ${CIAViz.movingDot('M100 84 H218', '#2F7DFF', '2.4s')}
        ${CIAViz.movingDot('M100 68 H124 V36 H268 V56', '#78B4FF', '3s', '0.6s')}
        ${CIAViz.pathLegend(16, 148)}
      `,
    },

    house: {
      viewBox: '0 0 320 180',
      html: () => CIAViz.arrowMarkers('oa') + `
        <text x="16" y="20" class="viz-label viz-label--title">ЧАСТНЫЙ ДОМ · РАЗДЕЛИТЬ ШУМНОЕ И ТИХОЕ</text>
        <rect x="64" y="36" width="192" height="40" class="viz-frame" rx="2"/>
        <text x="160" y="60" class="viz-label viz-label--room" text-anchor="middle">тихая зона · спальня</text>
        <rect x="64" y="76" width="192" height="16" class="viz-zone" rx="2"/>
        <text x="160" y="88" class="viz-label viz-label--layer viz-label--active" text-anchor="middle">перекрытие</text>
        <rect x="64" y="92" width="192" height="52" class="viz-zone--muted" rx="2"/>
        <text x="160" y="122" class="viz-label viz-label--active" text-anchor="middle">шумная зона · техника</text>
        <circle cx="160" cy="118" r="7" class="viz-node"/>
        ${CIAViz.impactRipples(160, 118)}
        <path class="obj-path viz-path" d="M160 111 V92" marker-end="url(#oa)"/>
        <path class="viz-path viz-path--soft" d="M132 118 C132 100 146 90 160 84" marker-end="url(#oas)"/>
        <path class="viz-path viz-path--soft" d="M188 118 C188 100 174 90 160 84" marker-end="url(#oas)"/>
        <text x="160" y="156" class="viz-label viz-label--caption" text-anchor="middle">шум поднимается вверх</text>
        ${CIAViz.movingDot('M160 118 V76', '#2F7DFF', '2.1s')}
        ${CIAViz.pathLegend(16, 148)}
      `,
    },

    studio: {
      viewBox: '0 0 320 180',
      html: () => CIAViz.arrowMarkers('oa') + `
        <text x="16" y="20" class="viz-label viz-label--title">СТУДИЯ · ЧТО ОСТАЁТСЯ В ЗАПИСИ</text>
        <rect x="32" y="36" width="256" height="108" class="viz-frame" rx="2"/>
        <circle cx="80" cy="96" r="8" class="viz-node"/>
        <text x="80" y="122" class="viz-label viz-label--active" text-anchor="middle">голос</text>
        <circle cx="240" cy="96" r="8" class="viz-node viz-node--soft"/>
        <text x="240" y="122" class="viz-label" text-anchor="middle">микрофон</text>
        <rect x="118" y="128" width="84" height="8" class="viz-zone" rx="1"/>
        <text x="160" y="124" class="viz-label viz-label--caption" text-anchor="middle">рабочая зона</text>
        <path class="obj-path viz-path" d="M88 96 H232" marker-end="url(#oa)"/>
        <text x="160" y="88" class="viz-label viz-label--active" text-anchor="middle">полезный звук</text>
        <path class="viz-path viz-path--soft" d="M80 96 L80 48 H240 V96" marker-end="url(#oas)"/>
        <path class="viz-path viz-path--soft" d="M80 96 L160 132 L240 96" marker-end="url(#oas)" opacity="0.45"/>
        <text x="160" y="44" class="viz-label viz-label--caption" text-anchor="middle">ранние отражения</text>
        ${CIAViz.movingDot('M88 96 H232', '#2F7DFF', '1.8s')}
        ${CIAViz.movingDot('M80 96 L80 48 H240 V96', '#78B4FF', '3s', '0.5s')}
        ${CIAViz.pathLegend(16, 148)}
      `,
    },

    office: {
      viewBox: '0 0 320 180',
      html: () => CIAViz.arrowMarkers('oa') + `
        <text x="16" y="20" class="viz-label viz-label--title">ОФИС · РАЗГОВОР НЕ ДОЛЖЕН ВЫХОДИТЬ НАРУЖУ</text>
        ${CIAViz.roomBlock(28, 48, 100, 88, 'open space', true)}
        <rect x="152" y="40" width="22" height="104" class="viz-zone" rx="2"/>
        <text x="163" y="156" class="viz-label viz-label--active" text-anchor="middle">перегородка</text>
        ${CIAViz.roomBlock(198, 48, 94, 88, 'переговорная', false)}
        <circle cx="228" cy="92" r="6" class="viz-node"/>
        <text x="228" y="80" class="viz-label viz-label--caption" text-anchor="middle">разговор</text>
        <path class="obj-path viz-path" d="M222 92 H174" marker-end="url(#oa)"/>
        <path class="viz-path" d="M152 92 H128" marker-end="url(#oa)"/>
        <path class="viz-path viz-path--soft" d="M228 52 H78" marker-end="url(#oas)"/>
        <text x="140" y="44" class="viz-label viz-label--caption">обход по потолку</text>
        ${CIAViz.movingDot('M222 92 H128', '#2F7DFF', '2.2s')}
        ${CIAViz.movingDot('M228 52 H78', '#78B4FF', '2.8s', '0.7s')}
        ${CIAViz.pathLegend(16, 148)}
      `,
    },

    horeca: {
      viewBox: '0 0 320 180',
      html: () => CIAViz.arrowMarkers('oa') + `
        <text x="16" y="20" class="viz-label viz-label--title">HORECA · КУХНЯ ШУМИТ В ДВЕ СТОРОНЫ</text>
        <rect x="56" y="36" width="208" height="32" class="viz-zone--muted" rx="2"/>
        <text x="160" y="56" class="viz-label viz-label--room" text-anchor="middle">жильцы сверху</text>
        <rect x="56" y="68" width="208" height="14" class="viz-zone" rx="2"/>
        <text x="160" y="79" class="viz-label viz-label--layer viz-label--active" text-anchor="middle">перекрытие</text>
        ${CIAViz.roomBlock(56, 92, 88, 48, 'зал', false)}
        <rect x="164" y="86" width="20" height="60" class="viz-zone" rx="2"/>
        <text x="174" y="156" class="viz-label viz-label--active" text-anchor="middle">стена</text>
        ${CIAViz.roomBlock(204, 92, 60, 48, 'кухня', true)}
        <circle cx="224" cy="116" r="6" class="viz-node"/>
        ${CIAViz.impactRipples(224, 116, '#78B4FF')}
        <path class="obj-path viz-path" d="M224 110 V82" marker-end="url(#oa)"/>
        <path class="viz-path viz-path--soft" d="M218 116 H184" marker-end="url(#oas)"/>
        <path class="viz-path viz-path--soft" d="M164 116 H144" marker-end="url(#oas)"/>
        <text x="160" y="168" class="viz-label viz-label--caption" text-anchor="middle">шум в зал и наверх</text>
        ${CIAViz.movingDot('M224 116 V68', '#2F7DFF', '2.2s')}
        ${CIAViz.movingDot('M224 116 H144', '#78B4FF', '2.8s', '0.6s')}
        ${CIAViz.pathLegend(16, 148)}
      `,
    },

    industrial: {
      viewBox: '0 0 320 180',
      html: () => CIAViz.arrowMarkers('oa') + `
        <text x="16" y="20" class="viz-label viz-label--title">ПРОМОБЪЕКТ · ГДЕ ПРЕВЫШЕН УРОВЕНЬ</text>
        <rect x="28" y="40" width="264" height="96" class="viz-frame" rx="2"/>
        <rect x="48" y="60" width="72" height="56" class="viz-zone" rx="2"/>
        <text x="84" y="84" class="viz-label viz-label--active" text-anchor="middle">станок</text>
        <text x="84" y="98" class="viz-label viz-label--caption" text-anchor="middle">источник</text>
        <circle cx="200" cy="88" r="32" fill="none" stroke="#78B4FF" stroke-width="1.2" stroke-dasharray="5 5"/>
        <text x="200" y="84" class="viz-label" text-anchor="middle">зона</text>
        <text x="200" y="98" class="viz-label viz-label--active" text-anchor="middle">превышения</text>
        ${CIAViz.roomBlock(244, 68, 36, 40, 'рабочее место', true)}
        <path class="obj-path viz-path" d="M120 88 H168" marker-end="url(#oa)"/>
        <path class="viz-path viz-path--soft" d="M120 68 H200" marker-end="url(#oas)"/>
        <text x="144" y="82" class="viz-label viz-label--active">замеряем здесь</text>
        ${CIAViz.movingDot('M120 88 H168', '#2F7DFF', '2.2s')}
        ${CIAViz.movingDot('M120 68 H200', '#78B4FF', '2.8s', '0.5s')}
        ${CIAViz.pathLegend(16, 148)}
      `,
    },
  };

  function initObjectTypes() {
    const grid = document.getElementById('objects-grid');
    if (!grid || !window.CIAViz) return;

    grid.querySelectorAll('[data-schematic]').forEach((el) => {
      const type = el.dataset.schematic;
      const spec = SCHEMATICS[type];
      if (!spec) return;
      CIAViz.mount(el, spec.viewBox, spec.html());
    });

    const cards = grid.querySelectorAll('.object-card');
    cards.forEach((card) => {
      const activate = () => {
        cards.forEach((c) => c.classList.remove('is-active'));
        card.classList.add('is-active');
        card.querySelectorAll('.obj-path').forEach((p) => p.setAttribute('opacity', '1'));
        if (window.CIAAnalytics) {
          window.CIAAnalytics.track('object_type_select', { type: card.dataset.object });
        }
      };
      card.addEventListener('click', activate);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });

    if (window.matchMedia('(max-width: 767px)').matches) {
      let frame = 0;
      const syncActiveFromScroll = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const railCenter = grid.getBoundingClientRect().left + grid.clientWidth / 2;
          let closest = cards[0];
          let closestDistance = Infinity;

          cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + rect.width / 2;
            const distance = Math.abs(cardCenter - railCenter);
            if (distance < closestDistance) {
              closestDistance = distance;
              closest = card;
            }
          });

          if (!closest.classList.contains('is-active')) {
            cards.forEach((c) => c.classList.remove('is-active'));
            closest.classList.add('is-active');
          }
        });
      };

      grid.addEventListener('scroll', syncActiveFromScroll, { passive: true });
      syncActiveFromScroll();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObjectTypes);
  } else {
    initObjectTypes();
  }
})();
