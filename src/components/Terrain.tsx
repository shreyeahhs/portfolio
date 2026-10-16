"use client";

import { useEffect, useRef } from "react";

/**
 * The page background: a contour map of the page itself.
 *
 * The ground is slow, drifting noise, drawn the way a layered paper relief
 * model looks from above: every contour is the edge of a sheet, lit on the
 * side that faces the light and shadowed on the side that does not (Tanaka's
 * illuminated contours, 1950). The sun is in the north-west, where cartographers
 * put it. A mouse becomes a lamp, so the edges near it catch a warm light.
 *
 * The map is built around the words. Every line of text, every image and every
 * plate on the page is measured and becomes a raised, perfectly flat plateau, so
 * contours swing round each paragraph like a coastline and never cross a single
 * letter. Lines stop about 24px short of any text.
 *
 * Clicking empty ground raises a small hill, which settles back over a few
 * seconds.
 *
 * How it stays cheap:
 * - the canvas lives in the document, not fixed to the screen, so the browser
 *   scrolls it along with the text and the two can never drift apart. It is a
 *   little taller than the screen and is moved and redrawn only when the screen
 *   nears one of its edges;
 * - three GPU passes: the layout mask at a quarter of CSS resolution, the
 *   ground at half, and only the contours themselves at full resolution;
 * - the ground redraws about 12 times a second, which is plenty for land that
 *   moves a few pixels a second; the lamp redraws only the final pass;
 * - the layout is measured once, then again only when something resizes or the
 *   text changes, never while scrolling;
 * - reduced motion gets a still map with no lamp and no hills; browsers without
 *   WebGL2 and half-float targets get no map, and the page keeps its ambient
 *   light and grain.
 */

/* ------------------------------------------------------------------ shaders */

const NOISE = /* glsl */ `
vec3 permute3(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

// 2D simplex noise. Ashima Arts and Stefan Gustavson, MIT licence.
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

/** Fullscreen triangle, no attributes. */
const FULLSCREEN = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

/**
 * Pass 1, the layout mask. One instanced quad per measured box (a line of
 * text, an image, a plate), each writing two soft fields, added together:
 * red is a tight field that clears the lines away from the text, green a wide
 * one that lifts the ground into a plateau.
 */
const MASK_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec4 aRect; // document px: left, top, right, bottom
uniform float uTop;
uniform vec2 uSpan;
uniform float uPad;
out vec2 vP;
flat out vec4 vRect;
void main() {
  vec2 c = vec2(float(gl_VertexID & 1), float((gl_VertexID >> 1) & 1));
  vec2 p = mix(aRect.xy - uPad, aRect.zw + uPad, c);
  vP = p;
  vRect = aRect;
  gl_Position = vec4(vec2(p.x, p.y - uTop) / uSpan * 2.0 - 1.0, 0.0, 1.0);
}`;

