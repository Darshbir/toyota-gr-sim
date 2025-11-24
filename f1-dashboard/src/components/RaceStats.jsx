import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Clock, Zap } from 'lucide-react';
import { animatedCounter, lapCounterFlip } from '../utils/animations';
import './RaceStats.css';

const RaceStats = ({ cars = [], raceTime = 0 }) => {
  const [stats, setStats] = useState({
    fastestLap: null,
    fastestLapTime: Infinity,
    totalOvertakes: 0,
    totalPitStops: 0
  });
  const [prevPositions, setPrevPositions] = useState({});
  const overtakesRef = useRef(null);
  const pitStopsRef = useRef(null);
  const prevOvertakesRef = useRef(0);
  const prevPitStopsRef = useRef(0);

  useEffect(() => {
    if (!cars || cars.length === 0) return;
    
    // Calculate fastest lap
    const fastest = cars.reduce((best, car) => {
      if (car.laps > 0) {
        const lapTime = car.total_time / car.laps;
        if (lapTime < best.time) {
          return { car: car.name, time: lapTime };
        }
      }
      return best;
    }, { car: null, time: Infinity });

    // Track overtakes
    const currentPositions = {};
    let newOvertakes = 0;
    
    // Initialize positions if empty (first run)
    const positionsToCompare = Object.keys(prevPositions).length === 0 
      ? {} 
      : prevPositions;
    
    if (Object.keys(positionsToCompare).length === 0) {
      cars.forEach(car => {
        currentPositions[car.name] = car.position;
      });
    } else {
      cars.forEach(car => {
        currentPositions[car.name] = car.position;
        if (positionsToCompare[car.name] && positionsToCompare[car.name] > car.position) {
          newOvertakes++;
        }
      });
    }

    // Track total pit stops
    let totalPitStops = 0;
    cars.forEach(car => {
      totalPitStops += car.pitstop_count || 0;
    });
    
    setStats(prev => {
      const newTotalOvertakes = prev.totalOvertakes + newOvertakes;
      
      // Animate counters after state update
      setTimeout(() => {
        if (overtakesRef.current && newTotalOvertakes !== prevOvertakesRef.current) {
          animatedCounter(overtakesRef.current, newTotalOvertakes, { duration: 600, decimals: 0 });
          prevOvertakesRef.current = newTotalOvertakes;
        }
        if (pitStopsRef.current && totalPitStops !== prevPitStopsRef.current) {
          animatedCounter(pitStopsRef.current, totalPitStops, { duration: 600, decimals: 0 });
          prevPitStopsRef.current = totalPitStops;
        }
      }, 0);
      
      return {
        fastestLap: fastest.car || prev.fastestLap,
        fastestLapTime: fastest.car ? fastest.time : prev.fastestLapTime,
        totalOvertakes: newTotalOvertakes,
        totalPitStops: totalPitStops
      };
    });

    setPrevPositions(currentPositions);
  }, [cars, raceTime]);

  const formatLapTime = (seconds) => {
    if (!seconds || seconds === Infinity) return '--:--.---';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  return (
    <motion.div
      className="race-stats"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="stats-header">Race Statistics</h3>
      
      <div className="stats-grid">
        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Trophy className="stat-icon" size={24} />
          <div className="stat-content">
            <div className="stat-label">Fastest Lap</div>
            <div className="stat-value">{stats.fastestLap || '--'}</div>
            <div className="stat-subvalue">{formatLapTime(stats.fastestLapTime)}</div>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <TrendingUp className="stat-icon" size={24} />
          <div className="stat-content">
            <div className="stat-label">Overtakes</div>
            <div className="stat-value" ref={overtakesRef}>{stats.totalOvertakes}</div>
            <div className="stat-subvalue">Total</div>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Clock className="stat-icon" size={24} />
          <div className="stat-content">
            <div className="stat-label">Pit Stops</div>
            <div className="stat-value" ref={pitStopsRef}>{stats.totalPitStops}</div>
            <div className="stat-subvalue">Total</div>
          </div>
        </motion.div>
      </div>

      {/* Top 3 Leaderboard */}
      {cars && cars.length > 0 && (
        <div className="top-three">
          <h4>Top 3</h4>
          {cars
            .filter(c => c && c.position)
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .slice(0, 3)
            .map((car, idx) => (
            <motion.div
              key={car.name}
              className={`top-three-item podium-${idx + 1}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="podium-position">{idx + 1}</div>
              <div className="podium-color" style={{ backgroundColor: car.color }}></div>
              <div className="podium-name">{car.name}</div>
              <div className="podium-time">{formatLapTime(car.total_time / Math.max(car.laps, 1))}</div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RaceStats;

