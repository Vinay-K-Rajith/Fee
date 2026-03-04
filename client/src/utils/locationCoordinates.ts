// Predefined coordinates for Delhi NCR locations (accurate GPS coordinates)
export const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  'Shahdara': { lat: 28.606, lng: 77.278 },
  'Delhi': { lat: 28.704, lng: 77.103 },
  'Chandni': { lat: 28.646, lng: 77.226 },
  'Ghaziabad': { lat: 28.669, lng: 77.455 },
  'Mehrauli': { lat: 28.523, lng: 77.187 },
  'Gurgaon': { lat: 28.459, lng: 77.026 },
  'Kalkaji': { lat: 28.516, lng: 77.260 },
  'NCR': { lat: 28.600, lng: 77.200 },
  'Faridabad': { lat: 28.409, lng: 77.314 },
  'Dwarka': { lat: 28.592, lng: 77.042 },
  'Vasant': { lat: 28.547, lng: 77.175 },
  'Malviya': { lat: 28.556, lng: 77.196 },
  'Saket': { lat: 28.524, lng: 77.197 },
  'Rohini': { lat: 28.785, lng: 77.046 },
  'Laxmi': { lat: 28.551, lng: 77.270 },
  'Greater': { lat: 28.615, lng: 77.380 },
  'Janakpuri': { lat: 28.515, lng: 77.065 },
  'Mayur': { lat: 28.469, lng: 77.125 },
  'Okhla': { lat: 28.525, lng: 77.254 },
  'Noida': { lat: 28.576, lng: 77.360 },
  'Sector': { lat: 28.595, lng: 77.360 },
  'East': { lat: 28.635, lng: 77.318 },
};

// Fuzzy match function to find closest location
export function getCoordinatesForLocation(location: string): { lat: number; lng: number } | null {
  const normalizedInput = location.toLowerCase().trim();
  
  // Exact match
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    if (key.toLowerCase() === normalizedInput) {
      return coords;
    }
  }
  
  // Partial match (location contains key or key contains location)
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    const lowerKey = key.toLowerCase();
    if (normalizedInput.includes(lowerKey) || lowerKey.includes(normalizedInput)) {
      return coords;
    }
  }
  
  // If no match found, return null
  return null;
}
