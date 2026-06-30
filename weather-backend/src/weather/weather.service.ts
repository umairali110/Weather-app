import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly apiKey = process.env.OPENWEATHER_API_KEY;
  private readonly geoUrl = 'https://api.openweathermap.org/geo/1.0';
  private readonly dataUrl = 'https://api.openweathermap.org/data/2.5';

  // Search by city/state/country name -> returns matching locations with lat/lon
  async searchLocation(query: string) {
    // top of weather.service.ts, inside getCurrentWeather/searchLocation, or just in the constructor
console.log('API KEY LOADED:', process.env.OPENWEATHER_API_KEY);
    try {
      const res = await axios.get(`${this.geoUrl}/direct`, {
        params: { q: query, limit: 5, appid: this.apiKey },
      });
      return res.data.map((loc: any) => ({
        name: loc.name,
        state: loc.state || null,
        country: loc.country,
        lat: loc.lat,
        lon: loc.lon,
      }));
    } catch (err) {
      throw new HttpException('Failed to search location', HttpStatus.BAD_GATEWAY);
    }
  }

  async getCurrentWeather(lat: number, lon: number) {
    try {
      const res = await axios.get(`${this.dataUrl}/weather`, {
        params: { lat, lon, appid: this.apiKey, units: 'metric' },
      });
      return res.data;
    } catch (err) {
      throw new HttpException('Failed to fetch current weather', HttpStatus.BAD_GATEWAY);
    }
  }

  async getForecast(lat: number, lon: number) {
    try {
      const res = await axios.get(`${this.dataUrl}/forecast`, {
        params: { lat, lon, appid: this.apiKey, units: 'metric' },
      });
      return res.data;
    } catch (err) {
      throw new HttpException('Failed to fetch forecast', HttpStatus.BAD_GATEWAY);
    }
  }

  // Reverse geocode - turn user's browser lat/lon into a readable place name
  async reverseGeocode(lat: number, lon: number) {
    try {
      const res = await axios.get(`${this.geoUrl}/reverse`, {
        params: { lat, lon, limit: 1, appid: this.apiKey },
      });
      return res.data[0] || null;
    } catch (err) {
      throw new HttpException('Failed to reverse geocode', HttpStatus.BAD_GATEWAY);
    }
  }
  async getAirQuality(lat: number, lon: number) {
  try {
    const res = await axios.get(`${this.dataUrl}/air_pollution`, {
      params: { lat, lon, appid: this.apiKey },
    });
    return res.data;
  } catch (err) {
    throw new HttpException('Failed to fetch air quality', HttpStatus.BAD_GATEWAY);
  }
}
}
