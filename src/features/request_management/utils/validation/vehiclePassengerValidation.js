export const validatePassengers = (capacity, passengers) => {
  const result = { error: "", warning: "" };
  if (capacity == null || Number.isNaN(Number(capacity))) return result;
  const c = Number(capacity);
  const p = Number(passengers || 0);
  if (p < 0) {
    result.error = "Passengers must be a non-negative number.";
    return result;
  }
  if (p > c) {
    result.error = `Passengers (${p}) exceed vehicle capacity (${c}).`;
    return result;
  }
  if (p >= Math.ceil(0.8 * c)) {
    result.warning = `Approaching capacity limit: ${p}/${c}.`;
  }
  return result;
};

