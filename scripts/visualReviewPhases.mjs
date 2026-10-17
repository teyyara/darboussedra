export const CAMERA_PHASE_RULES = {
  "lower-stair-flight": { y: [2.9, 4.25], z: [-4.2, -1.0] },
  "upper-side-landing": { x: [0.55, null], y: [4.4, 4.9], z: [-4.1, -0.6] },
  "roof-stair-flight": { y: [5.1, 7.1], z: [-2.75, 2.0] },
  // Hatch clearance is a height/zone/window condition; requiring x > 1 missed the
  // actual opening, because the camera is still near the stair centre when it rises.
  "roof-hatch-clear": { zone: "roof", y: [6.7, null], z: [-3.1, -0.7] },
  "front-door-clear": { zone: "outside", z: [4.96, null] },
};
export function isCameraPhaseMatch(phase, frame) {
  const rule = CAMERA_PHASE_RULES[phase];
  if (!rule || !frame || !Array.isArray(frame.position) || frame.position.length !== 3) return false;
  if (rule.zone && frame.zone !== rule.zone) return false;
  const [x, y, z] = frame.position;
  const within = (value, bounds) => !bounds ||
    ((bounds[0] == null || value > bounds[0]) && (bounds[1] == null || value < bounds[1]));
  return within(x, rule.x) && within(y, rule.y) && within(z, rule.z);
}
