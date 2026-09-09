/** Shared mutable rover state read by the camera and zone visuals every frame. */
export const roverState = {
  x: 0,
  z: 6,
  heading: Math.PI, // facing -z (toward the hub)
  speed: 0,
  vx: 0,
  vz: 0,
};

/** Shared camera orbit input written by pointer handlers, read by the camera rig. */
export const cameraInput = {
  yaw: 0.35,
  targetYaw: 0.35,
  distance: 17,
  targetDistance: 17,
  dragging: false,
  /** normalised pointer position, for subtle parallax */
  px: 0,
  py: 0,
};