const MASK_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vP;
flat in vec4 vRect;
out vec4 o;
void main() {
  vec2 q = abs(vP - 0.5 * (vRect.xy + vRect.zw)) - 0.5 * (vRect.zw - vRect.xy);
  float d = length(max(q, 0.0)); // 0 inside the box
  float tight = exp(-pow(d / 12.0, 2.0));
  float wide = exp(-pow(max(d - 10.0, 0.0) / 34.0, 2.0));
  o = vec4(tight, wide, 0.0, 0.0);
}`;

/** Pass 2, the ground, in levels: one contour per whole number. */
const HEIGHT_FS = /* glsl */ `#version 300 es
precision highp float;
uniform float uTop;
uniform float uTexel;
uniform vec2 uMaskSpan;
uniform sampler2D uMask;
uniform float uTime;
uniform float uFreq;
uniform float uRelief;
uniform float uLift;
uniform float uVh;
uniform vec4 uMounds[6]; // document x, y, height in levels, radius
out vec4 o;
${NOISE}
// A few octaves, gently warped so ridges meander the way real ground does, each
// octave drifting its own way so the land seems to settle rather than slide.
float ground(vec2 p, float t) {
  vec2 q = p * uFreq;
  vec2 w = vec2(snoise(q * 0.6 + vec2(3.1, 7.7) + t * vec2(0.011, -0.007)),
                snoise(q * 0.6 + vec2(9.4, 1.3) + t * vec2(-0.008, 0.012)));
  q += 0.42 * w;
  float h = 0.0;
  float a = 0.6;
  vec2 d = vec2(0.006, 0.004);
  for (int i = 0; i < 3; i++) {
    h += a * snoise(q + t * d);
    q = mat2(1.6, 1.2, -1.2, 1.6) * q;
    d = vec2(-d.y, d.x) * 1.3;
    a *= 0.42;
  }
  return h;
}
void main() {
  vec2 p = vec2(gl_FragCoord.x * uTexel, uTop + gl_FragCoord.y * uTexel);
  float wide = 1.0 - exp(-3.0 * texture(uMask, vec2(p.x, p.y - uTop) / uMaskSpan).g);
  // Steeper country in the first screen, gentler once you are reading.
  float hero = 1.0 - smoothstep(0.5 * uVh, 1.6 * uVh, p.y);
  float h = ground(p, uTime) * uRelief * (1.0 + 0.3 * hero) + uLift * wide;
  for (int i = 0; i < 6; i++) {
    vec2 d = p - uMounds[i].xy;
    h += uMounds[i].z * exp(-dot(d, d) / (2.0 * uMounds[i].w * uMounds[i].w));
  }
  o = vec4(h, 0.0, 0.0, 1.0);
}`;

/** Pass 3, the contours, at full resolution. */
const CONTOUR_FS = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uHeight;
uniform sampler2D uMask;
uniform vec2 uHeightSpan;
uniform vec2 uMaskSpan;
uniform float uTexel;
uniform float uTop;
uniform float uDpr;
uniform float uCanvasH;
uniform vec2 uLamp;
uniform float uLampOn;
uniform vec2 uSun;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform float uDark;
uniform float uVh;
out vec4 o;

float H(vec2 p) { return texture(uHeight, vec2(p.x, p.y - uTop) / uHeightSpan).r; }

// Straight colour and alpha laid over a premultiplied result.
vec4 over(vec3 c, float a, vec4 dst) { return vec4(c * a, a) + dst * (1.0 - a); }

void main() {
  vec2 p = vec2(gl_FragCoord.x, uCanvasH - gl_FragCoord.y) / uDpr + vec2(0.0, uTop);

  vec2 field = texture(uMask, vec2(p.x, p.y - uTop) / uMaskSpan).rg;
  float tight = 1.0 - exp(-4.0 * field.r);
  float wide = 1.0 - exp(-3.0 * field.g);
  // Lines end about 24px short of any text, and a gap narrower than about 90px
  // between two blocks stays empty, so nothing is left there as a stray tick.
  float keep = (1.0 - smoothstep(0.12, 0.6, tight)) * (1.0 - smoothstep(0.55, 0.92, wide));
  if (keep < 0.002) { o = vec4(0.0); return; }

  float e = uTexel;
  float h = H(p);
  vec2 g = vec2(H(p + vec2(e, 0.0)) - H(p - vec2(e, 0.0)),
                H(p + vec2(0.0, e)) - H(p - vec2(0.0, e))) / (2.0 * e);
  float s = length(g); // levels per px
  if (s < 1e-5) { o = vec4(0.0); return; }
  vec2 up = g / s;

  float fr = fract(h);
  float above = (1.0 - fr) / s; // px to the next sheet up
  float d = min(fr / s, above); // px to the nearest edge

  // Positive: the light is uphill, so this edge faces away from it.
  vec2 toLamp = uLamp - p;
  float dl = length(toLamp);
  float near = uLampOn * exp(-dl * dl / (2.0 * 340.0 * 340.0));
  float f = dot(up, uSun) * (1.0 - near) + dot(up, toLamp / max(dl, 1.0)) * near;
  float shade = clamp(f, 0.0, 1.0);
  float lit = clamp(-f, 0.0, 1.0);

  // Never a solid patch where the sheets crowd together.
  float room = smoothstep(3.0, 7.0, 1.0 / s);
  float aa = 0.8 / uDpr;
  float halfW = 0.3 + 0.5 * abs(f); // Tanaka: an edge is wider the more squarely it is lit
  float line = (1.0 - smoothstep(halfW - aa, halfW + aa, d)) * room;
  float thrown = f > 0.0 ? pow(clamp(1.0 - above / (9.0 * f), 0.0, 1.0), 1.5) * room : 0.0;

  vec3 shadowCol = mix(uInk, vec3(0.0), uDark);
  vec3 lightCol = mix(vec3(1.0), uInk, uDark);
  vec3 litCol = mix(lightCol, uAccent, near * 0.85);

  float castA = mix(0.055, 0.32, uDark);
  float shadeA = mix(0.15, 0.42, uDark);
  float litA = mix(0.55, 0.12, uDark) + near * mix(0.0, 0.34, uDark);
  float warmA = near * mix(0.38, 0.0, uDark);
  float traceA = mix(0.045, 0.035, uDark);

  vec4 c = vec4(0.0);
  c = over(shadowCol, castA * thrown, c);
  c = over(uInk, traceA * line, c);
  c = over(shadowCol, shadeA * shade * line, c);
  c = over(litCol, litA * lit * line, c);
  c = over(uAccent, warmA * lit * line, c);

  float hero = 1.0 - smoothstep(0.5 * uVh, 1.6 * uVh, p.y);
  o = c * keep * mix(0.85, 1.25, hero);
}`;

