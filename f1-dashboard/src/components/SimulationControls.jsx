import React, { useState, useEffect } from 'react';
import { Pause, Play, Gauge } from 'lucide-react';
import './SimulationControls.css';

const SimulationControls = ({ wsUrl, raceStarted, raceFinished }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [isChangingSpeed, setIsChangingSpeed] = useState(false);

  const baseUrl = wsUrl.replace('ws://', 'http://').replace('/ws', '');

  // Fetch current race status to sync pause/speed state
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/race-status`);
        const data = await response.json();
        setIsPaused(data.paused || false);
        setSpeed(data.speed_multiplier || 1.0);
      } catch (error) {
        console.error('Error fetching race status:', error);
      }
    };

    if (raceStarted && !raceFinished) {
      fetchStatus();
    }
  }, [raceStarted, raceFinished, baseUrl]);

  const handlePauseResume = async () => {
    const endpoint = isPaused ? '/api/simulation/resume' : '/api/simulation/pause';
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      setIsPaused(data.paused);
    } catch (error) {
      console.error('Error toggling pause:', error);
    }
  };

  const handleSpeedChange = async (newSpeed) => {
    setIsChangingSpeed(true);
    
    try {
      const response = await fetch(`${baseUrl}/api/simulation/speed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed: newSpeed })
      });
      
      const data = await response.json();
      setSpeed(data.speed_multiplier);
    } catch (error) {
      console.error('Error changing speed:', error);
    } finally {
      setTimeout(() => setIsChangingSpeed(false), 300);
    }
  };

  // Don't show controls if race hasn't started or is finished
  if (!raceStarted || raceFinished) {
    return null;
  }

  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1.0, label: '1x' },
    { value: 2.0, label: '2x' },
    { value: 5.0, label: '5x' }
  ];

  return (
    <div className="simulation-controls">
      <div className="controls-container">
        {/* Pause/Resume Button */}
        <button
          className={`control-button pause-button ${isPaused ? 'paused' : ''}`}
          onClick={handlePauseResume}
          title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
          <span className="button-label">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Speed Controls */}
        <div className="speed-controls">
          <div className="speed-label">
            <Gauge size={18} />
            <span>Speed</span>
          </div>
          <div className="speed-buttons">
            {speedOptions.map((option) => (
              <button
                key={option.value}
                className={`speed-button ${speed === option.value ? 'active' : ''} ${isChangingSpeed ? 'changing' : ''}`}
                onClick={() => handleSpeedChange(option.value)}
                disabled={isChangingSpeed}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
