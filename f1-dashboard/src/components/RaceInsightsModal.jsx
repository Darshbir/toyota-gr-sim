import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, TrendingUp, TrendingDown, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import './RaceInsightsModal.css';

const RaceInsightsModal = ({ isOpen, onClose, onReset, insights = {} }) => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const drivers = Object.values(insights);

  useEffect(() => {
    if (drivers.length > 0 && !selectedDriver) {
      setSelectedDriver(drivers[0].name);
    }
  }, [drivers, selectedDriver]);

  if (!isOpen) return null;

  const currentDriver = drivers.find(d => d.name === selectedDriver);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'undercut_success':
      case 'position_gain':
        return <CheckCircle size={16} className="insight-icon success" />;
      case 'undercut_failure':
      case 'position_loss':
        return <AlertCircle size={16} className="insight-icon warning" />;
      default:
        return <Award size={16} className="insight-icon" />;
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="race-insights-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="race-insights-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="race-insights-header">
              <div className="race-insights-title">
                <Award size={24} />
                <h2>Race Insights & Analysis</h2>
              </div>
              <button className="close-button" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="race-insights-content">
              <div className="driver-menu">
                <h3>Select Driver</h3>
                <div className="driver-list">
                  {drivers.map((driver) => (
                    <button
                      key={driver.name}
                      className={`driver-item ${selectedDriver === driver.name ? 'active' : ''}`}
                      onClick={() => setSelectedDriver(driver.name)}
                    >
                      <span className="driver-position">P{driver.final_position}</span>
                      <span className="driver-name">{driver.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="insights-panel">
                {currentDriver ? (
                  <>
                    <div className="driver-header">
                      <h3>{currentDriver.name}</h3>
                      <span className="position-badge">P{currentDriver.final_position}</span>
                    </div>

                    <div className="insights-section">
                      <h4>
                        <TrendingUp size={18} />
                        Key Insights
                      </h4>
                      {currentDriver.insights.length > 0 ? (
                        <div className="insights-list">
                          {currentDriver.insights.map((insight, idx) => (
                            <div key={idx} className="insight-item">
                              {getInsightIcon(insight.type)}
                              <div className="insight-content">
                                <div className="insight-message">{insight.message}</div>
                                <div className="insight-action">{insight.action}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-insights">No significant insights for this driver.</div>
                      )}
                    </div>

                    <div className="recommendations-section">
                      <h4>
                        <AlertCircle size={18} />
                        Recommendations
                      </h4>
                      {currentDriver.recommendations.length > 0 ? (
                        <ul className="recommendations-list">
                          {currentDriver.recommendations.map((rec, idx) => (
                            <li key={idx} className="recommendation-item">{rec}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="no-recommendations">No specific recommendations.</div>
                      )}
                    </div>

                    <div className="stats-summary">
                      <div className="stat-item">
                        <span className="stat-label">Pitstops:</span>
                        <span className="stat-value">{currentDriver.pitstops}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Total Time:</span>
                        <span className="stat-value">{currentDriver.total_time.toFixed(2)}s</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-driver-selected">Select a driver to view insights</div>
                )}
              </div>
            </div>

            <div className="race-insights-footer">
              <button className="reset-button" onClick={handleReset}>
                <RotateCcw size={18} />
                Reset Race & Clear Logs
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RaceInsightsModal;




