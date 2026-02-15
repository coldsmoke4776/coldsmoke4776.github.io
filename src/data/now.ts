export type NowCard = {
  label: string;
  title: string;
  summary: string;
  bullets?: string[];
  note?: string;
};

export const NOW_CARDS: NowCard[] = [
  {
    label: "Current project",
    title: "Agentic utilities + craft experiments",
    summary:
      "Spending the bulk of my spare cycles building the helper-set Codex already sketched out (rubberduck syntax assistant, the local HUD, the resume-engine plumbing) while still carving out evenings for low-level C work, math notebooks, and that half-built narrative card game that’s purely for fun.",
    bullets: [
      "Utility builds lean on agentic tooling for plumbing, CLI helpers, and glue code.",
      "Craft projects are intentionally manual—low-level demos, story-driven card rules, and anything that scratches the itch without feeling like work.",
    ],
  },
  {
    label: "Current book",
    title: "Effective C (2nd ed.)",
    summary:
      "Robert Seacord’s book is the read that keeps popping up in the C roadmap: the safety-first mindset and clean patterns keep me honest when I dip back into pointer-heavy systems or Rapido-style tools.",
    bullets: [
      "The chapter on ownership and lifetime reasoning feels like a checklist when I’m writing new allocator-style helpers.",
      "It’s as much a reference as a ritual—flip to the section that matches whatever the debugger is shouting about that week.",
    ],
  },
  {
    label: "Latest listen",
    title: "Modular ambient interludes",
    summary:
      "A low-end, modular/analogue synth palette has been the backdrop for late-night tinkering. This card is here to capture the next album or track that really sticks—swap it for the one you just loved when it changes.",
    note: "Update this summary with the exact song or album that hits differently next.",
  },
  {
    label: "Learning thread",
    title: "Agentic plumbing vs craft-toys",
    summary:
      "You can hear it in the blog: I’m forcing a split between utility projects that Codex and tools do for me, and the stubbornly manual side (game experiments, assembly puzzles, math notebooks) that stays slow and intentional.",
    bullets: [
      "Understanding the friction between agentic helpers and craft practice is its own lesson in expectations.",
      "Documenting the trade-offs keeps each new project honest: utility or craftsman, but not both at the same time.",
    ],
  },
];
