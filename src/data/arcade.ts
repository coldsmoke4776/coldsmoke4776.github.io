export type ArcadeExperience = {
  title: string;
  description: string;
  tags: string[];
  links: { label: string; href: string }[];
};

export const ARCADE_EXPERIENCES: ArcadeExperience[] = [
  {
    title: "Dashi",
    description:
      "An AI chess tutor with Ollama-backed prompts, a playful UI, and a board you can spin up in the browser to practice tactics or watch the coach explain why you blundered.",
    tags: ["Web", "AI", "Chess"],
    links: [
      { label: "Open the tutor", href: "https://dashi.coldsmoke4776.com" },
      { label: "Repo", href: "https://github.com/coldsmoke4776/dashi/tree/main" },
    ],
  },
  {
    title: "Memory Dungeon",
    description:
      "Heap + stack + disassembler turned into a mini-roguelike. Type into the stack playground and see how your characters dribble over buffer bounds in real time. The goal is learning, not beating the thing.",
    tags: ["WebGL", "Memory", "Game"],
    links: [
      { label: "Play the demo", href: "https://memorydungeon.coldsmoke4776.com" },
      { label: "Repo", href: "https://github.com/coldsmoke4776/memory_dungeon" },
    ],
  },
  {
    title: "Wizard's Shell",
    description:
      "Spellcast your favorite CLI commands while a narrative shell reacts. Runs entirely in the browser (thanks to WASM builds) so you can experiment with the lore and memory safe mimics of the spells.",
    tags: ["CLI", "Narrative", "WASM"],
    links: [
      { label: "Launch the shell", href: "https://wizardshell.coldsmoke4776.com" },
      { label: "Read the code", href: "https://github.com/coldsmoke4776/wizards_shell" },
    ],
  },
  {
    title: "Arcade Math Labs",
    description:
      "A sandbox of small science + math tinkers: vector field visualizers, orbital simulators, and any other UI fun that turns equations into something you can nudge and watch ripple.",
    tags: ["Math", "Physics", "UI"],
    links: [
      { label: "Open the lab", href: "/math-lab" },
      { label: "See the planning notes", href: "/archive/roadmap" },
    ],
  },
];
