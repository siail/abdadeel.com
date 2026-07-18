import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://abdadeel.com", // replace this with your deployed domain
  author: "Abdullah Adeel | abdadeel",
  desc: "A blog about web development, programming, and other stuff.",
  title: "abdadeel",
  ogImage: "og-image-default.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: true,
  svg: false,
  width: 45,
  height: 45,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/siail",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/mabdullahsial",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:contact.abdadeel@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/abdadeel_",
    linkTitle: `${SITE.title} on Twitter`,
    active: true,
  },
  {
    name: "Twitch",
    href: "https://twitch.tv/abdadeel",
    linkTitle: `${SITE.title} on Twitch`,
    active: false,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@abdlogs",
    linkTitle: `${SITE.title} on YouTube`,
    active: true,
  },
  {
    name: "TikTok",
    href: "https://github.com/siail",
    linkTitle: `${SITE.title} on TikTok`,
    active: false,
  },
  {
    name: "Discord",
    href: "https://github.com/siail",
    linkTitle: `${SITE.title} on Discord`,
    active: false,
  },
  {
    name: "GitLab",
    href: "https://github.com/siail",
    linkTitle: `${SITE.title} on GitLab`,
    active: false,
  },
  {
    name: "Reddit",
    href: "https://github.com/siail",
    linkTitle: `${SITE.title} on Reddit`,
    active: false,
  },
];
