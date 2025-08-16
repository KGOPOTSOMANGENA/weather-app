import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import ThemeToggle from "../components/ThemeToggle";
import UnitToggle from "../components/UnitToggle";
import LocationList from "../components/LocationList";
import ForecastTabs from "../components/ForecastTabs";
import { useLocalStorage } from "../hooks/useLocalStorage";
import useWeather from "../hooks/useWeatherAPI";

type Saved = { name: string; lat: number; lon: number };

export default function Home() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
  const [unit, setUnit] = useLocalStorage<"metric" | "imperial">("units", "metric");
  const [saved, setSaved] = useLocalStorage<Saved[]>("saved-locations", []);
  const [selected, setSelected] = useLocalStorage<Saved | null>("selected-location", null);

  const [weatherData, setWeatherData] = useState<any | null>(null);
  const { fetchByCoords, fetchByCityName, tryLoadCache, loading, error, setError } = useWeather();

  const defaultCoords: Saved = { name: "Johannesburg", lat: -26.2041, lon: 28.0473 };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const init = async () => {
      let lat: number;
      let lon: number;
      let name: string;

      if (selected) {
        lat = selected.lat;
        lon = selected.lon;
        name = selected.name;
      } else if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject)
          );
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          name = "Current Location";
        } catch (err) {
          console.warn("Geolocation denied or failed:", err);
          if (saved.length > 0) {
            const s = saved[0];
            lat = s.lat;
            lon = s.lon;
            name = s.name;
          } else {
            lat = defaultCoords.lat;
            lon = defaultCoords.lon;
            name = defaultCoords.name;
          }
        }
      } else {
        if (saved.length > 0) {
          const s = saved[0];
          lat = s.lat;
          lon = s.lon;
          name = s.name;
        } else {
          lat = defaultCoords.lat;
          lon = defaultCoords.lon;
          name = defaultCoords.name;
        }
      }

      const cache = tryLoadCache(lat, lon, unit);
      if (cache) setWeatherData(cache.data);
      const fresh = await fetchByCoords(lat, lon, unit);
      if (fresh) setWeatherData(fresh);

      setSelected({ name, lat, lon });
    };

    init();
  }, []);

  useEffect(() => {
    const doRefetch = async () => {
      if (!selected && !weatherData) return;
      const lat = selected?.lat ?? weatherData?.lat;
      const lon = selected?.lon ?? weatherData?.lon;
      if (lat && lon) {
        const cache = tryLoadCache(lat, lon, unit);
        if (cache) setWeatherData(cache.data);
        const fresh = await fetchByCoords(lat, lon, unit);
        if (fresh) setWeatherData(fresh);
      }
    };
    doRefetch();
  }, [unit]);

  const onSearch = async (city: string) => {
    setError(null);
    const res = await fetchByCityName(city, unit);
    if (!res) return;
    if (res.data) {
      setWeatherData(res.data);
      const name = city;
      const coords = res.coords!;
      setSelected({ name, lat: coords.lat, lon: coords.lon });
      setSaved((prev) => {
        const exists = prev.some((p) => p.name.toLowerCase() === name.toLowerCase());
        if (exists) return prev;
        return [{ name, lat: coords.lat, lon: coords.lon }, ...prev].slice(0, 10);
      });
    }
  };

  const selectSaved = async (s: Saved) => {
    setSelected(s);
    const cache = tryLoadCache(s.lat, s.lon, unit);
    if (cache) setWeatherData(cache.data);
    const fresh = await fetchByCoords(s.lat, s.lon, unit);
    if (fresh) setWeatherData(fresh);
  };

  const removeSaved = (idx: number) => {
    setSaved((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>Weather App</h1>
        <div className="controls">
          <UnitToggle unit={unit} setUnit={setUnit} />
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main className="container">
        <aside className="left">
          <SearchBar onSearch={onSearch} />
          <LocationList saved={saved} onSelect={selectSaved} onRemove={removeSaved} />
        </aside>

        <section className="main-panel">
          {loading && <div className="notice">Loading...</div>}
          {error && <div className="error">Error: {error}</div>}

          <WeatherCard
            name={selected?.name ?? weatherData?.timezone ?? "Current Location"}
            current={weatherData?.current}
            units={unit}
          />

          <ForecastTabs
            hourly={weatherData?.forecast?.list ?? []}
            daily={weatherData?.forecast?.daily ?? []}
            units={unit}
          />

          {weatherData?.alerts && weatherData.alerts.length > 0 && (
            <div className="alerts">
              <h3>Weather Alerts</h3>
              <pre>{JSON.stringify(weatherData.alerts, null, 2)}</pre>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <small>Data provided by OpenWeatherMap · Offline cache enabled</small>
      </footer>
    </div>
  );
}