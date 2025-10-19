import axios from "axios";

export interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5275";

export const getWeatherForecast = async (): Promise<WeatherForecast[]> => {
  const response = await axios.get<WeatherForecast[]>(`${API_BASE_URL}/weatherforecast`);
  return response.data;
};
