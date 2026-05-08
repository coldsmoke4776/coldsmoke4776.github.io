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
    title: "Finding ways to blend my nerdy hobbies (sci-fi, astrophysics, Magic: The Gathering) with my coding work.",
    summary: "Since starting the new job, I've realized that I don't need to constantly be grinding away on things to prove myself. I want to find true joy in tech like I did when I started out.",
    bullets: [
      "I really love the way the science fiction I've read recently and rediscovering Magic: The Gathering have inspired me to study the systems behind the things I love.",
      ],
  },
  {
    label: "Current book",
    title: "Project Hail Mary by Andy Weir",
    summary:
      "I wanted to pick up fiction reading again, because strict diets of textbooks and non-fiction make Matt a dull boy. Weir's book I picked up because I saw a trailer for the movie and I tore through it in two days.",
    bullets: [
      "The tactical, problem-solving way science is presented in PHM is the polar opposite of the dense style that led me to bounce off The Three-Body Problem, and ironically reading sci-fi again inspired more technical deep-diving joy than the constant grinding ever did.",
      "I adored Rocky as a companion, but I resent the unrealistic expectations for engineering skills he puts forward. Leave some of the glory for us two-handers, my hard-carapaced compadre.",
      "I also maintain Astrophage is a killer name for a metal band, too.",   
    ],
  },
  {
    label: "Latest listen",
    title: "Bilmuri - Kinda Hard (the whole album)",
    summary:
      "American Motor Sports was my album of the year 2024, and I eagerly awaited Bilmuri's new album. Kinda Hard is well named, with killer songwriting, instant earworm hooks and the odd tornado-kick breakdown to make you go 'Damn, that's kinda hard, bro'",  },
  {
    label: "Learning thread",
    title: "C++, from the ground up.",
    summary:
      "You can hear it in the blog: I’m forcing a split between utility projects that Codex and tools do for me, and the stubbornly manual side (game experiments, assembly puzzles, math notebooks) that stays slow and intentional.",
    bullets: [
      "I want to get back into the weeds, and stay there.",
      "I want to learn the systems of modern software development by hand and be able to use them by myself.",
      "The plan is to be less rigid about the use of AI programming aids going forward, though (re: Rubberduck)",
    ],
  },
];
