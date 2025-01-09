import { JobRequestsProvider } from "./JobRequestsContext";
// import { PurchasingRequestsProvider } from "./PurchasingRequestsContext";
// import { VehicleRequestsProvider } from "./VehicleRequestsContext";
// import { VenueRequestsProvider } from "./VenueRequestsContext";

export function RequestsProviderWrapper ({ children })  {
  return (
    <JobRequestsProvider>
        {children}
    </JobRequestsProvider>
  );
};


