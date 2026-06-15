(function () {
  'use strict';

  const ZONE_DATA = {
    walls: {
      title: 'Стены',
      body: 'Материал, толщина, пустоты, розетки, сопряжения и соседние конструкции влияют на фактическую звукоизоляцию.',
    },
    ceiling: {
      title: 'Потолок',
      body: 'Ударный и воздушный шум может передаваться напрямую через перекрытие и обходными путями через стены и узлы.',
    },
    floor: {
      title: 'Пол',
      body: 'Стяжка, покрытие, основание и связь с соседними конструкциями определяют распространение ударной энергии.',
    },
    joints: {
      title: 'Примыкания',
      body: 'Даже сильная конструкция теряет эффективность в слабом узле. Особое внимание требуется стыкам, швам и проходкам.',
    },
    engineering: {
      title: 'Инженерные системы',
      body: 'Вентиляция, трубы, шахты и оборудование могут проводить и излучать шум между помещениями.',
    },
    acoustics: {
      title: 'Акустика внутри',
      body: 'Отражения, реверберация и геометрия влияют на разборчивость речи, звучание музыки и общий комфорт.',
    },
  };

  function initRoomLayers() {
    const container = document.getElementById('room-layers-diagram');
    const titleEl = document.getElementById('system-text-title');
    const bodyEl = document.getElementById('system-text-body');
    const tabs = document.querySelectorAll('.system__tab');
    if (!container) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 400 300');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.innerHTML = `
      <rect x="40" y="40" width="320" height="220" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <rect id="layer-walls" class="room-layer" x="40" y="40" width="320" height="220" fill="rgba(47,125,255,0.08)" stroke="#2F7DFF" stroke-width="1.5" opacity="1"/>
      <rect id="layer-ceiling" class="room-layer" x="40" y="40" width="320" height="30" fill="rgba(120,180,255,0.15)" stroke="#78B4FF" stroke-width="1" opacity="0.2"/>
      <rect id="layer-floor" class="room-layer" x="40" y="230" width="320" height="30" fill="rgba(120,180,255,0.15)" stroke="#78B4FF" stroke-width="1" opacity="0.2"/>
      <path id="layer-joints" class="room-layer" d="M40 40 L80 40 L80 80 L40 80 Z" fill="rgba(47,125,255,0.2)" stroke="#2F7DFF" stroke-width="1" opacity="0.2"/>
      <line id="layer-engineering" class="room-layer" x1="200" y1="40" x2="200" y2="260" stroke="#78B4FF" stroke-width="2" stroke-dasharray="4 4" opacity="0.2"/>
      <circle id="layer-acoustics" class="room-layer" cx="200" cy="150" r="60" fill="none" stroke="#2F7DFF" stroke-width="1" stroke-dasharray="2 6" opacity="0.2"/>
      <circle cx="120" cy="100" r="4" fill="#2F7DFF"/>
      <circle cx="280" cy="180" r="4" fill="#2F7DFF"/>
      <path d="M120 100 Q200 80 280 180" fill="none" stroke="rgba(120,180,255,0.4)" stroke-width="1"/>
      <text x="50" y="30" fill="#607080" font-family="IBM Plex Mono, monospace" font-size="10">PLAN / A-01</text>
    `;
    container.appendChild(svg);

    const layerMap = {
      walls: ['layer-walls'],
      ceiling: ['layer-ceiling'],
      floor: ['layer-floor'],
      joints: ['layer-joints'],
      engineering: ['layer-engineering'],
      acoustics: ['layer-acoustics'],
    };

    function setZone(zone) {
      Object.keys(layerMap).forEach((key) => {
        layerMap[key].forEach((id) => {
          const el = svg.getElementById(id);
          if (el) el.setAttribute('opacity', key === zone ? '1' : '0.15');
        });
      });
      const data = ZONE_DATA[zone];
      if (data && titleEl && bodyEl) {
        titleEl.textContent = data.title;
        bodyEl.textContent = data.body;
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        setZone(tab.dataset.zone);
      });
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tab.click();
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
