// Act V — feature montage: a cover-flow of real StudySolo screens, cut on the beat.
import { el, clamp, seg, E, ease, lerp, track, ev, noise1, W, H } from "./core.js";

const pad = (n) => String(n).padStart(4, "0");
const seqFrames = (dir, a, b, t0, t1) => ({ dir, a, b, t0, t1 });
// Each shot: t0, t1, frames(t) → src, zoom keys [[t, [fx, fy, z]]] in UI css px (1600×900)
const SHOTS = [
  { t0: 33.0, t1: 35.0, zh: "读到哪，问到哪", en: "highlight anything · ask instantly",
    src: (t) => {
      if (t < 33.3) return `assets/seq/studio/${pad(0)}.jpg`;
      if (t < 33.85) return `assets/seq/studio/${pad(1 + Math.floor(seg(t, 33.3, 33.85) * 11.99))}.jpg`;
      if (t < 34.15) return `assets/seq/studio/${pad(13)}.jpg`;
      return `assets/seq/studio/${pad(15 + Math.floor(seg(t, 34.15, 35.0) * 150))}.jpg`;
    },
    zoom: [[33.0, [720, 250, 1.55]], [33.95, [700, 230, 1.7]], [34.35, [1300, 420, 1.45]], [35.0, [1330, 470, 1.5]]] },
  { t0: 35.0, t1: 36.0, zh: "一搜，贯通全科", en: "search every subject at once",
    src: (t) => (t < 35.2 ? "assets/lo/gs-open.jpg" : `assets/lo/gs-${Math.min(5, Math.floor(seg(t, 35.2, 35.95) * 6))}.jpg`),
    zoom: [[35.0, [800, 380, 1.2]], [36.0, [800, 420, 1.38]]] },
  { t0: 36.0, t1: 37.0, zh: "学完，马上测", en: "learn it · then test it",
    src: (t) => (t < 36.5 ? "assets/lo/quiz-a.jpg" : "assets/lo/quiz-b.jpg"),
    zoom: [[36.0, [560, 330, 1.45]], [37.0, [560, 380, 1.55]]] },
  { t0: 37.0, t1: 38.0, zh: "例题，逐道精讲", en: "worked examples, step by step",
    src: () => "assets/lo/examples-a.jpg",
    zoom: [[37.0, [660, 250, 1.4]], [38.0, [660, 380, 1.45]]] },
  { t0: 38.0, t1: 39.5, zh: "公式，可以上手拖", en: "formulas you can touch",
    src: (t) => `assets/seq/inter/${pad(Math.min(40, Math.floor(seg(t, 38.0, 39.5) * 41)))}.jpg`,
    zoom: [[38.0, [1340, 330, 1.8]], [39.5, [1340, 380, 1.95]]] },
  { t0: 39.5, t1: 40.5, zh: "每一节课，一字不落", en: "every lecture, word for word",
    src: () => "assets/lo/bio-lec.jpg",
    zoom: [[39.5, [560, 260, 1.5]], [40.5, [560, 420, 1.55]]] },
  { t0: 40.5, t1: 42.0, zh: "每一章，写成详解", en: "every chapter, explained in depth",
    src: (t) => (t < 41.0 ? "assets/lo/anat-detail.jpg" : t < 41.5 ? "assets/lo/bio-detail.jpg" : "assets/lo/prob-41.jpg"),
    zoom: [[40.5, [560, 300, 1.4]], [42.0, [560, 360, 1.5]]] },
  { t0: 42.0, t1: 43.0, zh: "Agent，接入你的工具", en: "an agent that plugs into your tools",
    src: () => "assets/lo/plugins.jpg",
    zoom: [[42.0, [900, 300, 1.25]], [43.0, [950, 340, 1.35]]] },
  { t0: 43.0, t1: 44.0, zh: "你的每一门课", en: "every course you take",
    src: () => "assets/lo/home-hover.jpg",
    zoom: [[43.0, [560, 450, 1.3]], [44.0, [560, 450, 1.05]]] },
];
const GAP = 1900; // world spacing between screens
const SW = 1380, SH = SW * 9 / 16;

