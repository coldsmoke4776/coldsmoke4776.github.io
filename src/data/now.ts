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
    title: "Learning Linux from the syscall boundary upward.",
    summary:
      "I've been having a blast building tiny C++ programs and then using strace and bpftrace to uncover what Linux is actually doing underneath them. It scratches the systems-curiosity itch while giving me a much sharper understanding of where EDR and SIEM telemetry comes from—and what that evidence can really prove.",
    bullets: [
      "Built a stateful four-tracepoint probe that follows openat requests through successful file-descriptor closure.",
      "Turned the FD 3 mystery into a practical lesson about state, correlation and bounded security claims.",
      "Next up: following process lifecycles through fork, exec and wait.",
    ],
  },
  {
    label: "Current books",
    title: "“Sapphic Moby Dick in Space!” and Charlie Munger",
    summary:
      "My current reading rotation is either acerbic space-whaling fiction or a billionaire investor explaining how not to make stupid decisions. Apparently this is what balance looks like.",
    bullets: [
      "Hell's Heart by Alexis Hall gave itself an absurdly strong elevator pitch and has delivered on it perfectly so far. The acerbic humor has landed extremely well with me.",
      "I finally found Poor Charlie's Almanack in print after years of hearing it recommended for building efficient, reliable decision-making frameworks. Time to find out whether any of them can save me from myself.",
    ],
  },
  {
    label: "Current rotation",
    title: "Spiritbox, Mastodon and an increasingly serious country detour",
    summary:
      "Spiritbox's Tsunami Sea is easily at the top of my rotation and is already on track to be my album of the year. Mastodon's Marrow Deep has been getting plenty of time too; I've been a huge fan of both bands for years.",
    bullets: [
      "Tsunami Sea is another reminder that Spiritbox seem almost purpose-built for my exact musical tastes.",
      "Marrow Deep has me happily back in Mastodon's particular corner of heavy music.",
      "I've also been on a real country kick: Chris Stapleton, Sturgill Simpson and Ella Langley, with “Chattahoochee” by Alan Jackson apparently serving as the road between metal and everything else.",
    ],
  },
  {
    label: "Learning thread",
    title: "Systems fluency, anchored in C++",
    summary:
      "C++ is still my language-mastery track, but the broader goal is systems fluency: understanding Linux, memory, processes, syscalls and kernel telemetry from first principles. That depth isn't preparation for some hypothetical future career—it is already helping me become uncommonly good at the job I love doing now.",
    bullets: [
      "Use C++ to build small artifacts that make low-level mechanisms visible instead of learning syntax in isolation.",
      "Keep connecting systems behavior back to EDR, detection engineering and offensive security.",
      "Stay slow and manual where understanding matters, while using automation where it genuinely removes friction.",
    ],
  },
];
