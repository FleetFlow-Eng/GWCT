import { NextResponse } from 'next/server';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

export async function GET() {
  try {
    // Direct feed from Ride Gwinnett's live Avail system
    const response = await fetch('https://realtimegwinnett.availtec.com/InfoPoint/GTFS-Realtime.ashx?Type=VehiclePosition', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/x-protobuf'
      }
    });

    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

    const vehicles = feed.entity.map(entity => {
      const v = entity.vehicle;
      // Safer timestamp handling
      const ts = v.timestamp?.low ? v.timestamp.low : (Number(v.timestamp) || Math.floor(Date.now() / 1000));

      return {
        id: entity.id || v.vehicle?.id || 'Unknown',
        latitude: v.position?.latitude || 0,
        longitude: v.position?.longitude || 0,
        route: v.trip?.routeId || 'Unknown',
        heading: v.position?.bearing || 0,
        vehicleId: v.vehicle?.label || v.vehicle?.id || 'N/A',
        timestamp: ts
      };
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('GWCT Tracker Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}