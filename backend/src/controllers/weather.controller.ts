import { Request, Response } from 'express';

interface WeatherData {
  zona: string;
  viento: {
    velocidad: number;
    direccion: number;
    descripcion: string;
  };
  temperatura: number;
  humedad: number;
  condicion: string;
  indiceFuego: 'bajo' | 'moderado' | 'alto' | 'extremo';
  timestamp: string;
}

type ZoneKey = 'parque tunari' | 'sacaba' | 'quillacollo' | 'cercado';

const WEATHER_BY_ZONE: Record<ZoneKey, Omit<WeatherData, 'timestamp'>> = {
  'parque tunari': {
    zona: 'Parque Tunari',
    viento: { velocidad: 22, direccion: 220, descripcion: 'Sur-Suroeste' },
    temperatura: 36,
    humedad: 18,
    condicion: 'Despejado con vientos moderados',
    indiceFuego: 'extremo',
  },
  sacaba: {
    zona: 'Sacaba',
    viento: { velocidad: 14, direccion: 200, descripcion: 'Sur' },
    temperatura: 29,
    humedad: 35,
    condicion: 'Parcialmente nublado',
    indiceFuego: 'alto',
  },
  quillacollo: {
    zona: 'Quillacollo',
    viento: { velocidad: 25, direccion: 185, descripcion: 'Sur' },
    temperatura: 33,
    humedad: 20,
    condicion: 'Despejado',
    indiceFuego: 'extremo',
  },
  cercado: {
    zona: 'Cercado',
    viento: { velocidad: 11, direccion: 260, descripcion: 'Oeste' },
    temperatura: 27,
    humedad: 42,
    condicion: 'Nublado',
    indiceFuego: 'moderado',
  },
};

export function getWeatherByZone(req: Request, res: Response): void {
  const zonaParam = req.params.zona.toLowerCase() as ZoneKey;

  const weatherBase = WEATHER_BY_ZONE[zonaParam];

  if (!weatherBase) {
    // Return generic Cochabamba data if zone not specifically mapped
    const generic: WeatherData = {
      zona: req.params.zona,
      viento: { velocidad: 15, direccion: 210, descripcion: 'Sur-Suroeste' },
      temperatura: 30,
      humedad: 30,
      condicion: 'Variable',
      indiceFuego: 'moderado',
      timestamp: new Date().toISOString(),
    };
    res.json({ success: true, data: { weather: generic } });
    return;
  }

  const weather: WeatherData = {
    ...weatherBase,
    timestamp: new Date().toISOString(),
  };

  res.json({ success: true, data: { weather } });
}

export function getAllZonesWeather(_req: Request, res: Response): void {
  const zones = Object.values(WEATHER_BY_ZONE).map((w) => ({
    ...w,
    timestamp: new Date().toISOString(),
  }));
  res.json({ success: true, data: { zones } });
}