export class Montage {
  constructor(parent) {
    this.root = el("div", { class: "layer", style: { display: "none", background: "radial-gradient(ellipse at 60% 40%, #111c36 0%, #080c18 50%, #05060b 100%)" } }, parent);
    this.grid = el("div", { class: "layer", style: { backgroundImage: "linear-gradient(rgba(140,170,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(140,170,255,0.06) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse at 50% 50%, #000 10%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, #000 10%, transparent 70%)" } }, this.root);
    this.view = el("div", { class: "layer", style: { perspective: "2200px", perspectiveOrigin: "50% 45%" } }, this.root);
    this.world = el("div", { class: "abs", style: { left: "0", top: "0", width: "1920px", height: "1080px", transformStyle: "preserve-3d" } }, this.view);
    this.screens = SHOTS.map((s, i) => {
      const card = el("div", { class: "abs", style: { left: `${960 - SW / 2}px`, top: `${540 - SH / 2}px`, width: `${SW}px`, height: `${SH}px`, borderRadius: "22px", overflow: "hidden", background: "#131318", boxShadow: "0 80px 160px -40px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.12), 0 0 90px rgba(80,130,255,0.18)", backfaceVisibility: "hidden" } }, this.world);
      const img = el("img", { class: "abs", style: { left: "0", top: "0", transformOrigin: "0 0", width: `${SW}px`, height: `${SH}px` } }, card);
      const shade = el("div", { class: "layer", style: { width: "100%", height: "100%", background: "#05070d", opacity: 0 } }, card);
      return { s, i, card, img, shade, last: null };
    });
    this.labelShade = el("div", { class: "layer", style: { background: "radial-gradient(ellipse 900px 420px at 18% 88%, rgba(3,5,10,0.88) 0%, rgba(3,5,10,0.55) 45%, rgba(3,5,10,0) 100%)" } }, this.root);
    // label
    this.label = el("div", { class: "abs", style: { left: "96px", top: "760px" } }, this.root);
    this.idx = el("div", { class: "mono", style: { fontSize: "20px", letterSpacing: "0.3em", color: "#8ab4ff" } }, this.label);
    this.title = el("div", { class: "sans", style: { fontSize: "88px", fontWeight: "900", color: "#fff", letterSpacing: "0.01em", lineHeight: "1.15", marginTop: "10px", textShadow: "0 8px 40px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.6)", whiteSpace: "nowrap" } }, this.label);
    this.sub = el("div", { class: "inter", style: { fontSize: "20px", letterSpacing: "0.3em", color: "rgba(230,236,255,0.62)", marginTop: "12px", textTransform: "uppercase", textShadow: "0 2px 12px rgba(0,0,0,0.9)" } }, this.label);
    this.ticks = el("div", { class: "abs", style: { left: "96px", top: "712px", display: "flex", gap: "8px" } }, this.root);
    this.tickEls = SHOTS.map(() => el("div", { style: { width: "34px", height: "4px", borderRadius: "4px", background: "rgba(255,255,255,0.18)" } }, this.ticks));
    this.titleCache = -1;
    for (const s of SHOTS.slice(1)) ev(s.t0 - 0.12, "whoosh");
    ev(41.0, "cut"); ev(41.5, "cut");
    this.ready = Promise.resolve();
  }
  camX(t) {
    // camera x in world "screen index" space; eased hops centered on each cut
    let x = 0;
    for (let i = 1; i < SHOTS.length; i++) x += E.inOutExpo(seg(t, SHOTS[i].t0 - 0.2, SHOTS[i].t0 + 0.12));
    return x;
  }
  async render(t, frame) {
    const on = t >= 32.98 && t < 47.1;
    this.root.style.display = on ? "" : "none";
    if (!on) return;
    const cx = this.camX(t);
    const vel = (this.camX(t + 1 / 60) - cx) * 60; // screens per second
    const recede = ease(t, 43.95, 44.7, E.inOutCubic);
    const intro = ease(t, 33.0, 33.5, E.outCubic);
    this.world.style.transform = `translateZ(${(-900 * recede - 500 * (1 - intro)).toFixed(1)}px) rotateY(${(-4 + 3 * recede).toFixed(2)}deg) translateX(120px)`;
    this.world.style.filter = recede > 0.01 ? `blur(${(recede * 9).toFixed(2)}px) brightness(${(1 - 0.55 * recede).toFixed(3)})` : Math.abs(vel) > 0.5 ? `blur(${Math.min(10, Math.abs(vel) * 0.9).toFixed(2)}px)` : "none";
    const loads = [];
    for (const sc of this.screens) {
      const d = sc.i - cx; // offset in screens
      const vis = Math.abs(d) < 1.6;
      sc.card.style.display = vis ? "" : "none";
      if (!vis) continue;
      const x = d * GAP * 0.62, ang = clamp(d, -1, 1) * -38, z = -Math.abs(d) * 520;
      sc.card.style.transform = `translate3d(${x.toFixed(1)}px, 0px, ${z.toFixed(1)}px) rotateY(${ang.toFixed(2)}deg)`;
      sc.shade.style.opacity = clamp(Math.abs(d) * 0.75).toFixed(3);
      // inner content & zoom
      const tt = clamp(t, sc.s.t0, sc.s.t1 - 1e-3);
      const src = sc.s.src(tt);
      if (src !== sc.last) { sc.img.src = src; sc.last = src; loads.push(sc.img.decode().catch(() => {})); }
      const [fx, fy, zz] = track(sc.s.zoom, tt);
      const iw = SW * zz, ih = SH * zz;
      let ix = SW / 2 - (fx / 1600) * iw, iy = SH / 2 - (fy / 900) * ih;
      ix = clamp(ix, SW - iw, 0); iy = clamp(iy, SH - ih, 0);
      sc.img.style.width = `${iw.toFixed(1)}px`; sc.img.style.height = `${ih.toFixed(1)}px`;
      sc.img.style.transform = `translate(${ix.toFixed(2)}px, ${iy.toFixed(2)}px)`;
    }
    await Promise.all(loads);
    // label
    let cur = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].t0 - 0.05) cur = i;
    const s = SHOTS[cur];
    if (this.titleCache !== cur) {
      this.titleCache = cur;
      this.idx.textContent = `${String(cur + 1).padStart(2, "0")} / ${String(SHOTS.length).padStart(2, "0")}`;
      this.title.innerHTML = [...s.zh].map((c) => `<span class="char">${c === " " ? "&nbsp;" : c}</span>`).join("");
      this.sub.textContent = s.en;
    }
    const spans = this.title.children;
    const lt = t - (s.t0 - 0.05);
    for (let k = 0; k < spans.length; k++) {
      const p = E.outCubic(clamp((lt - k * 0.025) / 0.28));
      const out = E.inCubic(clamp((t - (s.t1 - 0.14)) / 0.14));
      spans[k].style.opacity = (p * (1 - out)).toFixed(3);
      spans[k].style.transform = `translateY(${((1 - p) * 40 - out * 20).toFixed(1)}px)`;
      spans[k].style.filter = p < 0.99 || out > 0 ? `blur(${((1 - p) * 10 + out * 8).toFixed(1)}px)` : "none";
    }
    const lo = 1 - recede;
    this.label.style.opacity = lo.toFixed(3);
    this.labelShade.style.opacity = lo.toFixed(3);
    this.ticks.style.opacity = lo.toFixed(3);
    this.sub.style.opacity = E.outCubic(clamp((lt - 0.12) / 0.3)).toFixed(3);
    this.tickEls.forEach((k, i) => { k.style.background = i < cur ? "rgba(138,180,255,0.7)" : i === cur ? "#fff" : "rgba(255,255,255,0.18)"; k.style.width = i === cur ? "64px" : "34px"; });
    this.grid.style.transform = `translateX(${(-cx * 160) % 80}px)`;
    this.root.style.opacity = (1 - ease(t, 46.9, 47.05)).toFixed(3);
  }
}
