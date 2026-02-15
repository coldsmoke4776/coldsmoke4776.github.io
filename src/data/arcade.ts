export type ArcadeExperience = {
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
    title: "C&D&D Terminal RPG",
    description:
      "Browser-graphed CLI story loops where you can type fake commands, watch the log replay, and feel the stat-heavy crunch without ever touching a compiler.",
    tags: ["CLI", "RPG", "Memory"],
    links: [
      { label: "Read the repo", href: "https://github.com/coldsmoke4776/cndnd" },
      { label: "Spell up the demo", href: "/arcade#cndnd-terminal" },
    ],
    terminal: {
      caption: "Live C&D&D run",
      scriptPath: "/arcade/cndnd.js",
      wasmPath: "/arcade/cndnd.wasm",
      factoryName: "createCndndModule",
    },
  },
];
