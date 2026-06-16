(function () {
  'use strict';

  const movingDot = (path, color = '#2F7DFF', dur = '2.8s') => {
    if (CIAViz.reduced()) return '';
    return `<circle r="3" fill="${color}"><animateMotion path="${path}" dur="${dur}" repeatCount="indefinite"/></circle>`;
  };

  // Стрелки для схем объектов
  const arrowDefs = `<defs>
    <marker id="oa" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2F7DFF"/></marker>
    <marker id="oas" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#78B4FF"/></marker>
  </defs>`;

  const SCHEMATICS = {
    // Квартира: источник не всегда за "очевидной" стеной.
    apartment: {
      viewBox: '0 0 320 160',
      html: () => arrowDefs + `
        <text x="16" y="18" class="viz-label">КВАРТИРА · НЕСКОЛЬКО ПУТЕЙ ШУМА</text>

        <rect x="22" y="58" width="70" height="50" class="viz-zone--muted"/>
        <text x="36" y="78" class="viz-label">источник</text>
        <text x="34" y="94" class="viz-label viz-label--active">соседи</text>

        <rect x="146" y="34" width="14" height="100" class="viz-zone"/>
        <text x="132" y="148" class="viz-label viz-label--active">конструкция</text>

        <rect x="222" y="58" width="76" height="50" class="viz-frame"/>
        <text x="242" y="78" class="viz-label">где</text>
        <text x="232" y="94" class="viz-label">слышно</text>

        <path class="obj-path viz-path" d="M92 84 H146" marker-end="url(#oa)" opacity="0.9"/>
        <path class="viz-path" d="M160 84 H222" marker-end="url(#oa)" opacity="0.9"/>
        <path class="viz-path viz-path--soft" d="M92 64 H120 V34 H260 V58" marker-end="url(#oas)" opacity="0.65"/>
        <text x="102" y="76" class="viz-label">прямо</text>
        <text x="168" y="30" class="viz-label">обходом</text>

        ${movingDot('M92 84 H222', '#2F7DFF', '2.4s')}
        ${movingDot('M92 64 H120 V34 H260 V58', '#78B4FF', '3s')}
      `,
    },

    // Частный дом: шумная зона снизу влияет на тихую зону сверху.
    house: {
      viewBox: '0 0 320 160',
      html: () => arrowDefs + `
        <text x="16" y="18" class="viz-label">ЧАСТНЫЙ ДОМ · РАЗДЕЛИТЬ ШУМНОЕ И ТИХОЕ</text>

        <rect x="66" y="28" width="188" height="42" class="viz-frame"/>
        <text x="112" y="54" class="viz-label">тихая зона · спальня</text>

        <rect x="66" y="70" width="188" height="14" class="viz-zone"/>
        <text x="118" y="81" class="viz-label viz-label--active">перекрытие</text>

        <rect x="66" y="84" width="188" height="50" class="viz-zone--muted"/>
        <text x="100" y="114" class="viz-label viz-label--active">шумная зона · техника</text>

        <circle cx="160" cy="112" r="6" class="viz-node"/>
        <path class="obj-path viz-path" d="M160 106 V84" marker-end="url(#oa)" opacity="0.9"/>
        <path class="viz-path viz-path--soft" d="M128 112 C128 96 142 88 160 84" marker-end="url(#oas)" opacity="0.65"/>
        <path class="viz-path viz-path--soft" d="M192 112 C192 96 178 88 160 84" marker-end="url(#oas)" opacity="0.65"/>

        ${movingDot('M160 112 V70', '#2F7DFF', '2.1s')}
      `,
    },

    // Студия: полезный прямой звук и вредные ранние отражения.
    studio: {
      viewBox: '0 0 320 160',
      html: () => arrowDefs + `
        <text x="16" y="18" class="viz-label">СТУДИЯ · ЧТО ОСТАЁТСЯ В ЗАПИСИ</text>

        <rect x="30" y="30" width="260" height="108" class="viz-frame"/>

        <circle cx="76" cy="96" r="7" class="viz-node"/>
        <text x="54" y="120" class="viz-label viz-label--active">голос</text>

        <circle cx="244" cy="96" r="7" class="viz-node viz-node--soft"/>
        <text x="214" y="120" class="viz-label">микрофон</text>

        <rect x="118" y="124" width="84" height="8" class="viz-zone"/>
        <text x="116" y="118" class="viz-label viz-label--active">рабочая зона</text>

        <path class="obj-path viz-path" d="M83 96 H237" marker-end="url(#oa)" opacity="0.9"/>
        <text x="140" y="89" class="viz-label viz-label--active">полезный звук</text>

        <path class="viz-path viz-path--soft" d="M76 96 L76 46 H244 V96" marker-end="url(#oas)" opacity="0.68"/>
        <path class="viz-path viz-path--soft" d="M76 96 L160 132 L244 96" marker-end="url(#oas)" opacity="0.45"/>
        <text x="110" y="44" class="viz-label">ранние отражения</text>

        ${movingDot('M83 96 H237', '#2F7DFF', '1.8s')}
        ${movingDot('M76 96 L76 46 H244 V96', '#78B4FF', '3s')}
      `,
    },

    // Офис: конфиденциальный разговор утекает в общую зону.
    office: {
      viewBox: '0 0 320 160',
      html: () => arrowDefs + `
        <text x="16" y="18" class="viz-label">ОФИС · РАЗГОВОР НЕ ДОЛЖЕН ВЫХОДИТЬ НАРУЖУ</text>

        <rect x="24" y="44" width="102" height="84" class="viz-zone--muted"/>
        <text x="50" y="82" class="viz-label">open</text>
        <text x="48" y="96" class="viz-label">space</text>

        <rect x="194" y="44" width="102" height="84" class="viz-zone"/>
        <text x="214" y="82" class="viz-label viz-label--active">перего-</text>
        <text x="214" y="96" class="viz-label viz-label--active">ворная</text>

        <rect x="150" y="36" width="20" height="100" class="viz-zone"/>
        <text x="134" y="150" class="viz-label viz-label--active">перегородка</text>

        <circle cx="222" cy="86" r="6" class="viz-node"/>
        <path class="obj-path viz-path" d="M216 86 H170" marker-end="url(#oa)" opacity="0.9"/>
        <path class="viz-path" d="M150 86 H126" marker-end="url(#oa)" opacity="0.9"/>
        <path class="viz-path viz-path--soft" d="M222 44 H75 V44" marker-end="url(#oas)" opacity="0.65"/>
        <text x="86" y="38" class="viz-label">обход</text>

        ${movingDot('M222 86 H126', '#2F7DFF', '2.2s')}
        ${movingDot('M222 44 H75', '#78B4FF', '2.8s')}
      `,
    },

    // HoReCa: шум кухни влияет на гостей и жильцов сверху.
    horeca: {
      viewBox: '0 0 320 160',
      html: () => arrowDefs + `
        <text x="16" y="18" class="viz-label">HORECA · КУХНЯ ШУМИТ В ДВЕ СТОРОНЫ</text>

        <rect x="52" y="28" width="216" height="34" class="viz-zone--muted"/>
        <text x="108" y="49" class="viz-label">жильцы сверху</text>

        <rect x="52" y="62" width="216" height="12" class="viz-zone"/>
        <text x="116" y="72" class="viz-label viz-label--active">перекрытие</text>

        <rect x="52" y="90" width="86" height="44" class="viz-frame"/>
        <text x="84" y="116" class="viz-label">зал</text>

        <rect x="198" y="90" width="70" height="44" class="viz-zone--muted"/>
        <text x="214" y="116" class="viz-label">кухня</text>

        <rect x="158" y="84" width="18" height="58" class="viz-zone"/>
        <text x="144" y="154" class="viz-label viz-label--active">перегородка</text>

        <circle cx="220" cy="112" r="6" class="viz-node"/>
        <path class="obj-path viz-path" d="M220 106 V74" marker-end="url(#oa)" opacity="0.9"/>
        <path class="viz-path viz-path--soft" d="M214 112 H176" marker-end="url(#oas)" opacity="0.72"/>
        <path class="viz-path viz-path--soft" d="M158 112 H138" marker-end="url(#oas)" opacity="0.72"/>

        ${movingDot('M220 112 V62', '#2F7DFF', '2.2s')}
        ${movingDot('M220 112 H138', '#78B4FF', '2.8s')}
      `,
    },

    // Промышленный объект: важно не только оборудование, но и уровень на рабочем месте.
    industrial: {
      viewBox: '0 0 320 160',
      html: () => arrowDefs + `
        <text x="16" y="18" class="viz-label">ПРОМОБЪЕКТ · ГДЕ ПРЕВЫШЕН УРОВЕНЬ</text>

        <rect x="24" y="34" width="272" height="96" class="viz-frame"/>

        <rect x="42" y="58" width="70" height="48" class="viz-zone"/>
        <text x="54" y="78" class="viz-label viz-label--active">источник</text>
        <text x="56" y="94" class="viz-label">станок</text>

        <circle cx="210" cy="82" r="30" fill="none" stroke="#78B4FF" stroke-width="1.2" stroke-dasharray="5 5"/>
        <text x="188" y="78" class="viz-label">зона</text>
        <text x="184" y="92" class="viz-label">превышения</text>

        <rect x="238" y="64" width="40" height="36" class="viz-zone--muted"/>
        <text x="232" y="118" class="viz-label">рабочее место</text>

        <path class="obj-path viz-path" d="M112 82 H180" marker-end="url(#oa)" opacity="0.9"/>
        <path class="viz-path viz-path--soft" d="M112 62 H210" marker-end="url(#oas)" opacity="0.55"/>
        <circle cx="210" cy="82" r="4" fill="#78B4FF"/>
        <text x="136" y="76" class="viz-label viz-label--active">замеряем здесь</text>

        ${movingDot('M112 82 H180', '#2F7DFF', '2.2s')}
        ${movingDot('M112 62 H210', '#78B4FF', '2.8s')}
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObjectTypes);
  } else {
    initObjectTypes();
  }
})();
