(function () {
  'use strict';

  function initHeroVisual() {
    const container = document.getElementById('hero-visual');
    if (!container) return;

    if (typeof THREE === 'undefined') {
      container.classList.add('hero-visual--fallback');
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const pointer = { x: 0.5, y: 0.5 };
    const smoothPointer = { x: 0.5, y: 0.5 };
    const cursorPull = { strength: 0, target: 0 };
    const impulse = { strength: 0, age: 0, x: 0, y: 0 };
    const field = { energy: 0.28, chaos: 0, calm: 0.82 };
    const pull = { strength: 0 };
    const disturbance = { chaos: 0, energy: 0 };
    let irritation = 0;
    const clickTimes = [];
    let pressStart = 0;
    let isPressing = false;
    let lastBurstStrength = 0;

    container.innerHTML = '';
    container.classList.add('hero-visual--field');

    const stage = document.createElement('div');
    stage.className = 'hero-visual__stage';
    stage.setAttribute('aria-hidden', 'true');

    const glow = document.createElement('div');
    glow.className = 'hero-visual__glow';
    glow.setAttribute('aria-hidden', 'true');
    stage.append(glow);

    const caption = document.createElement('p');
    caption.className = 'hero-visual__caption';
    caption.textContent = 'Невидимое становится управляемым';
    caption.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 0, 4.05);

    const bleed = 1.95;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.className = 'hero-field';
    stage.append(renderer.domElement);
    container.append(stage, caption);

    const root = new THREE.Group();
    root.scale.setScalar(0.56);
    scene.add(root);

    const shellPoints = 3000;
    const geo = new THREE.BufferGeometry();
    const posArray = new Float32Array(shellPoints * 3);
    const normArray = new Float32Array(shellPoints * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < shellPoints; i++) {
      const y = 1 - (i / (shellPoints - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;

      normArray[i * 3] = x;
      normArray[i * 3 + 1] = y;
      normArray[i * 3 + 2] = z;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(normArray, 3));
    const wireDetail = isMobile ? 2 : 3;
    const wireGeo = new THREE.IcosahedronGeometry(1.15, wireDetail);

    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uEnergy: { value: 0.28 },
      uChaos: { value: 0 },
      uImpulse: { value: new THREE.Vector3(0, 0, 0) },
      uPull: { value: new THREE.Vector3(0, 0, 0) },
      uCalm: { value: 0.82 },
      uIrritation: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    };

    const fieldMaterial = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      vertexShader: `
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uEnergy;
        uniform float uChaos;
        uniform vec3 uImpulse;
        uniform vec3 uPull;
        uniform float uIrritation;
        uniform float uPixelRatio;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vDisp;
        varying float vHeat;

        float wave(vec3 p, float t, float chaos) {
          float calm =
            sin(p.x * 1.9 + t * 0.62) * cos(p.y * 1.8 - t * 0.52) * 0.12 +
            sin(length(p.xy) * 3.2 - t * 1.15) * 0.1 +
            sin(p.z * 2.3 + t * 0.48) * cos(p.x * 2.0 - t * 0.41) * 0.075;
          float wild =
            sin(p.x * 9.2 + t * 4.6) * sin(p.y * 10.8 - t * 4.1) * 0.062 +
            sin(p.z * 11.6 + t * 5.4) * 0.046 +
            abs(sin(p.x * 15.0 + t * 8.2)) * abs(sin(p.z * 14.0 - t * 7.4)) * 0.038 * chaos;
          float blend = chaos * chaos * (3.0 - 2.0 * chaos);
          return calm * (1.0 - blend) + wild * blend * (1.0 + chaos * 0.45);
        }

        void main() {
          vec3 pos = position;
          vec3 n = normalize(normal);
          vec2 ptr = uPointer * 2.0 - 1.0;
          float controlZone = exp(-length(pos.xy - ptr * 1.25) * 2.4) * uPull.z;
          float effectiveChaos = (uChaos + uIrritation * 0.72) * (1.0 - controlZone * 0.82);

          float disp = wave(pos, uTime, effectiveChaos);
          disp += wave(pos * 1.35 + vec3(0.3, 0.7, 0.2), uTime * 0.9, effectiveChaos * 0.55) * 0.45;
          disp += abs(sin(pos.x * 12.0 + uTime * 5.5)) * abs(sin(pos.z * 11.0 - uTime * 4.8)) * (effectiveChaos * 0.055 + uIrritation * 0.09);
          disp += abs(sin(pos.x * 18.0 + uTime * 7.0)) * uIrritation * 0.042;

          if (uImpulse.z > 0.01) {
            float iDist = length(pos.xy - uImpulse.xy);
            float ripple = sin(iDist * 16.0 - uImpulse.z * 9.5);
            disp += ripple * ripple * exp(-iDist * 1.9) * uImpulse.z * 0.22;
          }

          if (uPull.z > 0.001) {
            float pDist = length(pos.xy - uPull.xy);
            float grab = exp(-pDist * 2.6) * uPull.z;
            disp += grab * 0.22;
            disp *= 1.0 - controlZone * 0.18;
          }

          disp = clamp(disp, -0.17 - effectiveChaos * 0.06 - uIrritation * 0.08, 0.19 + effectiveChaos * 0.09 + uIrritation * 0.14);

          pos += n * disp;

          vDisp = disp;
          vHeat = clamp(abs(disp) * 4.2 + effectiveChaos * 0.62 + uEnergy * 0.22 + uIrritation * 0.35 - controlZone * 0.42, 0.0, 1.0);
          vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          vNormal = normalize(normalMatrix * n);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          float crest = pow(smoothstep(0.0, 0.16, abs(disp)), 0.62);
          float pointScale = 0.9 + crest * 0.5 + vHeat * 0.4 + uEnergy * 0.2;
          gl_PointSize = clamp(pointScale * uPixelRatio * (24.0 / -mvPosition.z), 1.0, 4.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vDisp;
        varying float vHeat;
        uniform float uTime;
        uniform float uEnergy;
        uniform float uChaos;
        uniform float uCalm;
        uniform float uIrritation;

        vec3 thermal(float t) {
          vec3 coldDeep = vec3(0.03, 0.14, 0.42);
          vec3 coldMid = vec3(0.10, 0.38, 0.92);
          vec3 cool = vec3(0.42, 0.78, 1.0);
          vec3 warm = vec3(0.98, 0.62, 0.14);
          vec3 hot = vec3(0.92, 0.16, 0.10);

          if (t < 0.28) return mix(coldDeep, coldMid, t / 0.28);
          if (t < 0.55) return mix(coldMid, cool, (t - 0.28) / 0.27);
          if (t < 0.78) return mix(cool, warm, (t - 0.55) / 0.23);
          return mix(warm, hot, (t - 0.78) / 0.22);
        }

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float facing = dot(normalize(vNormal), viewDir);
          if (facing < 0.0) discard;

          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;

          float crest = pow(smoothstep(0.0, 0.16, abs(vDisp)), 0.62);
          float heat = clamp(vHeat + crest * 0.38 + uChaos * 0.24 + uIrritation * 0.32 - uCalm * 0.38, 0.0, 1.0);
          heat *= 0.94 + sin(uTime * 0.55 + vWorldPos.x * 3.0 + vWorldPos.y * 2.2) * 0.06;

          vec3 col = thermal(heat);
          float alpha = 0.8 + heat * 0.2;
          float circle = smoothstep(0.5, 0.4, d);

          // Плавное исчезновение на краях сферы (френель)
          float edgeFade = smoothstep(0.0, 0.15, facing);

          gl_FragColor = vec4(col, alpha * circle * edgeFade);
        }
      `,
    });

    const fieldMesh = new THREE.Points(geo, fieldMaterial);
    root.add(fieldMesh);

    const wirePivot = new THREE.Group();
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x9ec8ff,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    wirePivot.add(wireMesh);
    root.add(wirePivot);

    scene.add(new THREE.AmbientLight(0x1a2840, 0.55));
    const keyLight = new THREE.PointLight(0x78b4ff, 1.6, 12);
    keyLight.position.set(2, 1.5, 3);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x2f7dff, 0.9, 10);
    fillLight.position.set(-2, -1, 2);
    scene.add(fillLight);

    let width = 0;
    let height = 0;
    let raf = 0;
    let startedAt = performance.now();
    let lastTime = startedAt;

    function resize() {
      const rect = container.getBoundingClientRect();
      const layoutW = Math.max(1, rect.width);
      const layoutH = Math.max(1, rect.height);
      width = layoutW * bleed;
      height = layoutH * bleed;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(Math.round(width * renderer.getPixelRatio()), Math.round(height * renderer.getPixelRatio()), false);
      renderer.domElement.style.width = `${width}px`;
      renderer.domElement.style.height = `${height}px`;
      uniforms.uPixelRatio.value = renderer.getPixelRatio();
    }

    function smoothField(dt, targetEnergy, targetChaos, targetCalm) {
      const returning = targetChaos < 0.06;
      const fieldEase = returning ? 1 - Math.pow(0.00015, dt) : 1 - Math.pow(0.008, dt);
      const calmEase = returning ? 1 - Math.pow(0.00008, dt) : 1 - Math.pow(0.004, dt);
      field.energy += (targetEnergy - field.energy) * fieldEase;
      field.chaos += (targetChaos - field.chaos) * fieldEase;
      field.calm += (targetCalm - field.calm) * calmEase;
    }

    function strengthFromPress(ms) {
      const t = Math.min(Math.max(ms, 0), 1100) / 1100;
      return 0.16 + Math.pow(t, 0.9) * 0.84;
    }

    function registerClickAgitation() {
      const now = performance.now();
      clickTimes.push(now);
      while (clickTimes.length && now - clickTimes[0] > 2400) clickTimes.shift();

      const recent = clickTimes.filter((t) => now - t < 900).length;
      const burst = Math.min(0.55, Math.max(0, recent - 1) * 0.13);
      irritation = Math.min(1, irritation + 0.08 + burst);
      return burst;
    }

    function draw(time) {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;
      const elapsed = (time - startedAt) / 1000;

      irritation *= Math.exp(-dt * 0.95);

      const decay = Math.exp(-dt * 6.2);
      disturbance.chaos *= decay;
      disturbance.energy *= decay;
      pull.strength *= Math.exp(-dt * 7.5);

      if (isPressing) {
        const hold = (performance.now() - pressStart) / 1000;
        const holdHint = Math.min(hold / 0.9, 1) * 0.08;
        disturbance.chaos = Math.min(0.35, disturbance.chaos + holdHint * dt * 2.5);
      }

      const idleFlow =
        0.26 +
        Math.sin(elapsed * 0.72) * 0.045 +
        Math.sin(elapsed * 1.15 + 1.4) * 0.03 +
        Math.cos(elapsed * 0.38 + 0.6) * 0.02;

      const targetEnergy = idleFlow + disturbance.energy * 0.55 + irritation * 0.18;
      const targetChaos = Math.min(1, disturbance.chaos + irritation * 0.72);
      const targetCalm = 0.74 + (1 - targetChaos) * 0.22 - irritation * 0.08;
      smoothField(dt, targetEnergy, targetChaos, targetCalm);

      const energy = field.energy;
      const chaos = field.chaos;
      const calm = field.calm;

      const ptrEase = 1 - Math.pow(0.1, dt);
      smoothPointer.x += (pointer.x - smoothPointer.x) * ptrEase;
      smoothPointer.y += (pointer.y - smoothPointer.y) * ptrEase;
      cursorPull.strength += (cursorPull.target - cursorPull.strength) * ptrEase;

      const leanX = (smoothPointer.x - 0.5) * 0.22 * cursorPull.strength;
      const leanY = (0.5 - smoothPointer.y) * 0.16 * cursorPull.strength;
      root.position.x += (leanX - root.position.x) * ptrEase;
      root.position.y += (leanY - root.position.y) * ptrEase;

      uniforms.uTime.value = elapsed;
      uniforms.uEnergy.value = energy;
      uniforms.uChaos.value = chaos;
      uniforms.uCalm.value = calm;
      uniforms.uIrritation.value = irritation;
      uniforms.uPointer.value.set(smoothPointer.x, smoothPointer.y);
      uniforms.uPull.value.set((smoothPointer.x - 0.5) * 2.0, (0.5 - smoothPointer.y) * 2.0, pull.strength);

      if (impulse.strength > 0.01) {
        impulse.age += dt;
        const impulseDecay = Math.pow(0.04 + lastBurstStrength * 0.12, dt);
        impulse.strength *= impulseDecay;
        uniforms.uImpulse.value.set(impulse.x, impulse.y, impulse.strength);
      } else {
        uniforms.uImpulse.value.z = 0;
      }

      root.rotation.y += 0.00055 + Math.sin(elapsed * 0.22) * 0.00015;
      root.rotation.x = Math.sin(elapsed * 0.31) * 0.055;

      if (!reduced) {
        wirePivot.rotation.y -= 0.0016;
      }

      wireMat.color.copy(new THREE.Color(0x9ec8ff)).lerp(new THREE.Color(0xffaa66), chaos * 0.35 + irritation * 0.25);
      wireMat.opacity = 0.22 + energy * 0.04 + chaos * 0.05 + irritation * 0.06;

      const lightEase = 1 - Math.pow(0.02, dt);
      const lightOrbit = elapsed * 0.35;
      const targetLightX = 1.5 + Math.sin(lightOrbit) * 0.4;
      const targetLightY = 0.8 + Math.cos(lightOrbit * 0.8) * 0.3;
      keyLight.position.x += (targetLightX - keyLight.position.x) * lightEase;
      keyLight.position.y += (targetLightY - keyLight.position.y) * lightEase;
      keyLight.color.copy(new THREE.Color(0x78b4ff)).lerp(new THREE.Color(0xff8844), chaos * 0.5);
      fillLight.intensity += (0.58 + chaos * 0.5 - fillLight.intensity) * lightEase;

      const glowWarm = chaos * 0.65;
      glow.style.opacity = String(0.2 + energy * 0.16 + pull.strength * 0.08);
      glow.style.background = `radial-gradient(circle, rgba(${Math.round(47 + glowWarm * 180)}, ${Math.round(125 - glowWarm * 55)}, ${Math.round(255 - glowWarm * 210)}, ${0.14 + chaos * 0.08}) 0%, transparent 70%)`;

      const captionWarm = Math.min(1, chaos * 0.85 + energy * 0.25);
      caption.style.color = `rgba(${Math.round(168 + captionWarm * 80)}, ${Math.round(210 - captionWarm * 60)}, 255, ${0.88 + calm * 0.08})`;

      renderer.render(scene, camera);

      if (!reduced) raf = requestAnimationFrame(draw);
    }

    function updatePointerFromEvent(e) {
      const w = Math.max(window.innerWidth, 1);
      const h = Math.max(window.innerHeight, 1);
      pointer.x = e.clientX / w;
      pointer.y = e.clientY / h;
    }

    function onPointerMove(e) {
      updatePointerFromEvent(e);
      cursorPull.target = 1;
    }

    function onPointerLeaveDocument() {
      cursorPull.target = 0;
    }

    function applyDisturbance(strength) {
      const agitation = registerClickAgitation();
      const combined = Math.min(1, strength + agitation * 0.65);

      lastBurstStrength = combined;
      impulse.x = (pointer.x - 0.5) * 2.2;
      impulse.y = (0.5 - pointer.y) * 2.2;
      impulse.strength = 0.18 + combined * 0.62;
      impulse.age = 0;
      disturbance.chaos = Math.min(1, disturbance.chaos + combined * 0.95);
      disturbance.energy = Math.min(1, disturbance.energy + combined * 0.6);
      pull.strength = combined * 0.9;
      container.classList.add('is-measuring');
      window.setTimeout(() => container.classList.remove('is-measuring'), 280 + combined * 220);
    }

    function onPressStart(e) {
      updatePointerFromEvent(e);
      pressStart = performance.now();
      isPressing = true;
    }

    function onPressEnd() {
      if (!isPressing) return;
      isPressing = false;
      const duration = performance.now() - pressStart;
      applyDisturbance(strengthFromPress(duration));
    }

    resize();

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          resize();
          if (reduced) draw(performance.now());
        })
      : null;
    if (ro) ro.observe(container);

    lastTime = performance.now();
    startedAt = lastTime;

    if (!reduced) {
      requestAnimationFrame(() => {
        resize();
        raf = requestAnimationFrame(draw);
      });
      window.addEventListener('pointerdown', onPressStart, { passive: true });
      window.addEventListener('pointerup', onPressEnd, { passive: true });
      window.addEventListener('pointercancel', onPressEnd, { passive: true });
      if (!isMobile) {
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onPointerLeaveDocument, { passive: true });
      }
    } else {
      draw(performance.now());
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
        lastTime = performance.now();
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
