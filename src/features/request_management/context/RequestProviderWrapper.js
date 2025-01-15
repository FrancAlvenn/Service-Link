import { JobRequestsProvider } from "./JobRequestsContext";
import { PurchasingRequestsProvider } from "./PurchasingRequestsContext";
import { VehicleRequestsProvider } from "./VehicleRequestsContext";
import { VenueRequestsProvider } from "./VenueRequestsContext";
// import { PurchasingRequestsProvider } from "./PurchasingRequestsContext";
// import { VehicleRequestsProvider } from "./VehicleRequestsContext";
// import { VenueRequestsProvider } from "./VenueRequestsContext";

export function RequestsProviderWrapper ({ children })  {
  return (
    <JobRequestsProvider>
      <PurchasingRequestsProvider>
        <VehicleRequestsProvider>
          <VenueRequestsProvider>
            {children}
          </VenueRequestsProvider>
        </VehicleRequestsProvider>
      </PurchasingRequestsProvider>
    </JobRequestsProvider>
  );
};


