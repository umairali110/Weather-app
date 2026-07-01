import { Controller, Get, Query, ParseFloatPipe,Post,Body } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherAiService } from './weather-ai.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService,
    private readonly weatherAiService: WeatherAiService,
  ) {}

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
 @Post('ask')
  ask(
    @Body('question') question: string,
    @Body('lat') lat: number,
    @Body('lon') lon: number,
    @Body('city') city?: string,
  ) {
    return this.weatherAiService
      .answerWeatherQuestion({ question, lat, lon, city })
      .then((answer) => ({ answer }));
  }
}
