import { useProgress } from "@react-three/drei";
import usePerformanceStore from "./utils/store/performanceDetectorStore";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@fontsource/knewave/latin-400";
import "./LoadingScreen.css";

const WORD = "REEFLEX";
const fontStr = (px) =>
  `400 ${px}px "Knewave", "Marker Felt", "Comic Sans MS", cursive`;
const DIVE_DURATION = 2800; // ms: "Begin" sonrası yazının içine dalış
const MAX_DPR = 1.5;
const SITE_BG = [1, 101, 125]; // #01657d
const TWO_PI = Math.PI * 2;

// Grafiti renkleri: istersen sadece buradan değiştir
const PAL = {
  line: "#ff5f7e", // mercan pembesi (çizgi ana rengi)
  lineLight: "#ff8a93", // çizginin üst açık tonu
  lineDeep: "#d03c68", // çizginin alt koyu tonu / damla alt tonu
  polyp: "#b8325a", // mercan polip çukurları
  dark: "#0a0f12", // dış kontur
  glow: "rgba(255,111,134,0.3)", // çizgi parlaması
  spray: "255,111,134", // sprey noktaları (rgb)
  shine: "rgba(255,228,228,0.8)", // iç parlak kenar
};

// Harflerin elle çizilmiş gibi oynak durması için (her harf için)
const OVERLAP = -0.02; // em: harfler birbirine yapışık
const ROT = [-0.035, 0.025, -0.02, 0.04, -0.03, 0.025, -0.035];
const DY = [0.012, -0.022, 0.016, -0.012, 0.022, -0.016, 0.012];
const SY = [1.03, 0.97, 1.06, 0.98, 1.05, 0.97, 1.04];

/* ------------------------------------------------------------ yardımcılar */
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

let noiseTile = null;
function getNoiseTile() {
  if (noiseTile) return noiseTile;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  const img = x.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 34;
  }
  x.putImageData(img, 0, 0);
  noiseTile = c;
  return c;
}

let causticTile = null;
function getCausticTile() {
  if (causticTile) return causticTile;
  const n = 256;
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const x = c.getContext("2d");
  const img = x.createImageData(n, n);
  for (let py = 0; py < n; py++) {
    for (let px = 0; px < n; px++) {
      const u = (px / n) * TWO_PI;
      const v = (py / n) * TWO_PI;
      const a =
        Math.sin(u * 2 + Math.sin(v * 3) * 1.4) +
        Math.sin(v * 2 + Math.sin(u * 3) * 1.4);
      const b = Math.pow(Math.max(0, 1 - Math.abs(a) * 1.5), 3);
      const i = (py * n + px) * 4;
      img.data[i] = 235;
      img.data[i + 1] = 252;
      img.data[i + 2] = 255;
      img.data[i + 3] = b * 255;
    }
  }
  x.putImageData(img, 0, 0);
  causticTile = c;
  return c;
}

/* ----------------------------------------------- gerçekçi balık siluetleri */
const TONES = {
  silver: [
    [0, "#10303b"],
    [0.3, "#2c6275"],
    [0.5, "#98bfcc"],
    [0.64, "#d6e8ee"],
    [1, "#f2f9fb"],
  ],
  tuna: [
    [0, "#08192b"],
    [0.35, "#1b4766"],
    [0.6, "#7a9db2"],
    [0.8, "#cddce4"],
    [1, "#edf3f5"],
  ],
};

