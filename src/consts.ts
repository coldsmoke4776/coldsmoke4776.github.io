export const SITE_TITLE = "Portfolio";
export const SITE_DESCRIPTION = "A personal portfolio showcasing projects, blog posts, and programming insights.";
export const GITHUB_USERNAME = "coldsmoke4776"; // Replace with your actual GitHub username
export const QUOTE = "Sr. Solutions Architect • Systems & Security Explorer • Amateur Game Dev • GO BIRDS";

export const KNOWN_TECH = [
  "Astro",
  "C",
  "X86_ASM (learning)",
  "HTML",
  "CSS",
  "Salesforce",
  "HubSpot",
  "Outreach",
  "Godot",
  "GDSCript",
  "Git"
];

export const ABOUT_ME = "I'm a passionate software developer with expertise in full-stack development, system programming, and cloud technologies. I love building efficient, scalable solutions and sharing knowledge through code and writing.";

export const NAV_LINKS: Array<{ title: string; href?: string }> = [
  {
    title: "Index",
  },
  {
    title: "Projects",
  },
  {
    title: "Resume",
  },
  {
    title: "Blog",
  },
  {
    title: "Dojo",
  }, // 👈 you were missing this comma
  {
    title: "Github",
    href: "//github.com/" + GITHUB_USERNAME,
  },
];
