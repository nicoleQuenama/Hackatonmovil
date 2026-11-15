import api from './api';

export interface WeatherData {
  zona: string;
  viento: {
    velocidad: number; // km/h
    direccion: number; // degrees 0-360
  };
  temperatura: number; // Celsius
  humedad: number; // percentage 0-100
  condicion: string;
  timestamp: string;
}

export const WeatherService = {
  async getWeatherByZone(zona: string): Promise<WeatherData> {
    const response = await api.get<WeatherData>(`/api/weather/${zona}`);
    return response.data;
  },
};

export default WeatherService;
