export type Accomplishment = {
  id: string;
  metric: string;
  metricLabel: string;
  text: string;
  tags: string[];
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  status: "current" | "past" | "upcoming";
  kind: "industry" | "research";
  location?: string;
  summary: string;
  accomplishments: Accomplishment[];
};

export const experiences: Experience[] = [
  {
    id: "fisheye",
    company: "FishEye Software",
    role: "Software Engineering Intern",
    period: "May 2026 – Aug 2026",
    status: "current",
    kind: "industry",
    summary:
      "Data infrastructure and LLM pipelines for a production C++/Python platform.",
    accomplishments: [
      {
        id: "fe-1",
        metric: "50K+",
        metricLabel: "requests / day",
        text: "Engineered a 50K+ request/day LLM structured-output pipeline spanning local HDF5 and AWS S3 storage with 100% schema compliance.",
        tags: ["Python", "AWS", "S3", "HDF5", "LLM"],
      },
      {
        id: "fe-2",
        metric: "2M+",
        metricLabel: "events / day",
        text: "Built a scalable transport-agnostic data lake API in C++ handling 2M+ daily training telemetry events across REST, gRPC, and WebSocket backends.",
        tags: ["C++", "gRPC", "REST", "WebSocket"],
      },
      {
        id: "fe-3",
        metric: "−65%",
        metricLabel: "parse latency",
        text: "Reduced JSON parsing latency by 65% through standardized distributed serialization and runtime schema validation using Pydantic.",
        tags: ["Pydantic", "Python", "Serialization"],
      },
      {
        id: "fe-4",
        metric: "−43%",
        metricLabel: "CI/CD build time",
        text: "Reduced CI/CD build times by 43% by splitting a monolithic C++/Python architecture into four independently deployable Dockerized components.",
        tags: ["Docker", "CI/CD", "C++", "Python"],
      },
    ],
  },
  {
    id: "daros",
    company: "DARoS Lab — UMass Amherst",
    role: "Undergraduate Research Assistant — Robotics & LLMs",
    period: "May 2026 – Present",
    status: "current",
    kind: "research",
    summary:
      "Language-driven control and learned locomotion for quadruped robots.",
    accomplishments: [
      {
        id: "da-1",
        metric: "92%",
        metricLabel: "kinematic extraction accuracy",
        text: "92% kinematic extraction accuracy across 15+ complex commands by integrating LLM harnesses into quadruped control frameworks.",
        tags: ["LLM", "Robotics", "Control"],
      },
      {
        id: "da-2",
        metric: "+40%",
        metricLabel: "grasp success",
        text: "40% improvement in object grasping success using perception pipelines and inverse kinematics with PyTorch and Drake.",
        tags: ["PyTorch", "Drake", "Perception", "IK"],
      },
      {
        id: "da-3",
        metric: "3×",
        metricLabel: "fewer falls",
        text: "3× reduction in quadruped falls through distributed reinforcement-learning locomotion policies.",
        tags: ["Reinforcement Learning", "Distributed", "Locomotion"],
      },
    ],
  },
  {
    id: "necessary",
    company: "Necessary Behavior",
    role: "Software Engineering Intern",
    period: "Jun 2023 – Sep 2023",
    status: "past",
    kind: "industry",
    summary: "Semantic search and front-end platform work.",
    accomplishments: [
      {
        id: "nb-1",
        metric: "+30%",
        metricLabel: "query relevance",
        text: "Increased query relevance by 30% and user engagement by 25% using dense-vector semantic search.",
        tags: ["Semantic Search", "Vectors"],
      },
      {
        id: "nb-2",
        metric: "+40%",
        metricLabel: "feature delivery speed",
        text: "Increased feature delivery speed by 40% by building a scalable React/Redux component library.",
        tags: ["React", "Redux", "TypeScript"],
      },
    ],
  },
];
