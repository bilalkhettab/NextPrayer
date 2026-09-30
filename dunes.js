/* Dunes: sand drawn by a WebGL fragment shader, in one of three forms.
     ridges   layered side-on ridges with pointed crests
     sweep    a few big side-on dunes, each split into a sunlit face and a
              crisp shadow along its slip face
     ripples  wind ripples in the sand, close up, seen from above (drawn by
              the `field` shader, which at dune scale read as stripes)
   One instance per canvas. Palettes are plain hex so the page can blend them
   through the day. The sand holds still and moves a little as the page
   scrolls. Without WebGL the canvas hides and the element's own CSS
   background shows instead. */
(() => {
  'use strict';

  const VERTEX = `
    attribute vec2 p;
    varying vec2 v_uv;
    void main() { v_uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

  // Shared by every form. `u_shape` means something different per form; see
  // each one's notes.
  const HEADER = `
    precision highp float;
    varying vec2 v_uv;
    uniform vec2 u_res;      // drawing buffer, px
    uniform float u_unit;    // px per sand unit: how big the forms are
    uniform float u_drift;   // scroll-driven phase
    uniform float u_seed;
    uniform vec3 u_col[5];   // sand colours, far/low to near/high
    uniform vec3 u_lit;
    uniform vec3 u_shade;
    uniform vec3 u_skyTop;
    uniform vec3 u_skyLow;
    uniform vec3 u_glow;
    uniform vec3 u_sun;      // x, y (0..1, y up), strength: where the glow sits
    // Which side the light comes from, -1 left to 1 right, the same for the
    // whole scene: the sun and moon are far enough away that every dune is lit
    // from one side, wherever the glow happens to sit on screen.
    uniform float u_light;
    uniform vec4 u_shape;
    uniform vec4 u_fx;       // grain, ripples, flat front ridge (0/1), grain in the sky

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    // Sky: horizon colour low, deepening upward, and a soft glow round the sun.
    vec3 sky(vec2 uv, float horizon) {
      vec3 col = mix(u_skyLow, u_skyTop, smoothstep(horizon - 0.15, 1.0, uv.y));
      float r = length((uv - u_sun.xy) * vec2(u_res.x / u_res.y, 1.0));
      return col + u_glow * u_sun.z * (0.5 * exp(-r * 2.6) + 0.5 * exp(-r * 11.0));
    }

    // One swell with its crest pushed downwind: a long gentle face, a short steep one.
    float swell(float a) { return sin(a + 0.65 * sin(a)); }

    // The same skewed swell, pinched to a pointed crest by \`sharpness\`.
    float dune(float a, float sharpness) {
      float s = a + 0.75 * sin(a);
      float sharp = 1.0 - 2.0 * abs(sin((s - 1.5708) * 0.5));
      return mix(sin(s), sharp, sharpness);
    }
  `;

  const FORMS = {};

  // u_shape: far base, near base, far amplitude, near amplitude (canvas heights).
  FORMS.ridges = HEADER + `
    float ridge(float x, float i) {
      float s = u_seed * 9.17 + i * 5.31;
      float a = x * (0.8 + i * 0.3) + s + u_drift * (0.35 + i * 0.25);
      return dune(a, 0.45) + 0.38 * swell(a * 1.93 + s * 1.7) + 0.1 * sin(a * 4.1 + s * 2.3);
    }

    void main() {
      vec2 uv = v_uv;
      float x = gl_FragCoord.x / u_unit;
      float px = 1.0 / u_res.y;
      vec3 col = sky(uv, u_shape.x);
      float covered = 0.0;
      float grainMask = u_fx.w;

      for (int k = 0; k < 5; k++) {
        float i = float(k);
        float depth = i / 4.0;
        float amp = mix(u_shape.z, u_shape.w, depth);
        float h = mix(u_shape.x, u_shape.y, depth) + amp * ridge(x, i);
        float below = h - uv.y;
        col *= 1.0 - covered * 0.06 * exp(below / (amp * 1.4 + 0.02)) * step(below, 0.0);
        float mask = smoothstep(-2.0 * px, 2.0 * px, below);
        if (mask > 0.0) {
          float plain = (k == 4) ? u_fx.z : 0.0;
          float fall = smoothstep(0.0, amp * 3.0 + 0.1, below);
          float xs = x + below * 1.5;
          float e = 0.15;
          float slope = amp * (ridge(xs + e, i) - ridge(xs - e, i)) / (2.0 * e);
          float facing = clamp(-slope * u_light * 8.0, -1.0, 1.0) * (1.0 - 0.5 * fall);
          vec3 c = u_col[k];
          c = mix(c, u_lit, max(facing, 0.0) * 0.3 * (1.0 - plain));
          c = mix(c, u_shade, max(-facing, 0.0) * 0.24 * (1.0 - plain));
          c = mix(c, u_shade, fall * 0.2 * (1.0 - plain));
          float crest = exp(-below / (px * 6.0 + amp * 0.3));
          c = mix(c, u_lit, crest * (0.12 + 0.28 * u_sun.z) * (1.0 - plain * 0.6));
          float rip = sin((below + 0.35 * amp * ridge(x * 2.7, i + 3.0)) * 240.0);
          c *= 1.0 + u_fx.y * rip * 0.035 * depth * smoothstep(0.0, 0.04, below) * (1.0 - plain);
          c = mix(c, u_skyLow, (1.0 - depth) * 0.3 * (1.0 - plain));
          col = mix(col, c, mask);
          covered = max(covered, mask);
          grainMask = mix(grainMask, 1.0 - plain, mask);
        }
      }
      col += (hash(gl_FragCoord.xy) - 0.5) * u_fx.x * grainMask;
      gl_FragColor = vec4(col, 1.0);
    }`;

  // u_shape: far base, near base, far amplitude, near amplitude (canvas heights).
  // Four dunes; colours u_col[1..4].
  FORMS.sweep = HEADER + `
    // Far dunes narrower than near ones, as they would be in perspective.
    float crest(float x, float i) {
      float s = u_seed * 9.17 + i * 5.31;
      float a = x * (1.1 - i * 0.2) + s + u_drift * (0.3 + i * 0.3);
      return dune(a, 0.6) + 0.2 * swell(a * 2.3 + s * 1.3);
    }

    void main() {
      vec2 uv = v_uv;
      float x = gl_FragCoord.x / u_unit;
      float px = 1.0 / u_res.y;
      vec3 col = sky(uv, u_shape.x);
      float covered = 0.0;
      float grainMask = u_fx.w;
      float tall = u_res.y / u_unit; // canvas height in sand units

      for (int k = 0; k < 4; k++) {
        float i = float(k);
        float depth = i / 3.0;
        float amp = mix(u_shape.z, u_shape.w, depth);
        float h = mix(u_shape.x, u_shape.y, depth) + amp * crest(x, i);
        float below = h - uv.y;
        col *= 1.0 - covered * 0.12 * exp(below / (amp * 0.5 + 0.01)) * step(below, 0.0);
        float mask = smoothstep(-px, px, below);
        if (mask > 0.0) {
          float plain = (k == 3) ? u_fx.z : 0.0;
          float fall = smoothstep(0.0, amp * 2.2 + 0.05, below);
          // Light and shadow part along a line curving down from each crest,
          // like the slip face on a real dune.
          float xs = x + below * tall * (0.7 + 2.5 * below);
          float e = 0.02;
          float slope = (crest(xs + e, i) - crest(xs - e, i)) / (2.0 * e);
          // Which face is sunlit is a crisp split, but how much it shows follows
          // how far to the side the light is: evened out with the sun overhead,
          // stronger as it drops. The split then changes sides at midday with
          // nothing to see, where it used to flip the whole landscape at once.
          float face = smoothstep(-0.06, 0.06, -slope * sign(u_light));
          float lit = mix(0.5, face, smoothstep(0.0, 0.6, abs(u_light)));
          vec3 base = u_col[k + 1];
          vec3 sunFace = mix(base, u_lit, 0.45 - 0.3 * fall);
          // Shadow lifts toward the foot, where light bounces off the sand.
          vec3 shadeFace = mix(mix(base, u_shade, 0.55), base, fall * 0.35);
          vec3 c = mix(shadeFace, sunFace, lit);
          float crestLine = exp(-below / (px * 1.5 + amp * 0.02));
          c = mix(c, u_lit, crestLine * (0.3 + 0.4 * u_sun.z));
          c = mix(c, u_skyLow, (1.0 - depth) * 0.25);
          c = mix(c, base, plain);
          col = mix(col, c, mask);
          covered = max(covered, mask);
          grainMask = mix(grainMask, 1.0 - plain, mask);
        }
      }
      col += (hash(gl_FragCoord.xy) - 0.5) * u_fx.x * grainMask;
      gl_FragColor = vec4(col, 1.0);
    }`;

  // Seen from above. u_shape: crest frequency, meander, cross dunes, relief.
  // Sand runs u_col[3] (troughs) to u_col[1] (crests); the sun's x sets which
  // side the light comes from, its height how long the shadows are.
  FORMS.field = HEADER + `
    // One period of a dune across the wind: a long, flat windward face up to a
    // sharp crest, then a short steep slip face. Straight faces shade evenly,
    // so the light breaks cleanly along each crest instead of rounding off.
    float profile(float t) { return min(t / 0.8, (1.0 - t) / 0.2); }

    // Smooth value noise, for the meanders and for where crests fade out.
    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    float sandSea(vec2 p) {
      float s = u_seed;
      // Crests meander on a slow noise field and run on a diagonal.
      vec2 w = vec2(vnoise(p * 0.3 + s), vnoise(p * 0.3 + s + 17.0)) - 0.5;
      vec2 q = mat2(0.87, -0.5, 0.5, 0.87) * (p + w * u_shape.y * 3.2);
      float d = profile(fract(q.x * u_shape.x + 0.35 * sin(q.y * 0.45 + s)));
      // Some crests die away, so they branch and merge like a real dune field.
      float keep = 0.3 + 0.7 * smoothstep(0.2, 0.75, vnoise(p * 0.25 + s * 3.0));
      vec2 r = mat2(0.8, -0.6, 0.6, 0.8) * p * 1.9;
      float d2 = profile(fract(r.x + 0.5 * sin(r.y * 0.9 + s)));
      return d * keep + u_shape.z * d2 * (1.0 - keep * 0.6);
    }

    void main() {
      vec2 p = gl_FragCoord.xy / u_unit + vec2(0.4, -1.0) * u_drift * 2.0;
      float e = 1.0 / u_unit;
      float h = sandSea(p);
      float hx = (sandSea(p + vec2(e, 0.0)) - sandSea(p - vec2(e, 0.0))) / (2.0 * e);
      float hy = (sandSea(p + vec2(0.0, e)) - sandSea(p - vec2(0.0, e))) / (2.0 * e);
      vec3 n = normalize(vec3(-hx * u_shape.w, -hy * u_shape.w, 1.0));
      vec3 sunDir = normalize(vec3(u_light * 1.1, 0.6, 0.35 + 0.8 * clamp(u_sun.y - 0.5, 0.0, 0.5)));
      // Lit or shaded relative to flat ground, so the palette sets the mid-tone.
      float light = clamp((dot(n, sunDir) - sunDir.z) * 2.2, -1.0, 1.0);
      vec3 base = mix(u_col[3], u_col[1], h);
      vec3 c = mix(base, u_lit, max(light, 0.0) * 0.6);
      c = mix(c, u_shade, max(-light, 0.0) * 0.7);
      c = mix(base, c, 0.45 + 0.55 * u_sun.z);
      c += (hash(gl_FragCoord.xy) - 0.5) * u_fx.x;
      gl_FragColor = vec4(c, 1.0);
    }`;

  FORMS.ripples = FORMS.field;

  const hexToRgb = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const instances = new Set();

  // Scroll drives the drift, eased so a wheel's steps glide rather than jump.
  // `DRIFT_PER_PX` keeps it slight: a screen of scrolling (~800px) moves the
  // sand a few dozen pixels.
  const DRIFT_PER_PX = 0.00012;
  const EASE = 0.12;
  let scrollTarget = window.scrollY;
  let drift = scrollTarget * DRIFT_PER_PX;
  window.addEventListener('scroll', () => { scrollTarget = window.scrollY; }, { passive: true });

  function loop() {
    requestAnimationFrame(loop);
    const target = reduceMotion.matches ? 0 : scrollTarget * DRIFT_PER_PX;
    const gap = target - drift;
    const moving = Math.abs(gap) > 0.00005;
    drift = moving ? drift + gap * EASE : target;
    for (const dunes of instances) {
      if (dunes.visible && (dunes.dirty || moving)) dunes.draw();
    }
  }

  class Dunes {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {{form: string, shape: number[], unit: number, seed: number, fx: number[]}} options
     *   form: ridges | sweep | ripples; shape: per form, see FORMS
     *   unit: CSS px per sand unit; fx: [grain, ripples, flat front ridge, grain in the sky]
     */
    constructor(canvas, options) {
      this.canvas = canvas;
      this.options = options;
      this.fragment = FORMS[options.form] || FORMS.ridges;
      this.visible = false;
      this.dirty = true;
      this.ok = this.init();
      if (!this.ok) { canvas.hidden = true; return; }

      new ResizeObserver(() => this.resize()).observe(canvas);
      new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible) this.dirty = true;
      }).observe(canvas);
      canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.ok = false; });
      canvas.addEventListener('webglcontextrestored', () => { this.ok = this.init(); this.resize(); });
      instances.add(this);
      if (instances.size === 1) requestAnimationFrame(loop);
    }

    init() {
      const gl = this.canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
      if (!gl) return false;
      const shader = (type, source) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      try {
        const program = gl.createProgram();
        gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
        gl.attachShader(program, shader(gl.FRAGMENT_SHADER, this.fragment));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
        gl.useProgram(program);
        this.program = program;
      } catch (error) {
        console.warn('Dunes: shader failed', error);
        return false;
      }
      // One triangle that covers the whole canvas.
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const p = gl.getAttribLocation(this.program, 'p');
      gl.enableVertexAttribArray(p);
      gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
      this.gl = gl;
      this.u = {};
      for (const name of ['res', 'unit', 'drift', 'seed', 'col', 'lit', 'shade', 'skyTop', 'skyLow', 'glow', 'sun', 'light', 'shape', 'fx']) {
        this.u[name] = gl.getUniformLocation(this.program, `u_${name}`);
      }
      this.dirty = true;
      return true;
    }

    resize() {
      // Soft gradients don't need full retina resolution; the edges are feathered.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
      this.dpr = dpr;
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
        // Resizing clears the canvas to black; redraw before it's painted.
        this.draw();
      }
      this.dirty = true;
    }

    /**
     * Palette: {skyTop, skyLow, glow, lit, shade, layers: [5 hex], sun: [x, y, strength], light?}.
     * `light` (-1 left to 1 right) defaults to the side of the screen the sun is on.
     */
    set(palette) {
      const key = JSON.stringify(palette);
      if (key === this.paletteKey) return;
      this.paletteKey = key;
      this.palette = {
        skyTop: hexToRgb(palette.skyTop),
        skyLow: hexToRgb(palette.skyLow),
        glow: hexToRgb(palette.glow),
        lit: hexToRgb(palette.lit),
        shade: hexToRgb(palette.shade),
        layers: new Float32Array(palette.layers.flatMap(hexToRgb)),
        sun: palette.sun,
        light: palette.light ?? Math.min(1, Math.max(-1, (palette.sun[0] - 0.5) * 6)),
      };
      this.dirty = true;
    }

    draw() {
      if (!this.ok || !this.palette) return;
      const { gl, u, palette, options } = this;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.uniform2f(u.res, this.canvas.width, this.canvas.height);
      // Smaller forms on narrow screens, so a phone still shows a few crests.
      const cssWidth = this.canvas.width / (this.dpr || 1);
      gl.uniform1f(u.unit, options.unit * (this.dpr || 1) * Math.min(1, Math.max(0.45, cssWidth / 1100)));
      gl.uniform1f(u.drift, drift);
      gl.uniform1f(u.seed, options.seed);
      gl.uniform3fv(u.col, palette.layers);
      gl.uniform3fv(u.lit, palette.lit);
      gl.uniform3fv(u.shade, palette.shade);
      gl.uniform3fv(u.skyTop, palette.skyTop);
      gl.uniform3fv(u.skyLow, palette.skyLow);
      gl.uniform3fv(u.glow, palette.glow);
      gl.uniform3fv(u.sun, palette.sun);
      gl.uniform1f(u.light, palette.light);
      gl.uniform4fv(u.shape, options.shape);
      gl.uniform4fv(u.fx, options.fx);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.dirty = false;
      // Shown only once there's a frame, so it fades in over the CSS fallback.
      if (!this.drawn) { this.drawn = true; this.canvas.classList.add('is-drawn'); }
    }
  }

  window.Dunes = Dunes;
})();
