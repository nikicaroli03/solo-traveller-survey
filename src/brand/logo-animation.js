// Animazione del logo Solo Travellers: l'SVG viene costruito a runtime dai dati del logo
// statico e animato con una timeline GSAP. gsap viene passato da fuori (pacchetto npm nel
// sito, script classico nella preview), così il modulo non dipende da un bundler.
//
// Regola d'oro: ogni movimento è espresso come scostamento dalla posizione finale. A fine
// timeline tutti gli scostamenti valgono zero e il fotogramma coincide con il logo statico.
import LOGO_DATA from './logo-data.js';

/** Formati supportati: dimensioni del palco e quota di larghezza di logo e slogan. */
export const FORMATS = {
  '16:9': { w: 1920, h: 1080, logo: 0.52, slogan: 0.58 },
  '1:1': { w: 1080, h: 1080, logo: 0.76, slogan: 0.78 },
  '9:16': { w: 1080, h: 1920, logo: 0.82, slogan: 0.84 },
};

/** Durata totale in secondi (hold finale compreso). */
export const DURATION = 8;

const NS = 'http://www.w3.org/2000/svg';
let uid = 0;

function el(name, attrs, parent) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, String(v));
  if (parent) parent.appendChild(node);
  return node;
}

const lerp = (a, b, t) => a + (b - a) * t;
const fx = (v) => +v.toFixed(3);

/**
 * Crea l'animazione dentro `container`.
 * Opzioni: format ('16:9' | '1:1' | '9:16'), autoplay, loop, onComplete, reducedMotion
 * (di default segue prefers-reduced-motion), background (false: palco trasparente, lo sfondo
 * lo disegna la pagina).
 */
