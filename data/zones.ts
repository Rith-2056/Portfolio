export type ZoneId = "about" | "experience" | "research" | "projects" | "skills" | "education" | "contact";

export type Zone = {
  id: ZoneId;
  label: string;
  /** short terminal-style code shown in the HUD */
  code: string;
  /** world position (x, z) of the zone's center */
  position: [number, number];
  /** radius at which the interact prompt appears */
  triggerRadius: number;
  /** radius of the solid collider (0 = walkable) */
  colliderRadius: number;
  /** where the camera looks when the zone is activated */
  focus: [number, number, number];
  /** where the rover is placed when jumping via nav */
  spawn: [number, number];
  description: string;
  navLabel: string;
  inNav: boolean;
};

export const zones: Zone[] = [
  {
    id: "about",
    label: "Central Hub",
    code: "HUB-00",
    position: [0, 0],
    triggerRadius: 4.2,
    colliderRadius: 1.15,
    focus: [0, 1.6, 0],
    spawn: [0, 4.5],
    description: "About",
    navLabel: "ABOUT",
    inNav: true,
  },
  {
    id: "experience",
    label: "Data Center",
    code: "DC-01",
    position: [-14, -9],
    triggerRadius: 5.2,
    colliderRadius: 3.4,
    focus: [-14, 1.4, -9],
    spawn: [-9.5, -5],
    description: "Experience",
    navLabel: "EXPERIENCE",
    inNav: true,
  },
  {
    id: "research",
    label: "Robotics Lab",
    code: "LAB-02",
    position: [14, -9],
    triggerRadius: 5.2,
    colliderRadius: 3.2,
    focus: [14, 1.2, -9],
    spawn: [9.5, -5],
    description: "Research",
    navLabel: "RESEARCH",
    inNav: false,
  },
  {
    id: "projects",
    label: "Workshop",
    code: "WS-03",
    position: [-13, 10],
    triggerRadius: 5,
    colliderRadius: 3,
    focus: [-13, 1.5, 10],
    spawn: [-8.5, 6.5],
    description: "Projects",
    navLabel: "PROJECTS",
    inNav: true,
  },
  {
    id: "skills",
    label: "Constellation",
    code: "CON-04",
    position: [13, 10],
    triggerRadius: 5,
    colliderRadius: 1.2,
    focus: [13, 3.2, 10],
    spawn: [8.5, 6.5],
    description: "Skills",
    navLabel: "SKILLS",
    inNav: true,
  },
  {
    id: "education",
    label: "Academy",
    code: "EDU-05",
    position: [0, 17.5],
    triggerRadius: 4.2,
    colliderRadius: 2.2,
    focus: [0, 1.5, 17.5],
    spawn: [0, 12.5],
    description: "Education",
    navLabel: "EDUCATION",
    inNav: false,
  },
  {
    id: "contact",
    label: "Comms Tower",
    code: "TX-06",
    position: [0, -19],
    triggerRadius: 4.5,
    colliderRadius: 1.6,
    focus: [0, 3, -19],
    spawn: [0, -14],
    description: "Contact",
    navLabel: "CONTACT",
    inNav: true,
  },
];

export const zoneById = Object.fromEntries(zones.map((z) => [z.id, z])) as Record<ZoneId, Zone>;

/** Island footprint radius (rover is kept inside this). */
export const ISLAND_RADIUS = 24;
