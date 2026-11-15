import { Router } from 'express';
import { getWeatherByZone, getAllZonesWeather } from '../controllers/weather.controller';

const router = Router();

// GET /api/weather         (all zones)
router.get('/', getAllZonesWeather);

// GET /api/weather/:zona   (specific zone)
router.get('/:zona', getWeatherByZone);

export default router;
