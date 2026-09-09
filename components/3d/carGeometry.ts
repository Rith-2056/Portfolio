import * as THREE from "three";

/**
 * One cross-section of the hull, mirrored across x.
 * Each station is a hexagon: a flat floor, a wide shoulder line, and a narrower roof.
 */
export type Station = {
  z: number;
  /** half-width at the floor, the shoulder (widest point) and the roof */
  wb: number;
  wm: number;
  wt: number;
  /** height of the floor, the shoulder and the roof */
  yb: number;
  ym: number;
  yt: number;
};

function ring(s: Station): number[][] {
  return [
    [-s.wb, s.yb],
    [s.wb, s.yb],
    [s.wm, s.ym],
    [s.wt, s.yt],
    [-s.wt, s.yt],
    [-s.wm, s.ym],
  ];
}

/**
 * Loft a closed hull through the given cross-sections, front (largest z) first.
 * Produces a hard-edged low-poly body: roughly 12 triangles per segment.
 */
export function loftHull(stations: Station[]): THREE.BufferGeometry {
  const rings = stations.map(ring);
  const pos: number[] = [];
  const push = (r: number[][], i: number, z: number) => pos.push(r[i][0], r[i][1], z);

  for (let s = 0; s < rings.length - 1; s++) {
    const a = rings[s];
    const b = rings[s + 1];
    const za = stations[s].z;
    const zb = stations[s + 1].z;
    for (let k = 0; k < 6; k++) {
      const n = (k + 1) % 6;
      // quad a[k] -> a[n] -> b[n] -> b[k]
      push(a, k, za);
      push(b, k, zb);
      push(b, n, zb);

      push(a, k, za);
      push(b, n, zb);
      push(a, n, za);
    }
  }

  // caps, as simple fans around the first and last rings
  const cap = (r: number[][], z: number, flip: boolean) => {
    for (let k = 1; k < 5; k++) {
      const tri = [0, k, k + 1];
      if (flip) tri.reverse();
      for (const i of tri) push(r, i, z);
    }
  };
  cap(rings[0], stations[0].z, false);
  cap(rings[rings.length - 1], stations[stations.length - 1].z, true);

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Soft radial falloff used for the underglow, so it has no visible edges. */
export function radialGlowTexture(): THREE.Texture {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,150,80,0.9)");
    g.addColorStop(0.4, "rgba(255,106,31,0.34)");
    g.addColorStop(1, "rgba(255,106,31,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * A thin vertical ribbon that follows the hull's shoulder line on one side.
 * Used for the emissive light strip, so it always traces the widest silhouette
 * edge instead of sinking into the body where the hull flares.
 */
export function shoulderRibbon(stations: Station[], side: 1 | -1, height = 0.05, offset = 0.018): THREE.BufferGeometry {
  const pos: number[] = [];
  for (let s = 0; s < stations.length - 1; s++) {
    const a = stations[s];
    const b = stations[s + 1];
    const ax = side * (a.wm + offset);
    const bx = side * (b.wm + offset);
    const quad = [
      [ax, a.ym + height / 2, a.z],
      [ax, a.ym - height / 2, a.z],
      [bx, b.ym - height / 2, b.z],
      [bx, b.ym + height / 2, b.z],
    ];
    for (const i of [0, 1, 2, 0, 2, 3]) pos.push(quad[i][0], quad[i][1], quad[i][2]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
