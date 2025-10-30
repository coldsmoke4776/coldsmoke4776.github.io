export const SITE_TITLE = "Matt Twells (jawndeere)";
export const SITE_DESCRIPTION = "A personal portfolio showcasing projects, blog posts, and programming insights.";
export const GITHUB_USERNAME = "coldsmoke4776"; // Replace with your actual GitHub username
export const QUOTE = "Sr. Solutions Architect • Systems & Security Explorer • Amateur Game Dev • GO BIRDS (6-2)";

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

export const ABOUT_ME = `Sr. Solutions Architect @ Bishop Fox. 
Ex-Army comms engineer, pentester, internal auditor and consultant.
I love building dumb, fun things that sharpen the blade and still make me laugh.
The goal is to develop an unassailable set of hard technical skills.
`.trim();




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
    title: "Roadmap"
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
