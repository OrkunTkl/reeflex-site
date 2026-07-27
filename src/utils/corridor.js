// Real floor-height anchor points, derived from the actual MODULE positions
// (UpBlock/LineHouse/Rague) — not the text positions. Modules sit ON the
// seafloor, so their Y coordinates are a much better proxy for real floor
// height than the floating title text was. This was the root cause of
// structures appearing to float: the old anchors used text Y values, which
// sit at a completely different height than the seafloor.
//
// The Z values near the start were re-derived from the real camera curve's
// actual path (see CameraPath.jsx) to fix rocks clipping through the
// camera. The Y values here are the SEAFLOOR depth, which must stay well
// BELOW the camera's own height at every point — the real camera's Y near
// the start is ~0.75-1.07, so the floor sits ~1.7-2 units under that.
const ANCHORS = [
  { x: 7.76, y: -1.0, z: -3.02 },
  { x: 4.72, y: -0.95, z: 0.29 },
  { x: 0, y: -0.9, z: 4.04 },
  { x: -2.29, y: -0.87, z: 3.36 },
  { x: -8, y: -0.85, z: -2.9 },
  { x: -10, y: -0.85, z: -7 },
  { x: -12, y: -0.85, z: -7 },
  { x: -19.5, y: -2.2, z: -8.5 },
  { x: -28, y: -4.35, z: -9.5 },
  { x: -35, y: -6.0, z: -13 },
  { x: -38, y: -6.9, z: -8 },
  { x: -45.6, y: -8.1, z: -6 },
  { x: -54, y: -9.5, z: -4.3 },
  { x: -65, y: -10.1, z: -2.0 },
  { x: -80, y: -10.4, z: -2.0 },
];

function interp(x, key) {
  if (x >= ANCHORS[0].x) return ANCHORS[0][key];
  if (x <= ANCHORS[ANCHORS.length - 1].x) return ANCHORS[ANCHORS.length - 1][key];
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const a = ANCHORS[i];
    const b = ANCHORS[i + 1];
    if (x <= a.x && x >= b.x) {
      const t = (a.x - x) / (a.x - b.x || 1);
      return a[key] + (b[key] - a[key]) * t;
    }
  }
  return ANCHORS[ANCHORS.length - 1][key];
}

// Real seafloor height/depth at a given X — modules and rocks should sit
// ON this (with a small negative embed offset), not float above it.
export function corridorY(x) {
  return interp(x, 'y');
}

export function corridorZ(x) {
  return interp(x, 'z');
}

export function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
