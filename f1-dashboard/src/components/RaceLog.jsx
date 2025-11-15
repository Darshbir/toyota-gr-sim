import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Wrench } from 'lucide-react';
import './RaceLog.css';

const RaceLog = ({ cars = [], raceTime = 0 }) => {
  const [events, setEvents] = useState([]);
  const [prevState, setPrevState] = useState({
    positions: {},
    drsState: {},
    pitState: {},
    pitstopCounts: {}
  });

  useEffect(() => {
    if (!cars || cars.length === 0) return;

    const currentPositions = {};
    const currentDRS = {};
    const currentPit = {};
    const currentPitstopCounts = {};

    cars.forEach(car => {
      currentPositions[car.name] = car.position;
      currentDRS[car.name] = car.drs_active || false;
      currentPit[car.name] = car.on_pit || false;
      currentPitstopCounts[car.name] = car.pitstop_count || 0;
    });

    const newEvents = [];

    // Detect overtakes
    cars.forEach(car => {
      if (prevState.positions[car.name] && prevState.positions[car.name] > car.position) {
        const oldPos = prevState.positions[car.name];
        const newPos = car.position;
        newEvents.push({
          type: 'overtake',
          time: raceTime,
          message: `${car.name} overtook P${oldPos} → P${newPos}`,
          car: car.name
        });
      }
    });

    // Detect DRS activations
    cars.forEach(car => {
      if (prevState.drsState[car.name] === false && car.drs_active === true) {
        newEvents.push({
          type: 'drs',
          time: raceTime,
          message: `${car.name} activated DRS`,
          car: car.name
        });
      }
    });

    // Detect pit stops
    cars.forEach(car => {
      // Entering pit
      if (prevState.pitState[car.name] === false && car.on_pit === true) {
        newEvents.push({
          type: 'pitstop',
          time: raceTime,
          message: `${car.name} entered pit lane`,
          car: car.name,
          details: `Lap ${car.laps + 1}, Tyre: ${car.tyre}`
        });
      }
      // Exiting pit (pitstop count increased)
      if ((prevState.pitstopCounts[car.name] || 0) < (car.pitstop_count || 0)) {
        if (!car.on_pit) {
          newEvents.push({
            type: 'pitstop',
            time: raceTime,
            message: `${car.name} exited pit lane`,
            car: car.name,
            details: `New tyres: ${car.tyre}`
          });
        }
      }
    });

    if (newEvents.length > 0) {
      setEvents(prev => [...prev, ...newEvents].slice(-50)); // Keep last 50 events
    }

    setPrevState({
      positions: currentPositions,
      drsState: currentDRS,
      pitState: currentPit,
      pitstopCounts: currentPitstopCounts
    });
  }, [cars, raceTime]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'overtake':
        return <TrendingUp size={14} />;
      case 'drs':
        return <Zap size={14} />;
      case 'pitstop':
        return <Wrench size={14} />;
      default:
        return null;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'overtake':
        return '#E10600';
      case 'drs':
        return '#FFD700';
      case 'pitstop':
        return '#FFA500';
      default:
        return '#B8B8B8';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="race-log">
      <h3 className="log-header">Race Log</h3>
      <div className="log-container">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="log-empty">No events yet</div>
          ) : (
            events.map((event, idx) => (
              <motion.div
                key={idx}
                className="log-entry"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ borderLeftColor: getEventColor(event.type) }}
              >
                <div className="log-entry-time">{formatTime(event.time)}</div>
                <div className="log-entry-icon" style={{ color: getEventColor(event.type) }}>
                  {getEventIcon(event.type)}
                </div>
                <div className="log-entry-content">
                  <span className="log-entry-text">{event.message}</span>
                  {event.details && (
                    <span className="log-entry-details">{event.details}</span>
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

export default RaceLog;

