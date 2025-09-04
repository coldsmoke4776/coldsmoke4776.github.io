export const SITE_TITLE = "Portfolio";
export const SITE_DESCRIPTION = "A personal portfolio showcasing projects, blog posts, and programming insights.";
export const GITHUB_USERNAME = "your-github-username"; // Replace with your actual GitHub username
export const QUOTE = "Code is poetry written in logic";

export const KNOWN_TECH = [
  "JavaScript",
  "TypeScript",
  "React",
  "Astro",
  "Node.js",
  "Python",
  "C",
  "Rust",
  "Go",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "AWS",
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
