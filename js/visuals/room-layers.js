(function () {
  'use strict';

  const movingDot = (path, color = '#2F7DFF', dur = '2.4s') => {
    if (CIAViz.reduced()) return '';
    return `<circle r="3" fill="${color}"><animateMotion path="${path}" dur="${dur}" repeatCount="indefinite"/></circle>`;
  };

  const ZONE_DATA = {
    walls: {
      title: 'Стены',
      body: 'Материал, толщина, розетки и стыки с соседними конструкциями — всё влияет на индекс звукоизоляции стены.',
      svg: () => `
        <text x="16" y="22" class="viz-label">РАЗРЕЗ СТЕНЫ · ВОЗДУШНЫЙ ШУМ</text>
        <rect x="64" y="56" width="72" height="140" class="viz-frame"/>
        <rect x="136" y="56" width="40" height="140" class="viz-zone"/>
        <rect x="176" y="56" width="72" height="140" class="viz-frame"/>
        <line x1="146" y1="66" x2="146" y2="186" class="viz-grid"/>
        <line x1="156" y1="66" x2="156" y2="186" class="viz-grid"/>
        <line x1="166" y1="66" x2="166" y2="186" class="viz-grid"/>
        <text x="78" y="80" class="viz-label">помещение A</text>
        <text x="194" y="80" class="viz-label">помещение B</text>
        <rect x="146" y="118" width="20" height="16" class="viz-zone--muted"/>
        <text x="138" y="162" class="viz-label viz-label--active">слабая точка</text>
        <path d="M80 126 H136" class="viz-path" marker-end="url(#arrow)"/>
        <path d="M176 126 H232" class="viz-path viz-path--soft" marker-end="url(#arrowSoft)"/>
        <circle cx="80" cy="126" r="6" class="viz-node viz-node--soft"/>
        ${movingDot('M80 126 H136', '#2F7DFF', '1.7s')}
      `,
    },
    ceiling: {
      title: 'Потолок',
      body: 'Шум сверху может идти прямо через перекрытие — или обходить его через стены и стыки. Без проверки легко обработать не то.',
      svg: () => `
        <text x="16" y="22" class="viz-label">ПЕРЕКРЫТИЕ · УДАРНЫЙ И ВОЗДУШНЫЙ ШУМ</text>
        <rect x="64" y="48" width="108" height="46" class="viz-frame"/>
        <rect x="64" y="94" width="108" height="30" class="viz-zone"/>
        <rect x="64" y="124" width="108" height="74" class="viz-frame"/>
        <rect x="172" y="48" width="32" height="150" class="viz-zone--muted"/>
        <text x="78" y="76" class="viz-label">верхний этаж</text>
        <text x="72" y="114" class="viz-label viz-label--active">плита перекрытия</text>
        <text x="78" y="162" class="viz-label">ваше помещение</text>
        <circle cx="118" cy="62" r="5" class="viz-node"/>
        <path d="M118 70 V124" class="viz-path" marker-end="url(#arrow)"/>
        <path d="M172 110 H188 V166 H118" class="viz-path viz-path--soft" marker-end="url(#arrowSoft)"/>
        <text x="210" y="142" class="viz-label">обход через стену</text>
        ${movingDot('M118 70 V124', '#2F7DFF', '1.8s')}
        ${movingDot('M172 110 H188 V166 H118', '#78B4FF', '3s')}
      `,
    },
    floor: {
      title: 'Пол',
      body: 'Стуки, шаги и техника передают удар через стяжку и перекрытие. Важны покрытие, основание и связь с соседними конструкциями.',
      svg: () => `
        <text x="16" y="22" class="viz-label">ПОЛ · УДАРНАЯ ЭНЕРГИЯ</text>
        <rect x="64" y="58" width="180" height="32" class="viz-zone--muted"/>
        <rect x="64" y="90" width="180" height="38" class="viz-zone"/>
        <rect x="64" y="128" width="180" height="54" class="viz-zone--muted"/>
        <text x="78" y="78" class="viz-label">покрытие</text>
        <text x="78" y="115" class="viz-label viz-label--active">стяжка</text>
        <text x="78" y="158" class="viz-label">основание / перекрытие</text>
        <circle cx="154" cy="74" r="8" class="viz-node viz-node--soft"/>
        <text x="170" y="82" class="viz-label">удар</text>
        <path d="M154 82 V182" class="viz-path" stroke-dasharray="6 4"/>
        <path d="M110 128 H198" class="viz-path viz-path--soft"/>
        ${movingDot('M154 82 V182', '#2F7DFF', '1.8s')}
      `,
    },
    joints: {
      title: 'Примыкания',
      body: 'Даже сильная стена «протекает» звуком в слабом стыке — шве, проходке или углу. Именно такие места часто упускают.',
      svg: () => `
        <text x="16" y="22" class="viz-label">УЗЕЛ ПРИМЫКАНИЯ · СЛАБОЕ ЗВЕНО</text>
        <rect x="64" y="48" width="96" height="100" class="viz-zone--muted"/>
        <rect x="120" y="148" width="124" height="52" class="viz-zone--muted"/>
        <rect x="152" y="132" width="20" height="32" class="viz-zone"/>
        <text x="128" y="124" class="viz-label viz-label--active">стык / шов</text>
        <path d="M72 98 H144" class="viz-path"/>
        <path d="M164 148 V168 H220" class="viz-path viz-path--soft" marker-end="url(#arrowSoft)"/>
        <circle cx="72" cy="98" r="4" class="viz-node"/>
        ${movingDot('M72 98 H144 L164 168 H220', '#2F7DFF', '3s')}
      `,
    },
    engineering: {
      title: 'Инженерные системы',
      body: 'Вентиляция, трубы и шахты часто проводят звук между комнатами — мимо стен, которые кажутся «главной проблемой».',
      svg: () => `
        <text x="16" y="22" class="viz-label">ИНЖЕНЕРНЫЕ КОММУНИКАЦИИ</text>
        <rect x="64" y="54" width="80" height="142" class="viz-zone--muted"/>
        <rect x="196" y="54" width="80" height="142" class="viz-zone--muted"/>
        <rect x="144" y="68" width="52" height="114" fill="none" stroke="#78B4FF" stroke-width="1" stroke-dasharray="6 5"/>
        <text x="156" y="62" class="viz-label viz-label--active">шахта</text>
        <ellipse cx="170" cy="100" rx="18" ry="9" class="viz-zone"/>
        <path d="M170 109 V182" class="viz-path"/>
        <text x="154" y="132" class="viz-label">вентиляция</text>
        <path d="M104 124 H144 L170 146 L196 168" class="viz-path viz-path--soft"/>
        <circle cx="104" cy="124" r="4" class="viz-node"/>
        ${movingDot('M104 124 H144 L170 146 L196 168', '#78B4FF', '2.7s')}
      `,
    },
    acoustics: {
      title: 'Акустика внутри',
      body: 'Эхо, гул и отражения влияют на разборчивость речи и комфорт — даже когда снаружи уже тихо. Это отдельная часть задачи.',
      svg: () => `
        <text x="16" y="22" class="viz-label">АКУСТИКА ПОМЕЩЕНИЯ · ОТРАЖЕНИЯ</text>
        <rect x="64" y="58" width="180" height="132" class="viz-frame"/>
        <path d="M64 190 L244 58" class="viz-line"/>
        <path d="M64 58 H244" class="viz-grid"/>
        <circle cx="100" cy="154" r="8" class="viz-node viz-node--soft"/>
        <text x="82" y="178" class="viz-label">источник</text>
        <circle cx="210" cy="104" r="6" class="viz-node viz-node--soft"/>
        <text x="188" y="92" class="viz-label">микрофон</text>
        <path d="M100 154 L210 104" class="viz-path"/>
        <path d="M100 154 L64 72 H244" class="viz-path viz-path--soft"/>
        <path d="M100 154 L64 190 H244" class="viz-path viz-path--soft" opacity="0.48"/>
        ${movingDot('M100 154 L210 104', '#78B4FF', '1.7s')}
        ${movingDot('M100 154 L64 72 H244', '#2F7DFF', '3.2s')}
      `,
    },
  };

  function initRoomLayers() {
    const container = document.getElementById('room-layers-diagram');
    const titleEl = document.getElementById('system-text-title');
    const bodyEl = document.getElementById('system-text-body');
    const tabs = document.querySelectorAll('.system__tab');
    if (!container || !window.CIAViz) return;

    let svg = null;

    function setZone(zone) {
      const data = ZONE_DATA[zone];
      if (!data) return;

      const arrowDef = `<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2F7DFF"/></marker><marker id="arrowSoft" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#78B4FF"/></marker></defs>`;
      svg = CIAViz.mount(container, '0 0 340 240', arrowDef + data.svg());

      if (titleEl) titleEl.textContent = data.title;
      if (bodyEl) bodyEl.textContent = data.body;

      tabs.forEach((t) => {
        const active = t.dataset.zone === zone;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => setZone(tab.dataset.zone));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setZone(tab.dataset.zone);
        }
      });
    });

    setZone('walls');

    window.CIARoomLayers = { setZone };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoomLayers);
  } else {
    initRoomLayers();
  }
})();
