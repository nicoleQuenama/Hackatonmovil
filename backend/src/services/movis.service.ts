import { v4 as uuidv4 } from 'uuid';

export interface HotspotData {
  id: string;
  source: 'MOVIS' | 'VIIR';
  lat: number;
  lng: number;
  zona: string;
  thermalAnomaly: number;    // Kelvin above background
  ndvi: number;              // -1 to 1 (low = dry vegetation)
  frp: number;               // Fire Radiative Power (MW)
  confidence: number;        // 0-100 %
  timestamp: string;
}

interface ZoneProfile {
  lat: number;
  lng: number;
  zona: string;
  baseThermal: number;
  baseNDVI: number;
}

const ZONE_PROFILES: ZoneProfile[] = [
  { lat: -17.28,   lng: -66.21,  zona: 'Parque Tunari', baseThermal: 12.5, baseNDVI: 0.25 },
  { lat: -17.3950, lng: -66.0450, zona: 'Sacaba',        baseThermal: 6.0,  baseNDVI: 0.42 },
  { lat: -17.3950, lng: -66.3600, zona: 'Quillacollo',   baseThermal: 8.3,  baseNDVI: 0.33 },
  { lat: -17.39,   lng: -66.155,  zona: 'Cercado',       baseThermal: 3.2,  baseNDVI: 0.55 },
];

function jitter(base: number, range: number): number {
  return parseFloat((base + (Math.random() * range * 2 - range)).toFixed(2));
}

export async function fetchMOVISHotspots(): Promise<HotspotData[]> {
  // Simulate network latency
  await new Promise<void>((resolve) => setTimeout(resolve, 80));

  return ZONE_PROFILES.map((profile) => ({
    id: uuidv4(),
    source: Math.random() > 0.5 ? 'MOVIS' : 'VIIR',
    lat: jitter(profile.lat, 0.005),
    lng: jitter(profile.lng, 0.005),
    zona: profile.zona,
    thermalAnomaly: jitter(profile.baseThermal, 2),
    ndvi: parseFloat(Math.max(0.05, Math.min(0.9, profile.baseNDVI + (Math.random() * 0.1 - 0.05))).toFixed(3)),
    frp: jitter(profile.baseThermal * 1.8, 1.5),
    confidence: Math.round(60 + Math.random() * 35),
    timestamp: new Date().toISOString(),
  }));
}

export async function fetchHotspotsByZone(zona: string): Promise<HotspotData[]> {
  const all = await fetchMOVISHotspots();
  return all.filter((h) => h.zona.toLowerCase() === zona.toLowerCase());
}

export async function fetchLatestVIIRSnapshot(): Promise<HotspotData[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, 60));

  return ZONE_PROFILES.filter((p) => p.baseThermal > 7).map((profile) => ({
    id: uuidv4(),
    source: 'VIIR' as const,
    lat: jitter(profile.lat, 0.003),
    lng: jitter(profile.lng, 0.003),
    zona: profile.zona,
    thermalAnomaly: jitter(profile.baseThermal + 2, 1.5),
    ndvi: parseFloat(Math.max(0.05, profile.baseNDVI - 0.1).toFixed(3)),
    frp: jitter(profile.baseThermal * 2.2, 2),
    confidence: Math.round(75 + Math.random() * 20),
    timestamp: new Date().toISOString(),
  }));
}
