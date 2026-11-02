// SAMPLE DATA ONLY. Never show these to real users as real listings.
export type Species = "dog" | "cat" | "other";
export type Size = "small" | "medium" | "large";

export interface Shelter { id: string; name: string; lat: number; lng: number; city: string }
export interface Intake {
  id: string; shelterId: string; species: Species; breed: string; color: string;
  size: Size; markings: string; foundDate: string; photo: string;
}

export const cities = [
  { name: "Bethesda, MD", lat: 38.9847, lng: -77.0947 },
  { name: "Washington, DC", lat: 38.9072, lng: -77.0369 },
  { name: "Toronto, ON", lat: 43.6532, lng: -79.3832 },
  { name: "Mexico City, CDMX", lat: 19.4326, lng: -99.1332 },
  { name: "Denver, CO", lat: 39.7392, lng: -104.9903 },
];

export const shelters: Shelter[] = [
  { id: "s1", name: "(Sample) Montgomery County Animal Services", lat: 39.1, lng: -77.15, city: "Derwood, MD" },
  { id: "s2", name: "(Sample) Washington Humane Society", lat: 38.915, lng: -76.98, city: "Washington, DC" },
  { id: "s3", name: "(Sample) Alexandria Animal Welfare", lat: 38.8, lng: -77.05, city: "Alexandria, VA" },
  { id: "s4", name: "(Sample) Toronto Animal Services", lat: 43.7, lng: -79.4, city: "Toronto, ON" },
  { id: "s5", name: "(Sample) Refugio Patitas CDMX", lat: 19.4, lng: -99.15, city: "Ciudad de México" },
  { id: "s6", name: "(Sample) Denver Animal Shelter", lat: 39.73, lng: -104.97, city: "Denver, CO" },
];

const ph = (c: string) =>
  "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120'><rect width='160' height='120' fill='${c}'/><text x='80' y='66' font-size='14' text-anchor='middle' fill='white' font-family='sans-serif'>sample photo</text></svg>`);

export const intakes: Intake[] = [
  { id: "i1", shelterId: "s1", species: "dog", breed: "Labrador mix", color: "black", size: "large", markings: "white patch on chest", foundDate: "2026-10-30", photo: ph("#6b7a8f") },
  { id: "i2", shelterId: "s2", species: "dog", breed: "Beagle", color: "brown", size: "medium", markings: "collar, no tag", foundDate: "2026-10-31", photo: ph("#8f7a6b") },
  { id: "i3", shelterId: "s3", species: "cat", breed: "Domestic shorthair", color: "grey", size: "small", markings: "white paws", foundDate: "2026-10-29", photo: ph("#7a8f6b") },
  { id: "i4", shelterId: "s1", species: "dog", breed: "Golden retriever", color: "golden", size: "large", markings: "scar on left ear", foundDate: "2026-11-01", photo: ph("#b08f4a") },
  { id: "i5", shelterId: "s4", species: "dog", breed: "Husky", color: "grey", size: "large", markings: "blue eyes", foundDate: "2026-10-28", photo: ph("#5a7a9a") },
  { id: "i6", shelterId: "s5", species: "dog", breed: "Chihuahua", color: "tan", size: "small", markings: "ninguna", foundDate: "2026-10-30", photo: ph("#9a7a5a") },
  { id: "i7", shelterId: "s6", species: "cat", breed: "Siamese", color: "cream", size: "small", markings: "dark face", foundDate: "2026-10-31", photo: ph("#9a8a7a") },
];

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const r = 6371, d = Math.PI / 180;
  const dLat = (bLat - aLat) * d, dLng = (bLng - aLng) * d;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * d) * Math.cos(bLat * d) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

export interface Search {
  species: Species; name: string; breed: string; color: string; size: Size;
  markings: string; dateLost: string; lat: number; lng: number; radiusKm: number;
}

export interface Match { intake: Intake; shelter: Shelter; km: number; score: number }

// Pass 1: species, found after date lost, within radius. Pass 2: score breed/colour/size/markings.
export function findMatches(s: Search, all: Intake[] = intakes): Match[] {
  const out: Match[] = [];
  for (const i of all) {
    const sh = shelters.find((x) => x.id === i.shelterId);
    if (!sh || i.species !== s.species || i.foundDate < s.dateLost) continue;
    const km = distanceKm(s.lat, s.lng, sh.lat, sh.lng);
    if (km > s.radiusKm) continue;
    const has = (a: string, b: string) => !!a && !!b && a.toLowerCase().includes(b.toLowerCase().trim());
    let score = 25; // species/date/distance already passed
    if (has(i.breed, s.breed) || has(s.breed, i.breed)) score += 25;
    if (has(i.color, s.color) || has(s.color, i.color)) score += 25;
    if (i.size === s.size) score += 15;
    if (s.markings && s.markings.toLowerCase().split(/\W+/).some((w) => w.length > 3 && i.markings.toLowerCase().includes(w))) score += 10;
    out.push({ intake: i, shelter: sh, km, score });
  }
  return out.sort((a, b) => b.score - a.score);
}
