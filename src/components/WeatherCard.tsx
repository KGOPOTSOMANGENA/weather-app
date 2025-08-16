import { getIconUrl } from "../utils/weatherIcons";

type Props = {
  name: string;
  current: any;
  units: "metric" | "imperial";
};

export default function WeatherCard({ name, current, units }: Props) {
  if (!current) return <div className="card">No data</div>;

  const temp = Math.round(current.main.temp);
  const hum = current.main.humidity;
  const wind = current.wind.speed;
  const desc = current.weather?.[0]?.description ?? "";
  const icon = current.weather?.[0]?.icon ?? "";

  return (
    <div className="card weather-card">
      <div className="card-header">
        <h2>{name}</h2>
        <img src={getIconUrl(icon)} alt={desc} />
      </div>

      <div className="card-body">
        <p className="big">{temp}°{units === "metric" ? "C" : "F"}</p>
        <p>{desc}</p>
        <p>Humidity: {hum}%</p>
        <p>Wind: {wind} {units === "metric" ? "m/s" : "mph"}</p>
      </div>
    </div>
  );
}