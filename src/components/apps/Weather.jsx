import React, { useState, useEffect } from 'react';

/**
 * Simple Weather Widget
 * Displays current weather (placeholder - can integrate with weather API)
 */
const Weather = () => {
  const [weather, setWeather] = useState({
    temp: 22,
    condition: 'Sunny',
    icon: '☀️',
    location: 'Your Location',
    humidity: 45,
    wind: 12,
  });

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Placeholder weather conditions
  const conditions = [
    { condition: 'Sunny', icon: '☀️', temp: 28 },
    { condition: 'Cloudy', icon: '☁️', temp: 22 },
    { condition: 'Rainy', icon: '🌧️', temp: 18 },
    { condition: 'Stormy', icon: '⛈️', temp: 16 },
    { condition: 'Snowy', icon: '❄️', temp: -2 },
  ];

  const refreshWeather = () => {
    const random = conditions[Math.floor(Math.random() * conditions.length)];
    setWeather(prev => ({
      ...prev,
      ...random,
      humidity: Math.floor(Math.random() * 60) + 30,
      wind: Math.floor(Math.random() * 25) + 5,
    }));
  };

  return (
    <div className="weather-app">
      <div className="weather-header">
        <span className="weather-location">{weather.location}</span>
        <span className="weather-time">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="weather-main">
        <span className="weather-icon">{weather.icon}</span>
        <div className="weather-temp">
          <span className="temp-value">{weather.temp}°</span>
          <span className="temp-unit">C</span>
        </div>
      </div>

      <div className="weather-condition">{weather.condition}</div>

      <div className="weather-details">
        <div className="weather-detail">
          <span className="detail-icon">💧</span>
          <span className="detail-value">{weather.humidity}%</span>
          <span className="detail-label">Humidity</span>
        </div>
        <div className="weather-detail">
          <span className="detail-icon">💨</span>
          <span className="detail-value">{weather.wind} km/h</span>
          <span className="detail-label">Wind</span>
        </div>
      </div>

      <button className="weather-refresh" onClick={refreshWeather}>
        🔄 Refresh
      </button>
    </div>
  );
};

export default Weather;
