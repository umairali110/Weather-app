import api from './api';

export async function searchLocation(query: string) {
  const res = await api.get('/weather/search', { params: { q: query } });
  return res.data;
}

export async function getCurrentWeather(lat: number, lon: number) {
  const res = await api.get('/weather/current', { params: { lat, lon } });
  return res.data;
}

export async function getForecast(lat: number, lon: number) {
  const res = await api.get('/weather/forecast', { params: { lat, lon } });
  return res.data;
}

export async function reverseGeocode(lat: number, lon: number) {
  const res = await api.get('/weather/reverse', { params: { lat, lon } });
  return res.data;
}

export async function getAirQuality(lat: number, lon: number) {
  const res = await api.get('/weather/air-quality', { params: { lat, lon } });
  return res.data;
}