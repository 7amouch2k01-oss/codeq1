import { z } from "zod";

export interface LessonInfo {
  id: string;
  title: string;
  challenge: string;
  concepts: string;
}

export const lessonsRegistry: Record<string, LessonInfo> = {
  "python-1-variables": {
    id: "python-1-variables",
    title: "Python Fundamentals — Lesson 1: Variables",
    challenge: "Assign the string 'Questbound' to a variable named hero and print it.",
    concepts: "Variable assignment, string literals, and print() output.",
  },
  "python-2-conditionals": {
    id: "python-2-conditionals",
    title: "Python Fundamentals — Lesson 2: Conditionals",
    challenge: "Check if xp is greater than or equal to 100 and print 'Level Up!'.",
    concepts: "if statements, comparison operators (>=), boolean logic, indentation.",
  },
  "python-3-functions": {
    id: "python-3-functions",
    title: "Python Fundamentals — Lesson 3: Functions",
    challenge: "Define a function greet(name) that returns 'Welcome, ' + name.",
    concepts: "def keyword, parameters, return statements, function calls.",
  },
  "python-4-loops": {
    id: "python-4-loops",
    title: "Python Fundamentals — Lesson 4: Loops",
    challenge: "Use a for loop to print the numbers 1 through 10, each on a new line.",
    concepts: "Python for loops, range(start, stop), exclusive stop bounds, and indentation.",
  },
  "python-5-projects": {
    id: "python-5-projects",
    title: "Python Fundamentals — Lesson 5: Projects",
    challenge: "Build a text calculator that adds two numbers and displays the result.",
    concepts: "Combining variables, user operations, functions, and string formatting.",
  },
  "python-6-lists": {
    id: "python-6-lists",
    title: "Python Fundamentals — Lesson 6: Lists and Arrays",
    challenge: "Create a list of 3 quest items and iterate through them printing each item.",
    concepts: "Lists, indexing, appending, and list iterations.",
  },
};

export const loopsLesson = lessonsRegistry["python-4-loops"];

export const tutorRequestSchema = z
  .object({
    lessonId: z.string().refine((id) => id in lessonsRegistry, {
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
