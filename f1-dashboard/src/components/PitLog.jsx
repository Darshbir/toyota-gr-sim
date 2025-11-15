import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Clock } from 'lucide-react';
import './PitLog.css';

const PitLog = ({ cars = [], raceTime = 0 }) => {
  const [pitEvents, setPitEvents] = useState([]);
  const [prevState, setPrevState] = useState({
    pitState: {},
    pitstopCounts: {},
    pitLap: {}
  });

  useEffect(() => {
    if (!cars || cars.length === 0) return;

    const currentPit = {};
    const currentPitstopCounts = {};
    const currentPitLap = {};

    cars.forEach(car => {
      currentPit[car.name] = car.on_pit || false;
      currentPitstopCounts[car.name] = car.pitstop_count || 0;
      currentPitLap[car.name] = car.laps || 0;
    });

    const newPitEvents = [];

    // Use previous state for comparison (initialize if empty)
    const stateToCompare = Object.keys(prevState.pitState).length === 0 
      ? { pitState: {}, pitstopCounts: {}, pitLap: {} }
      : prevState;

    // Detect pit stop entries
    cars.forEach(car => {
      const wasInPit = stateToCompare.pitState[car.name] || false;
      const isInPit = car.on_pit || false;
      
      if (!wasInPit && isInPit) {
        newPitEvents.push({
          type: 'entry',
          time: raceTime,
          message: `${car.name} entered pit lane`,
          car: car.name,
          details: `Lap ${car.laps + 1}, Current tyres: ${car.tyre}, Wear: ${Math.round((car.wear || 0) * 100)}%`
        });
      }
    });

    // Detect pit stop exits
    cars.forEach(car => {
      const wasInPit = stateToCompare.pitState[car.name] || false;
      const isInPit = car.on_pit || false;
      const prevPitstopCount = stateToCompare.pitstopCounts[car.name] || 0;
      const currentPitstopCount = car.pitstop_count || 0;
      
      // Car exited pit (was in pit, now not in pit) OR pitstop count increased
      if ((wasInPit && !isInPit) || (prevPitstopCount < currentPitstopCount && !isInPit)) {
        newPitEvents.push({
          type: 'exit',
          time: raceTime,
          message: `${car.name} exited pit lane`,
          car: car.name,
          details: `New tyres: ${car.tyre}, Total pit stops: ${currentPitstopCount}`
        });
      }
    });

    if (newPitEvents.length > 0) {
      setPitEvents(prev => [...prev, ...newPitEvents].slice(-30)); // Keep last 30 pit events
    }

    setPrevState({
      pitState: currentPit,
      pitstopCounts: currentPitstopCounts,
      pitLap: currentPitLap
    });
  }, [cars, raceTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEventColor = (type) => {
    return type === 'entry' ? '#FFA500' : '#00FF00';
  };

  return (
    <div className="pit-log">
      <h3 className="pit-log-header">Pit Log</h3>
      <div className="pit-log-container">
        <AnimatePresence initial={false}>
          {pitEvents.length === 0 ? (
            <div className="pit-log-empty">No pit stops yet</div>
          ) : (
            pitEvents.map((event, idx) => (
              <motion.div
                key={idx}
                className={`pit-log-entry pit-log-${event.type}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ borderLeftColor: getEventColor(event.type) }}
              >
                <div className="pit-log-entry-time">{formatTime(event.time)}</div>
                <div className="pit-log-entry-icon" style={{ color: getEventColor(event.type) }}>
                  {event.type === 'entry' ? <Wrench size={14} /> : <Clock size={14} />}
                </div>
                <div className="pit-log-entry-content">
                  <span className="pit-log-entry-text">{event.message}</span>
                  {event.details && (
                    <span className="pit-log-entry-details">{event.details}</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PitLog;

