import { useEffect, useState } from "react";
import { getWeatherForecast, type WeatherForecast } from "./services/weatherService";

function App() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getWeatherForecast();
        setForecasts(data);
      } catch (err) {
        console.error("Failed to fetch weather forecast:", err);
        setError("Failed to fetch weather forecast.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>🌤 Weather Forecast</h1>
      <ul>
        {forecasts.map((f, index) => (
          <li key={index}>
            <strong>{new Date(f.date).toLocaleDateString()}</strong> — {f.temperatureC}°C / {f.temperatureF}°F — {f.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
