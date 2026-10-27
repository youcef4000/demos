// La spirale : chaque réalisation est un écran posé sur une hélice qui s'enfonce dans le noir.
// Le défilement fait tourner l'hélice ; le film suivant quitte la spirale, vient se poser
// au point de mise au point, puis passe derrière la caméra.
import * as THREE from 'three';

const CARD_W = 3.2;
const CARD_H = 2.0;
const OMEGA = 1.12; // rotation de l'hélice entre deux films (radians)
const THETA0 = -0.32; // angle du premier film en attente
const INTRO = 3.2; // recul de départ de l'animation d'arrivée

const CARD_VERT = /* glsl */ `
  uniform float uBend;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec3 p = position;
    float x = p.x / ${(CARD_W / 2).toFixed(2)};
    p.z += (1.0 - x * x) * uBend;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const CARD_FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uCover;
  uniform float uFocus;
  uniform float uAlpha;
  uniform float uShift;
  uniform float uReady;
  uniform float uZoom;
  uniform vec3 uBg;
  uniform vec3 uTint;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec2 vUv;
  varying float vDepth;

  float rbox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uCover * uZoom + 0.5;
    vec3 col;
    col.r = texture2D(uTex, uv + vec2(uShift, 0.0)).r;
    col.g = texture2D(uTex, uv).g;
    col.b = texture2D(uTex, uv - vec2(uShift, 0.0)).b;

    // hors mise au point : noir et blanc chaud, éteint
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 mono = vec3(lum) * vec3(1.04, 0.98, 0.9);
    col = mix(mono * 0.42, col, uFocus);
    col = mix(uTint, col, uReady);

    vec2 c = vUv - 0.5;
    col *= 1.0 - dot(c, c) * (1.1 - uFocus * 0.5);

    vec2 size = vec2(${CARD_W.toFixed(2)}, ${CARD_H.toFixed(2)});
    float d = rbox(c * size, size * 0.5, 0.05);
    float a = 1.0 - smoothstep(-0.008, 0.008, d);

    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    col = mix(col, uBg, fog);
    gl_FragColor = vec4(col, a * uAlpha * (1.0 - fog * 0.6));
  }
`;

// fil de la spirale : chaque sommet connaît sa place s sur l'hélice, le shader le fait tourner
const LINE_VERT = /* glsl */ `
  attribute float aS;
  uniform float uP;
  uniform float uR;
  uniform float uStep;
  varying float vDepth;
  varying float vT;
  void main() {
    float t = aS - uP;
    float th = t * ${OMEGA.toFixed(3)} + ${THETA0.toFixed(3)};
    vec3 p = vec3(sin(th) * uR, cos(th) * uR, -t * uStep);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    vT = t;
    gl_Position = projectionMatrix * mv;
  }
`;

const LINE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vDepth;
  varying float vT;
  void main() {
    float fog = 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
    float near = smoothstep(-0.4, 0.8, vT);
    gl_FragColor = vec4(uColor, uOpacity * fog * near);
  }
`;

const DUST_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uFlow;
  uniform float uSize;
  uniform float uRange;
  uniform float uNear;
  varying float vA;
  void main() {
    vec3 p = position;
    p.z = uNear - mod(uNear - p.z + uFlow + uTime * (0.15 + aSeed * 0.2), uRange);
    p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.08;
    p.y += cos(uTime * 0.25 + aSeed * 30.0) * 0.08;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.4 + aSeed) / max(0.5, -mv.z);
    vA = smoothstep(uRange, uRange * 0.4, -mv.z) * smoothstep(0.3, 2.0, -mv.z) * (0.25 + aSeed * 0.75);
    gl_Position = projectionMatrix * mv;
  }
`;

const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * vA * 0.55);
  }
