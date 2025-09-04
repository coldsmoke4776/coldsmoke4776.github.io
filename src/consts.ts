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
    href: "/dojo",
  }, // 👈 you were missing this comma
  {
    title: "Github",
    href: "//github.com/" + GITHUB_USERNAME,
  },
];
