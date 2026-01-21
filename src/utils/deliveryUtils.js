// Coordenadas del Restaurante (Los Ejecutivos)
// Esto podría moverse a Firestore también en el futuro, pero por ahora lo mantenemos aquí o se pasa como argumento.
export const RESTAURANT_LOCATION = {
  lat: 10.399278,
  lng: -75.491306
};

// Fórmula Haversine para calcular distancia en km
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

export const findZoneByNeighborhood = (neighborhoodName, zones) => {
  if (!neighborhoodName || !zones) return null;
  const lowerName = neighborhoodName.toLowerCase();
  
  // Prioridad 1: Buscar por palabras clave del barrio
  return zones.find(zone => 
    zone.id !== 'pickup' && zone.keywords && zone.keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))
  );
};

export const getZoneByDistance = (lat, lng, zones) => {
  if (!zones) return null;
  const distance = calculateDistance(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, lat, lng);
  console.log(`Distancia calculada: ${distance.toFixed(2)} km`);

  // Ordenar zonas por distancia máxima (de menor a mayor) para encontrar la más cercana válida
  // Filtramos 'pickup' y las ordenamos
  const sortedZones = [...zones]
    .filter(z => z.id !== 'pickup')
    .sort((a, b) => a.maxDistanceKm - b.maxDistanceKm);

  // Buscar la primera zona que cubra la distancia
  for (const zone of sortedZones) {
    if (distance <= zone.maxDistanceKm) {
      return zone;
    }
  }
  
  return null; // Demasiado lejos
};
