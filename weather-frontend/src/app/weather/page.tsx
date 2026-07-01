"use client";
import WeatherChatWidget from "@/components/WeatherChatWidget";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCurrentWeather,
  getForecast,
  reverseGeocode,
  getAirQuality,
  searchLocation,
} from "@/lib/weather";

const AQI_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Good", color: "text-green-400" },
  2: { label: "Fair", color: "text-lime-400" },
  3: { label: "Moderate", color: "text-yellow-400" },
  4: { label: "Poor", color: "text-orange-400" },
  5: { label: "Very poor", color: "text-red-400" },
};

export default function WeatherPage() {
  const router = useRouter();
  const params = useSearchParams();
  const lat = parseFloat(params.get("lat") || "");
  const lon = parseFloat(params.get("lon") || "");

  const [current, setCurrent] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [place, setPlace] = useState<any>(null);
  const [aqi, setAqi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      setError("No location selected.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      getCurrentWeather(lat, lon),
      getForecast(lat, lon),
      reverseGeocode(lat, lon),
      getAirQuality(lat, lon),
    ]).then(([curRes, fcRes, placeRes, aqiRes]) => {
      if (cancelled) return;

      if (curRes.status === "fulfilled") setCurrent(curRes.value);
      if (fcRes.status === "fulfilled") setForecast(fcRes.value);
      if (placeRes.status === "fulfilled") setPlace(placeRes.value);
      if (aqiRes.status === "fulfilled") setAqi(aqiRes.value);

      if (curRes.status === "rejected") {
        setError("Could not load weather for this location.");
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const data = await searchLocation(query);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-500 to-sky-700">
        <p className="text-white text-lg">Loading weather…</p>
      </div>
    );
  }

  if (error || !current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-500 to-sky-700 gap-4 px-4">
        <p className="text-white text-lg">{error || "Something went wrong."}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-full transition-colors"
        >
          Back to search
        </button>
      </div>
    );
  }

  const hourly = forecast?.list?.slice(0, 7) || [];
  const daily = forecast?.list?.filter((_: any, i: number) => i % 8 === 0) || [];
  const aqiValue = aqi?.list?.[0]?.main?.aqi;
  const aqiInfo = aqiValue ? AQI_LABELS[aqiValue] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-600 to-sky-800 pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-white">
            <span className="text-2xl">🌤️</span>
            <span className="text-xl font-semibold">
              Weather<span className="text-sky-200">Now</span>
            </span>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative mb-8 max-w-md">
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 px-4 py-2.5">
            <svg className="h-4 w-4 text-white/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for city…"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60 text-sm"
            />
          </div>
          {results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg overflow-hidden z-10">
              {results.map((loc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setResults([]);
                    setQuery("");
                    router.push(`/weather?lat=${loc.lat}&lon=${loc.lon}`);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-100 text-sm text-slate-700"
                >
                  {loc.name}{loc.state ? `, ${loc.state}` : ""}, {loc.country}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Current weather card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 mb-6 grid sm:grid-cols-2 gap-6">
          <div>
            <p className="flex items-center gap-1.5 text-white/90 text-sm mb-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>
              {place?.name || current.name}{place?.state ? `, ${place.state}` : ""}
            </p>
            <p className="text-white/60 text-xs mb-4">{place?.country || current.sys?.country}</p>
            <div className="flex items-center gap-4">
              <p className="text-6xl font-bold text-white">{Math.round(current.main.temp)}°<span className="text-3xl align-top">C</span></p>
              <img
                src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                alt={current.weather[0].description}
                className="w-20 h-20"
              />
            </div>
            <p className="text-white capitalize mt-1">{current.weather[0].description}</p>
            <p className="text-white/70 text-sm mt-1">Feels like {Math.round(current.main.feels_like)}°</p>
          </div>

          <div className="space-y-2">
            {[
              { label: "Humidity", value: `${current.main.humidity}%` },
              { label: "Wind", value: `${current.wind.speed} m/s` },
              { label: "Pressure", value: `${current.main.pressure} hPa` },
              { label: "Visibility", value: `${(current.visibility / 1000).toFixed(1)} km` },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-2.5"
              >
                <span className="text-white/80 text-sm">{item.label}</span>
                <span className="text-white font-medium text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly forecast */}
        {hourly.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-5 mb-6">
            <p className="text-white/90 text-sm font-medium mb-4">Hourly forecast</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {hourly.map((h: any, i: number) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-20 bg-white/10 rounded-xl p-3 text-center"
                >
                  <p className="text-white/70 text-xs mb-2">
                    {new Date(h.dt * 1000).toLocaleTimeString([], { hour: "numeric" })}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${h.weather[0].icon}.png`}
                    alt={h.weather[0].description}
                    className="w-9 h-9 mx-auto"
                  />
                  <p className="text-white font-medium text-sm mt-1">{Math.round(h.main.temp)}°</p>
                  <p className="text-sky-200 text-[11px] mt-0.5">{Math.round((h.pop || 0) * 100)}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily forecast */}
        {daily.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-5 mb-6">
            <p className="text-white/90 text-sm font-medium mb-4">
              {daily.length}-day forecast
            </p>
            <div className="space-y-2">
              {daily.map((d: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2.5"
                >
                  <p className="text-white text-sm w-20">
                    {new Date(d.dt * 1000).toLocaleDateString(undefined, { weekday: "short" })}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${d.weather[0].icon}.png`}
                    alt={d.weather[0].description}
                    className="w-8 h-8"
                  />
                  <p className="text-sky-100 text-xs capitalize flex-1 text-center hidden sm:block">
                    {d.weather[0].description}
                  </p>
                  <p className="text-white font-medium text-sm">{Math.round(d.main.temp)}°</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom row: AQI + sunrise/sunset */}
        <div className="grid sm:grid-cols-2 gap-6">
          {aqiInfo && (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-5">
              <p className="text-white/90 text-sm font-medium mb-3">Air quality index</p>
              <p className={`text-3xl font-bold ${aqiInfo.color}`}>{aqiValue}</p>
              <p className={`text-sm font-medium ${aqiInfo.color}`}>{aqiInfo.label}</p>
            </div>
          )}

          {current.sys?.sunrise && current.sys?.sunset && (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-5">
              <p className="text-white/90 text-sm font-medium mb-3">Sunrise & sunset</p>
              <div className="flex justify-between text-white text-sm">
                <div>
                  <p className="text-xs text-white/60 mb-1">Sunrise</p>
                  <p className="font-medium">
                    {new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60 mb-1">Sunset</p>
                  <p className="font-medium">
                    {new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <WeatherChatWidget lat={lat} lon={lon} city={place?.name || current.name} />
    </div>
  );
}