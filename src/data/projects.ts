import type { CoverflowSlide } from "@/components/ui/coverflow-carousel";

export const PROJECTS: CoverflowSlide[] = [
  {
    index: "01",
    title: "FitZen",
    src: "/projects/fitzen-home.jpeg",
    alt: "FitZen Health Suite & AI Food Scanner",
    status: "In Progress",
    fit: "cover",
    subtitle:
      "A multi-module Flutter health suite. On-device computer vision classifies meals to compute calories and macros in real-time, coupled with a native pedometer tracking daily 7,455-step activity goals.",
    repoUrl: "https://github.com/hujaif21/fitzen",
    videoUrl: "https://www.youtube.com/embed/G7MkNjrm1bg?autoplay=1",
    href: "https://github.com/hujaif21/fitzen",
    meta: [
      { label: "Status", value: "In Progress" },
      { label: "Team", value: "3 Engineers" },
      { label: "Stack", value: "Flutter, Dart, Vision AI, Sensors" },
      { label: "Features", value: "Food Scanner, Step Counter" },
    ],
  },
  {
    index: "02",
    title: "MockMate AI",
    src: "/projects/mockmate-interview.png",
    alt: "MockMate AI Interactive Interview Simulation",
    status: "In Progress",
    fit: "contain",
    subtitle:
      "Intelligent interview simulator tailored for tech roles. Simulates dynamic technical and behavioral interview rounds with a countdown timer, voice flow, and real-time rubric scoring on communication and technical depth.",
    repoUrl: "https://github.com/hujaif21/mockmate",
    href: "https://github.com/hujaif21/mockmate",
    meta: [
      { label: "Status", value: "In Progress" },
      { label: "Team", value: "3 Engineers" },
      { label: "Stack", value: "JavaScript, Python, Supabase, Gemini" },
      { label: "Rubric", value: "Communication, Technical, Structure" },
    ],
  },
  {
    index: "03",
    title: "Dhikr Counter Pro",
    src: "/projects/dhikar-home.jpeg",
    alt: "Dhikr Counter Pro Minimalist Tasbih App",
    status: "Completed",
    fit: "cover",
    subtitle:
      "A distraction-free digital tasbih app featuring Arabic typography, high-volume goal pacing (up to 200,000 counts), haptic feedback intervals, and session history synchronization via a FastAPI backend.",
    appUrl: "https://drive.google.com/file/d/1ycYErMIZotnG92o_W69fHTVbMV123YoH/view",
    videoUrl: "https://www.youtube.com/embed/ZMq-WaDlYEA?autoplay=1",
    href: "https://drive.google.com/file/d/1ycYErMIZotnG92o_W69fHTVbMV123YoH/view",
    meta: [
      { label: "Status", value: "Completed" },
      { label: "Type", value: "Mobile Application" },
      { label: "Stack", value: "Flutter, Dart, FastAPI, Python" },
      { label: "Architecture", value: "Multi-Goal Pacing & REST API Sync" },
    ],
  },
  {
    index: "04",
    title: "NotMyFault",
    src: "/projects/notmyfault-home.jpeg",
    alt: "NotMyFault Smart Excuse Generator App",
    status: "Shipped",
    fit: "cover",
    subtitle:
      "An end-to-end shipped Flutter utility for witty, situational developer excuses. Features a 'Snitch Mode' causality inverter, category crisis triggers (Late, Deadline, Gym, Reply), and one-tap clipboard sharing.",
    appUrl: "https://drive.google.com/file/d/1s0_m3MilTJaYPLe1eFvdpjKL_Qzx5pr8/view",
    videoUrl: "https://www.youtube.com/embed/ae7GW9QFV5E?autoplay=1",
    href: "https://drive.google.com/file/d/1s0_m3MilTJaYPLe1eFvdpjKL_Qzx5pr8/view",
    meta: [
      { label: "Status", value: "Shipped" },
      { label: "Type", value: "Mobile Application" },
      { label: "Stack", value: "Flutter, Dart, State Management" },
      { label: "Feature", value: "Snitch Mode & Multi-Crisis Engine" },
    ],
  },
  {
    index: "05",
    title: "FreshCart",
    src: "/projects/freshcart-home.png",
    alt: "FreshCart Grocery Mobile App UI/UX Design System",
    status: "Completed",
    fit: "cover",
    subtitle:
      "Complete mobile grocery shopping user experience crafted in Figma. Includes end-to-end user journeys, an atomic component library, and strict WCAG AA accessibility compliance.",
    designUrl:
      "https://www.figma.com/proto/0F79Z6tXEj8AB1ecuZhnRW/Untitled?node-id=2-2&p=f&t=1FzX8mZijqwyO8n9-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=2%3A2",
    href: "https://www.figma.com/proto/0F79Z6tXEj8AB1ecuZhnRW/Untitled?node-id=2-2&p=f&t=1FzX8mZijqwyO8n9-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=2%3A2",
    meta: [
      { label: "Type", value: "UI/UX Architecture" },
      { label: "Tooling", value: "Figma, Auto Layout, Tokens" },
      { label: "Academic Score", value: "30 / 30" },
    ],
  },
  {
    index: "06",
    title: "Friends Cafe",
    src: "/projects/friendscafe-home.jpeg",
    alt: "Friends Cafe College Project",
    status: "Completed",
    fit: "contain",
    subtitle:
      "College engineering project — responsive commercial website built for a local cafe featuring online table reservations, interactive menu discovery, and promotional offers.",
    repoUrl: "https://github.com/hujaif21/friends-cafe",
    href: "https://github.com/hujaif21/friends-cafe",
    meta: [
      { label: "Type", value: "College Project" },
      { label: "Team", value: "3 Engineers" },
      { label: "Stack", value: "Spring Boot, HTML, CSS, JavaScript" },
      { label: "Status", value: "Completed" },
    ],
  },
  {
    index: "07",
    title: "Noir Digital Studio",
    src: "/projects/noir-home.png",
    alt: "Noir Digital Studio Web Presence",
    status: "Completed",
    fit: "contain",
    subtitle:
      "A sleek, modern web presence built with responsive design principles.",
    description:
      "A sleek, modern web presence built with responsive design principles.",
    liveUrl: "https://hujaif21.github.io/noir-digital-studio/",
    href: "https://hujaif21.github.io/noir-digital-studio/",
    meta: [
      { label: "Type", value: "Web Presence" },
      { label: "Stack", value: "HTML, CSS, Responsive Design" },
      { label: "Status", value: "Live" },
    ],
  },
];
