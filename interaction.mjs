// Shared target contract: id, action, position, distance, available, priority, activate.
export function selectInteraction(position, targets) {
  return targets
    .filter(target => target.available && Math.hypot(position.x-target.position.x, position.z-target.position.z) < target.distance)
    .sort((a,b) => (b.priority ?? 0)-(a.priority ?? 0))[0] ?? null;
}
