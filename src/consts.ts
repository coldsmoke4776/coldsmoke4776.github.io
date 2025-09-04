export const SITE_TITLE = "Matt Twells (jawndeere)";
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

export const ABOUT_ME = `
<pre class="bg-black text-green-400 font-mono p-4 rounded-lg whitespace-pre-wrap">
$ whoami
Matt Twells — Sr. Solutions Architect @ Bishop Fox
Ex-Army comms engineer, pentester, internal auditor and consultant.

$ motto
Build dumb, fun things that sharpen the blade and still make me laugh.
Develop an unassailable set of hard technical skills.
</pre>
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
