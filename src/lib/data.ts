import python from "@/assets/banner-python.jpg";
import html from "@/assets/banner-html.jpg";
import c from "@/assets/banner-c.jpg";
import cpp from "@/assets/banner-cpp.jpg";
import rogue from "@/assets/av-rogue.jpg";
import mage from "@/assets/av-mage.jpg";
import king from "@/assets/av-king.jpg";
import elf from "@/assets/av-elf.jpg";

const banners = { python, html, c, cpp };

export const avatars = {
  rogue,
  mage,
  king,
  elf,
};

export const courses = [
  {
    id: "python",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    banner: banners.python,
    name: "Python",
    blurb: "Build real projects, automate the boring stuff, and unlock endless possibilities.",
    popular: true,
    color: "text-gold",
  },
  {
    id: "html",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    banner: banners.html,
    name: "HTML",
    blurb: "Create beautiful, accessible web pages and bring your ideas to life on the web.",
    color: "text-ember",
  },
  {
    id: "c",
    icon: "/c-logo.svg",
    banner: banners.c,
    name: "C",
    blurb: "Understand how computers work and build powerful, high-performance programs.",
    color: "text-sky",
  },
  {
    id: "cpp",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
    banner: banners.cpp,
    name: "C++",
    blurb: "Take your skills further with modern C++. Build games, engines, and systems.",
    color: "text-sky",
  },
  {
    id: "sql",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    banner: banners.python,
    name: "SQL & Databases",
    blurb: "Master relational schemas, queries, joins, and database analytics.",
    color: "text-primary",
  },
  {
    id: "dsa",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    banner: banners.c,
    name: "Algorithms & DSA",
    blurb: "Conquer recursion, binary search, trees, and dynamic programming.",
    color: "text-ember",
  },
];

export const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];

/** Simulates running a tiny Python subset: supports `for i in range(a, b): print(i)` and print("..."). */
export function runPython(src: string): string {
  const out: string[] = [];
  const lines = src.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  for (let i = 0; i < lines.length; i++) {
    const l = (lines[i] ?? "").trim();
    const loop = l.match(/^for (\w+) in range\((\d+)(?:,\s*(\d+))?\):$/);
    if (loop) {
      const [a, b] = loop[3] ? [Number(loop[2]), Number(loop[3])] : [0, Number(loop[2])];
      const body = lines[i + 1]?.trim() ?? "";
      for (let n = a; n < b; n++) out.push(evalPrint(body, loop[1], n));
      i++;
      continue;
    }
    out.push(evalPrint(l));
  }
  return out.join("\n");
}

function evalPrint(line: string, v?: string, n?: number) {
  const m = line.match(/^print\((.*)\)$/);
  if (!m) throw new Error(`Unsupported line: ${line}`);
  const arg = (m[1] ?? "").trim();
  if (/^["'].*["']$/.test(arg)) return arg.slice(1, -1);
  if (arg === v) return String(n);
  throw new Error(`NameError: '${arg}' is not defined`);
}
