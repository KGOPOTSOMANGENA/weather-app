export type WeatherCurrent = {
  dt: number;
  temp: number;
  humidity: number;
  wind_speed: number;
  weather: { id: number; main: string; description: string; icon: string }[];
};

export type WeatherOneCall = {
  lat: number;
  lon: number;
  timezone: string;
  current: WeatherCurrent;
  hourly: WeatherCurrent[];
  daily: any[];
  alerts?: any[];
};