/* --------------------------------------------------------------- the layout */

type Box = [number, number, number, number];

/** Something that moves against the page while you scroll: a sticky column, the hero's drift. */
type Group = { el: Element; x: number; y: number; rects: number[] };

type Info = { skip: boolean; group: Element | null; clip: Box | null; lift: number };

const ROOT_INFO: Info = { skip: false, group: null, clip: null, lift: 0 };

/** The vertical offset Motion has written inline, which is transient (a reveal mid-flight), unlike a class. */
function inlineLift(el: Element) {
  const t = (el as HTMLElement).style?.transform;
  if (!t || t === "none") return 0;
  const m = /translateY\((-?[\d.]+)px\)/.exec(t) ?? /translate(?:3d)?\([^,]+,\s*(-?[\d.]+)px/.exec(t);
  return m ? parseFloat(m[1]) : 0;
}

function visibleBox(cs: CSSStyleDeclaration) {
  const bg = cs.backgroundColor;
  const a = /rgba?\([^)]*?,\s*([\d.]+)\)$/.exec(bg);
  const hasBg = bg !== "transparent" && (a ? parseFloat(a[1]) > 0.1 : bg.startsWith("rgb"));
  const framed =
    parseFloat(cs.borderTopWidth) > 0 &&
    parseFloat(cs.borderRightWidth) > 0 &&
    parseFloat(cs.borderBottomWidth) > 0 &&
    parseFloat(cs.borderLeftWidth) > 0;
  return hasBg || framed || cs.backgroundImage !== "none";
}

const GRAPHIC = new Set(["IMG", "CANVAS", "VIDEO", "IFRAME", "INPUT", "TEXTAREA", "SELECT", "BUTTON"]);

/**
 * Every box on the page that the map must keep clear of, in document pixels.
 * Boxes inside something that moves against the page are kept apart, relative
 * to that thing, and placed again every frame.
 */
