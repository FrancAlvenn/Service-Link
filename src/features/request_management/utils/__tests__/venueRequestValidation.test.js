import { validatePax, validateTimeRange } from "../validation/venueRequestValidation";

describe("validatePax", () => {
  test("returns no error/warning when capacity is undefined", () => {
    expect(validatePax(undefined, 50)).toEqual({ error: "", warning: "" });
  });

  test("error when pax is negative", () => {
    const res = validatePax(100, -1);
    expect(res.error).toMatch(/non-negative/);
    expect(res.warning).toBe("");
  });

  test("error when pax exceeds capacity", () => {
    const res = validatePax(100, 120);
    expect(res.error).toMatch(/exceed venue capacity/i);
    expect(res.warning).toBe("");
  });

  test("warning when pax reaches 80% of capacity", () => {
    const res = validatePax(100, 80);
    expect(res.error).toBe("");
    expect(res.warning).toMatch(/Approaching capacity limit/i);
  });

  test("no warning below 80% of capacity", () => {
    const res = validatePax(100, 79);
    expect(res.error).toBe("");
    expect(res.warning).toBe("");
  });
});

describe("validateTimeRange", () => {
  test("no error when either time missing", () => {
    expect(validateTimeRange("", "10:00")).toEqual({ error: "" });
  });

  test("error when end <= start", () => {
    const res = validateTimeRange("10:00", "10:00");
    expect(res.error).toMatch(/later than start/i);
  });

  test("error when duration < 60 minutes", () => {
    const res = validateTimeRange("10:00", "10:30");
    expect(res.error).toMatch(/at least 1 hour/i);
  });

  test("valid for broad ranges across day", () => {
    expect(validateTimeRange("00:00", "01:00")).toEqual({ error: "" });
    expect(validateTimeRange("16:00", "18:00")).toEqual({ error: "" });
    expect(validateTimeRange("22:00", "23:30")).toEqual({ error: "" });
  });
});

