import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherAiService } from './weather-ai.service';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, WeatherAiService], 
})
export class WeatherModule {}