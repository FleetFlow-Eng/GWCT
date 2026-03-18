import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- CUSTOM MAP CSS ---
const mapStyles = `
  @keyframes radarPing {
      0% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(2.5); opacity: 0; box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
      100% { transform: scale(1); opacity: 0; }
  }
  .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
  .leaflet-popup-tip-container { display: none !important; }
  .leaflet-popup-content { margin: 0 !important; width: auto !important; }
  
  .leaflet-tooltip {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      color: #ffffff !important;
      padding: 0 !important;
      text-shadow: 
          -1px -1px 0 #000,  
           1px -1px 0 #000,
          -1px  1px 0 #000,
           1px  1px 0 #000,
           0 2px 4px rgba(0,0,0,0.8);
  }
  .leaflet-tooltip::before {
      display: none !important;
  }
`;

// --- CLEAN MARKER WITH RADAR PING ---
const createBusIcon = (isStale, isSelected) => {
    const color = isStale ? '#f43f5e' : '#7c3aed'; // Gwinnett Purple
    const size = isSelected ? 24 : 14; 
    
    const html = `
        <div style="position: relative; width: ${size}px; height: ${size}px;">
            ${!isStale ? `
                <div style="
                    position: absolute; inset: 0; border-radius: 50%; 
                    background-color: ${color}; 
                    animation: radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                    z-index: -1;
                "></div>
            ` : ''}
            <div style="
                background-color: ${color};
                width: 100%; height: 100%;
                border: 2px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                transition: transform 0.2s ease;
                transform: scale(${isSelected ? 1.2 : 1});
            "></div>
        </div>
    `;
    
    return L.divIcon({
        className: 'clean-bus-icon',
        html: html,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2 - 5]
    });
};

const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 });
    }, [center, zoom, map]);
    return null;
};

export default function Map({ buses, selectedId, routes, darkMode }) {
    // Centered on Gwinnett County
    const defaultCenter = [33.9564, -84.0063]; 
    
    // Bulletproof selection logic
    const selectedBus = buses?.find((b) => b.id === selectedId || b.vehicle?.vehicle?.id === selectedId || b.vehicleId === selectedId);
    
    const centerPoint = selectedBus 
        ? [
            selectedBus.vehicle?.position?.latitude || selectedBus.latitude, 
            selectedBus.vehicle?.position?.longitude || selectedBus.longitude
          ] 
        : null;

    const tileUrl = darkMode 
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    return (
        <>
            <style>{mapStyles}</style>
            <MapContainer 
                center={defaultCenter} 
                zoom={11} 
                style={{ height: '100%', width: '100%', background: darkMode ? '#0f172a' : '#f8fafc', zIndex: 0 }}
                zoomControl={false} 
            >
                <TileLayer url={tileUrl} />
                {centerPoint && centerPoint[0] && <MapController center={centerPoint} zoom={15} />}

                {buses?.map((v) => {
                    // BULLETPROOF DATA PARSING: Checks both possible structures
                    const lat = v.vehicle?.position?.latitude || v.latitude;
                    const lng = v.vehicle?.position?.longitude || v.longitude;
                    
                    // If no coordinates are found, skip drawing this specific bus
                    if (!lat || !lng) return null;

                    const busNum = v.vehicle?.vehicle?.label || v.vehicleId || v.id;
                    const rId = v.vehicle?.trip?.routeId || v.route;
                    const cleanId = rId ? String(rId).trim() : "";
                    const routeInfo = routes?.[cleanId] || (cleanId ? `Route ${cleanId}` : "Ride Gwinnett");
                    
                    const timestamp = v.vehicle?.timestamp || v.timestamp || 0;
                    const lastSeenMs = timestamp * 1000;
                    const isStale = (Date.now() - lastSeenMs) > (5 * 60 * 1000); 
                    const isSelected = selectedId === busNum || selectedId === v.id;

                    return (
                        <Marker 
                            key={v.id || busNum} 
                            position={[lat, lng]} 
                            icon={createBusIcon(isStale, isSelected)}
                            zIndexOffset={isSelected ? 1000 : (isStale ? 1 : 100)}
                        >
                            <Tooltip permanent direction="right" offset={[10, 0]} opacity={1}>
                                <span style={{ fontWeight: '900', fontSize: '11px', letterSpacing: '0.05em' }}>{busNum}</span>
                            </Tooltip>

                            <Popup closeButton={false}>
                                <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${darkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/95 border-slate-200'} min-w-[180px]`}>
                                    <h3 className={`font-black text-2xl mb-1 tracking-tighter ${darkMode ? 'text-white' : 'text-[#522D80]'}`}>Unit {busNum}</h3>
                                    <p className="text-[10px] font-black text-[#FFC72C] uppercase mb-4 leading-tight border-b border-slate-500/20 pb-2">
                                        {routeInfo.split(' - ')[1] || routeInfo}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-inner ${isStale ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}>
                                            {isStale ? 'Signal Lost' : 'Transmitting'}
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </>
    );
}