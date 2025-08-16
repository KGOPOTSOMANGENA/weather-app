import { useState, useCallback } from "react";
import type { WeatherOneCall } from "../utils/types";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";

export type WeatherData = {
  current: any;
  forecast: {
    list: any[];
    daily: any[];
  };
};

export default function useWeather() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentWeather = useCallback(
    async (lat: number, lon: number, units = "metric") => {
      if (typeof lat !== "number" || typeof lon !== "number") {
        throw new Error("Invalid coordinates");
      }
      const url = `${CURRENT_URL}?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Current weather fetch failed");
      return await res.json();
    },
    []
  );

  const fetchForecast = useCallback(
    async (lat: number, lon: number, units = "metric") => {
      if (typeof lat !== "number" || typeof lon !== "number") {
        throw new Error("Invalid coordinates");
      }
      const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Forecast fetch failed");
      return await res.json();
    },
    []
  );

  const fetchByCoords = useCallback(
    async (lat: number, lon: number, units = "metric"): Promise<WeatherData | null> => {
      setLoading(true);
      setError(null);

      try {
        const currentData = await fetchCurrentWeather(lat, lon, units);
        const forecastData = await fetchForecast(lat, lon, units);

        const dailyMap: Record<string, any[]> = {};
        forecastData.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000).toLocaleDateString();
          if (!dailyMap[date]) dailyMap[date] = [];
          dailyMap[date].push(item);
        });

        const daily = Object.entries(dailyMap).map(([date, items]) => {
          const temps = items.map((i) => i.main.temp);
          const weather = items[0].weather;
          return {
            dt: items[0].dt,
            temp: { day: Math.max(...temps), night: Math.min(...temps) },
            weather,
          };
        });

        const combined: WeatherData = {
          current: currentData,
          forecast: { list: forecastData.list, daily },
        };

        localStorage.setItem(
          `weather_cache_${lat}_${lon}_${units}`,
          JSON.stringify({ fetchedAt: Date.now(), data: combined })
        );

        setLoading(false);
        return combined;
      } catch (err: any) {
        setLoading(false);
        console.error(err);
        setError(err.message || "Unknown error");
        return null;
      }
    },
    [fetchCurrentWeather, fetchForecast]
  );

  const fetchByCityName = useCallback(
    async (city: string, units = "metric"): Promise<{ coords: { lat: number; lon: number }; data?: WeatherData } | null> => {
      setLoading(true);
      setError(null);
      try {
        const geoUrl = `${GEO_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) throw new Error("Location lookup failed");

        const geoJson = await geoRes.json();
        if (!geoJson || geoJson.length === 0) {
          setError("City not found");
          setLoading(false);
          return null;
        }

        const { lat, lon } = geoJson[0];
        const data = await fetchByCoords(lat, lon, units);
        setLoading(false);
        return { coords: { lat, lon }, data: data ?? undefined };
      } catch (err: any) {
        setLoading(false);
        console.error(err);
        setError(err.message || "Unknown error");
        return null;
      }
    },
    [fetchByCoords]
  );

  const tryLoadCache = (lat: number, lon: number, units = "metric") => {
    if (typeof lat !== "number" || typeof lon !== "number") return null;
    const raw = localStorage.getItem(`weather_cache_${lat}_${lon}_${units}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  return { fetchByCoords, fetchByCityName, tryLoadCache, loading, error, setError };
}
