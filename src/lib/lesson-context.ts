import { z } from "zod";

export type LanguageTrack = "python" | "html" | "c" | "cpp";

export interface LessonInfo {
  id: string;
  track: LanguageTrack;
  order: number;
  title: string;
  challenge: string;
  concepts: string;
  starterCode: string;
  testCheck: (output: string, code: string) => boolean;
}

export const multiCourseRegistry: Record<string, LessonInfo> = {
  // ── PYTHON TRACK ──
  "python-1-variables": {
    id: "python-1-variables",
    track: "python",
    order: 1,
    title: "Lesson 1: Variables & Printing",
    challenge: "Assign the string 'Questbound' to a variable named hero, then print(hero).",
    concepts: "Variables, strings, and print() output.",
    starterCode: `# Lesson 1: Variables\nhero = "Questbound"\nprint(hero)\n`,
    testCheck: (out) => out.trim().includes("Questbound"),
  },
  "python-2-conditionals": {
    id: "python-2-conditionals",
    track: "python",
    order: 2,
    title: "Lesson 2: Conditionals & Logic",
    challenge: "Set xp = 150. If xp >= 100, print 'Level Up!'.",
    concepts: "if statements, comparison operators, and indentation.",
    starterCode: `# Lesson 2: Conditionals\nxp = 150\nif xp >= 100:\n    print("Level Up!")\n`,
    testCheck: (out) => out.trim().includes("Level Up!"),
  },
  "python-3-functions": {
    id: "python-3-functions",
    track: "python",
    order: 3,
    title: "Lesson 3: Functions & Reusability",
    challenge:
      "Define a function greet(name) that returns 'Welcome, ' + name, and print(greet('Knight')).",
    concepts: "def keyword, parameters, return statements.",
    starterCode: `# Lesson 3: Functions\ndef greet(name):\n    return "Welcome, " + name\n\nprint(greet("Knight"))\n`,
    testCheck: (out) => out.trim().includes("Welcome, Knight"),
  },
  "python-4-loops": {
    id: "python-4-loops",
    track: "python",
    order: 4,
    title: "Lesson 4: Loops & Iterations",
    challenge: "Use a for loop to print the numbers 1 through 10, each on a new line.",
    concepts: "for loops, range(start, stop), exclusive stop bounds.",
    starterCode: `# Lesson 4: Loops\nfor i in range(1, 11):\n    print(i)\n`,
    testCheck: (out) => out.trim() === "1\n2\n3\n4\n5\n6\n7\n8\n9\n10",
  },
  "python-5-projects": {
    id: "python-5-projects",
    track: "python",
    order: 5,
    title: "Lesson 5: Mini Quest Project",
    challenge: "Calculate total quest score: return base + bonus. Print calc_score(150, 50).",
    concepts: "Functions, arithmetic, and modular code.",
    starterCode: `# Lesson 5: Projects\ndef calc_score(base, bonus):\n    return base + bonus\n\nprint("Total Score:", calc_score(150, 50))\n`,
    testCheck: (out) => out.trim().includes("200"),
  },
  "python-6-lists": {
    id: "python-6-lists",
    track: "python",
    order: 6,
    title: "Lesson 6: Lists & Collections",
    challenge:
      "Create a list with 'Sword', 'Shield', 'Potion', and loop through them printing each item.",
    concepts: "Lists, arrays, iteration, collections.",
    starterCode: `# Lesson 6: Lists\nitems = ["Sword", "Shield", "Potion"]\nfor item in items:\n    print("Item:", item)\n`,
    testCheck: (out) => out.trim().includes("Sword") && out.trim().includes("Potion"),
  },

  // ── HTML/CSS TRACK ──
  "html-1-intro": {
    id: "html-1-intro",
    track: "html",
    order: 1,
    title: "Lesson 1: Structure & Headings",
    challenge:
      "Create an <h1> heading with 'Welcome to Questbound' and a paragraph <p> underneath.",
    concepts: "Semantic HTML tags, <h1>, <p>, opening and closing elements.",
    starterCode: `<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Welcome to Questbound</h1>\n    <p>Your journey into web craft begins here.</p>\n  </body>\n</html>`,
    testCheck: (_, code) =>
      code.includes("<h1") && code.includes("Welcome to Questbound") && code.includes("<p"),
  },
  "html-2-forms": {
    id: "html-2-forms",
    track: "html",
    order: 2,
    title: "Lesson 2: Interactive Forms & Inputs",
    challenge: "Add a text <input placeholder='Player name'> and a <button>Submit</button>.",
    concepts: "Form controls, inputs, buttons, attributes.",
    starterCode: `<div class="quest-card">\n  <h2>Adventurer Sign-in</h2>\n  <input type="text" placeholder="Player name" />\n  <button>Embark</button>\n</div>`,
    testCheck: (_, code) => code.includes("<input") && code.includes("<button"),
  },
  "html-3-css": {
    id: "html-3-css",
    track: "html",
    order: 3,
    title: "Lesson 3: Styling with CSS",
    challenge: "Style the .badge class with a gold color or background.",
    concepts: "CSS classes, color properties, background, border-radius.",
    starterCode: `<style>\n  .badge {\n    background: #eab308;\n    color: #0f172a;\n    padding: 8px 16px;\n    border-radius: 9999px;\n    font-weight: bold;\n    display: inline-block;\n  }\n</style>\n<div class="badge">Master Coder</div>`,
    testCheck: (_, code) => code.includes("<style") && code.includes(".badge"),
  },
  "html-4-layout": {
    id: "html-4-layout",
    track: "html",
    order: 4,
    title: "Lesson 4: Flexbox Layouts",
    challenge: "Create a container with display: flex to arrange two inventory items side by side.",
    concepts: "CSS Flexbox, display: flex, justify-content, gap.",
    starterCode: `<style>\n  .container {\n    display: flex;\n    gap: 16px;\n  }\n  .item {\n    padding: 12px;\n    background: #1e293b;\n    border-radius: 8px;\n  }\n</style>\n<div class="container">\n  <div class="item">🛡️ Shield</div>\n  <div class="item">⚔️ Sword</div>\n</div>`,
    testCheck: (_, code) => code.includes("display: flex") || code.includes("display:flex"),
  },

  // ── C PROGRAMMING TRACK ──
  "c-1-intro": {
    id: "c-1-intro",
    track: "c",
    order: 1,
    title: "Lesson 1: Structure of a C Program",
    challenge: "Write the entrypoint int main() that prints 'Hello, C Adventurer!' using printf.",
    concepts: "#include <stdio.h>, main function, printf, return 0.",
    starterCode: `#include <stdio.h>\n\nint main() {\n    printf("Hello, C Adventurer!\\n");\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("printf") && code.includes("main()"),
  },
  "c-2-pointers": {
    id: "c-2-pointers",
    track: "c",
    order: 2,
    title: "Lesson 2: Pointers & Addresses",
    challenge: "Declare an integer val = 42 and a pointer ptr = &val. Dereference *ptr.",
    concepts: "Memory addresses, address-of operator &, dereference operator *.",
    starterCode: `#include <stdio.h>\n\nint main() {\n    int val = 42;\n    int *ptr = &val;\n    printf("Value: %d\\n", *ptr);\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("&") && code.includes("*ptr"),
  },
  "c-3-structs": {
    id: "c-3-structs",
    track: "c",
    order: 3,
    title: "Lesson 3: Custom Structures",
    challenge: "Define a struct Player with int hp and int level.",
    concepts: "struct keyword, custom data types, member access.",
    starterCode: `#include <stdio.h>\n\nstruct Player {\n    int hp;\n    int level;\n};\n\nint main() {\n    struct Player p1 = {100, 5};\n    printf("Level: %d\\n", p1.level);\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("struct Player"),
  },
  "c-4-memory": {
    id: "c-4-memory",
    track: "c",
    order: 4,
    title: "Lesson 4: Dynamic Allocation (malloc & free)",
    challenge: "Allocate an array of 5 integers dynamically and remember to free() it.",
    concepts: "stdlib.h, malloc, sizeof, free, pointer validation.",
    starterCode: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *arr = (int *)malloc(5 * sizeof(int));\n    if (arr != NULL) {\n        arr[0] = 100;\n        printf("First: %d\\n", arr[0]);\n        free(arr);\n    }\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("malloc") && code.includes("free"),
  },

  // ── C++ TRACK ──
  "cpp-1-intro": {
    id: "cpp-1-intro",
    track: "cpp",
    order: 1,
    title: "Lesson 1: Streams & Namespaces",
    challenge: "Use std::cout from <iostream> to print 'Modern C++ Quest'.",
    concepts: "iostream, std::cout, std::endl, namespaces.",
    starterCode: `#include <iostream>\n\nint main() {\n    std::cout << "Modern C++ Quest" << std::endl;\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("std::cout") && code.includes("iostream"),
  },
  "cpp-2-oop": {
    id: "cpp-2-oop",
    track: "cpp",
    order: 2,
    title: "Lesson 2: Classes & Encapsulation",
    challenge: "Define a Hero class with private health and a public getter getHealth().",
    concepts: "class, public/private access specifiers, methods, constructors.",
    starterCode: `#include <iostream>\n\nclass Hero {\nprivate:\n    int health = 100;\npublic:\n    int getHealth() const { return health; }\n};\n\nint main() {\n    Hero h;\n    std::cout << "Health: " << h.getHealth() << std::endl;\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("class Hero") && code.includes("getHealth()"),
  },
  "cpp-3-templates": {
    id: "cpp-3-templates",
    track: "cpp",
    order: 3,
    title: "Lesson 3: Generic Templates",
    challenge: "Write a template function getMax(T a, T b) that returns the greater value.",
    concepts: "template <typename T>, generic programming, type inference.",
    starterCode: `#include <iostream>\n\ntemplate <typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}\n\nint main() {\n    std::cout << getMax(10, 20) << std::endl;\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("template") && code.includes("getMax"),
  },
  "cpp-4-stl": {
    id: "cpp-4-stl",
    track: "cpp",
    order: 4,
    title: "Lesson 4: Standard Template Library (std::vector)",
    challenge: "Store quest items in std::vector<std::string> and use a range-based for loop.",
    concepts: "std::vector, push_back, range-based for, iterators.",
    starterCode: `#include <iostream>\n#include <vector>\n#include <string>\n\nint main() {\n    std::vector<std::string> loot = {"Excalibur", "Aegis"};\n    for (const auto& item : loot) {\n        std::cout << item << std::endl;\n    }\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("std::vector") && code.includes("loot"),
  },
};

export const lessonsRegistry = multiCourseRegistry;
export const loopsLesson = multiCourseRegistry["python-4-loops"];

export const tutorRequestSchema = z
  .object({
    lessonId: z.string().refine((id) => id in multiCourseRegistry, {
      message: "Unknown lesson identifier.",
    }),
    code: z.string().max(6000),
    output: z.string().max(6000).default(""),
    error: z.string().max(2000).default(""),
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(4000),
        }),
      )
      .min(1)
      .max(12),
  })
  .refine((body) => body.messages.at(-1)?.role === "user", "A learner question is required.");
