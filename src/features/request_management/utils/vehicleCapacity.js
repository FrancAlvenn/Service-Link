export const getVehicleCapacity = (vehicleOptions, vehicleId) => {
  const v = (vehicleOptions || []).find(
    (veh) => Number(veh.vehicle_id) === Number(vehicleId)
  );
  return v?.capacity ? Number(v.capacity) : null;
};

