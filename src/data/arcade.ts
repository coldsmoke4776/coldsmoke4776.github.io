export type ArcadeExperience = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  links: { label: string; href: string }[];
  terminal?: {
    caption: string;
    scriptPath: string;
    wasmPath: string;
    factoryName?: string;
  };
};

export const ARCADE_EXPERIENCES: ArcadeExperience[] = [
  {
    slug: "cndnd",
    title: "C&D&D Terminal RPG",
    description:
      "My first ever game I built with my own hands in C. Just loads a party file with existing info and runs an encounter with real RNG and turn-based combat. It's a little slow (10-20secs) but you should get a different result every time!",
    tags: ["CLI", "RPG",],
    links: [
      { label: "Read the repo", href: "https://github.com/coldsmoke4776/cndnd" },
    ],
    terminal: {
      caption: "Live C&D&D run",
      scriptPath: "/arcade/cndnd.js",
      wasmPath: "/arcade/cndnd.wasm",
      factoryName: "createCndndModule",
    },
  },
  {
    slug: "rollhighordie",
    title: "Roll High Or Die",
    description:
      "A procedural 3D arcade runner built from scratch in C++ using Raylib. Jump across dynamically generated platforms, chase your best distance, and don’t fall. Built as part of a deeper dive into low-level graphics, physics tuning, and real-time game systems in C++.",
    tags: ["Itch.io", "Platformer",],
    links: [
      { label: "Read the repo", href: "https://github.com/coldsmoke4776/rollhighordie/tree/main" },
    ],
  },
];
