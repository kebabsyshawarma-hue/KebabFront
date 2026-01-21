export const DELIVERY_ZONES = [
  { id: 'local', name: 'Gaviotas / Los Ejecutivos', fee: 5000, keywords: ['Gaviotas', 'Ejecutivos', 'Castellana'] },
  { id: 'zona2', name: 'Campestre / Plan Parejo', fee: 8000, keywords: ['campestre', 'plan parejo', 'parque'] },
  { id: 'zona3', name: 'Arjona / Ternera', fee: 10000, keywords: ['arjona', 'ternera'] },
  { id: 'pickup', name: 'Recogida en Local', fee: 0, keywords: [] },
];

export const findZoneByNeighborhood = (neighborhoodName) => {
  if (!neighborhoodName) return null;
  const lowerName = neighborhoodName.toLowerCase();
  
  // Search for keywords in the neighborhood name
  return DELIVERY_ZONES.find(zone => 
    zone.keywords.some(keyword => lowerName.includes(keyword))
  );
};
