import { describe, expect, it } from "vitest";
import { loopsLesson, tutorRequestSchema } from "@/lib/lesson-context";

describe("Lesson-aware hint requests", () => {
  const request = { lessonId: loopsLesson.id, code: "for i in range(1, 10):\n    print(i)", messages: [{ role: "user", content: "My loop misses 10. What should I check?" }] };
  it("accepts a coding problem without requiring code", () => {
    expect(tutorRequestSchema.parse({ ...request, code: "" }).messages[0]?.content).toBe("My loop misses 10. What should I check?");
  });
  it("rejects context for an unknown lesson", () => {
    expect(tutorRequestSchema.safeParse({ ...request, lessonId: "invented-lesson" }).success).toBe(false);
  });
  it("requires a nonempty learner problem", () => {
    expect(tutorRequestSchema.safeParse({ ...request, messages: [{ role: "user", content: " " }] }).success).toBe(false);
  });
});