export function createLogoAnimation(gsap, container, options = {}) {
  const {
    format = '16:9',
    autoplay = true,
    loop = false,
    onComplete,
    background = true,
    reducedMotion = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  } = options;
  const D = LOGO_DATA;
  const F = FORMATS[format] || FORMATS['16:9'];
  const C = D.colors;
  const id = `stl${++uid}`;

  // --- Impaginazione -----------------------------------------------------------
  // Unità logo (maiuscole = 100) → pixel del palco
  const k = Math.min((F.w * F.logo) / D.lockup.w, (F.h * 0.36) / D.lockup.h);
  const tx = F.w / 2 - (D.lockup.x + D.lockup.w / 2) * k;
  const ty = F.h / 2 - (D.lockup.y + D.lockup.h / 2) * k;
  const center = { x: (F.w / 2 - tx) / k, y: (F.h / 2 - ty) / k };

  // Slogan su due righe sfalsate: la seconda rientra, così ogni L parte già dal proprio
  // lato e nessuna figura deve sorpassare l'altra. Unità logo, scala sc.
  const lineGap = 1.32 * D.cap;
  const [s1, s2] = D.slogan;
  const indent = 0.42 * s1.ink.w;
  const blockW = Math.max(s1.ink.w, indent + s2.ink.w);
  const sc = Math.min((F.w * F.slogan) / k / blockW, (F.h * 0.4) / k / (D.cap + lineGap));
  const b1 = center.y - ((lineGap - D.cap) * sc) / 2;
  const left = center.x - (blockW * sc) / 2 - s1.ink.x * sc;
  const lines = D.slogan.map((l, i) => {
    const base = b1 + i * lineGap * sc;
    const x = left + i * indent * sc;
    return { ...l, x, base, slot: { x: x + l.slotX0 * sc, y: base } };
  });

  // La L di "Leave" (in alto a sinistra) diventa la figura di sinistra, quella che allunga
  // il piede e collega; la L di "Link" (in basso, più a destra) arriva per prima a destra.
  // Mentre camminano crescono fino a ms, come se venissero verso la camera: l'incontro è
  // il momento più grande; poi il logo si ricompone con uno zoom indietro.
  const ms = Math.max(sc, 1.45);
  const meetBase = center.y + (D.cap * ms) / 2;
  const pos = {
    L: {
      start: lines[0].slot,
      meet: { x: center.x - D.arm * ms, y: meetBase },
      final: { x: D.figures.left.x0, y: 0 },
    },
    R: {
      start: lines[1].slot,
      meet: { x: center.x, y: meetBase },
      final: { x: D.figures.right.x0, y: 0 },
    },
  };
  const contact = { x: pos.R.meet.x, y: meetBase - (D.stem * ms) / 2 };

  // --- SVG -------------------------------------------------------------------------
  const svg = el('svg', {
    viewBox: `0 0 ${F.w} ${F.h}`,
    width: '100%',
    height: '100%',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': 'Solo Travellers. Leave solo, Link together.',
  });
  svg.style.display = 'block';
  const defs = el('defs', {}, svg);
  const dots = el(
    'pattern',
    { id: `${id}-dots`, width: 32, height: 32, patternUnits: 'userSpaceOnUse' },
    defs,
  );
  el('circle', { cx: 16, cy: 16, r: 1.4, fill: C.cream, 'fill-opacity': 0.055 }, dots);
  const bg = el('radialGradient', { id: `${id}-bg`, cx: '50%', cy: '42%', r: '78%' }, defs);
  el('stop', { offset: '0', 'stop-color': '#15263E' }, bg);
  el('stop', { offset: '1', 'stop-color': C.night }, bg);
  const glowGrad = el('radialGradient', { id: `${id}-glow` }, defs);
  el('stop', { offset: '0', 'stop-color': C.orange, 'stop-opacity': 0.55 }, glowGrad);
  el('stop', { offset: '1', 'stop-color': C.orange, 'stop-opacity': 0 }, glowGrad);

  if (background) {
    el('rect', { width: F.w, height: F.h, fill: `url(#${id}-bg)` }, svg);
    el('rect', { width: F.w, height: F.h, fill: `url(#${id}-dots)` }, svg);
  }

  const logo = el('g', { transform: `matrix(${fx(k)} 0 0 ${fx(k)} ${fx(tx)} ${fx(ty)})` }, svg);

  // Rotte tratteggiate, rivelate da una maschera che segue le figure
  const routesG = el('g', { id: `${id}-routes` }, logo);
  const routeOffset = { x: (D.stem * sc) / 2, y: 16 * sc };
  function makeRoute(key) {
    const { start, meet } = pos[key];
    const s = { x: start.x + routeOffset.x, y: start.y + routeOffset.y };
    const m = { x: meet.x + routeOffset.x, y: meet.y + routeOffset.y };
    const dx = m.x - s.x;
    const d = `M${fx(s.x)} ${fx(s.y)}C${fx(s.x + dx * 0.55)} ${fx(s.y)} ${fx(m.x - dx * 0.55)} ${fx(m.y)} ${fx(m.x)} ${fx(m.y)}`;
    const mask = el(
      'mask',
      {
        id: `${id}-mask-${key}`,
        maskUnits: 'userSpaceOnUse',
        x: -1e4,
        y: -1e4,
        width: 2e4,
        height: 2e4,
      },
      defs,
    );
    const reveal = el(
      'path',
      { d, fill: 'none', stroke: '#fff', 'stroke-width': 24 / k, 'stroke-linecap': 'round' },
      mask,
    );
    const path = el(
      'path',
      {
        d,
        fill: 'none',
        stroke: C.orange,
        'stroke-width': 3 / k,
        'stroke-linecap': 'round',
        'stroke-dasharray': `${10 / k} ${13 / k}`,
        'stroke-opacity': 0.75,
        mask: `url(#${id}-mask-${key})`,
      },
      routesG,
    );
    return { d, reveal, path, len: 0 };
  }
  const routes = { L: makeRoute('L'), R: makeRoute('R') };

  // Slogan: una riga per gruppo, un tracciato per lettera
  const sloganG = el('g', { id: `${id}-slogan`, fill: C.cream }, logo);
  const sloganGlyphs = lines.map((l) => {
    const g = el(
      'g',
      { transform: `translate(${fx(l.x)} ${fx(l.base)}) scale(${fx(sc)})` },
      sloganG,
    );
    return l.glyphs.map((d) => el('path', { d }, g));
  });

  // Impulso del "Link"
  const pulseG = el('g', {}, logo);
  const glow = el(
    'circle',
    { cx: contact.x, cy: contact.y, r: 70 * ms, fill: `url(#${id}-glow)`, opacity: 0 },
    pulseG,
  );
  const ring = el(
    'circle',
    {
      cx: contact.x,
      cy: contact.y,
      r: 2,
      fill: 'none',
      stroke: C.orange,
      'stroke-width': 4 / k,
      opacity: 0,
    },
    pulseG,
  );

  // Wordmark: stessi tracciati e coordinate del logo statico
  const wordmark = el('g', { id: `${id}-wordmark` }, logo);
  const words = {};
  for (const key of ['solo', 'trave', 'ers']) {
    const g = el('g', { id: `${id}-word-${key}`, fill: C.cream }, wordmark);
    words[key] = D.words[key].map((d) => el('path', { d }, g));
  }
  const figuresG = el('g', { fill: C.orange }, wordmark);
  const figL = el('g', { id: `${id}-figure-left` }, figuresG);
  el('path', { d: D.figures.left.head }, figL);
  const bodyAlone = el('path', { d: D.figures.left.bodyAlone }, figL);
  const bodyLinked = el('path', { d: D.figures.left.body, opacity: 0 }, figL);
  const figR = el('g', { id: `${id}-figure-right` }, figuresG);
  el('path', { d: D.figures.right.head }, figR);
  el('path', { d: D.figures.right.body }, figR);

  const tagG = el('g', { id: `${id}-tagline` }, logo);
  const tag = {
    l1: el('path', { d: D.tagline.l1, fill: C.orange }, tagG),
    leave: el('path', { d: D.tagline.leave, fill: C.cream }, tagG),
    l2: el('path', { d: D.tagline.l2, fill: C.orange }, tagG),
    link: el('path', { d: D.tagline.link, fill: C.cream }, tagG),
  };

  container.appendChild(svg);
  for (const r of Object.values(routes)) {
    r.len = r.path.getTotalLength();
    r.reveal.setAttribute('stroke-dasharray', `${r.len} ${r.len}`);
  }

  // --- Stato delle figure ------------------------------------------------------------
  // walk: avanzamento lungo la rotta · asm: passaggio dall'incontro alla posizione nel logo
  // rise: comparsa dal basso · jump: piccolo salto insieme al momento del Link
  const state = {
    L: { walk: 0, asm: 0, rise: 0, jump: 0, steps: 4 },
    R: { walk: 0, asm: 0, rise: 0, jump: 0, steps: 5 },
  };
  const nodes = { L: figL, R: figR };

  function render() {
    for (const key of ['L', 'R']) {
      const s = state[key];
      const p = pos[key];
      const r = routes[key];
      r.reveal.setAttribute('stroke-dashoffset', String(r.len * (1 - s.walk)));
      if (s.asm >= 1 && s.jump === 0 && s.rise === 0) {
        nodes[key].removeAttribute('transform');
        continue;
      }
      let ax;
      let ay;
      let scale;
      let lean = 0;
      if (s.asm > 0) {
        ax = lerp(p.meet.x, p.final.x, s.asm);
        ay = lerp(p.meet.y, p.final.y, s.asm);
        scale = lerp(ms, 1, s.asm);
      } else {
        const pt = r.path.getPointAtLength(r.len * s.walk);
        ax = pt.x - routeOffset.x;
        ay = pt.y - routeOffset.y;
        scale = lerp(sc, ms, s.walk);
        // Camminata: un saltello per passo e il busto inclinato in avanti
        ay -= Math.abs(Math.sin(Math.PI * s.steps * s.walk)) * 7 * sc;
        lean = Math.sin(Math.PI * s.walk) * 5;
      }
      ay += s.rise * 26 * sc - s.jump * 8 * ms;
      nodes[key].setAttribute(
        'transform',
        `translate(${fx(ax)} ${fx(ay)}) rotate(${fx(lean)}) scale(${fx(scale)}) translate(${fx(-p.final.x)} 0)`,
      );
    }
  }

  // --- Timeline ------------------------------------------------------------------------
  const tl = gsap.timeline({
    paused: true,
    repeat: loop ? -1 : 0,
    repeatDelay: 0.8,
    onUpdate: render,
    onComplete,
  });

  if (reducedMotion) {
    state.L.asm = state.R.asm = 1;
    gsap.set([...sloganGlyphs.flat(), routesG], { opacity: 0 });
    gsap.set(bodyAlone, { opacity: 0 });
    gsap.set(bodyLinked, { opacity: 1 });
    tl.fromTo(svg, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out' });
  } else {
    const allWords = [...words.solo, ...words.trave, ...words.ers];
    gsap.set([...allWords, ...Object.values(tag)], { opacity: 0 });

    // 1 · Slogan: "Leave solo," e "Link together.", le L sono già persone
    tl.addLabel('slogan', 0)
      .fromTo(state.L, { rise: 1 }, { rise: 0, duration: 0.8, ease: 'power3.out' }, 0.1)
      .fromTo(figL, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
      .fromTo(
        sloganGlyphs[0],
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.035 },
        0.22,
      )
      .fromTo(state.R, { rise: 1 }, { rise: 0, duration: 0.8, ease: 'power3.out' }, 0.38)
      .fromTo(figR, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.38)
      .fromTo(
        sloganGlyphs[1],
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.035 },
        0.5,
      );

    // 2 · Le altre lettere si dissolvono, restano le due persone
    tl.addLabel('alone', 1.65)
      .to(
        sloganGlyphs[0],
        {
          opacity: 0,
          scale: 0.6,
          y: -10,
          transformOrigin: '50% 80%',
          duration: 0.45,
          ease: 'power2.in',
          stagger: { each: 0.03, from: 'end' },
        },
        'alone',
      )
      .to(
        sloganGlyphs[1],
        {
          opacity: 0,
          scale: 0.6,
          y: -10,
          transformOrigin: '50% 80%',
          duration: 0.45,
          ease: 'power2.in',
          stagger: { each: 0.03, from: 'end' },
        },
        'alone+=0.08',
      );

    // 3 · Si incamminano una verso l'altra, tracciando la rotta
    tl.addLabel('walk', 2.5)
      .fromTo(routesG, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 'walk')
      .fromTo(state.R, { walk: 0 }, { walk: 1, duration: 1.3, ease: 'power1.inOut' }, 'walk')
      .fromTo(state.L, { walk: 0 }, { walk: 1, duration: 1.4, ease: 'power1.inOut' }, 'walk+=0.1');

    // 4 · Link: il piede tocca l'altra figura, un impulso parte dal punto di contatto
    tl.addLabel('link', 4.0)
      .set(bodyAlone, { opacity: 0 }, 'link')
      .set(bodyLinked, { opacity: 1 }, 'link')
      .fromTo(
        ring,
        { attr: { r: 2, 'stroke-width': 4 / k }, opacity: 1 },
        {
          attr: { r: 90 * ms, 'stroke-width': 0.5 / k },
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out',
          immediateRender: false,
        },
        'link',
      )
      .fromTo(
        glow,
        { opacity: 0 },
        { opacity: 1, duration: 0.16, ease: 'power2.out', immediateRender: false },
        'link',
      )
      .to(glow, { opacity: 0, duration: 0.7, ease: 'power1.out' }, 'link+=0.16')
      .to([state.L, state.R], { jump: 1, duration: 0.14, ease: 'power2.out' }, 'link+=0.02')
      .to([state.L, state.R], { jump: 0, duration: 0.32, ease: 'power2.in' }, 'link+=0.16')
      .to(routesG, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 'link+=0.15');

    // 5 · Intorno alle due L si forma "Solo TraveLLers"
    tl.addLabel('logo', 4.6)
      .fromTo(
        [state.L, state.R],
        { asm: 0 },
        { asm: 1, duration: 0.9, ease: 'power3.inOut' },
        'logo',
      )
      .fromTo(
        words.trave,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: { each: 0.05, from: 'end' },
        },
        'logo+=0.42',
      )
      .fromTo(
        words.ers,
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, duration: 0.75, ease: 'power3.out', stagger: 0.05 },
        'logo+=0.46',
      )
      .fromTo(
        words.solo,
        { opacity: 0, y: -45 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.05 },
        'logo+=0.56',
      );

    // 6 · Lo slogan sotto il nome, poi il logo resta fermo
    tl.addLabel('tagline', 6.0)
      .fromTo(
        [tag.l1, tag.l2],
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.14 },
        'tagline',
      )
      .fromTo(
        [tag.leave, tag.link],
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.14 },
        'tagline+=0.1',
      )
      .addLabel('hold', 6.8)
      .set({}, {}, DURATION);
  }

  render();
  if (autoplay) tl.play(0);

  return {
    svg,
    timeline: tl,
    duration: tl.duration(),
    play: () => tl.play(),
    pause: () => tl.pause(),
    replay: () => tl.restart(),
    // pause(t) non emette onUpdate: le figure vanno ridisegnate a mano
    seek: (t) => {
      tl.pause(t);
      render();
    },
    /** Posizione a schermo di nome e slogan (utile a fine animazione per una transizione) */
    lockupRect: () => {
      const a = wordmark.getBoundingClientRect();
      const b = tagG.getBoundingClientRect();
      const x = Math.min(a.left, b.left);
      const y = Math.min(a.top, b.top);
      return new DOMRect(x, y, Math.max(a.right, b.right) - x, Math.max(a.bottom, b.bottom) - y);
    },
    destroy: () => {
      tl.kill();
      svg.remove();
    },
  };
}