function measureLayout(own: Element) {
  const sx = window.scrollX;
  const sy = window.scrollY;
  const memo = new Map<Element, Info>();
  const statics: number[] = [];
  const groups = new Map<Element, Group>();

  function info(el: Element): Info {
    const known = memo.get(el);
    if (known) return known;
    const parent = el.parentElement;
    const up = parent && parent !== document.body ? info(parent) : ROOT_INFO;
    if (up.skip) {
      memo.set(el, up);
      return up;
    }

    const cs = getComputedStyle(el);
    const pos = cs.position;
    let out: Info;
    if (
      el === own ||
      pos === "fixed" ||
      (pos === "sticky" && el.tagName === "HEADER") ||
      cs.display === "none" ||
      cs.visibility === "hidden" ||
      el.getAttribute("role") === "dialog"
    ) {
      out = { ...up, skip: true };
    } else {
      let { group, clip, lift } = up;
      if (!group && (pos === "sticky" || el.hasAttribute("data-terrain-follow"))) {
        // Positions inside are kept relative to this, so its own offset is not undone.
        group = el;
        lift = 0;
      } else {
        lift += inlineLift(el);
      }
      if (cs.overflowX !== "visible" || cs.overflowY !== "visible") {
        const r = el.getBoundingClientRect();
        const b: Box = [r.left, r.top, r.right, r.bottom];
        clip = clip
          ? [Math.max(clip[0], b[0]), Math.max(clip[1], b[1]), Math.min(clip[2], b[2]), Math.min(clip[3], b[3])]
          : b;
      }
      out = { skip: false, group, clip, lift };
      if (
        (GRAPHIC.has(el.tagName) || (el.tagName === "svg" && !(el as SVGElement).ownerSVGElement) || visibleBox(cs)) &&
        el !== document.body
      ) {
        add(el.getBoundingClientRect(), out);
      }
    }
    memo.set(el, out);
    return out;
  }

  function add(r: DOMRect, at: Info) {
    let l = r.left;
    let t = r.top;
    let rt = r.right;
    let b = r.bottom;
    if (at.clip) {
      l = Math.max(l, at.clip[0]);
      t = Math.max(t, at.clip[1]);
      rt = Math.min(rt, at.clip[2]);
      b = Math.min(b, at.clip[3]);
    }
    if (rt - l < 2 || b - t < 2) return;
    t -= at.lift;
    b -= at.lift;
    if (at.group) {
      let g = groups.get(at.group);
      if (!g) {
        const o = at.group.getBoundingClientRect();
        g = { el: at.group, x: o.left, y: o.top, rects: [] };
        groups.set(at.group, g);
      }
      g.rects.push(l - g.x, t - g.y, rt - g.x, b - g.y);
    } else {
      statics.push(l + sx, t + sy, rt + sx, b + sy);
    }
  }

  const all = document.body.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) info(all[i]);

  const range = document.createRange();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.nodeValue || !n.nodeValue.trim()) continue;
    const parent = n.parentElement;
    if (!parent) continue;
    const at = info(parent);
    if (at.skip) continue;
    range.selectNodeContents(n);
    const rects = range.getClientRects();
    for (let i = 0; i < rects.length; i++) add(rects[i], at);
  }
  range.detach();

  return { statics, groups: [...groups.values()] };
}

/* ------------------------------------------------------------------- colour */

type RGB = [number, number, number];

function hex(v: string, fallback: RGB): RGB {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v.trim());
  if (!m) return fallback;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* -------------------------------------------------------------------- WebGL */

function compile(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, fs],
  ] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    gl.attachShader(p, s);
    gl.deleteShader(s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  const u: Record<string, WebGLUniformLocation> = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(p, i)!.name.replace(/\[0\]$/, "");
    u[name] = gl.getUniformLocation(p, name)!;
  }
  return { p, u };
}

function target(gl: WebGL2RenderingContext, w: number, h: number, internal: number, format: number) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { tex, fb, w, h, ok };
}

