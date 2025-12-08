import { detectTypes, validatePrompt, normalizeType, rateLimiter, isStudent, shouldBlockStudent } from "../AIPrompt.validation";

describe("AIPrompt validation", () => {
  const helpers = {
    toDate: (v) => {
      const m = String(v || "").match(/\d{4}-\d{2}-\d{2}/);
      return m ? m[0] : undefined;
    },
    toTime: (v) => {
      const m = String(v || "").match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
      return m ? m[0] : undefined;
    },
  };

  test("detectTypes identifies venue", () => {
    const types = detectTypes("Book a venue in Hall A");
    expect(types).toContain("venue_request");
  });

  test("validatePrompt rejects empty", () => {
    const res = validatePrompt("", helpers);
    expect(res.ok).toBe(false);
    expect(res.code).toBe(400);
    expect(res.message).toMatch(/Please specify your request type/);
  });

  test("validatePrompt accepts vehicle with context", () => {
    const res = validatePrompt("Need vehicle for 5 pax at 10:30 to City Hall on 2025-01-15", helpers);
    expect(res.ok).toBe(true);
    expect(res.types).toContain("vehicle_request");
  });

  test("normalizeType maps tokens", () => {
    expect(normalizeType("job")).toBe("job_request");
    expect(normalizeType("vehicle")).toBe("vehicle_request");
    expect(normalizeType("venue")).toBe("venue_request");
  });

  test("isStudent and block student job", () => {
    const user = { designation_id: 1 };
    expect(isStudent(user)).toBe(true);
    expect(shouldBlockStudent("job_request", user)).toBe(true);
    expect(shouldBlockStudent("venue_request", user)).toBe(false);
  });

  test("rateLimiter returns 429 after threshold", () => {
    const user = { email: "tester@example.com" };
    const key = `aiprompt_rate_${user.email}`;
    localStorage.removeItem(key);
    for (let i = 0; i < 5; i++) {
      const r = rateLimiter(user);
      expect(r.ok).toBe(true);
    }
    const r6 = rateLimiter(user);
    expect(r6.ok).toBe(false);
    expect(r6.code).toBe(429);
  });
});
