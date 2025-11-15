import React from 'react';
import { CloudRain, Thermometer, Wind, Sun, Cloud, CloudRain as Storm } from 'lucide-react';
import './WeatherSelector.css';

const WeatherSelector = ({ weather, onWeatherChange, disabled = false }) => {
  const { rain = 0.0, track_temp = 25.0, wind = 0.0 } = weather || {};

  const handleRainChange = (e) => {
    const newRain = parseFloat(e.target.value);
    onWeatherChange({ rain: newRain, track_temp, wind });
  };

  const handleTempChange = (e) => {
    const newTemp = parseFloat(e.target.value);
    onWeatherChange({ rain, track_temp: newTemp, wind });
  };

  const handleWindChange = (e) => {
    const newWind = parseFloat(e.target.value);
    onWeatherChange({ rain, track_temp, wind: newWind });
  };

  const getWeatherIcon = () => {
    if (rain < 0.1) return <Sun size={24} className="weather-icon sunny" />;
    if (rain < 0.3) return <Cloud size={24} className="weather-icon cloudy" />;
    if (rain < 0.6) return <CloudRain size={24} className="weather-icon rainy" />;
    return <Storm size={24} className="weather-icon stormy" />;
  };

  const getWeatherLabel = () => {
    if (rain < 0.1) return 'Dry';
    if (rain < 0.3) return 'Light Rain';
    if (rain < 0.6) return 'Medium Rain';
    return 'Heavy Rain';
  };

  const getWeatherColor = () => {
    if (rain < 0.1) return '#FFD700';
    if (rain < 0.3) return '#87CEEB';
    if (rain < 0.6) return '#4682B4';
    return '#1E3A8A';
  };

  return (
    <div className={`weather-selector ${disabled ? 'disabled' : ''}`}>
      <div className="weather-selector-header">
        <h3>Race Weather Conditions</h3>
        <div className="weather-preview">
          {getWeatherIcon()}
          <span className="weather-label" style={{ color: getWeatherColor() }}>
            {getWeatherLabel()}
          </span>
        </div>
      </div>

      <div className="weather-controls">
        <div className="weather-control-group">
          <label className="weather-control-label">
            <CloudRain size={16} />
            <span>Rain Intensity</span>
            <span className="weather-value">{(rain * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={rain}
            onChange={handleRainChange}
            disabled={disabled}
            className="weather-slider rain-slider"
            style={{
              '--slider-color': getWeatherColor(),
              '--slider-value': `${rain * 100}%`
            }}
          />
          <div className="weather-slider-labels">
            <span>Dry</span>
            <span>Light</span>
            <span>Medium</span>
            <span>Heavy</span>
          </div>
        </div>

        <div className="weather-control-group">
          <label className="weather-control-label">
            <Thermometer size={16} />
            <span>Track Temperature</span>
            <span className="weather-value">{track_temp.toFixed(1)}°C</span>
          </label>
          <input
            type="range"
            min="15"
            max="50"
            step="0.5"
            value={track_temp}
            onChange={handleTempChange}
            disabled={disabled}
            className="weather-slider temp-slider"
            style={{
              '--slider-value': `${((track_temp - 15) / 35) * 100}%`
            }}
          />
          <div className="weather-slider-labels">
            <span>15°C</span>
            <span>32.5°C</span>
            <span>50°C</span>
          </div>
        </div>

        <div className="weather-control-group">
          <label className="weather-control-label">
            <Wind size={16} />
            <span>Wind Speed</span>
            <span className="weather-value">{wind.toFixed(1)} m/s</span>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={wind}
            onChange={handleWindChange}
            disabled={disabled}
            className="weather-slider wind-slider"
            style={{
              '--slider-value': `${(wind / 20) * 100}%`
            }}
          />
          <div className="weather-slider-labels">
            <span>0 m/s</span>
            <span>10 m/s</span>
            <span>20 m/s</span>
          </div>
        </div>
      </div>

      {disabled && (
        <div className="weather-disabled-message">
          Weather cannot be changed during an active race
        </div>
      )}
    </div>
  );
};

export default WeatherSelector;