/* ---------------------------------------------------------------- component */

const MASK_TEXEL = 4; // CSS px per mask texel
const HEIGHT_TEXEL = 2; // CSS px per ground texel
const MASK_PAD = 10 + 34 * 3; // how far the wide field reaches past a box (the tight one is well inside it)
const DRIFT_MS = 80; // the ground moves a few pixels a second, so 12 steps a second is plenty
const MOUNDS = 6;
const SUN: [number, number] = [-Math.SQRT1_2, -Math.SQRT1_2]; // toward the north-west, y down

type Mound = { x: number; y: number; t0: number };

export function Terrain() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = ref.current;
    if (!wrap || !canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let maskProg: ReturnType<typeof compile>;
    let heightProg: ReturnType<typeof compile>;
    let contourProg: ReturnType<typeof compile>;
    try {
      maskProg = compile(gl, MASK_VS, MASK_FS);
      heightProg = compile(gl, FULLSCREEN, HEIGHT_FS);
      contourProg = compile(gl, FULLSCREEN, CONTOUR_FS);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn("Terrain: shader failed", err);
      return;
    }

    const rectBuf = gl.createBuffer()!;
    const rectVao = gl.createVertexArray()!;
    gl.bindVertexArray(rectVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, rectBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
    gl.vertexAttribDivisor(0, 1);
    const emptyVao = gl.createVertexArray()!;
    gl.bindVertexArray(null);

    /* ---- state ---- */

    let W = 0; // CSS px
    let Hc = 0; // canvas height, CSS px
    let docH = 0;
    let vh = 0;
    let dpr = 1;
    let top = 0; // document y of the canvas's top edge
    let mask: ReturnType<typeof target> | null = null;
    let height: ReturnType<typeof target> | null = null;

    let statics: number[] = [];
    let groups: Group[] = [];
    let placed: number[] = []; // live document positions of the groups, flattened
    let instances = new Float32Array(0);

    let ink: RGB = [0.09, 0.09, 0.1];
    let accent: RGB = [0.72, 0.24, 0.04];
    let dark = 0;

    const pointer = { cx: 0, cy: 0, tx: 0, ty: 0, on: 0, target: 0, seen: false };
    const mounds: Mound[] = [];

    let maskDirty = true;
    let groundDirty = true;
    let contourDirty = true;
    let lastDrift = -Infinity;
    let broken = false;
    const start = performance.now();

    function readColours() {
      const cs = getComputedStyle(document.documentElement);
      ink = hex(cs.getPropertyValue("--c-ink"), ink);
      accent = hex(cs.getPropertyValue("--c-accent"), accent);
      const page = hex(cs.getPropertyValue("--c-page"), [0.98, 0.98, 0.98]);
      dark = 0.2126 * page[0] + 0.7152 * page[1] + 0.0722 * page[2] < 0.4 ? 1 : 0;
      contourDirty = true;
    }

    function resize() {
      W = wrap!.clientWidth;
      docH = wrap!.clientHeight;
      vh = window.innerHeight;
      if (!(W > 0) || !(docH > 0)) return;
      const margin = Math.max(240, Math.round(vh * 0.4));
      Hc = Math.min(docH, vh + 2 * margin);
      // Keep the full-resolution pass within about twelve million pixels.
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(12e6 / (W * Hc)));
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(Hc * dpr);
      canvas!.style.height = `${Hc}px`;

      for (const t of [mask, height]) {
        if (!t) continue;
        gl!.deleteTexture(t.tex);
        gl!.deleteFramebuffer(t.fb);
      }
      mask = target(gl!, Math.ceil(W / MASK_TEXEL), Math.ceil(Hc / MASK_TEXEL), gl!.RG16F, gl!.RG);
      height = target(gl!, Math.ceil(W / HEIGHT_TEXEL), Math.ceil(Hc / HEIGHT_TEXEL), gl!.R16F, gl!.RED);
      // A device that has the extension but cannot draw into these formats gets no map.
      if (!mask.ok || !height.ok) {
        broken = true;
        return;
      }
      top = -Infinity; // force a placement
      maskDirty = true;
    }

    /** Keep the canvas over the screen. True if it moved. */
    function place() {
      const sy = window.scrollY;
      const margin = (Hc - vh) / 2;
      const max = Math.max(0, docH - Hc);
      const inside = sy >= top + margin * 0.3 || top <= 0;
      const below = sy + vh <= top + Hc - margin * 0.3 || top >= max;
      if (inside && below && Number.isFinite(top)) return false;
      top = Math.min(max, Math.max(0, Math.round(sy - margin)));
      canvas!.style.transform = `translate3d(0, ${top}px, 0)`;
      return true;
    }

    /** Where the moving groups are now. True if any of them moved. */
    function follow() {
      let changed = placed.length !== groups.length * 2;
      const next: number[] = [];
      for (const g of groups) {
        const r = g.el.getBoundingClientRect();
        const x = r.left + window.scrollX;
        const y = r.top + window.scrollY;
        next.push(x, y);
      }
      for (let i = 0; i < next.length && !changed; i++) if (Math.abs(next[i] - placed[i]) > 0.25) changed = true;
      placed = next;
      return changed;
    }

    function collect() {
      const lo = top - MASK_PAD;
      const hi = top + Hc + MASK_PAD;
      const out: number[] = [];
      for (let i = 0; i < statics.length; i += 4) {
        if (statics[i + 3] < lo || statics[i + 1] > hi) continue;
        out.push(statics[i], statics[i + 1], statics[i + 2], statics[i + 3]);
      }
      groups.forEach((g, k) => {
        const ox = placed[k * 2];
        const oy = placed[k * 2 + 1];
        for (let i = 0; i < g.rects.length; i += 4) {
          const t = g.rects[i + 1] + oy;
          const b = g.rects[i + 3] + oy;
          if (b < lo || t > hi) continue;
          out.push(g.rects[i] + ox, t, g.rects[i + 2] + ox, b);
        }
      });
      instances = new Float32Array(out);
    }

    /* ---- passes ---- */

    function drawMask() {
      collect();
      const m = mask!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, m.fb);
      gl!.viewport(0, 0, m.w, m.h);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      if (instances.length) {
        gl!.useProgram(maskProg.p);
        gl!.uniform1f(maskProg.u.uTop, top);
        gl!.uniform2f(maskProg.u.uSpan, m.w * MASK_TEXEL, m.h * MASK_TEXEL);
        gl!.uniform1f(maskProg.u.uPad, MASK_PAD);
        gl!.bindVertexArray(rectVao);
        gl!.bindBuffer(gl!.ARRAY_BUFFER, rectBuf);
        gl!.bufferData(gl!.ARRAY_BUFFER, instances, gl!.DYNAMIC_DRAW);
        gl!.enable(gl!.BLEND);
        gl!.blendEquation(gl!.FUNC_ADD);
        gl!.blendFunc(gl!.ONE, gl!.ONE);
        gl!.drawArraysInstanced(gl!.TRIANGLE_STRIP, 0, 4, instances.length / 4);
        gl!.disable(gl!.BLEND);
      }
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    }

    const moundData = new Float32Array(MOUNDS * 4);

    function drawGround(now: number) {
      const h = height!;
      const m = mask!;
      moundData.fill(0);
      mounds.forEach((d, i) => {
        const age = (now - d.t0) / 1000;
        moundData[i * 4] = d.x;
        moundData[i * 4 + 1] = d.y;
        moundData[i * 4 + 2] = 3 * (1 - Math.exp(-age / 0.28)) * Math.exp(-age / 6);
        moundData[i * 4 + 3] = 64;
      });
      for (let i = mounds.length; i < MOUNDS; i++) moundData[i * 4 + 3] = 1;

      gl!.bindFramebuffer(gl!.FRAMEBUFFER, h.fb);
      gl!.viewport(0, 0, h.w, h.h);
      gl!.useProgram(heightProg.p);
      const u = heightProg.u;
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, m.tex);
      gl!.uniform1i(u.uMask, 0);
      gl!.uniform2f(u.uMaskSpan, m.w * MASK_TEXEL, m.h * MASK_TEXEL);
      gl!.uniform1f(u.uTop, top);
      gl!.uniform1f(u.uTexel, HEIGHT_TEXEL);
      gl!.uniform1f(u.uTime, reduce ? 0 : (now - start) / 1000);
      gl!.uniform1f(u.uFreq, 1 / (W < 640 ? 480 : 680));
      gl!.uniform1f(u.uRelief, 5.5);
      gl!.uniform1f(u.uLift, 1.6);
      gl!.uniform1f(u.uVh, vh);
      gl!.uniform4fv(u.uMounds, moundData);
      gl!.bindVertexArray(emptyVao);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    }

    function drawContours() {
      const h = height!;
      const m = mask!;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.useProgram(contourProg.p);
      const u = contourProg.u;
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, h.tex);
      gl!.uniform1i(u.uHeight, 0);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, m.tex);
      gl!.uniform1i(u.uMask, 1);
      gl!.uniform2f(u.uHeightSpan, h.w * HEIGHT_TEXEL, h.h * HEIGHT_TEXEL);
      gl!.uniform2f(u.uMaskSpan, m.w * MASK_TEXEL, m.h * MASK_TEXEL);
      gl!.uniform1f(u.uTexel, HEIGHT_TEXEL);
      gl!.uniform1f(u.uTop, top);
      gl!.uniform1f(u.uDpr, canvas!.width / W);
      gl!.uniform1f(u.uCanvasH, canvas!.height);
      gl!.uniform2f(u.uLamp, pointer.cx + window.scrollX, pointer.cy + window.scrollY);
      gl!.uniform1f(u.uLampOn, pointer.on);
      gl!.uniform2f(u.uSun, SUN[0], SUN[1]);
      gl!.uniform3f(u.uInk, ink[0], ink[1], ink[2]);
      gl!.uniform3f(u.uAccent, accent[0], accent[1], accent[2]);
      gl!.uniform1f(u.uDark, dark);
      gl!.uniform1f(u.uVh, vh);
      gl!.bindVertexArray(emptyVao);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    /* ---- the frame ---- */

    let lastScroll = -1;

    function frame(now: number) {
      if (broken || !mask || !height || !(W > 0) || !(Hc > 0)) return;
      const t = performance.now();
      if ((t >= measureDue || (mutatedAt && t - mutatedAt > 400)) && t - lastMeasure >= 100) measure();
      if (place()) maskDirty = true;
      if (groups.length && follow()) maskDirty = true;

      // The lamp eases toward the pointer and fades in and out with it.
      const lampWas = pointer.on;
      pointer.on += (pointer.target - pointer.on) * 0.08;
      if (Math.abs(pointer.on - pointer.target) < 0.002) pointer.on = pointer.target;
      const dx = pointer.tx - pointer.cx;
      const dy = pointer.ty - pointer.cy;
      pointer.cx += dx * 0.2;
      pointer.cy += dy * 0.2;
      const lampMoving = pointer.on > 0 && (Math.abs(dx) + Math.abs(dy) > 0.3 || window.scrollY !== lastScroll);
      lastScroll = window.scrollY;
      if (lampMoving || pointer.on !== lampWas) contourDirty = true;

      while (mounds.length && now - mounds[0].t0 > 30_000) mounds.shift();
      if (mounds.length) groundDirty = true;
      if (!reduce && now - lastDrift >= DRIFT_MS) {
        lastDrift = now;
        groundDirty = true;
      }

      if (maskDirty) {
        drawMask();
        maskDirty = false;
        groundDirty = true;
      }
      if (groundDirty) {
        drawGround(now);
        groundDirty = false;
        contourDirty = true;
      }
      if (contourDirty) {
        drawContours();
        contourDirty = false;
      }
    }

    let raf = 0;
    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      frame(now);
    }

    /* ---- measuring ---- */

    let measureDue = Infinity; // when the next measurement is wanted
    let mutatedAt = 0;
    let lastMeasure = -Infinity;

    function measure() {
      const m = measureLayout(wrap!);
      statics = m.statics;
      groups = m.groups;
      placed = [];
      if (groups.length) follow();
      maskDirty = true;
      lastMeasure = performance.now();
      measureDue = Infinity;
      mutatedAt = 0;
    }

    /**
     * A resize reflows the page at once, so it is measured at once, before the
     * next paint, rather than leaving the map a frame behind the words.
     */
    const onResize = () => {
      resize();
      measure();
      frame(performance.now());
    };

    readColours();
    onResize();
    const soon = () => {
      measureDue = 0;
    };
    document.fonts?.ready.then(soon);
    const settle = window.setTimeout(soon, 1400); // after the hero's entrance

    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => {
      if (wrap.clientHeight !== docH || wrap.clientWidth !== W) onResize();
    });
    ro.observe(wrap);
    // Text that appears or changes without moving anything else: a chat answer, a
    // picked project. Measured once it has been still for 400ms.
    const mo = new MutationObserver(() => {
      mutatedAt = performance.now();
    });
    const main = document.querySelector("main");
    if (main) mo.observe(main, { childList: true, subtree: true, characterData: true });

    const recolour = () => {
      readColours();
      frame(performance.now());
    };
    const themeWatch = new MutationObserver(recolour);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", recolour);

    /* ---- the pointer ---- */

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
      if (!pointer.seen) {
        pointer.cx = e.clientX;
        pointer.cy = e.clientY;
        pointer.seen = true;
      }
      pointer.target = 1;
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    /** Is this spot open ground, well clear of everything on the page? */
    function open(x: number, y: number) {
      const clear = 28;
      for (let i = 0; i < instances.length; i += 4) {
        if (
          x > instances[i] - clear &&
          x < instances[i + 2] + clear &&
          y > instances[i + 1] - clear &&
          y < instances[i + 3] + clear
        )
          return false;
      }
      return true;
    }

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const el = e.target as Element | null;
      if (el?.closest("a, button, input, textarea, select, label, summary, iframe, [role=dialog], #off-the-clock")) return;
      if (!window.getSelection()?.isCollapsed) return;
      const x = e.clientX + window.scrollX;
      const y = e.clientY + window.scrollY;
      if (!open(x, y)) return;
      mounds.push({ x, y, t0: performance.now() });
      if (mounds.length > MOUNDS) mounds.shift();
    };

    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      window.addEventListener("blur", onLeave);
      window.addEventListener("click", onClick);
    }

    // If the GPU drops the context, the map simply goes; everything above it is unaffected.
    const onLost = () => {
      broken = true;
      cancelAnimationFrame(raf);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      mo.disconnect();
      themeWatch.disconnect();
      mq.removeEventListener("change", recolour);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("click", onClick);
      canvas.removeEventListener("webglcontextlost", onLost);
      for (const t of [mask, height]) {
        if (!t) continue;
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fb);
      }
      gl.deleteBuffer(rectBuf);
      gl.deleteVertexArray(rectVao);
      gl.deleteVertexArray(emptyVao);
      gl.deleteProgram(maskProg.p);
      gl.deleteProgram(heightProg.p);
      gl.deleteProgram(contourProg.p);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[15] overflow-hidden print:hidden">
      <canvas ref={ref} className="absolute top-0 left-0 block w-full" />
    </div>
  );
}
