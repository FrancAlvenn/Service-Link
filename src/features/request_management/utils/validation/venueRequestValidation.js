export const validatePax = (capacity, pax) => {
  const result = { error: "", warning: "" };
  if (capacity == null || Number.isNaN(Number(capacity))) return result;
  const c = Number(capacity);
  const p = Number(pax || 0);
  if (p < 0) {
    result.error = "Estimated attendees must be a non-negative number.";
    return result;
  }
  if (p > c) {
    result.error = `Estimated attendees (${p}) exceed venue capacity (${c}).`;
    return result;
  }
  if (p >= Math.ceil(0.8 * c)) {
    result.warning = `Approaching capacity limit: ${p}/${c}.`;
  }
  return result;
};

export const validateTimeRange = (startStr, endStr) => {
  const result = { error: "" };
  if (!startStr || !endStr) return result;
  const start = new Date(`1970-01-01T${startStr}`);
  const end = new Date(`1970-01-01T${endStr}`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return result;
  if (start >= end) {
    result.error = "End time must be later than start time.";
    return result;
  }
  const durationMin = (end - start) / (1000 * 60);
  if (durationMin < 60) {
    result.error = "Event duration must be at least 1 hour.";
  }
  return result;
};

