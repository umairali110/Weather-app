"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { searchLocation } from "@/lib/weather";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        router.push(`/weather?lat=${latitude}&lon=${longitude}`);
      },
      () => {
        setLocating(false);
        setError("Could not access your location. Please allow location access or search manually.");
      }
    );
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchLocation(query);
      setResults(Array.isArray(data) ? data : []);
      if (!data || data.length === 0) {
        setError("No locations found. Try a different search.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col items-center px-4 pt-28 pb-16">
      <div className="text-center mb-10">
        <p className="text-sm font-medium text-sky-600 dark:text-sky-400 tracking-wide uppercase mb-2">
          Live weather, anywhere
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          WeatherNow
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-md mx-auto">
          Search any city, state, or country to see current conditions and a 5-day forecast.
        </p>
      </div>

      <form onSubmit={handleSearch} className="w-full max-w-lg">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 p-2 pl-5">
          <svg className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try 'London', 'Tokyo', or 'California'"
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 py-2"
          />
          <button
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-5 py-2.5 rounded-full transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      <button
        onClick={useMyLocation}
        disabled={locating}
        className="mt-4 flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:underline disabled:opacity-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        {locating ? "Locating…" : "Use my current location"}
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/40 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="w-full max-w-lg mt-6 space-y-2">
          {results.map((loc, i) => (
            <button
              key={i}
              onClick={() => router.push(`/weather?lat=${loc.lat}&lon=${loc.lon}`)}
              className="w-full flex items-center justify-between text-left p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all group"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {loc.name}{loc.state ? `, ${loc.state}` : ""}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{loc.country}</p>
              </div>
              <svg className="h-4 w-4 text-slate-300 group-hover:text-sky-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}