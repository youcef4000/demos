// Fond « satin » en WebGL : un drapé de tissu qui ondule lentement, éclairé depuis le pointeur.
// Un seul shader plein écran, rendu à demi-résolution (le satin est doux, l'agrandissement ne se voit pas).
// Renvoie null si WebGL est indisponible : la page garde alors son dégradé CSS.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform vec2 uMouse;
uniform vec3 uShadow;
uniform vec3 uBase;
uniform vec3 uLight;

// Hauteur du drapé : grands plis diagonaux, légèrement tordus
float drape(vec2 p, float t) {
  vec2 q = p;
  q.x += 0.38 * sin(p.y * 1.15 + t * 0.21);
  q.y += 0.30 * sin(p.x * 0.85 - t * 0.17);
  float a = sin(q.x * 1.7 + q.y * 0.75 + t * 0.30);
  a += 0.55 * sin(q.x * -0.75 + q.y * 1.9 - t * 0.24 + 1.7);
  a += 0.20 * sin(q.x * 3.1 - q.y * 1.2 + t * 0.42 + 4.0);
  return a;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y) * 2.1;
  vec2 m = uMouse * 2.0 - 1.0;
  p += m * 0.05;
  p.y += uScroll * 1.4;
  float t = uTime;
  float e = 0.02;
  float h = drape(p, t);
  vec2 g = vec2(drape(p + vec2(e, 0.0), t) - h, drape(p + vec2(0.0, e), t) - h) / e;
  vec3 n = normalize(vec3(-g * 0.34, 1.0));
  vec3 L = normalize(vec3(-0.5 + m.x * 0.4, 0.55 + m.y * 0.3, 0.8));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(clamp(dot(n, H), 0.0, 1.0), 38.0);
  vec3 col = mix(uShadow, uBase, smoothstep(0.42, 0.97, diff));
  col = mix(col, uLight, spec * 0.8);
  float vig = smoothstep(1.2, 0.3, length(uv - vec2(0.5, 0.55)));
  col *= mix(0.95, 1.0, vig);
  gl_FragColor = vec4(col, 1.0);
}
`;

const hex = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function createSilk(canvas, { colors = ['#d8c1b2', '#f3e9de', '#fffaf3'], scale = 0.5 } = {}) {
  let gl;
  try {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' });
  } catch {
    return null;
  }
  if (!gl) return null;

  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = shader(gl.VERTEX_SHADER, VERT);
  const fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  for (const name of ['uRes', 'uTime', 'uScroll', 'uMouse', 'uShadow', 'uBase', 'uLight']) U[name] = gl.getUniformLocation(prog, name);

  const state = { mouse: [0.5, 0.6], target: [0.5, 0.6], scroll: 0, time: 8, running: false, raf: 0, last: 0, w: 0, h: 0 };

  function setColors([a, b, c]) {
    gl.uniform3fv(U.uShadow, hex(a));
    gl.uniform3fv(U.uBase, hex(b));
    gl.uniform3fv(U.uLight, hex(c));
  }
  setColors(colors);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr * scale));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr * scale));
    if (w === state.w && h === state.h) return;
    state.w = canvas.width = w;
    state.h = canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  function draw() {
    resize();
    state.mouse[0] += (state.target[0] - state.mouse[0]) * 0.04;
    state.mouse[1] += (state.target[1] - state.mouse[1]) * 0.04;
    gl.uniform2f(U.uRes, state.w, state.h);
    gl.uniform1f(U.uTime, state.time);
    gl.uniform1f(U.uScroll, state.scroll);
    gl.uniform2f(U.uMouse, state.mouse[0], state.mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    if (!state.running) return;
    const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 0;
    state.last = now;
    state.time += dt;
    draw();
    state.raf = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (state.running) return;
      state.running = true;
      state.last = 0;
      state.raf = requestAnimationFrame(frame);
    },
    stop() {
      state.running = false;
      cancelAnimationFrame(state.raf);
    },
    render: draw,
    setMouse(x, y) {
      state.target[0] = x;
      state.target[1] = 1 - y;
    },
    setScroll(v) {
      state.scroll = v;
    },
    setColors,
  };
}
