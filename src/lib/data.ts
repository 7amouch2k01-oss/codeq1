export const courses = [
  { id: "python", name: "Python", blurb: "Build real projects, automate the boring stuff, and unlock endless possibilities.", progress: 2, popular: true, color: "text-gold" },
  { id: "html", name: "HTML", blurb: "Create beautiful, accessible web pages and bring your ideas to life on the web.", progress: 1, color: "text-ember" },
  { id: "c", name: "C", blurb: "Understand how computers work and build powerful, high-performance programs.", progress: 1, color: "text-sky" },
  { id: "cpp", name: "C++", blurb: "Take your skills further with modern C++. Build games, engines, and systems.", progress: 1, color: "text-sky" },
];
export const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const leaders = [
  { name: "ByteKing", title: "Grand Coder", xp: 3120 },
  { name: "CodeMage", title: "Algorithm Adept", xp: 2340 },
  { name: "SyntaxElf", title: "Function Master", xp: 1980 },
  { name: "DebugDrake", title: "Code Knight", xp: 1760 },
  { name: "NullNinja", title: "Algorithm Adept", xp: 1540 },
  { name: "LoopLegend", title: "Code Knight", xp: 1320 },
  { name: "ScriptSage", title: "Function Master", xp: 1210 },
  { name: "You", title: "Code Knight", xp: 1080, me: true },
  { name: "BracketBeast", title: "Bug Hunter", xp: 940 },
  { name: "PixelPanda", title: "Syntax Scholar", xp: 860 },
];

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