function drawFish(c, s, dir, wag, alpha, tone, ys) {
  c.save();
  c.globalAlpha = alpha;
  c.scale(dir, ys);
  c.rotate(Math.sin(wag * 0.5) * 0.035);

  const g = c.createLinearGradient(0, -0.17 * s, 0, 0.16 * s);
  TONES[tone].forEach(([o, col]) => g.addColorStop(o, col));
  const dark = tone === "tuna" ? "#0a2236" : "#15394a";

  // kuyruk (gövdenin arkasında sallanır)
  c.save();
  c.translate(-0.32 * s, 0);
  c.rotate(Math.sin(wag) * 0.32);
  c.fillStyle = dark;
  c.beginPath();
  c.moveTo(0.02 * s, -0.03 * s);
  c.lineTo(-0.21 * s, -0.18 * s);
  c.quadraticCurveTo(-0.12 * s, 0, -0.21 * s, 0.18 * s);
  c.lineTo(0.02 * s, 0.03 * s);
  c.closePath();
  c.fill();
  c.restore();

  // sırt yüzgeci
  c.fillStyle = dark;
  c.beginPath();
  c.moveTo(0.12 * s, -0.14 * s);
  c.lineTo(-0.02 * s, -0.25 * s);
  c.lineTo(-0.1 * s, -0.12 * s);
  c.closePath();
  c.fill();

  // gövde
  c.beginPath();
  c.moveTo(0.5 * s, 0);
  c.bezierCurveTo(0.38 * s, -0.12 * s, 0.1 * s, -0.17 * s, -0.1 * s, -0.13 * s);
  c.lineTo(-0.32 * s, -0.035 * s);
  c.lineTo(-0.32 * s, 0.035 * s);
  c.bezierCurveTo(-0.1 * s, 0.12 * s, 0.15 * s, 0.16 * s, 0.5 * s, 0);
  c.closePath();
  c.fillStyle = g;
  c.fill();

  // yan çizgi + üst parlama
  c.lineCap = "round";
  c.strokeStyle = "rgba(15,55,70,0.45)";
  c.lineWidth = s * 0.012;
  c.beginPath();
  c.moveTo(0.34 * s, -0.04 * s);
  c.quadraticCurveTo(0, -0.05 * s, -0.3 * s, -0.01 * s);
  c.stroke();
  c.strokeStyle = "rgba(255,255,255,0.35)";
  c.lineWidth = s * 0.016;
  c.beginPath();
  c.moveTo(0.38 * s, -0.085 * s);
  c.quadraticCurveTo(0.08 * s, -0.135 * s, -0.18 * s, -0.095 * s);
  c.stroke();

  // solungaç + göz
  c.strokeStyle = "rgba(10,40,55,0.5)";
  c.lineWidth = s * 0.01;
  c.beginPath();
  c.arc(0.2 * s, 0, 0.1 * s, -0.9, 0.9);
  c.stroke();
  c.fillStyle = "#07151b";
  c.beginPath();
  c.arc(0.37 * s, -0.025 * s, 0.03 * s, 0, TWO_PI);
  c.fill();
  c.fillStyle = "rgba(255,255,255,0.8)";
  c.beginPath();
  c.arc(0.378 * s, -0.033 * s, 0.009 * s, 0, TWO_PI);
  c.fill();
  c.restore();
}

