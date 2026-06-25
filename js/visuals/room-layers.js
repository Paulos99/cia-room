(function () {
  'use strict';

  const ZONE_DATA = {
    walls: {
      title: 'Стены',
      body: 'Материал, толщина, розетки, проходки и стыки — сначала определяем свойства существующей стены, затем решаем, что в ней нужно менять.',
      svg: () => `
        <text x="16" y="22" class="viz-label viz-label--title">СТЕНА И ПРИМЫКАНИЯ · ВОЗДУШНЫЙ ШУМ</text>
        ${CIAViz.roomBlock(52, 52, 78, 148, 'помещение A')}
        <rect x="130" y="52" width="48" height="148" class="viz-zone" rx="2"/>
        <text x="154" y="82" class="viz-label viz-label--layer viz-label--active" text-anchor="middle">слой</text>
        <text x="154" y="98" class="viz-label viz-label--layer viz-label--active" text-anchor="middle">стены</text>
        <line x1="142" y1="62" x2="142" y2="190" class="viz-grid"/>
        <line x1="154" y1="62" x2="154" y2="190" class="viz-grid"/>
        <line x1="166" y1="62" x2="166" y2="190" class="viz-grid"/>
        ${CIAViz.roomBlock(178, 52, 78, 148, 'помещение B')}
        <rect x="142" y="118" width="24" height="18" class="viz-callout" rx="1"/>
        <text x="154" y="152" class="viz-label viz-label--active" text-anchor="middle">слабая точка</text>
        <text x="154" y="166" class="viz-label viz-label--caption" text-anchor="middle">розетка / отверстие</text>
        <path d="M70 126 H130" class="viz-path" marker-end="url(#arrow)"/>
        <path d="M178 126 H248" class="viz-path viz-path--soft" marker-end="url(#arrowSoft)"/>
        <circle cx="70" cy="126" r="7" class="viz-node viz-node--soft"/>
        <text x="70" y="108" class="viz-label viz-label--caption" text-anchor="middle">источник</text>
        ${CIAViz.movingDot('M70 126 H130', '#2F7DFF', '1.7s')}
        ${CIAViz.movingDot('M178 126 H248', '#78B4FF', '2.6s', '0.8s')}
        ${CIAViz.pathLegend(228, 196)}
      `,
    },
    ceiling: {
      title: 'Потолок',
      body: 'Шум сверху идёт через перекрытие или обходит его по стенам — проверяем оба маршрута.',
      svg: () => `
        <text x="16" y="22" class="viz-label viz-label--title">ПЕРЕКРЫТИЕ · УДАРНЫЙ И ВОЗДУШНЫЙ ШУМ</text>
        <rect x="72" y="44" width="132" height="44" class="viz-frame" rx="2"/>
        <text x="138" y="70" class="viz-label viz-label--room" text-anchor="middle">верхний этаж</text>
        <rect x="72" y="88" width="132" height="28" class="viz-zone" rx="2"/>
        <text x="138" y="106" class="viz-label viz-label--layer viz-label--active" text-anchor="middle">плита перекрытия</text>
        <rect x="72" y="116" width="132" height="80" class="viz-frame" rx="2"/>
        <text x="138" y="160" class="viz-label viz-label--room" text-anchor="middle">ваше помещение</text>
        <rect x="204" y="44" width="36" height="152" class="viz-zone--muted" rx="2"/>
        <text x="222" y="128" class="viz-label viz-label--caption" text-anchor="middle">стена</text>
        <circle cx="138" cy="58" r="6" class="viz-node"/>
        <text x="138" y="48" class="viz-label viz-label--caption" text-anchor="middle">удар / гул</text>
        ${CIAViz.impactRipples(138, 58)}
        <path d="M138 66 V116" class="viz-path" marker-end="url(#arrow)"/>
        <path d="M204 110 H222 V176 H138" class="viz-path viz-path--soft" marker-end="url(#arrowSoft)"/>
        <text x="248" y="148" class="viz-label viz-label--active">обход через стену</text>
        ${CIAViz.movingDot('M138 66 V116', '#2F7DFF', '1.8s')}
        ${CIAViz.movingDot('M204 110 H222 V176 H138', '#78B4FF', '3s', '0.5s')}
        ${CIAViz.pathLegend(228, 196)}
      `,
    },
    floor: {
      title: 'Пол',
      body: 'Шаги и техника передают удар через стяжку и перекрытие — важны покрытие и развязка.',
      svg: () => `
        <text x="16" y="22" class="viz-label viz-label--title">ПЕРЕКРЫТИЕ И ПОЛ · УДАРНАЯ ЭНЕРГИЯ</text>
        ${CIAViz.layerStack(78, 48, 184, [
          { h: 34, label: 'покрытие', active: false },
          { h: 42, label: 'стяжка', active: true },
          { h: 52, label: 'перекрытие', active: false },
        ])}
        <line x1="78" y1="124" x2="262" y2="124" class="viz-layer-edge"/>
        <circle cx="170" cy="48" r="9" class="viz-node viz-node--soft"/>
        <path d="M170 40 V48" class="viz-path" stroke-width="2.2"/>
        <path d="M164 40 H176" class="viz-path" stroke-width="2.2"/>
        <text x="170" y="36" class="viz-label viz-label--active" text-anchor="middle">удар</text>
        ${CIAViz.impactRipples(170, 48)}
        <path d="M170 57 V182" class="viz-path" stroke-dasharray="5 4"/>
        <path d="M108 124 H232" class="viz-path viz-path--soft"/>
        <text x="170" y="200" class="viz-label viz-label--caption" text-anchor="middle">энергия уходит в перекрытие</text>
        <text x="278" y="68" class="viz-label viz-label--caption">шаги,</text>
        <text x="278" y="80" class="viz-label viz-label--caption">мебель</text>
        ${CIAViz.movingDot('M170 57 V182', '#2F7DFF', '1.8s')}
        ${CIAViz.movingDot('M108 124 H232', '#78B4FF', '2.4s', '0.9s')}
        ${CIAViz.pathLegend(16, 196)}
      `,
    },
    joints: {
      title: 'Примыкания',
      body: 'Один слабый стык или проходка может свести на нет всю звукоизоляцию.',
      svg: () => `
        <text x="16" y="22" class="viz-label viz-label--title">УЗЕЛ ПРИМЫКАНИЯ · СЛАБОЕ ЗВЕНО</text>
        <rect x="56" y="48" width="168" height="56" class="viz-zone--muted" rx="2"/>
        <text x="140" y="80" class="viz-label viz-label--room" text-anchor="middle">стена A</text>
        <rect x="56" y="104" width="56" height="100" class="viz-zone--muted" rx="2"/>
        <text x="84" y="158" class="viz-label viz-label--room" text-anchor="middle">стена B</text>
        <rect x="56" y="104" width="28" height="28" class="viz-callout" rx="1"/>
        <text x="70" y="100" class="viz-label viz-label--active" text-anchor="middle">стык</text>
        <text x="70" y="140" class="viz-label viz-label--caption" text-anchor="middle">шов</text>
        <circle cx="72" cy="76" r="5" class="viz-node"/>
        <text x="72" y="64" class="viz-label viz-label--caption" text-anchor="middle">шум</text>
        <path d="M72 81 H200" class="viz-path"/>
        <path d="M84 104 V168 H236" class="viz-path viz-path--soft" marker-end="url(#arrowSoft)"/>
        <text x="248" y="172" class="viz-label viz-label--active">утечка вниз</text>
        ${CIAViz.movingDot('M72 81 H200', '#2F7DFF', '1.6s')}
        ${CIAViz.movingDot('M84 104 V168 H236', '#78B4FF', '2.4s', '0.7s')}
        ${CIAViz.pathLegend(228, 196)}
      `,
    },
    engineering: {
      title: 'Инженерные системы',
      body: 'Вентиляция, трубы, шахты и оборудование проводят звук и вибрацию между помещениями — иногда бороться нужно с источником, а не с потолком.',
      svg: () => `
        <text x="16" y="22" class="viz-label viz-label--title">ИНЖЕНЕРНЫЕ КОММУНИКАЦИИ</text>
        ${CIAViz.roomBlock(48, 56, 84, 136, 'комната A')}
        ${CIAViz.roomBlock(208, 56, 84, 136, 'комната B')}
        <rect x="132" y="68" width="76" height="112" fill="rgba(47,125,255,0.04)" stroke="#78B4FF" stroke-width="1.2" stroke-dasharray="6 5" rx="2"/>
        <text x="170" y="62" class="viz-label viz-label--active" text-anchor="middle">шахта</text>
        <rect x="158" y="88" width="24" height="72" class="viz-zone" rx="2"/>
        <ellipse cx="170" cy="88" rx="14" ry="7" class="viz-zone"/>
        <path d="M170 95 V160" class="viz-path"/>
        <text x="170" y="178" class="viz-label viz-label--caption" text-anchor="middle">вентиляция</text>
        <circle cx="104" cy="124" r="5" class="viz-node"/>
        <text x="104" y="112" class="viz-label viz-label--caption" text-anchor="middle">источник</text>
        <path d="M109 124 H158" class="viz-path"/>
        <path d="M170 160 V176 H208" class="viz-path viz-path--soft" marker-end="url(#arrowSoft)"/>
        <text x="170" y="196" class="viz-label viz-label--active" text-anchor="middle">звук обходит стены</text>
        ${CIAViz.movingDot('M109 124 H158 V160', '#2F7DFF', '2s')}
        ${CIAViz.movingDot('M170 160 V176 H208', '#78B4FF', '1.8s', '1s')}
        ${CIAViz.pathLegend(16, 196)}
      `,
    },
    acoustics: {
      title: 'Акустика внутри',
      body: 'Эхо и отражения влияют на речь и комфорт — это отдельная задача от звукоизоляции.',
      svg: () => `
        <text x="16" y="22" class="viz-label viz-label--title">ВНУТРЕННЯЯ АКУСТИКА · ОТРАЖЕНИЯ</text>
        <rect x="64" y="48" width="212" height="140" class="viz-frame" rx="2"/>
        <path d="M64 188 L276 48" class="viz-line"/>
        <path d="M64 48 H276" class="viz-grid"/>
        <circle cx="108" cy="148" r="9" class="viz-node viz-node--soft"/>
        <text x="108" y="172" class="viz-label viz-label--active" text-anchor="middle">источник</text>
        <circle cx="232" cy="100" r="7" class="viz-node viz-node--soft"/>
        <text x="232" y="88" class="viz-label" text-anchor="middle">микрофон</text>
        <path d="M108 148 L232 100" class="viz-path" marker-end="url(#arrow)"/>
        <text x="158" y="116" class="viz-label viz-label--active">прямой звук</text>
        <path d="M108 148 L64 64 H276" class="viz-path viz-path--soft"/>
        <path d="M108 148 L64 188 H276" class="viz-path viz-path--soft" opacity="0.5"/>
        <text x="170" y="58" class="viz-label viz-label--caption" text-anchor="middle">ранние отражения</text>
        ${CIAViz.movingDot('M108 148 L232 100', '#2F7DFF', '1.7s')}
        ${CIAViz.movingDot('M108 148 L64 64 H276', '#78B4FF', '3.2s', '0.4s')}
        ${CIAViz.pathLegend(16, 196)}
      `,
    },
  };

  function initRoomLayers() {
    const container = document.getElementById('room-layers-diagram');
    const titleEl = document.getElementById('system-text-title');
    const bodyEl = document.getElementById('system-text-body');
    const tabs = document.querySelectorAll('.system__tab');
    if (!container || !window.CIAViz) return;

    function setZone(zone) {
      const data = ZONE_DATA[zone];
      if (!data) return;

      CIAViz.mount(container, '0 0 340 240', CIAViz.arrowMarkers('arrow') + data.svg());

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
