# RITH.OS — interactive portfolio

A small explorable 3D world for Divyarith "Rith" Shivashok, a Computer Science, Data Science and Statistics student at UMass Amherst working on LLMs, robotics, and data infrastructure.

You drive a Batmobile around a floating island. Each location on the island is a section of the portfolio. Approach one, press `E`, and a clean 2D panel materialises with the content.

The car is a low-poly hull lofted through nine cross-sections, with a wedge nose, exposed rear wheels and a turbine that spools up with the throttle. Because the bodywork is near-black on a near-black island, readability comes from edge outlines, light strips that trace the widest line of the body, headlights, the turbine glow and a soft underglow, rather than from the paint.

## Controls

| Input | Action |
| --- | --- |
| `W A S D` / arrow keys | drive |
| `Shift` | boost |
| `E` / `Enter` / `Space` | interact with the nearby location |
| drag | orbit the camera |
| scroll | zoom |
| `Esc` | close a panel |
| `Tab` | keyboard navigation through the HUD and panels |

Phones and tablets get a 2D island map with the same content and the same panels.

## Locations

| Zone | Section |
| --- | --- |
| Central Hub | About |
| Data Center | Experience (FishEye Software, DARoS Lab, Necessary Behavior) |
| Robotics Lab | Research (opens the timeline on DARoS Lab) |
| Workshop | Projects |
| Constellation | Skills |
| Academy | Education and awards |
| Comms Tower | Contact |

## Stack

Next.js 16 (App Router) · TypeScript · React 19 · React Three Fiber · Three.js · Drei · Framer Motion · Tailwind CSS 4 · Zustand

## Layout

```
app/                 route, layout, global styles
components/
  3d/                the world: island, Batmobile, camera rig, zone wrapper, ambient effects
  3d/zones/          one file per location (Hub, DataCenter, RoboticsLab, Workshop, Constellation, Academy, CommsTower)
  ui/                HUD, intro, loader, panels, cursor, joystick, 2D mobile map
  sections/          2D content for each section
data/                all portfolio content (profile, experience, projects, skills, zone layout)
lib/                 store, input, physics, device detection, shared materials
```

The 3D world and the content layer only talk through the Zustand store, so either side can be changed alone. All résumé facts live in `data/`.

## Performance notes

- The canvas is loaded with `next/dynamic` and `ssr: false`, so the first HTML is tiny and fully static.
- No textures or model files. Every object, the car included, is procedural low-poly geometry with a shared set of materials, which keeps the download to code only and keeps draw calls low.
- LEDs, constellation nodes and floating rocks are instanced meshes. Particle systems are single `Points` objects.
- A cheap heuristic (`lib/device.ts`) sorts devices into high / medium / low tiers that control device pixel ratio, shadows, antialiasing, point lights, and particle counts.
- `prefers-reduced-motion` disables the intro camera sweep, drifting particles, idle animations, and Framer Motion transitions.
- Physics is a small custom step (circle colliders, island edge, damping), so there is no physics engine in the bundle.
- A server-rendered, visually hidden résumé is in the page for crawlers and assistive technology.

## Run

```bash
npm install
npm run dev
```

`npm run build` produces the static production build.
