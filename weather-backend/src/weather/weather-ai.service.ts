import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { WeatherService } from './weather.service';

interface AskParams {
  question: string;
  lat: number;
  lon: number;
  city?: string;
}

@Injectable()
export class WeatherAiService {
  private readonly logger = new Logger(WeatherAiService.name);
  private readonly HF_API_TOKEN = process.env.HUGGINGFACE_API_KEY;
  private readonly HF_MODEL = process.env.HF_WEATHER_MODEL || 'meta-llama/Llama-3.1-8B-Instruct';

  constructor(private readonly weatherService: WeatherService) {}

  async answerWeatherQuestion({ question, lat, lon, city }: AskParams): Promise<string> {
    // Reuse the existing WeatherService — no duplicate OpenWeather calls
    const [current, forecast, airQuality] = await Promise.all([
      this.weatherService.getCurrentWeather(lat, lon),
      this.weatherService.getForecast(lat, lon),
      this.weatherService.getAirQuality(lat, lon).catch(() => null), // optional, don't fail the whole request if this errors
    ]);

    const prompt = this.buildPrompt({ current, forecast, airQuality, city, question });

    try {
      return await this.callHuggingFace(prompt);
    } catch (err) {
      this.logger.error('Hugging Face call failed', err as Error);
      return this.buildFallbackAnswer(current);
    }
  }

  // ---------- Build a grounded prompt from raw OpenWeather responses ----------

  private buildPrompt({ current, forecast, airQuality, city, question }: any): string {
    const location = city || current.name || `${current.coord?.lat},${current.coord?.lon}`;

    const currentLine = `Temperature: ${Math.round(current.main.temp)}°C (feels like ${Math.round(
      current.main.feels_like,
    )}°C), Condition: ${current.weather?.[0]?.description}, Humidity: ${current.main.humidity}%, Wind: ${Math.round(
      current.wind.speed * 3.6,
    )} km/h`;

    // forecast.list is 3-hour steps; take next 16 (~48h)
    const forecastLines = (forecast.list || [])
      .slice(0, 16)
      .map((entry: any) => {
        const time = new Date(entry.dt * 1000).toLocaleString('en-US', {
          weekday: 'short',
          hour: 'numeric',
        });
        const rainChance = Math.round((entry.pop ?? 0) * 100);
        return `- ${time}: ${Math.round(entry.main.temp)}°C, ${entry.weather?.[0]?.description}, ${rainChance}% rain chance`;
      })
      .join('\n');

    let aqiLine = '';
    if (airQuality?.list?.[0]) {
      const aqi = airQuality.list[0].main.aqi; // 1 (good) to 5 (very poor)
      const labels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
      aqiLine = `Air Quality Index: ${labels[aqi] || aqi}`;
    }

    return `You are a helpful weather assistant embedded in a weather app. Answer the user's question using ONLY the data below. Do not invent numbers that aren't given.

Depending on what the user asks, you may need to:
- Judge if conditions are suitable for an activity (hiking, sports, travel, farming/irrigation, etc.)
- Recommend clothing or gear based on temperature, wind, and rain
- Give simple health/safety advice (heat, UV, air quality, humidity) if relevant
- Advise on outdoor timing (best/worst hours today or tomorrow)
- Summarize the day or week in plain language

Pick whichever of these fits the question naturally — don't force categories that don't apply. Keep the answer short (2-4 sentences), natural, and directly actionable.

Location: ${location}

Current conditions:
${currentLine}
${aqiLine}

Forecast (next 48 hours, 3-hour steps):
${forecastLines}

User question: "${question}"

Answer:`;
  }

  // ---------- Call Hugging Face ----------

  private async callHuggingFace(prompt: string): Promise<string> {
    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.HF_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 220,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      throw new BadGatewayException(`Hugging Face API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty response from Hugging Face');
    return text;
  }

  // ---------- Fallback if the model call fails ----------

  private buildFallbackAnswer(current: any): string {
    return `Right now it's ${Math.round(current.main.temp)}°C and ${current.weather?.[0]?.description} in ${
      current.name
    }. I couldn't reach the AI assistant just now — please try asking again in a moment.`;
  }
}