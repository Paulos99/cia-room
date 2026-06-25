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
    const wireOpacityBase = isMobile ? 0.3 : 0.26;
    const wireOpacityAnimBase = isMobile ? 0.26 : 0.22;

    function makeFieldDotTexture() {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, 'rgba(90, 165, 255, 0.82)');
      gradient.addColorStop(0.32, 'rgba(55, 130, 235, 0.62)');
      gradient.addColorStop(0.68, 'rgba(35, 100, 210, 0.22)');
      gradient.addColorStop(1, 'rgba(20, 80, 190, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    function thermalColor(heat, light, pos, time) {
      const t = Math.max(0, Math.min(1, heat));
      const pearlA = Math.sin(pos.x * 5.2 + pos.y * 3.8 + time * 0.55) * 0.5 + 0.5;
      const pearlB = Math.sin(pos.z * 4.6 - pos.x * 3.4 + time * 0.42) * 0.5 + 0.5;

      const coldDeep = light ? [0.1, 0.42, 0.96] : [0.04, 0.24, 0.78];
      const coldMid = light ? [0.16, 0.56, 1.0] : [0.08, 0.4, 0.92];
      const cool = light ? [0.24, 0.68, 1.0] : [0.14, 0.52, 0.96];
      const cyan = [0.12, 0.76, 0.98];
      const violet = [0.36, 0.42, 0.98];

      let rgb;
      if (t < 0.28) {
        const k = t / 0.28;
        rgb = coldDeep.map((v, i) => v + (coldMid[i] - v) * k);
      } else if (t < 0.55) {
        const k = (t - 0.28) / 0.27;
        rgb = coldMid.map((v, i) => v + (cool[i] - v) * k);
      } else {
        rgb = cool.slice();
      }

      rgb = rgb.map((v, i) => v + (cyan[i] - v) * pearlA * 0.22);
      rgb = rgb.map((v, i) => v + (violet[i] - v) * pearlB * 0.16);

      const lum = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114;
      const sat = 1.34;
      return rgb.map((v) => lum + (v - lum) * sat);
    }

    function waveField(p, t, energy, chaos, irritation, impulseVec, pullVec, pullStrength, ptr) {
      const px = p.x;
      const py = p.y;
      const pz = p.z;
      const ptrX = ptr.x * 2 - 1;
      const ptrY = ptr.y * 2 - 1;
      const controlZone = Math.exp(-Math.hypot(px - ptrX * 1.25, py - ptrY * 1.25) * 2.4) * pullStrength;
      const effectiveChaos = (chaos + irritation * 0.72) * (1 - controlZone * 0.82);

      const wave = (x, y, z, time, c) => {
        const calm =
          Math.sin(x * 1.9 + time * 0.62) * Math.cos(y * 1.8 - time * 0.52) * 0.12 +
          Math.sin(Math.hypot(x, y) * 3.2 - time * 1.15) * 0.1 +
          Math.sin(z * 2.3 + time * 0.48) * Math.cos(x * 2.0 - time * 0.41) * 0.075;
        const wild =
          Math.sin(x * 9.2 + time * 4.6) * Math.sin(y * 10.8 - time * 4.1) * 0.062 +
          Math.sin(z * 11.6 + time * 5.4) * 0.046 +
          Math.abs(Math.sin(x * 15.0 + time * 8.2)) * Math.abs(Math.sin(z * 14.0 - time * 7.4)) * 0.038 * c;
        const blend = c * c * (3 - 2 * c);
        return calm * (1 - blend) + wild * blend * (1 + c * 0.45);
      };

      let disp = wave(px, py, pz, t, effectiveChaos);
      disp += wave(px * 1.35 + 0.3, py * 1.35 + 0.7, pz * 1.35 + 0.2, t * 0.9, effectiveChaos * 0.55) * 0.45;
      disp += Math.abs(Math.sin(px * 12.0 + t * 5.5)) * Math.abs(Math.sin(pz * 11.0 - t * 4.8)) * (effectiveChaos * 0.055 + irritation * 0.09);
      disp += Math.abs(Math.sin(px * 18.0 + t * 7.0)) * irritation * 0.042;

      if (impulseVec.z > 0.01) {
        const iDist = Math.hypot(px - impulseVec.x, py - impulseVec.y);
        const ripple = Math.sin(iDist * 16.0 - impulseVec.z * 9.5);
        disp += ripple * ripple * Math.exp(-iDist * 1.9) * impulseVec.z * 0.22;
      }

      if (pullStrength > 0.001) {
        const pDist = Math.hypot(px - pullVec.x, py - pullVec.y);
        disp += Math.exp(-pDist * 2.6) * pullStrength * 0.22;
        disp *= 1 - controlZone * 0.18;
      }

      disp = Math.max(
        -0.17 - effectiveChaos * 0.06 - irritation * 0.08,
        Math.min(0.19 + effectiveChaos * 0.09 + irritation * 0.14, disp),
      );

      const heat = Math.max(
        0,
        Math.min(
          1,
          Math.abs(disp) * 4.2 + effectiveChaos * 0.62 + energy * 0.35 + irritation * 0.35 - controlZone * 0.42,
        ),
      );

      return { disp, heat };
    }
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

    function isLightTheme() {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }

    function updateCaptionColor(captionWarm, calm) {
      if (isLightTheme()) {
        caption.style.removeProperty('color');
        return;
      }

      caption.style.color = `rgba(${Math.round(168 + captionWarm * 80)}, ${Math.round(210 - captionWarm * 60)}, 255, ${0.88 + calm * 0.08})`;
    }

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
      preserveDrawingBuffer: true,
    });
    renderer.debug.checkShaderErrors = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.sortObjects = true;
    renderer.domElement.className = 'hero-field';
    stage.append(renderer.domElement);
    container.append(stage, caption);

    const root = new THREE.Group();
    root.scale.setScalar(0.56);
    scene.add(root);

    const shellPoints = isMobile ? 3200 : 5500;
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
    const basePos = new Float32Array(posArray);
    const colorArray = new Float32Array(shellPoints * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const wireDetail = isMobile ? 2 : 3;
    const fieldScale = 0.75;
    const wireRadius = 1.15 * 0.85;
    const wireGeo = new THREE.IcosahedronGeometry(wireRadius, wireDetail);

    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uEnergy: { value: 0.28 },
      uChaos: { value: 0 },
      uImpulse: { value: new THREE.Vector3(0, 0, 0) },
      uPull: { value: new THREE.Vector3(0, 0, 0) },
      uCalm: { value: 0.82 },
      uIrritation: { value: 0 },
      uLight: { value: isLightTheme() ? 1 : 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    };

    const waveGlsl = `
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
    `;

    const coreGeo = new THREE.SphereGeometry(0.9, isMobile ? 40 : 56, isMobile ? 32 : 44);
    const coreMat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
      side: THREE.FrontSide,
      blending: THREE.NormalBlending,
      vertexShader: `
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uEnergy;
        uniform float uChaos;
        uniform vec3 uImpulse;
        uniform vec3 uPull;
        uniform float uIrritation;
        varying float vHeat;
        varying vec3 vNormalView;
        varying vec3 vWorldPos;
        ${waveGlsl}

        void main() {
          vec3 dir = normalize(position);
          vec3 n = normalize(normal);
          vec2 ptr = uPointer * 2.0 - 1.0;
          float controlZone = exp(-length(dir.xy - ptr * 1.25) * 2.4) * uPull.z;
          float effectiveChaos = (uChaos + uIrritation * 0.72) * (1.0 - controlZone * 0.82);

          float disp = wave(dir, uTime, effectiveChaos);
          disp += wave(dir * 1.35 + vec3(0.3, 0.7, 0.2), uTime * 0.9, effectiveChaos * 0.55) * 0.45;
          disp += abs(sin(dir.x * 12.0 + uTime * 5.5)) * abs(sin(dir.z * 11.0 - uTime * 4.8)) * (effectiveChaos * 0.055 + uIrritation * 0.09);
          disp += abs(sin(dir.x * 18.0 + uTime * 7.0)) * uIrritation * 0.042;

          if (uImpulse.z > 0.01) {
            float iDist = length(dir.xy - uImpulse.xy);
            float ripple = sin(iDist * 16.0 - uImpulse.z * 9.5);
            disp += ripple * ripple * exp(-iDist * 1.9) * uImpulse.z * 0.22;
          }

          if (uPull.z > 0.001) {
            float pDist = length(dir.xy - uPull.xy);
            disp += exp(-pDist * 2.6) * uPull.z * 0.22;
            disp *= 1.0 - controlZone * 0.18;
          }

          disp = clamp(disp, -0.17 - effectiveChaos * 0.06 - uIrritation * 0.08, 0.19 + effectiveChaos * 0.09 + uIrritation * 0.14);

          vec3 pos = position + n * disp;
          vHeat = clamp(abs(disp) * 4.2 + effectiveChaos * 0.62 + uEnergy * 0.35 + uIrritation * 0.35 - controlZone * 0.42, 0.0, 1.0);
          vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vNormalView = normalize(normalMatrix * n);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vHeat;
        varying vec3 vNormalView;
        varying vec3 vWorldPos;
        uniform float uEnergy;
        uniform float uLight;
        uniform float uTime;

        vec3 saturate(vec3 c, float amount) {
          float l = dot(c, vec3(0.299, 0.587, 0.114));
          return mix(vec3(l), c, amount);
        }

        void main() {
          vec3 n = normalize(vNormalView);
          vec3 viewDir = normalize(-vNormalView);
          float facing = abs(dot(n, viewDir));
          float heat = max(vHeat, 0.1 + uEnergy * 0.18 + uLight * 0.03);
          float fresnel = pow(1.0 - facing, 2.4);

          float pearlA = sin(dot(n, vec3(0.72, 0.38, 0.92)) * 7.5 + uTime * 0.55 + vWorldPos.y * 4.5) * 0.5 + 0.5;
          float pearlB = sin(dot(n, vec3(-0.42, 0.86, 0.28)) * 6.2 - uTime * 0.42 + vWorldPos.x * 5.2) * 0.5 + 0.5;
          float pearlC = sin(length(vWorldPos.xy) * 8.0 + uTime * 0.35) * 0.5 + 0.5;

          vec3 deep = mix(vec3(0.02, 0.18, 0.82), vec3(0.06, 0.34, 0.94), uLight);
          vec3 mid = mix(vec3(0.08, 0.46, 0.98), vec3(0.14, 0.58, 1.0), uLight);
          vec3 hot = mix(vec3(0.18, 0.62, 1.0), vec3(0.28, 0.74, 1.0), uLight);
          vec3 cyan = vec3(0.12, 0.78, 0.96);
          vec3 violet = vec3(0.34, 0.42, 0.98);
          vec3 pearl = vec3(0.78, 0.9, 1.0);

          vec3 col = mix(deep, mid, heat);
          col = mix(col, hot, heat * heat * 0.55);
          col = mix(col, cyan, pearlA * 0.28);
          col = mix(col, violet, pearlB * 0.22);
          col = mix(col, pearl, fresnel * 0.38 + pearlC * 0.12);
          col = saturate(col, 1.42);

          float alpha = (0.04 + heat * 0.12 + uEnergy * 0.03 + fresnel * 0.04) * smoothstep(0.0, 0.25, facing);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    const coreScale = fieldScale * 0.85;
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.scale.setScalar(coreScale);
    coreMesh.renderOrder = 0;
    root.add(coreMesh);

    const fieldMaterial = new THREE.PointsMaterial({
      map: makeFieldDotTexture(),
      vertexColors: true,
      size: isMobile ? 0.046 : 0.04,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
      blending: THREE.NormalBlending,
    });

    const fieldMesh = new THREE.Points(geo, fieldMaterial);
    fieldMesh.scale.setScalar(coreScale);
    fieldMesh.renderOrder = 1;
    root.add(fieldMesh);

    const wirePivot = new THREE.Group();
    const wireUniforms = {
      uColor: { value: new THREE.Color(0x9ec8ff) },
      uOpacity: { value: wireOpacityBase },
    };
    const wireMat = new THREE.ShaderMaterial({
      uniforms: wireUniforms,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
      side: THREE.FrontSide,
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        uniform vec3 uColor;
        uniform float uOpacity;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float facing = dot(normalize(vNormal), viewDir);
          if (facing < 0.0) discard;

          float edgeFade = smoothstep(0.0, 0.15, facing);
          gl_FragColor = vec4(uColor, uOpacity * edgeFade);
        }
      `,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    wireMesh.renderOrder = 2;
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

    function updateFieldPoints(elapsed, energy, chaos) {
      const posAttr = geo.getAttribute('position');
      const colorAttr = geo.getAttribute('color');
      const pullVec = {
        x: (smoothPointer.x - 0.5) * 2.0,
        y: (0.5 - smoothPointer.y) * 2.0,
      };
      const impulseVec = {
        x: impulse.x,
        y: impulse.y,
        z: impulse.strength,
      };
      const light = isLightTheme();

      for (let i = 0; i < shellPoints; i++) {
        const bx = basePos[i * 3];
        const by = basePos[i * 3 + 1];
        const bz = basePos[i * 3 + 2];
        const sample = waveField(
          { x: bx, y: by, z: bz },
          elapsed,
          energy,
          chaos,
          irritation,
          impulseVec,
          pullVec,
          pull.strength,
          smoothPointer,
        );
        const heat = Math.max(sample.heat, 0.1 + energy * 0.18 + (light ? 0.02 : 0));
        const disp = sample.disp;
        posAttr.setXYZ(i, bx + bx * disp, by + by * disp, bz + bz * disp);
        const rgb = thermalColor(heat, light, { x: bx, y: by, z: bz }, elapsed);
        colorAttr.setXYZ(i, rgb[0], rgb[1], rgb[2]);
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      fieldMaterial.size = (isMobile ? 0.046 : 0.04) + energy * 0.01 + chaos * 0.008;
      fieldMaterial.opacity = Math.min(0.52, 0.34 + energy * 0.1 + chaos * 0.04);
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
      uniforms.uLight.value = isLightTheme() ? 1 : 0;
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

      wireUniforms.uColor.value.copy(new THREE.Color(0x9ec8ff)).lerp(new THREE.Color(0xffaa66), chaos * 0.35 + irritation * 0.25);
      wireUniforms.uOpacity.value = wireOpacityAnimBase + energy * 0.04 + chaos * 0.05 + irritation * 0.06;

      const lightEase = 1 - Math.pow(0.02, dt);
      const lightOrbit = elapsed * 0.35;
      const targetLightX = 1.5 + Math.sin(lightOrbit) * 0.4;
      const targetLightY = 0.8 + Math.cos(lightOrbit * 0.8) * 0.3;
      keyLight.position.x += (targetLightX - keyLight.position.x) * lightEase;
      keyLight.position.y += (targetLightY - keyLight.position.y) * lightEase;
      keyLight.color.copy(new THREE.Color(0x78b4ff)).lerp(new THREE.Color(0xff8844), chaos * 0.5);
      fillLight.intensity += (0.58 + chaos * 0.5 - fillLight.intensity) * lightEase;

      const glowWarm = chaos * 0.65;
      glow.style.opacity = String(0.16 + energy * 0.07 + pull.strength * 0.03);
      glow.style.background = `radial-gradient(circle, rgba(${Math.round(47 + glowWarm * 180)}, ${Math.round(125 - glowWarm * 55)}, ${Math.round(255 - glowWarm * 210)}, ${0.12 + chaos * 0.03}) 0%, rgba(59, 140, 255, 0.04) 50%, transparent 72%)`;

      const captionWarm = Math.min(1, chaos * 0.85 + energy * 0.25);
      updateCaptionColor(captionWarm, calm);
      try {
        updateFieldPoints(elapsed, energy, chaos);
      } catch (err) {
        console.error('hero-visual field update failed', err);
      }

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

    let resizeFrame = 0;
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          cancelAnimationFrame(resizeFrame);
          resizeFrame = requestAnimationFrame(() => {
            resize();
            if (reduced) draw(performance.now());
          });
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

    window.addEventListener('cia:theme-change', () => {
      uniforms.uLight.value = isLightTheme() ? 1 : 0;
      updateCaptionColor(0, field.calm);
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
