import { useState, useEffect } from 'react';

export function useBusData() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        
        // This "Adapter" wraps Gwinnett's flat data back into the 
        // nested shape that your BusTracker.tsx sidebar expects
        const normalizedData = data.map(bus => {
          return {
            id: bus.id,
            // We keep the flat values for the Map.js
            latitude: bus.latitude,
            longitude: bus.longitude,
            route: bus.route,
            vehicleId: bus.vehicleId,
            timestamp: bus.timestamp,
            // We recreate the nested values for BusTracker.tsx
            vehicle: {
              vehicle: { id: bus.id, label: bus.vehicleId },
              position: { latitude: bus.latitude, longitude: bus.longitude, bearing: bus.heading },
              trip: { routeId: String(bus.route) }, // Forces it to match routes.json
              timestamp: bus.timestamp
            }
          };
        });

        setBuses(normalizedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching GWCT data:", err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Refreshes every 15 seconds
    return () => clearInterval(interval);
  }, []);

  return { buses, loading };
}