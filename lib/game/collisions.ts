export interface Vec3 {
  x: number
  y: number
  z: number
}

export function spheresOverlap(
  a: Vec3,
  radiusA: number,
  b: Vec3,
  radiusB: number,
): boolean {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  const r = radiusA + radiusB
  return dx * dx + dy * dy + dz * dz <= r * r
}

/** Side-scroller hit test — ignore Z so perspective depth doesn't fake-miss. */
export function circlesOverlap2D(
  a: Vec3,
  radiusA: number,
  b: Vec3,
  radiusB: number,
): boolean {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const r = radiusA + radiusB
  return dx * dx + dy * dy <= r * r
}

export function distance2D(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}
