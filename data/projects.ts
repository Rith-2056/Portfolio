export type Project = {
  id: string;
  name: string;
  kind: string;
  artifact: "browser" | "terminal" | "network";
  description: string;
  technologies: string[];
  highlights: string[];
};

export const projects: Project[] = [
  {
    id: "zooreviews",
    name: "ZooReviews",
    kind: "Chrome extension",
    artifact: "browser",
    description:
      "A browser extension that rewrites the review experience in place, parsing live page DOM and serving batched GraphQL data from the edge.",
    technologies: ["TypeScript", "GraphQL", "React", "DOM Manipulation"],
    highlights: [
      "5,000+ peak concurrent users",
      "Sub-100ms load times",
      "10K+ RPM traffic",
      "GraphQL request batching",
      "Redis edge caching",
      "Dynamic DOM parsing",
    ],
  },
  {
    id: "companion",
    name: "AI Mental Health Companion",
    kind: "LLM application",
    artifact: "terminal",
    description:
      "A conversational assistant that classifies emotional state in real time and adapts its responses, backed by Gemini and Cloud Firestore.",
    technologies: ["Python", "Gemini API", "Cloud Firestore", "Streamlit"],
    highlights: [
      "85% classification precision",
      "500+ simulated profiles",
      "Real-time inference",
      "GCP / Firestore architecture",
    ],
  },
  {
    id: "skillswap",
    name: "SkillSwap Platform",
    kind: "Web platform",
    artifact: "network",
    description:
      "A peer skill-exchange network where an LLM tags what people can teach and learn, then matches them on micro-skills.",
    technologies: ["React", "Firebase", "Tailwind CSS", "OpenAI API"],
    highlights: [
      "200+ beta users",
      "50% reduction in form completion time",
      "35%+ improvement in micro-skill matching",
      "LLM-powered intelligent tagging",
    ],
  },
];