/* ------------------------------------------------------------------ bileşen */
export const LoadingScreen = ({ started, onStarted }) => {
  const { progress } = useProgress();
  const level = usePerformanceStore((state) => state.level);
  const { t } = useTranslation();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [diving, setDiving] = useState(false);

  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const progressRef = useRef(0);
  const startedRef = useRef({ value: false, at: 0 });
  const onStartedRef = useRef(onStarted);

  useEffect(() => {
    onStartedRef.current = onStarted;
  }, [onStarted]);

  useEffect(() => {
    setDisplayProgress((prev) => Math.max(prev, progress));
  }, [progress]);

  useEffect(() => {
    progressRef.current = displayProgress;
  }, [displayProgress]);

  useEffect(() => {
    startedRef.current = { value: started, at: performance.now() };
  }, [started]);

  /* ---- canvas motoru ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d");
    const water = document.createElement("canvas");
    const wctx = water.getContext("2d");
    const wall = document.createElement("canvas");

    let W = 0;
    let H = 0;
    let dpr = 1;
    let L = null;
    let schools = [];
    let fishes = [];
    let bubbles = [];
    let dust = [];
    let specks = [];
    let polyps = [];
    let drips = [];
    let raf = 0;
    let resizeTimer = 0;
    let last = performance.now();
    let time = 0;
    let lvl = 0;
    let disposed = false;
    let causticPat = null;
    const dive = {
      start: null,
      tx: 0,
      ty: 0,
      zMax: 40,
      rEdge: 20,
      ended: false,
      onEnd: null,
    };

    const wordPath = (c) => {
      c.font = fontStr(L.fs);
      c.textAlign = "center";
      c.textBaseline = "alphabetic";
      c.lineJoin = "round";
      c.miterLimit = 2;
    };

    // kelimeyi harf harf çiz (her harf hafif eğik / kaymış)
    const paintWord = (c, mode) => {
      wordPath(c);
      for (const g of L.glyphs) {
        c.save();
        c.translate(g.x, g.y);
        c.rotate(g.rot);
        c.scale(1, g.sy);
        if (mode === "stroke") c.strokeText(g.ch, 0, 0);
        else c.fillText(g.ch, 0, 0);
        c.restore();
      }
    };

    const setT = (c, z, px, py) => {
      c.setTransform(
        dpr * z,
        0,
        0,
        dpr * z,
        dpr * (W / 2 - z * px),
        dpr * (H / 2 - z * py),
      );
    };

    /* beton duvar (bir kez çizilir) */
    const buildWall = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      wall.width = cw;
      wall.height = ch;
      const x = wall.getContext("2d");
      const g = x.createRadialGradient(
        cw / 2,
        ch * 0.45,
        0,
        cw / 2,
        ch * 0.45,
        Math.max(cw, ch) * 0.7,
      );
      g.addColorStop(0, "#1a2c33");
      g.addColorStop(1, "#080e11");
      x.fillStyle = g;
      x.fillRect(0, 0, cw, ch);
      for (let i = 0; i < 90; i++) {
        const r = (60 + Math.random() * 240) * dpr;
        const bx = Math.random() * cw;
        const by = Math.random() * ch;
        const bg = x.createRadialGradient(bx, by, 0, bx, by, r);
        const light = Math.random() < 0.5;
        bg.addColorStop(
          0,
          light ? "rgba(190,225,235,0.035)" : "rgba(0,0,0,0.14)",
        );
        bg.addColorStop(1, "rgba(0,0,0,0)");
        x.fillStyle = bg;
        x.fillRect(bx - r, by - r, r * 2, r * 2);
      }
      x.globalAlpha = 0.55;
      x.fillStyle = x.createPattern(getNoiseTile(), "repeat");
      x.fillRect(0, 0, cw, ch);
      x.globalAlpha = 1;
      // beton levha derzleri
      x.lineWidth = Math.max(1, dpr * 1.5);
      const joints = [
        [0, ch * 0.2, cw, ch * 0.2],
        [0, ch * 0.78, cw, ch * 0.78],
        [cw * 0.27, 0, cw * 0.27, ch],
        [cw * 0.74, 0, cw * 0.74, ch],
      ];
      joints.forEach(([x1, y1, x2, y2]) => {
        x.strokeStyle = "rgba(0,0,0,0.5)";
        x.beginPath();
        x.moveTo(x1, y1);
        x.lineTo(x2, y2);
        x.stroke();
        x.strokeStyle = "rgba(200,230,240,0.05)";
        x.beginPath();
        x.moveTo(x1 + dpr * 2, y1 + dpr * 2);
        x.lineTo(x2 + dpr * 2, y2 + dpr * 2);
        x.stroke();
      });
      const v = x.createRadialGradient(
        cw / 2,
        ch / 2,
        Math.min(cw, ch) * 0.3,
        cw / 2,
        ch / 2,
        Math.max(cw, ch) * 0.75,
      );
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,0.65)");
      x.fillStyle = v;
      x.fillRect(0, 0, cw, ch);
    };

    /* harf kenarlarından sprey saçılması + boya damlaları */
    const buildPaint = () => {
      const sc = 0.5;
      const w = Math.max(1, Math.round(W * sc));
      const h = Math.max(1, Math.round(H * sc));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const x = c.getContext("2d", { willReadFrequently: true });
      x.setTransform(sc, 0, 0, sc, 0, 0);
      wordPath(x);
      x.fillStyle = "#fff";
      paintWord(x, "fill");
      const d = x.getImageData(0, 0, w, h).data;
      const sol = (ix, iy) =>
        ix >= 0 &&
        iy >= 0 &&
        ix < w &&
        iy < h &&
        d[(iy * w + ix) * 4 + 3] > 128;

      const edge = [];
      const bottoms = [];
      const ya = Math.max(2, Math.floor(L.top * sc) - 2);
      const yb = Math.min(h - 6, Math.ceil(L.bottom * sc) + 2);
      const xa = Math.max(2, Math.floor(L.x0 * sc) - 2);
      const xb = Math.min(w - 3, Math.ceil(L.x1 * sc) + 2);
      const clearLen = Math.max(4, Math.round(L.fs * 0.12 * sc));
      for (let y = ya; y <= yb; y++) {
        for (let xx = xa; xx <= xb; xx++) {
          if (!sol(xx, y)) continue;
          if (
            sol(xx - 1, y) &&
            sol(xx + 1, y) &&
            sol(xx, y - 1) &&
            sol(xx, y + 1)
          )
            continue;
          edge.push(xx, y);
          if (!sol(xx, y + 1) && sol(xx, y - 2) && sol(xx, y - 4)) {
            let clear = true;
            for (let k = 2; k < clearLen; k += 3) {
              if (sol(xx, y + k)) {
                clear = false;
                break;
              }
            }
            if (clear) bottoms.push(xx, y);
          }
        }
      }

      specks = [];
      const n = edge.length / 2;
      if (n > 0) {
        for (let i = 0; i < 1500; i++) {
          const k = Math.floor(Math.random() * n) * 2;
          const ang = Math.random() * TWO_PI;
          const dist = L.fs * 0.07 * Math.pow(Math.random(), 2.0);
          specks.push(
            edge[k] / sc + Math.cos(ang) * dist,
            edge[k + 1] / sc + Math.sin(ang) * dist,
            L.fs * (0.0012 + Math.random() * 0.0028),
          );
        }
      }

      // mercan polipleri: harf kenarında yuvarlak kabarcıklar
      polyps = [];
      if (n > 0) {
        for (let i = 0; i < 520; i++) {
          const k = Math.floor(Math.random() * n) * 2;
          const ang = Math.random() * TWO_PI;
          const off = L.fs * 0.032 * Math.pow(Math.random(), 0.7);
          polyps.push({
            x: edge[k] / sc + Math.cos(ang) * off,
            y: edge[k + 1] / sc + Math.sin(ang) * off,
            r: L.fs * (0.01 + Math.random() * 0.017),
          });
        }
      }

      drips = [];
      const bn = bottoms.length / 2;
      for (let tries = 0; tries < 600 && drips.length < 9 && bn > 0; tries++) {
        const k = Math.floor(Math.random() * bn) * 2;
        const dx = bottoms[k] / sc;
        // sadece harflerin en alt kenarından aksın (çentiklerden değil)
        if (bottoms[k + 1] / sc < L.baseline - L.fs * 0.14) continue;
        if (drips.some((p) => Math.abs(p.x - dx) < L.fs * 0.11)) continue;
        drips.push({
          x: dx,
          y: bottoms[k + 1] / sc,
          len: L.fs * (0.08 + Math.pow(Math.random(), 1.4) * 0.3),
          w: L.fs * (0.034 + Math.random() * 0.02),
          at: 0.45 + Math.random() * 0.45, // su seviyesi bu değere gelince akmaya başlar
          ph: Math.random() * 10,
        });
      }
    };

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      W = window.innerWidth;
      H = window.innerHeight;
      [canvas, mask, water].forEach((c) => {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      });

      mctx.setTransform(1, 0, 0, 1, 0, 0);
      mctx.font = fontStr(100);
      const letters = WORD.split("");
      const widths = letters.map((ch) => mctx.measureText(ch).width);
      const total100 =
        widths.reduce((a, b) => a + b, 0) +
        (letters.length - 1) * OVERLAP * 100;
      const m = mctx.measureText(WORD);
      const asc100 = (m.actualBoundingBoxAscent || 72) * 1.07;
      const desc100 = (m.actualBoundingBoxDescent || 0) * 1.07 + 3;
      const fs = Math.min(
        ((W * 0.82) / total100) * 100,
        ((H * 0.44) / (asc100 + desc100)) * 100,
      );
      const k = fs / 100;
      const ascent = asc100 * k;
      const descent = desc100 * k;
      const textWidth = total100 * k;
      const cy = H * 0.45;
      const baseline = cy + (ascent - descent) / 2;
      const gx0 = W / 2 - textWidth / 2;
      let cursor = gx0;
      const glyphs = letters.map((ch, i) => {
        const w = widths[i] * k;
        const g = {
          ch,
          x: cursor + w / 2,
          y: baseline + DY[i % DY.length] * fs,
          rot: ROT[i % ROT.length],
          sy: SY[i % SY.length],
        };
        cursor += w + OVERLAP * fs;
        return g;
      });
      L = {
        fs,
        cx: W / 2,
        cy,
        baseline,
        top: baseline - ascent,
        bottom: baseline + descent,
        textWidth,
        x0: gx0,
        x1: gx0 + textWidth,
        glyphs,
      };

      buildWall();
      buildPaint();
      causticPat = wctx.createPattern(getCausticTile(), "repeat");

      // balık sürüleri (4 sürü + 2 büyük yalnız balık)
      schools = Array.from({ length: 4 }, (_, i) => ({
        x: L.x0 + Math.random() * textWidth,
        t: 0.15 + (i / 3) * 0.7,
        dir: i % 2 ? 1 : -1,
        speed: fs * (0.1 + Math.random() * 0.08),
        depth: 0.55 + Math.random() * 0.45,
      }));
      fishes = [];
      schools.forEach((sc, si) => {
        const cnt = 7;
        for (let i = 0; i < cnt; i++) {
          fishes.push({
            school: si,
            ox: (Math.random() - 0.5) * fs * 0.28,
            oy: (Math.random() - 0.5) * fs * 0.14,
            s: fs * (0.08 + Math.random() * 0.03) * (0.7 + sc.depth * 0.4),
            alpha: 0.45 + sc.depth * 0.55,
            tone: "silver",
            ys: 1,
            ph: Math.random() * 10,
          });
        }
      });
      for (let i = 0; i < 2; i++) {
        schools.push({
          x: L.x0 + Math.random() * textWidth,
          t: 0.3 + i * 0.4,
          dir: i ? -1 : 1,
          speed: fs * (0.06 + Math.random() * 0.04),
          depth: 1,
        });
        fishes.push({
          school: schools.length - 1,
          ox: 0,
          oy: 0,
          s: fs * 0.21,
          alpha: 0.95,
          tone: "tuna",
          ys: 1.45,
          ph: Math.random() * 10,
        });
      }
      fishes.sort((a, b) => a.alpha - b.alpha);

      bubbles = Array.from({ length: 16 }, () => ({
        x: L.x0 + Math.random() * textWidth,
        p: Math.random(),
        sp: 0.05 + Math.random() * 0.1,
        r: fs * (0.003 + Math.random() * 0.007),
        w: Math.random() * 10,
      }));
      dust = Array.from({ length: 70 }, () => ({
        x: L.x0 + Math.random() * textWidth,
        p: Math.random(),
        sp: 0.008 + Math.random() * 0.02,
        r: fs * (0.0015 + Math.random() * 0.0035),
        w: Math.random() * 10,
      }));
    };

    /* su: gradyan, kostik ışık, ışık hüzmeleri, balıklar (dünya koordinatları) */
    const drawWater = (c, lv, dt) => {
      const { fs, top, bottom } = L;
      const x0 = L.x0 - fs * 0.15;
      const x1 = L.x1 + fs * 0.15;
      const A = fs * 0.014;
      const y0 = bottom + A * 3 - lv * (bottom - top + A * 6);
      const k1 = TWO_PI / (fs * 0.9);
      const k2 = TWO_PI / (fs * 0.5);
      const step = Math.max(4, fs * 0.03);
      const yAt = (x, ph, amp) =>
        y0 +
        amp * Math.sin(x * k1 + time * 1.8 + ph) +
        amp * 0.6 * Math.sin(x * k2 - time * 1.2 + ph);
      const depthH = bottom - top;

      // arkadaki ince dalga bandı
      const back = new Path2D();
      back.moveTo(x0, yAt(x0, 1.7, A) - A * 1.3);
      for (let x = x0; x <= x1; x += step)
        back.lineTo(x, yAt(x, 1.7, A) - A * 1.3);
      back.lineTo(x1, bottom + A * 8);
      back.lineTo(x0, bottom + A * 8);
      back.closePath();
      c.fillStyle = "rgba(30,255,250,0.2)";
      c.fill(back);

      const body = new Path2D();
      const line = new Path2D();
      body.moveTo(x0, yAt(x0, 0, A));
      line.moveTo(x0, yAt(x0, 0, A));
      for (let x = x0; x <= x1; x += step) {
        const y = yAt(x, 0, A);
        body.lineTo(x, y);
        line.lineTo(x, y);
      }
      body.lineTo(x1, bottom + A * 8);
      body.lineTo(x0, bottom + A * 8);
      body.closePath();

      const g = c.createLinearGradient(0, y0 - A, 0, y0 + depthH * 1.05);
      // sitedeki su renkleriyle aynı: tepe #1efffa, yüzey #4590b4, derinlik #01657d
      g.addColorStop(0, "#1efffa");
      g.addColorStop(0.18, "#3ec4d6");
      g.addColorStop(0.5, "#3aa3c0");
      g.addColorStop(1, "#1a86a6");
      c.fillStyle = g;
      c.fill(body);

      c.save();
      c.clip(body);

      // kostik (su altı ışık ağı), iki katman ters yönde kayar
      if (causticPat) {
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.3;
        const layers = [
          [(fs * 1.0) / 256, time * fs * 0.025, time * fs * 0.012],
          [(fs * 0.62) / 256, -time * fs * 0.02, time * fs * 0.018],
        ];
        layers.forEach(([sc, tx, ty]) => {
          causticPat.setTransform(new DOMMatrix().translate(tx, ty).scale(sc));
          c.fillStyle = causticPat;
          c.fillRect(x0, y0 - A * 2, x1 - x0, bottom - y0 + A * 10);
        });
        c.globalAlpha = 1;
        c.globalCompositeOperation = "source-over";
      }

      // ışık hüzmeleri
      const rg = c.createLinearGradient(0, y0, 0, bottom);
      rg.addColorStop(0, "rgba(200,250,255,0.17)");
      rg.addColorStop(1, "rgba(200,250,255,0)");
      c.globalCompositeOperation = "lighter";
      c.fillStyle = rg;
      for (let i = 0; i < 5; i++) {
        const bx =
          x0 +
          ((i + 0.5) / 5) * (x1 - x0) +
          Math.sin(time * 0.25 + i * 1.7) * fs * 0.08;
        const tw = fs * 0.03;
        const bw = fs * (0.14 + 0.05 * Math.sin(i * 2.3));
        c.beginPath();
        c.moveTo(bx - tw, y0);
        c.lineTo(bx + tw, y0);
        c.lineTo(bx + bw + fs * 0.18, bottom);
        c.lineTo(bx - bw + fs * 0.18, bottom);
        c.fill();
      }
      c.globalCompositeOperation = "source-over";

      // derinlik karartması
      const dg = c.createLinearGradient(0, y0, 0, y0 + depthH * 1.0);
      dg.addColorStop(0, "rgba(1,101,125,0)");
      dg.addColorStop(1, "rgba(1,101,125,0.28)");
      c.fillStyle = dg;
      c.fillRect(x0, y0 - A * 2, x1 - x0, bottom - y0 + A * 10);

      // plankton
      c.fillStyle = "rgba(210,245,250,0.28)";
      c.beginPath();
      dust.forEach((p) => {
        const f = (p.p + time * p.sp) % 1;
        const dy = bottom - f * (depthH + fs * 0.05);
        const dx = p.x + Math.sin(time * 0.3 + p.w) * fs * 0.03;
        c.moveTo(dx + p.r, dy);
        c.arc(dx, dy, p.r, 0, TWO_PI);
      });
      c.fill();

      // balıklar
      schools.forEach((s) => {
        s.x += s.dir * s.speed * dt;
        const m = fs * 0.3;
        if (s.dir > 0 && s.x > x1 + m) s.x = x0 - m;
        if (s.dir < 0 && s.x < x0 - m) s.x = x1 + m;
      });
      fishes.forEach((f) => {
        const s = schools[f.school];
        const lo = y0 + f.s * 0.7;
        const hi = bottom - f.s * 0.5;
        const y =
          lo +
          s.t * Math.max(0, hi - lo) +
          f.oy +
          Math.sin(time * 1.1 + f.ph) * f.s * 0.12;
        const x = s.x + f.ox + Math.sin(time * 0.8 + f.ph) * fs * 0.01;
        c.save();
        c.translate(x, y);
        drawFish(
          c,
          f.s,
          s.dir,
          time * (9 + (f.ph % 3)) + f.ph,
          f.alpha,
          f.tone,
          f.ys,
        );
        c.restore();
      });

      // baloncuklar
      c.lineWidth = Math.max(0.6, fs * 0.0025);
      c.strokeStyle = "rgba(230,252,255,0.55)";
      c.fillStyle = "rgba(255,255,255,0.1)";
      bubbles.forEach((b) => {
        const f = (time * b.sp + b.p) % 1;
        const by = bottom - f * (depthH + fs * 0.1);
        const bx = b.x + Math.sin(time * 1.6 + b.w) * fs * 0.01;
        c.beginPath();
        c.arc(bx, by, b.r, 0, TWO_PI);
        c.fill();
        c.stroke();
      });
      c.restore();

      // yüzey (menisküs) parlaması
      c.lineJoin = "round";
      c.strokeStyle = "rgba(170,240,250,0.25)";
      c.lineWidth = fs * 0.016;
      c.stroke(line);
      c.strokeStyle = "rgba(235,253,255,0.85)";
      c.lineWidth = fs * 0.0035;
      c.stroke(line);
    };

    /* "Begin" → dalış hedefi: ortaya yakın, harfin en kalın iç noktası */
    const prepareDive = () => {
      const c = document.createElement("canvas");
      c.width = Math.round(W);
      c.height = Math.round(H);
      const x = c.getContext("2d", { willReadFrequently: true });
      wordPath(x);
      x.fillStyle = "#fff";
      paintWord(x, "fill");
      const w = c.width;
      const h = c.height;
      const data = x.getImageData(0, 0, w, h).data;
      const solid = (px, py) => {
        const ix = px | 0;
        const iy = py | 0;
        return (
          ix >= 0 &&
          iy >= 0 &&
          ix < w &&
          iy < h &&
          data[(iy * w + ix) * 4 + 3] > 128
        );
      };
      let best = null;
      const range = L.textWidth * 0.3;
      for (let y = L.top; y <= L.bottom; y += 4) {
        for (let xx = L.cx - range; xx <= L.cx + range; xx += 4) {
          if (!solid(xx, y)) continue;
          let r = 3;
          outer: for (; r < L.fs * 0.3; r += 3) {
            for (let a = 0; a < 12; a++) {
              const ang = (a * Math.PI) / 6;
              if (!solid(xx + Math.cos(ang) * r, y + Math.sin(ang) * r))
                break outer;
            }
          }
          const score = r - Math.hypot(xx - L.cx, y - L.cy) * 0.04;
          if (!best || score > best.score) best = { x: xx, y, r, score };
        }
      }
      if (!best) best = { x: L.cx, y: L.cy, r: L.fs * 0.08 };
      const halfDiag = Math.hypot(W, H) / 2;
      dive.tx = best.x;
      dive.ty = best.y;
      dive.rEdge = best.r;
      dive.zMax = Math.min(150, Math.max(8, (1.2 * halfDiag) / best.r));
    };

    const frame = (now) => {
      if (disposed) return;
      const s = startedRef.current;
      if (s.value && now - s.at > 900) return; // geçiş bitti, döngüyü durdur
      raf = requestAnimationFrame(frame);

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      if (!L) return;

      let tt = 0;
      if (dive.start != null)
        tt = Math.min(1, (now - dive.start) / DIVE_DURATION);
      const e = easeInOutCubic(tt);
      const z = dive.start == null ? 1 : Math.exp(Math.log(dive.zMax) * e);
      const px = W / 2 + (dive.tx - W / 2) * e;
      const py = H / 2 + (dive.ty - H / 2) * e;

      const target =
        dive.start != null ? 1 : Math.min(1, progressRef.current / 100);
      lvl += (target - lvl) * Math.min(1, dt * 2.6);
      if (target - lvl < 0.0005) lvl = target;

      // duvar
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(wall, 0, 0);

      // dalış sırasında çizgiler yumuşakça kaybolur
      const ratio =
        dive.start != null ? (dive.rEdge * z) / Math.hypot(W, H) : 0;
      const eA = 1 - smooth(0.3, 0.58, ratio);
      const edges = eA > 0.01;

      setT(ctx, z, px, py);
      wordPath(ctx);

      // sprey saçılması (overspray)
      if (edges && z < 5 && specks.length) {
        ctx.fillStyle = `rgba(${PAL.spray},0.38)`;
        ctx.beginPath();
        for (let i = 0; i < specks.length; i += 3) {
          ctx.moveTo(specks[i] + specks[i + 2], specks[i + 1]);
          ctx.arc(specks[i], specks[i + 1], specks[i + 2], 0, TWO_PI);
        }
        ctx.fill();
      }

      // mercan çizgisi: koyu dış kontur + pembe mercan çizgi + polip kabarcıkları
      if (edges) {
        const rim = L.fs * 0.012;
        ctx.save();
        ctx.globalAlpha = eA;
        ctx.lineJoin = "round";
        if (z < 2.5) {
          ctx.shadowColor = PAL.glow;
          ctx.shadowBlur = dpr * 26;
        }
        ctx.strokeStyle = PAL.dark;
        ctx.lineWidth = L.fs * 0.1;
        paintWord(ctx, "stroke");
        ctx.fillStyle = PAL.dark;
        ctx.beginPath();
        polyps.forEach((p) => {
          ctx.moveTo(p.x + p.r + rim, p.y);
          ctx.arc(p.x, p.y, p.r + rim, 0, TWO_PI);
        });
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = eA;
        ctx.lineJoin = "round";
        const cg = ctx.createLinearGradient(0, L.top, 0, L.bottom);
        cg.addColorStop(0, PAL.lineLight);
        cg.addColorStop(0.45, PAL.line);
        cg.addColorStop(1, PAL.lineDeep);
        ctx.strokeStyle = cg;
        ctx.lineWidth = L.fs * 0.064;
        paintWord(ctx, "stroke");
        ctx.fillStyle = cg;
        ctx.beginPath();
        polyps.forEach((p) => {
          ctx.moveTo(p.x + p.r, p.y);
          ctx.arc(p.x, p.y, p.r, 0, TWO_PI);
        });
        ctx.fill();
        // polip çukuru + parlak nokta
        ctx.fillStyle = PAL.polyp;
        ctx.beginPath();
        polyps.forEach((p) => {
          if (p.r < L.fs * 0.012) return;
          ctx.moveTo(p.x + p.r * 0.38, p.y);
          ctx.arc(p.x, p.y, p.r * 0.38, 0, TWO_PI);
        });
        ctx.fill();
        ctx.fillStyle = "rgba(255,240,235,0.55)";
        ctx.beginPath();
        polyps.forEach((p) => {
          ctx.moveTo(p.x - p.r * 0.35 + p.r * 0.2, p.y - p.r * 0.4);
          ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.4, p.r * 0.2, 0, TWO_PI);
        });
        ctx.fill();
        ctx.restore();
      }

      // boş harf: koyu cam gövde (çizginin iç yarısını kapatır)
      const gg = ctx.createLinearGradient(0, L.top, 0, L.bottom);
      gg.addColorStop(0, "#0f2f3a");
      gg.addColorStop(1, "#071a22");
      ctx.fillStyle = gg;
      paintWord(ctx, "fill");

      // harf maskesi
      mctx.setTransform(1, 0, 0, 1, 0, 0);
      mctx.clearRect(0, 0, mask.width, mask.height);
      setT(mctx, z, px, py);
      wordPath(mctx);
      mctx.fillStyle = "#fff";
      paintWord(mctx, "fill");

      // su katmanı → harflerin içine kırp
      wctx.setTransform(1, 0, 0, 1, 0, 0);
      wctx.globalCompositeOperation = "source-over";
      wctx.clearRect(0, 0, water.width, water.height);
      if (lvl > 0.001) {
        setT(wctx, z, px, py);
        drawWater(wctx, lvl, dt);
        wctx.setTransform(1, 0, 0, 1, 0, 0);
        wctx.globalCompositeOperation = "destination-in";
        wctx.drawImage(mask, 0, 0);

        // cam etkisi: iç kenar gölgesi, parlak kenar, üstten yansıma
        wctx.globalCompositeOperation = "source-atop";
        setT(wctx, z, px, py);
        wordPath(wctx);
        if (edges) {
          wctx.strokeStyle = "rgba(1,80,102,0.22)";
          wctx.lineWidth = L.fs * 0.03;
          paintWord(wctx, "stroke");
          wctx.strokeStyle = "rgba(200,245,255,0.4)";
          wctx.lineWidth = L.fs * 0.01;
          paintWord(wctx, "stroke");
        }
        const sg = wctx.createLinearGradient(
          0,
          L.top,
          0,
          L.top + (L.bottom - L.top) * 0.55,
        );
        sg.addColorStop(0, "rgba(255,255,255,0.15)");
        sg.addColorStop(1, "rgba(255,255,255,0)");
        wctx.fillStyle = sg;
        wctx.fillRect(
          L.x0 - L.fs,
          L.top - L.fs,
          L.textWidth + L.fs * 2,
          L.fs * 3,
        );
        wctx.globalCompositeOperation = "source-over";

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(water, 0, 0);
      }

      // boya damlaları: çizgiyle aynı renk, su dolunca harflerden akar
      if (edges && z < 6) {
        setT(ctx, z, px, py);
        const rim = L.fs * 0.011;
        const lineW = L.fs * 0.032; // çizginin harf dışına taşan kalınlığı
        const shape = (d, hw, top, yb) => {
          ctx.beginPath();
          ctx.moveTo(d.x - hw * 1.7, top);
          ctx.lineTo(d.x + hw * 1.7, top);
          ctx.quadraticCurveTo(
            d.x + hw * 0.7,
            top + (yb - top) * 0.35,
            d.x + hw * 0.6,
            yb - hw * 1.3,
          );
          ctx.arc(d.x, yb - hw * 1.3, hw * 1.35, 0, Math.PI);
          ctx.quadraticCurveTo(
            d.x - hw * 0.7,
            top + (yb - top) * 0.35,
            d.x - hw * 1.7,
            top,
          );
          ctx.closePath();
          ctx.fill();
        };
        drips.forEach((d) => {
          const g = smooth(d.at, Math.min(1.05, d.at + 0.3), lvl);
          if (g < 0.01) return;
          const wob = Math.sin(time * 1.4 + d.ph) * L.fs * 0.004 * g;
          const len = d.len * g + wob;
          const yb = d.y + lineW + len;
          const hw = d.w * 0.5;
          ctx.globalAlpha = eA;
          // koyu kenar (çizginin koyu konturuyla aynı dil)
          ctx.fillStyle = PAL.dark;
          shape(d, hw + rim, d.y + lineW, yb + rim);
          // renkli gövde
          const dg = ctx.createLinearGradient(0, d.y, 0, yb);
          dg.addColorStop(0, PAL.line);
          dg.addColorStop(1, PAL.lineDeep);
          ctx.fillStyle = dg;
          shape(d, hw, d.y + lineW * 0.25, yb);
          // damla parlaması
          ctx.fillStyle = "rgba(255,240,225,0.5)";
          ctx.beginPath();
          ctx.ellipse(
            d.x - hw * 0.45,
            yb - hw * 1.4,
            hw * 0.28,
            hw * 0.6,
            0,
            0,
            TWO_PI,
          );
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      // harfin iç kenarında ince parlak çizgi
      if (edges) {
        setT(ctx, z, px, py);
        ctx.save();
        ctx.globalAlpha = eA;
        ctx.lineJoin = "round";
        ctx.strokeStyle = PAL.shine;
        ctx.lineWidth = L.fs * 0.007;
        paintWord(ctx, "stroke");
        ctx.restore();
      }

      // sona doğru site rengine karış
      if (dive.start != null) {
        const a = smooth(0.7, 1, tt);
        if (a > 0) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.fillStyle = `rgba(${SITE_BG[0]},${SITE_BG[1]},${SITE_BG[2]},${a})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (tt >= 1 && !dive.ended) {
          dive.ended = true;
          if (dive.onEnd) dive.onEnd();
        }
      }
    };

    layout();
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => !disposed && layout(), 150);
    };
    window.addEventListener("resize", onResize);
    if (document.fonts && document.fonts.load) {
      document.fonts
        .load(fontStr(100), WORD)
        .then(() => !disposed && layout())
        .catch(() => {});
    }
    raf = requestAnimationFrame(frame);

    engineRef.current = {
      startDive: (cb) => {
        if (!L || dive.start != null) return;
        prepareDive();
        dive.onEnd = cb;
        dive.start = performance.now();
      },
    };

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      engineRef.current = null;
    };
  }, []);

  const canStart = displayProgress >= 100 && !!level;

  const handleBegin = () => {
    if (!canStart || diving) return;
    setDiving(true);
    engineRef.current?.startDive(() => onStartedRef.current?.());
  };

  return (
    <div className={`reef-loader ${started ? "reef-loader--done" : ""}`}>
      <canvas ref={canvasRef} className="reef-loader__canvas" />
      <div
        className={`reef-loader__ui ${diving ? "reef-loader__ui--hidden" : ""}`}
      >
        <button
          className={`reef-loader__button ${canStart ? "reef-loader__button--ready" : ""}`}
          disabled={!canStart}
          onClick={handleBegin}
        >
          {canStart ? "Begin" : `${Math.floor(displayProgress)}%`}
        </button>
        <p className="reef-loader__link">{t("loadingLikeSite")}</p>
        <p className="reef-loader__credit">{t("credit")}</p>
      </div>
    </div>
  );
};
