import { z } from "zod";

export type LanguageTrack = "python" | "html" | "c" | "cpp" | "sql" | "dsa";

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
  // ─────────────────────────────────────────────
  // 🐍 1. PYTHON ADVENTURER (Serpent's Valley)
  // ─────────────────────────────────────────────
  "python-1-variables": {
    id: "python-1-variables",
    track: "python",
    order: 1,
    title: "Lesson 1: The Awakening (Variables & Output)",
    challenge: "Assign the string 'Questbound' to a variable named hero, then print(hero).",
    concepts: "Variables, strings, standard output with print().",
    starterCode: `# Lesson 1: Variables\nhero = "Questbound"\nprint(hero)\n`,
    testCheck: (out) => out.trim().includes("Questbound"),
  },
  "python-2-conditionals": {
    id: "python-2-conditionals",
    track: "python",
    order: 2,
    title: "Lesson 2: The Fork in the Road (Conditionals)",
    challenge: "Set xp = 150. If xp >= 100, print 'Level Up!'.",
    concepts: "if statements, comparison operators, and indentation.",
    starterCode: `# Lesson 2: Conditionals\nxp = 150\nif xp >= 100:\n    print("Level Up!")\n`,
    testCheck: (out) => out.trim().includes("Level Up!"),
  },
  "python-3-functions": {
    id: "python-3-functions",
    track: "python",
    order: 3,
    title: "Lesson 3: Spellcrafting (Functions & Scope)",
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
    title: "Lesson 4: The Endless Staircase (Loops)",
    challenge: "Use a for loop to print numbers 1 through 10, each on a new line.",
    concepts: "for loops, range(start, stop), exclusive stop bounds.",
    starterCode: `# Lesson 4: Loops\nfor i in range(1, 11):\n    print(i)\n`,
    testCheck: (out) => out.trim() === "1\n2\n3\n4\n5\n6\n7\n8\n9\n10",
  },
  "python-5-projects": {
    id: "python-5-projects",
    track: "python",
    order: 5,
    title: "Lesson 5: Arithmetic & Scoring",
    challenge: "Calculate total quest score: return base + bonus. Print calc_score(150, 50).",
    concepts: "Functions, arithmetic, and modular code.",
    starterCode: `# Lesson 5: Scoring\ndef calc_score(base, bonus):\n    return base + bonus\n\nprint("Total Score:", calc_score(150, 50))\n`,
    testCheck: (out) => out.trim().includes("200"),
  },
  "python-6-lists": {
    id: "python-6-lists",
    track: "python",
    order: 6,
    title: "Lesson 6: The Adventurer's Backpack (Lists)",
    challenge:
      "Create a list with 'Sword', 'Shield', 'Potion', and loop through them printing each item.",
    concepts: "Lists, arrays, iteration, collections.",
    starterCode: `# Lesson 6: Lists\nitems = ["Sword", "Shield", "Potion"]\nfor item in items:\n    print("Item:", item)\n`,
    testCheck: (out) => out.trim().includes("Sword") && out.trim().includes("Potion"),
  },
  "python-7-dictionaries": {
    id: "python-7-dictionaries",
    track: "python",
    order: 7,
    title: "Lesson 7: Map of Symbols (Dictionaries)",
    challenge: "Create a dictionary stats with 'hp': 100 and 'mana': 50. Print stats['hp'].",
    concepts: "Key-value dictionaries, lookups, indexing.",
    starterCode: `# Lesson 7: Dictionaries\nstats = {"hp": 100, "mana": 50}\nprint("HP:", stats["hp"])\n`,
    testCheck: (out) => out.trim().includes("100"),
  },
  "python-8-exceptions": {
    id: "python-8-exceptions",
    track: "python",
    order: 8,
    title: "Lesson 8: The Resilient Shield (Error Handling)",
    challenge: "Use try/except ZeroDivisionError to catch dividing by zero and print 'Caught!'.",
    concepts: "try, except, exception handling, robust code.",
    starterCode: `# Lesson 8: Error Handling\ntry:\n    res = 10 / 0\nexcept ZeroDivisionError:\n    print("Caught!")\n`,
    testCheck: (out) => out.trim().includes("Caught!"),
  },
  "python-9-classes": {
    id: "python-9-classes",
    track: "python",
    order: 9,
    title: "Lesson 9: Constructing Golems (OOP Classes)",
    challenge: "Define a class Golem with __init__(self, hp) and print a new Golem(250).hp.",
    concepts: "Classes, objects, __init__, self, instance attributes.",
    starterCode: `# Lesson 9: Classes\nclass Golem:\n    def __init__(self, hp):\n        self.hp = hp\n\ng = Golem(250)\nprint("Golem HP:", g.hp)\n`,
    testCheck: (out) => out.trim().includes("250"),
  },
  "python-10-capstone": {
    id: "python-10-capstone",
    track: "python",
    order: 10,
    title: "Lesson 10: Realm Capstone (Dungeon Crawler)",
    challenge: "Build a dungeon crawl function that battles a boss with 100 HP doing 25 damage per hit.",
    concepts: "Loops, functions, conditionals, game loops.",
    starterCode: `# Lesson 10: Capstone Dungeon\ndef dungeon_crawl():\n    boss_hp = 100\n    hits = 0\n    while boss_hp > 0:\n        boss_hp -= 25\n        hits += 1\n    return f"Boss defeated in {hits} hits!"\n\nprint(dungeon_crawl())\n`,
    testCheck: (out) => out.trim().includes("4 hits"),
  },

  // ─────────────────────────────────────────────
  // 🌐 2. WEB CRAFT (HTML & CSS)
  // ─────────────────────────────────────────────
  "html-1-intro": {
    id: "html-1-intro",
    track: "html",
    order: 1,
    title: "Lesson 1: Structure & Headings",
    challenge: "Create an <h1> heading with 'Welcome to Questbound' and a paragraph <p> underneath.",
    concepts: "Semantic HTML tags, <h1>, <p>, opening and closing elements.",
    starterCode: `<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Welcome to Questbound</h1>\n    <p>Your journey into web craft begins here.</p>\n  </body>\n</html>`,
    testCheck: (_, code) => code.includes("<h1") && code.includes("Welcome to Questbound") && code.includes("<p"),
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
  "html-5-grid": {
    id: "html-5-grid",
    track: "html",
    order: 5,
    title: "Lesson 5: The Castle Grid (CSS Grid)",
    challenge: "Use display: grid with grid-template-columns to build a 3-column loot chest.",
    concepts: "CSS Grid, grid-template-columns, gap.",
    starterCode: `<style>\n  .grid {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 10px;\n  }\n</style>\n<div class="grid">\n  <div>Ruby</div><div>Sapphire</div><div>Emerald</div>\n</div>`,
    testCheck: (_, code) => code.includes("grid-template-columns"),
  },
  "html-6-js": {
    id: "html-6-js",
    track: "html",
    order: 6,
    title: "Lesson 6: The Spark of Life (JavaScript DOM)",
    challenge: "Add a <script> tag that attaches an event listener or logs 'Quest Loaded'.",
    concepts: "JavaScript integration, <script>, console.log.",
    starterCode: `<button id="btn">Cast Spell</button>\n<script>\n  console.log("Quest Loaded");\n</script>`,
    testCheck: (_, code) => code.includes("<script") && code.includes("Quest Loaded"),
  },

  // ─────────────────────────────────────────────
  // ⚙️ 3. C SYSTEMS & MEMORY FORGE (Iron Core)
  // ─────────────────────────────────────────────
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
  "c-5-linked-lists": {
    id: "c-5-linked-lists",
    track: "c",
    order: 5,
    title: "Lesson 5: The Linked Chain (Node Pointer)",
    challenge: "Define a struct Node containing an int value and struct Node *next pointer.",
    concepts: "Self-referencing structs, linked lists, next pointer.",
    starterCode: `#include <stdio.h>\n\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nint main() {\n    struct Node n1 = {10, NULL};\n    printf("Node data: %d\\n", n1.data);\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("struct Node *next") || code.includes("struct Node* next"),
  },
  "c-6-bitwise": {
    id: "c-6-bitwise",
    track: "c",
    order: 6,
    title: "Lesson 6: Binary Forge (Bitwise Operators)",
    challenge: "Use bitwise shift << or bitwise AND & to manipulate bit flags.",
    concepts: "Bitwise AND, OR, XOR, shifts.",
    starterCode: `#include <stdio.h>\n\nint main() {\n    int flag = 1 << 3; // 8\n    printf("Flag: %d\\n", flag);\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("<<") || code.includes("&"),
  },

  // ─────────────────────────────────────────────
  // 🏗️ 4. MODERN C++ & ENGINES (Titan's Engine)
  // ─────────────────────────────────────────────
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
  "cpp-5-smart-pointers": {
    id: "cpp-5-smart-pointers",
    track: "cpp",
    order: 5,
    title: "Lesson 5: Smart Pointers (RAII)",
    challenge: "Use std::make_unique to allocate an integer safely with std::unique_ptr.",
    concepts: "memory header, unique_ptr, make_unique, RAII.",
    starterCode: `#include <iostream>\n#include <memory>\n\nint main() {\n    auto ptr = std::make_unique<int>(100);\n    std::cout << *ptr << std::endl;\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("make_unique") || code.includes("unique_ptr"),
  },
  "cpp-6-game-loop": {
    id: "cpp-6-game-loop",
    track: "cpp",
    order: 6,
    title: "Lesson 6: The Game Loop",
    challenge: "Implement an update/render game loop that ticks 3 times.",
    concepts: "Game loops, delta tick, state machines.",
    starterCode: `#include <iostream>\n\nint main() {\n    for (int frame = 1; frame <= 3; ++frame) {\n        std::cout << "Render Frame: " << frame << std::endl;\n    }\n    return 0;\n}\n`,
    testCheck: (_, code) => code.includes("Frame") && code.includes("for"),
  },

  // ─────────────────────────────────────────────
  // 🗄️ 5. SQL & DATA ARCHIVES (Oracle Archives)
  // ─────────────────────────────────────────────
  "sql-1-select": {
    id: "sql-1-select",
    track: "sql",
    order: 1,
    title: "Lesson 1: The Oracle Query (SELECT)",
    challenge: "Write a SQL query to SELECT name, xp FROM players ORDER BY xp DESC.",
    concepts: "SELECT, FROM, ORDER BY, DESC.",
    starterCode: `-- Query the highest ranked adventurers\nSELECT name, xp \nFROM players \nORDER BY xp DESC;\n`,
    testCheck: (_, code) => code.toUpperCase().includes("SELECT") && code.toUpperCase().includes("FROM PLAYERS"),
  },
  "sql-2-where": {
    id: "sql-2-where",
    track: "sql",
    order: 2,
    title: "Lesson 2: Filtering Reality (WHERE)",
    challenge: "Select all quests WHERE difficulty = 'Hard' AND completed = false.",
    concepts: "WHERE clause, AND, boolean comparisons.",
    starterCode: `-- Filter dangerous quests\nSELECT * FROM quests \nWHERE difficulty = 'Hard' AND completed = false;\n`,
    testCheck: (_, code) => code.toUpperCase().includes("WHERE") && code.toUpperCase().includes("DIFFICULTY"),
  },
  "sql-3-joins": {
    id: "sql-3-joins",
    track: "sql",
    order: 3,
    title: "Lesson 3: Bridging Realms (INNER JOIN)",
    challenge: "Join players with their inventory items using INNER JOIN on player_id.",
    concepts: "Relational data, INNER JOIN, ON primary/foreign keys.",
    starterCode: `-- Combine player and item tables\nSELECT p.name, i.item_name\nFROM players p\nINNER JOIN inventory i ON p.id = i.player_id;\n`,
    testCheck: (_, code) => code.toUpperCase().includes("JOIN") && code.toUpperCase().includes("ON"),
  },
  "sql-4-aggregates": {
    id: "sql-4-aggregates",
    track: "sql",
    order: 4,
    title: "Lesson 4: Guild Accounting (GROUP BY & COUNT)",
    challenge: "Count total members per guild: SELECT guild_id, COUNT(*) GROUP BY guild_id.",
    concepts: "Aggregate functions, COUNT, GROUP BY.",
    starterCode: `-- Count adventurer guild numbers\nSELECT guild_id, COUNT(*)\nFROM players\nGROUP BY guild_id;\n`,
    testCheck: (_, code) => code.toUpperCase().includes("GROUP BY") && code.toUpperCase().includes("COUNT"),
  },

  // ─────────────────────────────────────────────
  // ⚡ 6. ALGORITHMS & DATA STRUCTURES (The Labyrinth)
  // ─────────────────────────────────────────────
  "dsa-1-recursion": {
    id: "dsa-1-recursion",
    track: "dsa",
    order: 1,
    title: "Lesson 1: The Mirror Hall (Recursion)",
    challenge: "Write a recursive function countdown(n) that base-cases at n <= 0.",
    concepts: "Recursion, base cases, call stacks.",
    starterCode: `def countdown(n):\n    if n <= 0:\n        print("Blast off!")\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(3)\n`,
    testCheck: (out) => out.trim().includes("Blast off!"),
  },
  "dsa-2-binary-search": {
    id: "dsa-2-binary-search",
    track: "dsa",
    order: 2,
    title: "Lesson 2: Divide and Conquer (Binary Search)",
    challenge: "Implement binary search to find target in a sorted list in O(log N) steps.",
    concepts: "Time complexity, binary search, two pointers.",
    starterCode: `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1\n\nprint("Found at:", binary_search([1, 3, 5, 7, 9], 7))\n`,
    testCheck: (out) => out.trim().includes("3"),
  },
  "dsa-3-stacks": {
    id: "dsa-3-stacks",
    track: "dsa",
    order: 3,
    title: "Lesson 3: The Ancient Tower (Stacks LIFO)",
    challenge: "Use a list as a Stack to push 10, push 20, and pop the top element.",
    concepts: "Stacks, Last-In-First-Out, push/pop.",
    starterCode: `stack = []\nstack.append(10)\nstack.append(20)\ntop = stack.pop()\nprint("Popped:", top)\n`,
    testCheck: (out) => out.trim().includes("20"),
  },
  "dsa-4-queues": {
    id: "dsa-4-queues",
    track: "dsa",
    order: 4,
    title: "Lesson 4: The Hero Queue (Queues FIFO)",
    challenge: "Implement a FIFO queue where the first adventurer in is the first served.",
    concepts: "Queues, First-In-First-Out, collections.deque.",
    starterCode: `from collections import deque\nq = deque(["Arthur", "Lancelot"])\nq.append("Galahad")\nfirst = q.popleft()\nprint("First Served:", first)\n`,
    testCheck: (out) => out.trim().includes("Arthur"),
  },
};

export const lessonsRegistry = multiCourseRegistry;
export const loopsLesson = multiCourseRegistry["python-4-loops"];

export const tutorRequestSchema = z
  .object({
    lessonId: z.string().refine((id) => id in multiCourseRegistry, {
      message: "Unknown lesson identifier.",
    }),
    code: z.string().max(8000),
    output: z.string().max(8000).default(""),
    error: z.string().max(3000).default(""),
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(4000),
        }),
      )
      .min(1)
      .max(16),
  })
  .refine((body) => body.messages.at(-1)?.role === "user", "A learner question is required.");
