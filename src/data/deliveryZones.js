export const DELIVERY_ZONES = [
  { id: 'local', name: 'Gaviotas / Los Ejecutivos', fee: 5000, keywords: ['gaviotas', 'ejecutivos', 'castellana', 'villa sandra', 'bombonera'], maxDistanceKm: 2.0 },
  { id: 'zona2', name: 'Zonas Aledañas (2-5km)', fee: 8000, keywords: ['campestre', 'olaya', 'alpes', 'terca'], maxDistanceKm: 5.0 },
  { id: 'zona3', name: 'Zonas Lejanas (5-10km)', fee: 12000, keywords: ['bocagrande', 'manga', 'crespo', 'boquilla'], maxDistanceKm: 10.0 },
  { id: 'pickup', name: 'Recogida en Local', fee: 0, keywords: [], maxDistanceKm: 0 },
];

// Coordenadas exactas del Restaurante (Los Ejecutivos)
export const RESTAURANT_LOCATION = {
  lat: 10.399278,
  lng: -75.491306
};

// Función para calcular distancia en km (Fórmula Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const findZoneByNeighborhood = (neighborhoodName) => {
  if (!neighborhoodName) return null;
  const lowerName = neighborhoodName.toLowerCase();
  
  // Prioridad 1: Buscar por palabras clave del barrio
  return DELIVERY_ZONES.find(zone => 
    zone.id !== 'pickup' && zone.keywords.some(keyword => lowerName.includes(keyword))
  );
};

export const getZoneByDistance = (lat, lng) => {
  const distance = calculateDistance(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, lat, lng);
  console.log(`Distancia calculada: ${distance.toFixed(2)} km`);

  // Prioridad 2: Si no hubo coincidencia por nombre, asignar por rango de km
  if (distance <= 2.0) return DELIVERY_ZONES.find(z => z.id === 'local');
  if (distance <= 5.0) return DELIVERY_ZONES.find(z => z.id === 'zona2');
  if (distance <= 10.0) return DELIVERY_ZONES.find(z => z.id === 'zona3');
  
  return null; // Demasiado lejos
};