`;

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function createSpiral(canvas, { projects, accent = '#ff4a1c', bg = '#0b0b0c', onProgress } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const bgColor = new THREE.Color(bg);
  renderer.setClearColor(bgColor, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
  const world = new THREE.Group();
  scene.add(world);

  const accentColor = new THREE.Color(accent);
  const state = {
    p: -1.6, // progression voulue (index du film au point)
    cur: -1.6 - INTRO,
    vel: 0,
    intro: 0,
    mx: 0,
    my: 0,
    cmx: 0,
    cmy: 0,
    visible: true,
    running: false,
    time: 0,
    // mise en page, recalculée au resize
    d: 8,
    R: 3,
    step: 2.4,
    fracY: 0.45,
    rect: { x: 0, y: 0, w: 0, h: 0 },
  };

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 24, 12);
  const blank = new THREE.DataTexture(new Uint8Array([20, 20, 22, 255]), 1, 1);
  blank.needsUpdate = true;

  const cards = projects.map((proj, i) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: CARD_VERT,
      fragmentShader: CARD_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTex: { value: blank },
        uCover: { value: new THREE.Vector2(1, 1) },
        uFocus: { value: 0 },
        uAlpha: { value: 1 },
        uShift: { value: 0 },
        uReady: { value: 0 },
        uZoom: { value: 1 },
        uBend: { value: 0 },
        uBg: { value: bgColor },
        uTint: { value: new THREE.Color(0x1a1817) },
        uFogNear: { value: 10 },
        uFogFar: { value: 34 },
      },
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.index = i;
    world.add(mesh);
    const card = { mesh, mat, ready: 0 };
    loadTexture(proj, card);
    return card;
  });

  function coverFor(card, w, h) {
    const plane = CARD_W / CARD_H;
    const img = w / h;
    card.mat.uniforms.uCover.value.set(img > plane ? plane / img : 1, img > plane ? 1 : img / plane);
  }

  function loadTexture(proj, card) {
    if (!proj.cover) return fallbackTexture(proj, card);
    loader.load(
      proj.cover,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, maxAniso);
        coverFor(card, tex.image.width, tex.image.height);
        card.mat.uniforms.uTex.value = tex;
        card.ready = 1;
      },
      undefined,
      () => fallbackTexture(proj, card),
    );
  }

  // image introuvable ou refusée : un carton titre, comme au cinéma
  function fallbackTexture(proj, card) {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 640;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 1024, 640);
    grd.addColorStop(0, '#221f1c');
    grd.addColorStop(1, '#0e0d0c');
    g.fillStyle = grd;
    g.fillRect(0, 0, 1024, 640);
    g.fillStyle = accent;
    g.fillRect(64, 64, 10, 10);
    g.fillStyle = '#efe9df';
    g.font = '600 64px Archivo, Helvetica, Arial, sans-serif';
    g.fillText(String(proj.title || '').slice(0, 26), 64, 560);
    g.font = '400 26px "IBM Plex Mono", monospace';
    g.fillStyle = 'rgba(239,233,223,.55)';
    g.fillText(`${proj.category || ''}  ${proj.year || ''}`.toUpperCase(), 64, 480);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    card.mat.uniforms.uTex.value = tex;
    card.mat.uniforms.uCover.value.set(1, 1);
    card.ready = 1;
  }

  // --- fil de l'hélice
  const LINE_N = 900;
  const sArr = new Float32Array(LINE_N);
  const lineStart = -1.2;
  const lineEnd = projects.length + 5;
  for (let i = 0; i < LINE_N; i++) sArr[i] = lineStart + ((lineEnd - lineStart) * i) / (LINE_N - 1);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LINE_N * 3), 3));
  lineGeo.setAttribute('aS', new THREE.BufferAttribute(sArr, 1));
  const lineUniforms = {
    uP: { value: 0 },
    uR: { value: 3 },
    uStep: { value: 2.4 },
    uColor: { value: accentColor },
    uOpacity: { value: 0.55 },
    uFogNear: { value: 8 },
    uFogFar: { value: 36 },
  };
  const line = new THREE.Line(
    lineGeo,
    new THREE.ShaderMaterial({ vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, uniforms: lineUniforms, transparent: true, depthWrite: false }),
  );
  line.frustumCulled = false;
  world.add(line);

  // --- poussière dans le faisceau
  const coarse = matchMedia('(pointer: coarse)').matches;
  const DUST_N = coarse ? 380 : 900;
  const dPos = new Float32Array(DUST_N * 3);
  const dSeed = new Float32Array(DUST_N);
  for (let i = 0; i < DUST_N; i++) {
    const r = 0.6 + Math.random() * 7;
    const a = Math.random() * Math.PI * 2;
    dPos[i * 3] = Math.cos(a) * r;
    dPos[i * 3 + 1] = Math.sin(a) * r * 0.8;
    dPos[i * 3 + 2] = 10 - Math.random() * 40;
    dSeed[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dSeed, 1));
  const dustUniforms = {
    uTime: { value: 0 },
    uFlow: { value: 0 },
    uSize: { value: 26 },
    uRange: { value: 40 },
    uNear: { value: 10 },
    uColor: { value: new THREE.Color('#ffd9b8') },
  };
  const dust = new THREE.Points(
    dustGeo,
    new THREE.ShaderMaterial({ vertexShader: DUST_VERT, fragmentShader: DUST_FRAG, uniforms: dustUniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  dust.frustumCulled = false;
  scene.add(dust);

  // --- mise en page : taille voulue de l'écran au point, en pixels
  function resize() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, coarse ? 1.6 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;

    const portrait = h > w * 1.1;
    const cardPx = portrait ? Math.min(w * 0.88, 560) : Math.min(w * 0.5, h * 0.5 * (CARD_W / CARD_H), 980);
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // distance telle que la carte mesure cardPx de large : largeur visible = 2 d tan * aspect
    state.d = (CARD_W * w) / (cardPx * 2 * tan * camera.aspect);
    state.fracY = portrait ? 0.3 : 0.44;
    state.R = portrait ? 2.1 : 3.3;
    state.step = portrait ? 2.2 : 2.5;
    dustUniforms.uSize.value = (portrait ? 18 : 26) * dpr;
    camera.setViewOffset(w, h, 0, (0.5 - state.fracY) * h, w, h);
    camera.updateProjectionMatrix();

    const cardH = cardPx / (CARD_W / CARD_H);
    state.rect = { x: w / 2 - cardPx / 2, y: state.fracY * h - cardH / 2, w: cardPx, h: cardH };
    lineUniforms.uR.value = state.R;
    lineUniforms.uStep.value = state.step;
    render();
    return state.rect;
  }

  function place(card, t, hero) {
    const { R, step, d } = state;
    const m = card.mesh;
    const u = card.mat.uniforms;
    let focus;
    if (t >= 0) {
      // le film suivant quitte l'hélice et glisse vers le point
      const k = smooth(0, 1.15, t);
      const th = t * OMEGA + THETA0;
      const hx = Math.sin(th) * R;
      const hy = Math.cos(th) * R;
      m.position.set(hx * k, hy * k, -t * step);
      m.rotation.set(-Math.cos(th) * 0.28 * k, Math.sin(th) * 0.42 * k, -th * 0.06 * k);
      m.scale.setScalar(1 - 0.18 * k);
      focus = 1 - smooth(0.08, 0.85, t);
      u.uAlpha.value = 1;
    } else {
      // le film vu part sur le côté en continuant la spirale, et passe derrière la caméra
      const s = -t;
      const th = THETA0 + Math.PI - s * OMEGA * 0.5;
      const k = smooth(0, 1, s);
      m.position.set(Math.sin(th) * R * 1.6 * k, Math.cos(th) * R * 0.9 * k, s * d * 0.55);
      m.rotation.set(Math.cos(th) * 0.35 * k, -Math.sin(th) * 0.7 * k, th * 0.05 * k);
      m.scale.setScalar(1);
      focus = 1 - smooth(0, 0.7, s);
      u.uAlpha.value = 1 - smooth(0.35, 0.95, s);
    }
    // dans l'accueil, la spirale entière reste lisible
    u.uFocus.value = Math.max(focus, hero * 0.7 * (1 - smooth(5, 10, t)));
    m.visible = u.uAlpha.value > 0.01 && t < 14;
    u.uZoom.value = 1 - 0.05 * u.uFocus.value;
    u.uReady.value += (card.ready - u.uReady.value) * 0.08;
    u.uShift.value = THREE.MathUtils.clamp(state.vel * 0.006, -0.02, 0.02);
    u.uBend.value = 0.08 * (1 - u.uFocus.value) + THREE.MathUtils.clamp(state.vel * 0.12, -0.5, 0.5);
    m.renderOrder = Math.round(100 - t * 4);
  }

  function frame(dt) {
    // l'arrivée : la spirale se déroule avant que le visiteur ne touche à rien
    const target = state.p - INTRO * (1 - state.intro);
    const prev = state.cur;
    state.cur += (target - state.cur) * Math.min(1, dt * 7);
    const v = (state.cur - prev) / Math.max(dt, 1 / 240);
    state.vel += (v - state.vel) * Math.min(1, dt * 6);
    state.time += dt;

    state.cmx += (state.mx - state.cmx) * Math.min(1, dt * 3);
    state.cmy += (state.my - state.cmy) * Math.min(1, dt * 3);

    // dans l'accueil on recule pour voir toute la spirale, puis on s'approche
    const hero = smooth(0, -1.6, state.cur);
    const dist = state.d * (1 + 0.55 * hero);
    camera.position.set(state.cmx * 0.55, -state.cmy * 0.35, dist);
    camera.lookAt(0, 0, -2 * hero);
    camera.rotation.z += THREE.MathUtils.clamp(state.vel * 0.012, -0.05, 0.05);

    world.rotation.z = Math.sin(state.time * 0.15) * 0.02;
    cards.forEach((c, i) => place(c, i - state.cur, hero));
    lineUniforms.uP.value = state.cur;
    lineUniforms.uOpacity.value = 0.35 + 0.35 * hero;
    dustUniforms.uTime.value = state.time;
    dustUniforms.uFlow.value = state.cur * state.step * 0.8;
    onProgress?.(state.cur, state.vel);
  }

  function render() {
    renderer.render(scene, camera);
  }

  let last = performance.now();
  function loop(now) {
    if (!state.running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    frame(dt);
    render();
    requestAnimationFrame(loop);
  }

  function start() {
    if (state.running) return;
    state.running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  }
  const stop = () => (state.running = false);

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : state.visible && start()));

  resize();
  frame(0);
  render();

  return {
    resize,
    start,
    stop,
    get rect() {
      return state.rect;
    },
    setProgress(p) {
      state.p = p;
    },
    setPointer(x, y) {
      state.mx = x;
      state.my = y;
    },
    setVisible(v) {
      state.visible = v;
      v && !document.hidden ? start() : stop();
    },
    setAccent(hex) {
      accentColor.set(hex);
    },
    // arrivée : durée en secondes
    intro(duration = 2.4, instant = false) {
      if (instant) {
        state.intro = 1;
        state.cur = state.p;
        return;
      }
      const t0 = performance.now();
      const tick = (now) => {
        const x = Math.min(1, (now - t0) / (duration * 1000));
        state.intro = 1 - Math.pow(1 - x, 3);
        if (x < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    texturesReady() {
      return cards.every((c) => c.ready);
    },
    readyCount() {
      return cards.filter((c) => c.ready).length;
    },
  };
}
