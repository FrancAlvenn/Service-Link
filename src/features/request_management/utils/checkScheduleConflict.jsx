const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export const checkVenueConflict = (venueRequests, requestToCheck) => {
  const newStart = timeToMinutes(requestToCheck.event_start_time);
  const newEnd = timeToMinutes(requestToCheck.event_end_time);
  const newVenue = requestToCheck.venue_id;
  const newDate = requestToCheck.event_dates;

  // 1. Check against approved requests (HARD conflicts)
  for (const existing of venueRequests) {
    if (existing.archived) {
      console.log("Skipping archived request");
      continue;
    }
    if (requestToCheck.id && existing.id === requestToCheck.id) {
      console.log("Skipping self-check");
      continue;
    }

    if (existing.venue_id === newVenue && existing.event_dates === newDate) {
      const existingStart = timeToMinutes(existing.event_start_time);
      let existingEnd = timeToMinutes(existing.event_end_time);

      // Apply grace period for events ending at 12 PM
      if (existing.event_end_time === "12:00") {
        existingEnd += 60; // 1-hour buffer
      }

      // FIX: Add grace period to ALL approved events, not just 12 PM
      existingEnd += 60; // Add 1-hour buffer to ALL approved events

      // Check for time overlap - FIXED CONDITION
      if (newStart < existingEnd && newEnd > existingStart) {
        return {
          conflict: true,
          type: "hard",
          message: `Venue is already booked for an approved request from ${existing.event_start_time} to ${existing.event_end_time}`,
        };
      }
    }
  }

  // 2. Check against pending requests (SOFT conflicts)
  for (const existing of venueRequests) {
    if (existing.archived) {
      console.log("Skipping archived request");
      continue;
    }
    if (requestToCheck.id && existing.id === requestToCheck.id) {
      console.log("Skipping self-check");
      continue;
    }

    if (existing.venue_id === newVenue && existing.event_dates === newDate) {
      const existingStart = timeToMinutes(existing.event_start_time);
      const existingEnd = timeToMinutes(existing.event_end_time);

      // Check for time overlap - FIXED CONDITION
      if (newStart < existingEnd && newEnd > existingStart) {
        return {
          conflict: true,
          type: "soft",
          message: `Warning: Pending request exists for same time slot (${existing.event_start_time}-${existing.event_end_time})`,
        };
      }
    }
  }

  return { conflict: false };
};
