import { z } from "zod";

export const loopsLesson = {
  id: "python-4-loops",
  title: "Python Fundamentals — Lesson 4: Loops",
  challenge: "Use a for loop to print the numbers 1 through 10, each on a new line.",
  concepts: "Python for loops, range(start, stop), exclusive stop bounds, and indentation.",
};

export const tutorRequestSchema = z
  .object({
    lessonId: z.literal("python-4-loops"),
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
