(function () {
  'use strict';

  function initHeroVisual() {
    const container = document.getElementById('hero-visual');
    if (!container) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.createElement('canvas');
    const pointer = { x: 0.58, y: 0.44, active: false };
    const impulses = [];

    let ctx = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let startedAt = performance.now();

    canvas.className = 'hero-field';

    container.innerHTML = '';
    container.append(canvas);
    ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawGrid(plot) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(120, 180, 255, 0.085)';

      for (let i = 0; i <= 8; i++) {
        const x = plot.x + (plot.w / 8) * i;
        ctx.beginPath();
        ctx.moveTo(x, plot.y);
        ctx.lineTo(x, plot.y + plot.h);
        ctx.stroke();
      }

      for (let i = 0; i <= 4; i++) {
        const y = plot.y + (plot.h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(plot.x, y);
        ctx.lineTo(plot.x + plot.w, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(160, 180, 205, 0.22)';
      ctx.beginPath();
      ctx.moveTo(plot.x, plot.cy);
      ctx.lineTo(plot.x + plot.w, plot.cy);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(120, 180, 255, 0.16)';
      ctx.strokeRect(plot.x, plot.y, plot.w, plot.h);
      ctx.restore();
    }

    function waveformAt(t, elapsed, frequency, amplitude, noise) {
      const attack = Math.min(1, t * 8);
      const hiFreqBlend = Math.max(0, (t - 0.62) / 0.38);
      const carrier =
        Math.sin(t * Math.PI * 2 * frequency + elapsed * 2.4) * 0.72 +
        Math.sin(t * Math.PI * 2 * (frequency * 0.52) - elapsed * 1.4) * 0.32 +
        Math.sin(t * Math.PI * 2 * (frequency * 1.85) + elapsed * 3.2) * 0.16;
      const highFrequency =
        Math.sin(t * Math.PI * 2 * (frequency * 8.5) + elapsed * 8) * 0.16 +
        Math.sin(t * Math.PI * 2 * (frequency * 13) - elapsed * 7.5) * 0.08;

      return (carrier + highFrequency * hiFreqBlend * noise) * amplitude * attack;
    }

    function draw(time) {
      const elapsed = (time - startedAt) / 1000;
      const plot = {
        x: width * 0.08,
        y: height * 0.2,
        w: width * 0.84,
        h: height * 0.56,
      };
      plot.cy = plot.y + plot.h * 0.54;

      const targetAmplitude = (1 - pointer.y) * 0.86 + 0.14;
      const targetFrequency = 1.4 + pointer.x * 9.4;
      const noise = 0.24 + pointer.x * 0.9;
      const playhead = (elapsed * 0.12 + pointer.x * 0.18) % 1;

      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createRadialGradient(width * 0.65, height * 0.5, 10, width * 0.65, height * 0.5, Math.max(width, height) * 0.64);
      bg.addColorStop(0, 'rgba(47, 125, 255, 0.11)');
      bg.addColorStop(0.52, 'rgba(47, 125, 255, 0.028)');
      bg.addColorStop(1, 'rgba(3, 6, 9, 0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      drawGrid(plot);

      ctx.save();
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(120, 180, 255, 0.22)';
      ctx.beginPath();

      const samples = Math.max(220, Math.round(plot.w));
      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        let yNorm = waveformAt(t, elapsed, targetFrequency, targetAmplitude, noise);

        impulses.forEach((impulse) => {
          const age = elapsed - impulse.started;
          const position = impulse.x + age * 0.5;
          const envelope = Math.max(0, 1 - age / 1.4);
          const distance = Math.abs(t - position);
          yNorm += Math.max(0, 1 - distance / 0.085) * Math.sin(distance * 90 - age * 12) * impulse.strength * envelope;
        });

        const x = plot.x + t * plot.w;
        const y = plot.cy - yNorm * (plot.h * 0.42);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.lineWidth = 2.2;
      ctx.strokeStyle = 'rgba(245, 250, 255, 0.92)';
      ctx.shadowBlur = 14;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
      ctx.stroke();

      ctx.lineWidth = 1.1;
      ctx.strokeStyle = 'rgba(120, 180, 255, 0.8)';
      ctx.shadowBlur = 18;
      ctx.shadowColor = 'rgba(47, 125, 255, 0.7)';
      ctx.stroke();
      ctx.restore();

      const playheadX = plot.x + playhead * plot.w;
      ctx.save();
      ctx.strokeStyle = 'rgba(120, 180, 255, 0.34)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 7]);
      ctx.beginPath();
      ctx.moveTo(playheadX, plot.y);
      ctx.lineTo(playheadX, plot.y + plot.h);
      ctx.stroke();
      ctx.restore();

      for (let i = impulses.length - 1; i >= 0; i--) {
        if (elapsed - impulses[i].started > 1.6) impulses.splice(i, 1);
      }

      if (!reduced) {
        raf = requestAnimationFrame(draw);
      }
    }

    function updatePointer(e) {
      pointer.x = Math.min(1, Math.max(0, e.clientX / Math.max(window.innerWidth, 1)));
      pointer.y = Math.min(1, Math.max(0, e.clientY / Math.max(window.innerHeight, 1)));
      pointer.active = true;
    }

    resize();
    draw(performance.now());

    if (!reduced) {
      raf = requestAnimationFrame(draw);
      window.addEventListener('pointermove', updatePointer, { passive: true });
      window.addEventListener('pointerdown', (e) => {
        updatePointer(e);
        impulses.push({ x: pointer.x, started: (performance.now() - startedAt) / 1000, strength: 0.8 + (1 - pointer.y) * 0.8 });
        if (impulses.length > 5) impulses.shift();
      }, { passive: true });
    }

    window.addEventListener('resize', () => {
      resize();
      if (reduced) draw(performance.now());
    });

    document.addEventListener('visibilitychange', () => {
      if (reduced) return;
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        startedAt = performance.now();
        raf = requestAnimationFrame(draw);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroVisual);
  } else {
    initHeroVisual();
  }
})();
