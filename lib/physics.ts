import { zones, ISLAND_RADIUS } from "@/data/zones";

export type Body = { x: number; z: number; vx: number; vz: number };

const colliders = zones
  .filter((z) => z.colliderRadius > 0)
  .map((z) => ({ x: z.position[0], z: z.position[1], r: z.colliderRadius }));

/** Extra decorative colliders (rocks, props) in world space. */
export const propColliders: { x: number; z: number; r: number }[] = [
  { x: -6, z: -16, r: 1.1 },
  { x: 7, z: -17, r: 0.9 },
  { x: 19, z: 1, r: 1.2 },
  { x: -19.5, z: 1.5, r: 1.0 },
  { x: 6.5, z: 17, r: 0.9 },
  { x: -7, z: 17.5, r: 1.0 },
];

const all = [...colliders, ...propColliders];

/**
 * Resolve a circle body of radius `r` against zone colliders and the island edge.
 * Mutates the body in place. Returns true if a collision happened this step.
 */
export function resolveCollisions(body: Body, r: number): boolean {
  let hit = false;
  for (const c of all) {
    const dx = body.x - c.x;
    const dz = body.z - c.z;
    const min = c.r + r;
    const d2 = dx * dx + dz * dz;
    if (d2 < min * min && d2 > 1e-6) {
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const nz = dz / d;
      const push = min - d;
      body.x += nx * push;
      body.z += nz * push;
      // reflect velocity along the normal with heavy damping
      const vn = body.vx * nx + body.vz * nz;
      if (vn < 0) {
        body.vx -= nx * vn * 1.4;
        body.vz -= nz * vn * 1.4;
      }
      hit = true;
    }
  }
  // island edge: soft wall
  const edge = ISLAND_RADIUS - 1.2 - r;
  const dist = Math.hypot(body.x, body.z);
  if (dist > edge) {
    const nx = body.x / dist;
    const nz = body.z / dist;
    body.x = nx * edge;
    body.z = nz * edge;
    const vn = body.vx * nx + body.vz * nz;
    if (vn > 0) {
      body.vx -= nx * vn * 1.5;
      body.vz -= nz * vn * 1.5;
    }
    hit = true;
  }
  return hit;
}

export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function dampAngle(current: number, target: number, lambda: number, dt: number) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * (1 - Math.exp(-lambda * dt));
}
