import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import mapboxgl from "mapbox-gl";
import MapboxClient from "@mapbox/mapbox-sdk/services/geocoding";
import "mapbox-gl/dist/mapbox-gl.css";

const MapboxAddressPicker = forwardRef(({ onSelect, token }, ref) => {
  const mapContainer = useRef(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const geocodingClientRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!token) {
      setError("Mapbox token is missing");
      return;
    }

    try {
      mapboxgl.accessToken = token;
      geocodingClientRef.current = MapboxClient({ accessToken: token });

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [121.0437, 14.676], // Manila coordinates
        zoom: 12,
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add click handler to map
      map.on("click", handleMapClick);

      mapRef.current = map;
      setError(null);

      return () => {
        map.off("click", handleMapClick);
        map.remove();
      };
    } catch (err) {
      console.error("Map initialization error:", err);
      setError("Failed to initialize map");
    }
  }, [token]);

  const handleMapClick = async (e) => {
    try {
      setLoading(true);
      const { lng, lat } = e.lngLat;

      // Reverse geocode clicked location
      const response = await geocodingClientRef.current
        .reverseGeocode({
          query: [lng, lat],
          limit: 1,
          types: ["address", "poi", "place"],
        })
        .send();

      const place = response.body.features[0];

      if (place) {
        // Update marker
        updateMarker([lng, lat]);

        // Update search query
        setQuery(place.place_name);

        // Notify parent component
        if (onSelect) {
          onSelect({
            ...place,
            coordinates: [lng, lat],
          });
        }
      }
    } catch (err) {
      console.error("Reverse geocode error:", err);
      setError("Failed to get location details");
    } finally {
      setLoading(false);
    }
  };

  const updateMarker = (coordinates) => {
    if (!mapRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker with precise placement
    markerRef.current = new mapboxgl.Marker({
      color: "#3b82f6",
      draggable: false,
    })
      .setLngLat(coordinates)
      .addTo(mapRef.current);

    // Center map on marker
    mapRef.current.flyTo({
      center: coordinates,
      zoom: 15,
      essential: true,
    });
  };

  // Debounced search function
  const performSearch = useCallback(async (value) => {
    try {
      setLoading(true);
      const response = await geocodingClientRef.current
        .forwardGeocode({
          query: value,
          autocomplete: true,
          limit: 5,
          countries: ["PH"],
          proximity: [121.0437, 14.676],
        })
        .send();

      setSuggestions(response.body.features);
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Failed to search locations");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only search if query has at least 3 characters
    if (value.length > 2) {
      // Set new timer with 500ms delay
      debounceTimer.current = setTimeout(() => {
        performSearch(value);
      }, 500);
    } else {
      setSuggestions([]);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSelect = (place) => {
    // Use precise coordinates from geometry if available
    const coordinates = place.geometry?.coordinates || place.center;

    if (coordinates) {
      updateMarker(coordinates);
      setQuery(place.place_name);
      setSuggestions([]);

      if (onSelect) {
        onSelect({
          ...place,
          coordinates,
        });
      }
    } else {
      setError("Location coordinates not found");
    }
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      setQuery("");
      setSuggestions([]);
      setError(null);
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [121.0437, 14.676],
          zoom: 12,
        });
      }
    },
  }));

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          name="destination"
          value={query}
          onChange={handleSearch}
          placeholder="Search address in Philippines..."
          className="p-2 border w-full rounded-md text-sm pr-10"
          disabled={loading}
          onFocus={(e) => {
            e.target.style.fontSize = "16px";
          }}
          inputMode="search"
          enterKeyHint="search"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {suggestions.length > 0 && (
        <ul
          className="bg-white dark:bg-gray-800 shadow-lg rounded-md border dark:border-gray-700 max-h-64 overflow-y-auto"
          style={{ touchAction: "manipulation" }}
        >
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-start"
              onClick={() => handleSelect(s)}
            >
              <span className="mr-2">📍</span>
              <span>{s.place_name}</span>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={mapContainer}
        className="w-full h-64 rounded-md border dark:border-gray-700 mt-2"
        onTouchStart={(e) => e.stopPropagation()}
      />

      <p className="text-xs text-gray-500 mt-1">
        Click on the map to select a location or search for an address
      </p>
    </div>
  );
});

export default MapboxAddressPicker;
