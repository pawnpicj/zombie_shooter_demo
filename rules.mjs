export const ARENA = 23;
export const MAGAZINE = 30;
export function waveConfig(wave) {
  return { total: 8 + wave * 4, interval: Math.max(.18, .8 - wave * .035), health: 24 + wave * 4, speed: Math.min(4.4, 1.6 + wave * .12) };
}
export function segmentHit(ax, az, bx, bz, x, z, radius) {
  const dx = bx - ax, dz = bz - az;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
  return (ax + t * dx - x) ** 2 + (az + t * dz - z) ** 2 <= radius ** 2;
}
export function moveCircle(pos, dx, dz, radius, obstacles, bound = ARENA) {
  for (const axis of ['x', 'z']) {
    pos[axis] = Math.max(-bound + radius, Math.min(bound - radius, pos[axis] + (axis === 'x' ? dx : dz)));
    for (const o of obstacles) {
      const cx = Math.max(o.x - o.w / 2, Math.min(pos.x, o.x + o.w / 2));
      const cz = Math.max(o.z - o.d / 2, Math.min(pos.z, o.z + o.d / 2));
      const vx = pos.x - cx, vz = pos.z - cz, distance = Math.hypot(vx, vz);
      if (distance < radius) {
        if (distance > .0001) { pos.x += vx / distance * (radius - distance); pos.z += vz / distance * (radius - distance); }
        else {
          const faces = [{axis:'x',v:o.x-o.w/2-radius},{axis:'x',v:o.x+o.w/2+radius},{axis:'z',v:o.z-o.d/2-radius},{axis:'z',v:o.z+o.d/2+radius}];
          faces.sort((a,b)=>Math.abs(pos[a.axis]-a.v)-Math.abs(pos[b.axis]-b.v));
          pos[faces[0].axis]=faces[0].v;
        }
      }
    }
  }
  pos.x = Math.max(-bound + radius, Math.min(bound - radius, pos.x));
  pos.z = Math.max(-bound + radius, Math.min(bound - radius, pos.z));
  return pos;
}
