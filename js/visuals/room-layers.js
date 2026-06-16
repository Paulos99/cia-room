(function () {
  'use strict';

  const ZONE_DATA = {
    walls: {
      title: 'Стены',
      body: 'Материал, толщина, пустоты, розетки, сопряжения и соседние конструкции влияют на фактическую звукоизоляцию.',
      svg: `
        <text x="16" y="22" class="viz-label">РАЗРЕЗ СТЕНЫ · ВОЗДУШНЫЙ ШУМ</text>
        <rect x="40" y="50" width="280" height="180" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)"/>
        <text x="55" y="75" class="viz-label">помещение A</text>
        <text x="230" y="75" class="viz-label">помещение B</text>
        <rect x="130" y="60" width="100" height="160" fill="rgba(47,125,255,0.06)" stroke="#2F7DFF" stroke-width="1.5"/>
        <line x1="145" y1="70" x2="145" y2="210" stroke="rgba(120,180,255,0.3)" stroke-width="1" stroke-dasharray="4 3"/>
        <line x1="165" y1="70" x2="165" y2="210" stroke="rgba(120,180,255,0.2)" stroke-width="1" stroke-dasharray="4 3"/>
        <line x1="185" y1="70" x2="185" y2="210" stroke="rgba(120,180,255,0.2)" stroke-width="1" stroke-dasharray="4 3"/>
        <rect x="168" y="130" width="24" height="16" fill="none" stroke="#78B4FF" stroke-width="1"/>
        <text x="155" y="155" class="viz-label">розетка</text>
        <path d="M70 120 L130 120" stroke="#2F7DFF" stroke-width="1.5" marker-end="url(#arrow)"/>
        <path d="M230 120 L170 120" stroke="#78B4FF" stroke-width="1" stroke-dasharray="4 3" opacity="0.6"/>
        <circle cx="70" cy="120" r="6" fill="rgba(47,125,255,0.2)" stroke="#2F7DFF"/>
        ${CIAViz.reduced() ? '' : '<circle r="3" fill="#2F7DFF"><animateMotion path="M70 120 L130 120" dur="2s" repeatCount="indefinite"/></circle>'}
      `,
    },
    ceiling: {
      title: 'Потолок',
      body: 'Ударный и воздушный шум может передаваться напрямую через перекрытие и обходными путями через стены и узлы.',
      svg: `
        <text x="16" y="22" class="viz-label">ПЕРЕКРЫТИЕ · УДАРНЫЙ И ВОЗДУШНЫЙ ШУМ</text>
        <rect x="50" y="80" width="260" height="40" fill="rgba(47,125,255,0.1)" stroke="#2F7DFF" stroke-width="1.5"/>
        <text x="60" y="105" class="viz-label">плита перекрытия</text>
        <rect x="50" y="40" width="120" height="40" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)"/>
        <text x="60" y="65" class="viz-label">верхний этаж</text>
        <rect x="50" y="120" width="120" height="50" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)"/>
        <text x="60" y="150" class="viz-label">ваше помещение</text>
        <path d="M110 75 L110 85" stroke="#2F7DFF" stroke-width="2"/>
        <path d="M105 70 L110 85 L115 70" fill="none" stroke="#2F7DFF" stroke-width="1.5"/>
        <path d="M200 80 L260 80 L260 140 L200 140" fill="none" stroke="#78B4FF" stroke-width="1" stroke-dasharray="5 3"/>
        <text x="210" y="165" class="viz-label">обход через стену</text>
        ${CIAViz.reduced() ? '' : '<circle r="3" fill="#2F7DFF"><animateMotion path="M110 70 L110 120" dur="1.5s" repeatCount="indefinite"/></circle><circle r="3" fill="#78B4FF"><animateMotion path="M200 80 L260 80 L260 140" dur="2.5s" repeatCount="indefinite"/></circle>'}
      `,
    },
    floor: {
      title: 'Пол',
      body: 'Стяжка, покрытие, основание и связь с соседними конструкциями определяют распространение ударной энергии.',
      svg: `
        <text x="16" y="22" class="viz-label">ПОЛ · УДАРНАЯ ЭНЕРГИЯ</text>
        <rect x="60" y="50" width="240" height="30" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)"/>
        <text x="70" y="70" class="viz-label">покрытие</text>
        <rect x="60" y="80" width="240" height="35" fill="rgba(47,125,255,0.08)" stroke="#2F7DFF" stroke-width="1"/>
        <text x="70" y="102" class="viz-label">стяжка</text>
        <rect x="60" y="115" width="240" height="50" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)"/>
        <text x="70" y="145" class="viz-label">основание / перекрытие</text>
        <circle cx="180" cy="65" r="8" fill="rgba(47,125,255,0.15)" stroke="#2F7DFF"/>
        <path d="M180 73 L180 115" stroke="#2F7DFF" stroke-width="2" stroke-dasharray="4 2"/>
        <path d="M180 115 L180 165" stroke="#78B4FF" stroke-width="1.5"/>
        <text x="195" y="90" class="viz-label">удар</text>
        ${CIAViz.reduced() ? '' : '<circle r="3" fill="#2F7DFF"><animateMotion path="M180 73 L180 165" dur="1.8s" repeatCount="indefinite"/></circle>'}
      `,
    },
    joints: {
      title: 'Примыкания',
      body: 'Даже сильная конструкция теряет эффективность в слабом узле. Особое внимание требуется стыкам, швам и проходкам.',
      svg: `
        <text x="16" y="22" class="viz-label">УЗЕЛ ПРИМЫКАНИЯ · СЛАБОЕ ЗВЕНО</text>
        <rect x="80" y="60" width="100" height="140" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)"/>
        <rect x="180" y="100" width="100" height="100" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)"/>
        <path d="M180 100 L180 200" stroke="#2F7DFF" stroke-width="2.5"/>
        <rect x="172" y="130" width="16" height="40" fill="rgba(47,125,255,0.15)" stroke="#78B4FF" stroke-width="1"/>
        <text x="155" y="125" class="viz-label viz-label--active">стык</text>
        <path d="M60 120 L172 140" stroke="#2F7DFF" stroke-width="1.5" opacity="0.8"/>
        <path d="M172 140 L280 160" stroke="#78B4FF" stroke-width="1" stroke-dasharray="4 3" opacity="0.7"/>
        ${CIAViz.reduced() ? '' : '<circle r="3" fill="#2F7DFF"><animateMotion path="M60 120 L172 140 L280 160" dur="3s" repeatCount="indefinite"/></circle>'}
      `,
    },
    engineering: {
      title: 'Инженерные системы',
      body: 'Вентиляция, трубы, шахты и оборудование могут проводить и излучать шум между помещениями.',
      svg: `
        <text x="16" y="22" class="viz-label">ИНЖЕНЕРНЫЕ КОММУНИКАЦИИ</text>
        <rect x="50" y="50" width="100" height="150" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)"/>
        <rect x="200" y="50" width="100" height="150" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)"/>
        <rect x="150" y="70" width="50" height="110" fill="none" stroke="#78B4FF" stroke-width="1" stroke-dasharray="5 3"/>
        <text x="158" y="65" class="viz-label">шахта</text>
        <ellipse cx="175" cy="100" rx="18" ry="10" fill="none" stroke="#2F7DFF" stroke-width="1.5"/>
        <text x="155" y="130" class="viz-label">вентиляция</text>
        <line x1="175" y1="110" x2="175" y2="180" stroke="#2F7DFF" stroke-width="2"/>
        <path d="M100 120 L150 120 L175 140 L200 160" fill="none" stroke="#78B4FF" stroke-width="1.5"/>
        ${CIAViz.reduced() ? '' : '<circle r="3" fill="#2F7DFF"><animateMotion path="M100 120 L150 120 L175 140 L200 160" dur="2.5s" repeatCount="indefinite"/></circle>'}
      `,
    },
    acoustics: {
      title: 'Акустика внутри',
      body: 'Отражения, реверберация и геометрия влияют на разборчивость речи, звучание музыки и общий комфорт.',
      svg: `
        <text x="16" y="22" class="viz-label">АКУСТИКА ПОМЕЩЕНИЯ · ОТРАЖЕНИЯ</text>
        <rect x="70" y="55" width="210" height="140" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)"/>
        <circle cx="110" cy="160" r="8" fill="rgba(47,125,255,0.2)" stroke="#2F7DFF"/>
        <text x="95" y="185" class="viz-label">источник</text>
        <circle cx="220" cy="100" r="6" fill="rgba(120,180,255,0.15)" stroke="#78B4FF"/>
        <text x="200" y="90" class="viz-label">микрофон</text>
        <path d="M110 160 L70 80" stroke="#2F7DFF" stroke-width="1" opacity="0.5"/>
        <path d="M110 160 L280 80" stroke="#2F7DFF" stroke-width="1" opacity="0.5"/>
        <path d="M110 160 L70 195" stroke="#78B4FF" stroke-width="1" opacity="0.4"/>
        <path d="M110 160 L220 100" stroke="#78B4FF" stroke-width="1.5" opacity="0.7"/>
        <path d="M70 80 L280 80 L280 195 L70 195 Z" fill="none" stroke="rgba(47,125,255,0.2)" stroke-dasharray="3 5"/>
        ${CIAViz.reduced() ? '' : '<circle r="2.5" fill="#78B4FF"><animateMotion path="M110 160 L220 100" dur="1.5s" repeatCount="indefinite"/></circle><circle r="2.5" fill="#2F7DFF"><animateMotion path="M110 160 L70 80 L280 80" dur="3s" repeatCount="indefinite"/></circle>'}
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

      const arrowDef = `<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2F7DFF"/></marker></defs>`;
      svg = CIAViz.mount(container, '0 0 340 240', arrowDef + data.svg);

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoomLayers);
  } else {
    initRoomLayers();
  }
})();
