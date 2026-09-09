export type SkillGroup = "Programming" | "AI / ML" | "Frameworks" | "Cloud / Infrastructure";

export type Skill = {
  name: string;
  group: SkillGroup;
  /** ids of experiences / projects this technology was used in */
  links: string[];
};

export const skillGroups: SkillGroup[] = [
  "Programming",
  "AI / ML",
  "Frameworks",
  "Cloud / Infrastructure",
];

export const skills: Skill[] = [
  // Programming
  { name: "Python", group: "Programming", links: ["fisheye", "daros", "companion"] },
  { name: "C++", group: "Programming", links: ["fisheye"] },
  { name: "TypeScript", group: "Programming", links: ["zooreviews", "necessary"] },
  { name: "JavaScript", group: "Programming", links: ["zooreviews", "skillswap", "necessary"] },
  { name: "Java", group: "Programming", links: [] },
  { name: "Go", group: "Programming", links: [] },
  { name: "SQL", group: "Programming", links: [] },
  // AI / ML
  { name: "PyTorch", group: "AI / ML", links: ["daros"] },
  { name: "TensorFlow", group: "AI / ML", links: [] },
  { name: "JAX", group: "AI / ML", links: [] },
  { name: "HuggingFace", group: "AI / ML", links: [] },
  { name: "Gemini", group: "AI / ML", links: ["companion"] },
  { name: "OpenAI", group: "AI / ML", links: ["skillswap"] },
  // Frameworks
  { name: "React", group: "Frameworks", links: ["zooreviews", "skillswap", "necessary"] },
  { name: "Next.js", group: "Frameworks", links: [] },
  { name: "FastAPI", group: "Frameworks", links: [] },
  { name: "Pydantic", group: "Frameworks", links: ["fisheye"] },
  { name: "Pandas", group: "Frameworks", links: [] },
  { name: "NumPy", group: "Frameworks", links: [] },
  { name: "Matplotlib", group: "Frameworks", links: [] },
  // Cloud / Infrastructure
  { name: "AWS", group: "Cloud / Infrastructure", links: ["fisheye"] },
  { name: "EC2", group: "Cloud / Infrastructure", links: [] },
  { name: "S3", group: "Cloud / Infrastructure", links: ["fisheye"] },
  { name: "Lambda", group: "Cloud / Infrastructure", links: [] },
  { name: "DynamoDB", group: "Cloud / Infrastructure", links: [] },
  { name: "GCP", group: "Cloud / Infrastructure", links: ["companion"] },
  { name: "Firestore", group: "Cloud / Infrastructure", links: ["companion"] },
  { name: "Docker", group: "Cloud / Infrastructure", links: ["fisheye"] },
  { name: "Git/GitHub", group: "Cloud / Infrastructure", links: ["fisheye", "daros", "zooreviews", "companion", "skillswap", "necessary"] },
  { name: "CI/CD", group: "Cloud / Infrastructure", links: ["fisheye"] },
];

/** Labels for link targets, so tooltips can name what a skill connects to. */
export const linkTargets: Record<string, { label: string; short: string; type: "experience" | "project" }> = {
  fisheye: { label: "FishEye Software", short: "FishEye", type: "experience" },
  daros: { label: "DARoS Lab", short: "DARoS Lab", type: "experience" },
  necessary: { label: "Necessary Behavior", short: "Necessary Behavior", type: "experience" },
  zooreviews: { label: "ZooReviews", short: "ZooReviews", type: "project" },
  companion: { label: "AI Mental Health Companion", short: "AI Companion", type: "project" },
  skillswap: { label: "SkillSwap", short: "SkillSwap", type: "project" },
};
