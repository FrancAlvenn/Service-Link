import { validatePassengers } from "../validation/vehiclePassengerValidation";

describe("validatePassengers", () => {
  test("returns no error/warning when capacity is undefined", () => {
    expect(validatePassengers(undefined, 4)).toEqual({ error: "", warning: "" });
  });

  test("error when passengers is negative", () => {
    const res = validatePassengers(10, -1);
    expect(res.error).toMatch(/non-negative/);
    expect(res.warning).toBe("");
  });

  test("error when passengers exceed capacity", () => {
    const res = validatePassengers(10, 12);
    expect(res.error).toMatch(/exceed vehicle capacity/i);
    expect(res.warning).toBe("");
  });

  test("warning when passengers reach 80% of capacity", () => {
    const res = validatePassengers(10, 8);
    expect(res.error).toBe("");
    expect(res.warning).toMatch(/Approaching capacity limit/i);
  });

  test("no warning below 80% of capacity", () => {
    const res = validatePassengers(10, 7);
    expect(res.error).toBe("");
    expect(res.warning).toBe("");
  });
});

