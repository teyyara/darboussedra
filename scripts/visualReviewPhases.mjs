export const CAMERA_PHASE_RULES = {
  // Capture the upward/rightward look while the camera moves across the last three treads.
  "lower-stair-midflight": { x: [-0.2, 0.2], y: [3.04, 3.42], z: [-2.7, -2.1] },
  "lower-stair-clearance": { x: [-0.2, 0.2], y: [4.25, 4.93], z: [-4.38, -3.3] },
  "lower-stair-flight": { y: [2.9, 4.25], z: [-4.2, -1.0] },
  // Capture farther along the bridge, not at the same top-tread pose as the clearance still.
  "upper-side-landing": { x: [0.55, null], y: [4.4, 4.9], z: [-3.2, -2.4] },
  "roof-stair-flight": { y: [4.65, 6.6], z: [-2.75, 2.0] },
  // This capture is after the camera steps sideways out of the hatch, not while
  // the camera is still rising through the opening and seeing only sky.
  "roof-hatch-clear": { zone: "roof", x: [0.9, null], y: [6.7, null], z: [-3.1, -0.7] },
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
