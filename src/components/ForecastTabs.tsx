import { useState } from "react";
import { getIconUrl } from "../utils/weatherIcons";
import "../styles/ForecastTabs.css";

type Props = {
  hourly?: any[];
  daily?: any[];
  units: "metric" | "imperial";
};

export default function ForecastTabs({ hourly = [], daily = [], units }: Props) {
  const [tab, setTab] = useState<"hourly" | "daily">("hourly");

  const formatDate = (timestamp: number, options?: Intl.DateTimeFormatOptions) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", options);
  };

  const formatHour = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      hour12: false, 
    });
  };

  return (
    <div className="forecast-tabs">
      <div className="tabs">
        <button
          onClick={() => setTab("hourly")}
          className={tab === "hourly" ? "active" : ""}
        >
          Hourly
        </button>
        <button
          onClick={() => setTab("daily")}
          className={tab === "daily" ? "active" : ""}
        >
          Daily
        </button>
      </div>

      {tab === "hourly" ? (
        <div className="scroll-x hourly">
          {hourly.slice(0, 24).map((h, idx) => (
            <div key={idx} className="forecast-card">
              <p>{formatHour(h.dt)}</p>
              <img
                src={getIconUrl(h.weather[0].icon)}
                alt={h.weather[0].description}
              />
              <p>
                {Math.round(h.main.temp)}°{units === "metric" ? "C" : "F"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="daily">
          {daily.slice(0, 7).map((d, idx) => (
            <div key={idx} className="forecast-card">
              <p>
                {formatDate(d.dt, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <img
                src={getIconUrl(d.weather[0].icon)}
                alt={d.weather[0].description}
              />
              <p>Day: {Math.round(d.temp.day)}°</p>
              <p>Night: {Math.round(d.temp.night)}°</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
