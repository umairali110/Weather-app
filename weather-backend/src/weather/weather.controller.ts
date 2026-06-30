import { Controller, Get, Query, ParseFloatPipe } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('search')
  search(@Query('q') q: string) {
    return this.weatherService.searchLocation(q);
  }

  @Get('current')
  current(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ) {
    return this.weatherService.getCurrentWeather(lat, lon);
  }

  @Get('forecast')
  forecast(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ) {
    return this.weatherService.getForecast(lat, lon);
  }

  @Get('reverse')
  reverse(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ) {
    return this.weatherService.reverseGeocode(lat, lon);
  }
  @Get('air-quality')
airQuality(
  @Query('lat', ParseFloatPipe) lat: number,
  @Query('lon', ParseFloatPipe) lon: number,
) {
  return this.weatherService.getAirQuality(lat, lon);
}
}
