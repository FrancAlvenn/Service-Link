import mbxDirections from "@mapbox/mapbox-sdk/services/directions";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

export const geocodeOrigin = async (token, originText) => {
  const geocoding = mbxGeocoding({ accessToken: token });
  const res = await geocoding.forwardGeocode({ query: originText, limit: 1 }).send();
  const feature = res?.body?.features?.[0];
  if (!feature?.center) throw new Error("Origin not found");
  return { lon: feature.center[0], lat: feature.center[1] };
};

export const getRouteDurationSeconds = async (token, originCoord, destCoord) => {
  const directions = mbxDirections({ accessToken: token });
  const res = await directions
    .getDirections({
      profile: "driving",
      geometries: "geojson",
      overview: "simplified",
      waypoints: [
        { coordinates: [originCoord.lon, originCoord.lat] },
        { coordinates: [destCoord.lon, destCoord.lat] },
      ],
    })
    .send();
  const route = res?.body?.routes?.[0];
  if (!route?.duration) throw new Error("No route found");
  return Math.round(route.duration); // seconds
};

export const addDurationToTime = (dateISO, departHHMM, durationSec) => {
  const depart = new Date(`${dateISO}T${departHHMM}`);
  const arrival = new Date(depart.getTime() + durationSec * 1000);
  const hh = String(arrival.getHours()).padStart(2, "0");
  const mm = String(arrival.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

