import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon in React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition, onLocationFound }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationFound(e.latlng);
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onLocationFound(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Ubicación seleccionada</Popup>
    </Marker>
  );
}

export default function AddressMap({ onLocationSelect }) {
  // Default center: Turbaco, Bolivar, Colombia
  const defaultCenter = [10.3333, -75.4167]; 
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLocationFound = async (latlng) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es', // Request Spanish results
            'User-Agent': 'KebabWebsite/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.address) {
        // Extract relevant parts for neighborhood matching
        // Nominatim returns various fields: neighbourhood, suburb, residential, village, etc.
        const neighborhood = data.address.neighbourhood || 
                             data.address.suburb || 
                             data.address.residential || 
                             data.address.village || 
                             data.address.city_district || '';
                             
        const fullAddress = data.display_name;

        onLocationSelect({
          lat: latlng.lat,
          lng: latlng.lng,
          address: fullAddress,
          neighborhood: neighborhood,
          rawAddress: data.address // Pass full object just in case
        });
      }
    } catch (error) {
      console.error("Error geocoding:", error);
    } finally {
      setLoading(false);
    }
  };

  const locateMe = () => {
    // We can't access the map instance directly here easily without a ref or context, 
    // but we can trigger standard browser geolocation and update state.
    // However, the cleanest way in Leaflet is map.locate(). 
    // Since map instance is inside MapContainer, let's use a workaround or pass a prop to LocationMarker to trigger it.
    // Simpler: use navigator.geolocation
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition((pos) => {
         const { latitude, longitude } = pos.coords;
         const latlng = { lat: latitude, lng: longitude };
         setPosition(latlng);
         handleLocationFound(latlng);
       });
    } else {
      alert("Geolocalización no soportada por este navegador.");
    }
  };

  return (
    <div className="card mb-3 border-warning">
      <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
        <span className="fw-bold"><i className="bi bi-geo-alt-fill me-1"></i> Selecciona tu ubicación</span>
        <button type="button" className="btn btn-sm btn-dark text-warning" onClick={locateMe} disabled={loading}>
          {loading ? 'Buscando...' : 'Usar mi ubicación'}
        </button>
      </div>
      <div style={{ height: '300px', width: '100%' }}>
        <MapContainer center={defaultCenter} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onLocationFound={handleLocationFound} />
          {/* We force the map to fly to position if it changes via external button (locateMe) 
              This requires a component that listens to 'position' prop changes.
          */}
          <MapUpdater position={position} />
        </MapContainer>
      </div>
      <div className="card-footer text-muted small">
         Toca el mapa para ajustar la ubicación exacta.
      </div>
    </div>
  );
}

// Helper to update map view when position changes externally
function MapUpdater({ position }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);
  return null;
}
