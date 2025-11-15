import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import './RaceInsights.css';

const RaceInsights = ({ raceFinished, wsUrl }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showInsights, setShowInsights] = useState(false);

  const baseUrl = wsUrl.replace('/ws', '').replace('ws://', 'http://').replace('wss://', 'https://');

  useEffect(() => {
    // Don't auto-fetch - wait for user to click button
    // This ensures the floating button is visible
    if (raceFinished) {
      console.log('Race finished - AI Insights button should appear');
    }
  }, [raceFinished]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/api/race-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data);
      setShowInsights(true);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!raceFinished) return null;

  return (
    <AnimatePresence>
      {showInsights && (
        <motion.div
          className="race-insights-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowInsights(false)}
        >
          <motion.div
            className="race-insights-container"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="insights-header">
              <Brain size={24} className="insights-icon" />
              <h2>AI Race Analysis</h2>
              <button className="insights-close" onClick={() => setShowInsights(false)}>
                ×
              </button>
            </div>

            {loading && (
              <div className="insights-loading">
                <Loader className="spinner" size={48} />
                <p>Analyzing race data with AI...</p>
                <span className="loading-subtext">Powered by Gemini 2.5 Pro</span>
              </div>
            )}

            {error && (
              <div className="insights-error">
                <AlertCircle size={48} />
                <h3>Unable to Generate Insights</h3>
                <p>{error}</p>
                <button onClick={fetchInsights} className="retry-button">
                  Retry
                </button>
              </div>
            )}

            {insights && !loading && (
              <div className="insights-content">
                {/* Model Info */}
                <div className="model-info">
                  <div className="model-badge">
                    <Brain size={16} />
                    <span>{insights.insights?.model_info?.model_name || 'F1 Strategy AI'}</span>
                  </div>
                  <div className="model-metadata">
                    <span>Engine: {insights.insights?.model_info?.inference_engine || 'Gemini'}</span>
                    <span>•</span>
                    <span>Confidence: {(insights.insights?.model_info?.confidence_threshold * 100 || 75).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Race Overview */}
                {insights.insights?.insights?.race_overview && (
                  <div className="insights-section">
                    <h3>Race Overview</h3>
                    <div className="overview-stats">
                      <div className="stat-item">
                        <span className="stat-label">Weather Impact</span>
                        <div className="stat-bar">
                          <motion.div
                            className="stat-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${(insights.insights.insights.race_overview.weather_impact_score || 0) * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Competitiveness</span>
                        <div className="stat-bar">
                          <motion.div
                            className="stat-fill competitive"
                            initial={{ width: 0 }}
                            animate={{ width: `${(insights.insights.insights.race_overview.competitiveness_score || 0) * 100}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </div>

                    {insights.insights.insights.race_overview.key_moments && (
                      <div className="key-moments">
                        <h4>Key Moments</h4>
                        <ul>
                          {insights.insights.insights.race_overview.key_moments.map((moment, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + idx * 0.1 }}
                            >
                              {moment}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Driver Selector */}
                {insights.insights?.insights?.driver_insights && (
                  <div className="insights-section">
                    <h3>Driver Analysis</h3>
                    <div className="driver-selector">
                      {Object.keys(insights.insights.insights.driver_insights).map((driverName) => (
                        <button
                          key={driverName}
                          className={`driver-button ${selectedDriver === driverName ? 'active' : ''}`}
                          onClick={() => setSelectedDriver(driverName)}
                        >
                          {driverName}
                        </button>
                      ))}
                    </div>

                    {/* Selected Driver Insights */}
                    {selectedDriver && insights.insights.insights.driver_insights[selectedDriver] && (
                      <DriverInsightsPanel
                        driver={selectedDriver}
                        data={insights.insights.insights.driver_insights[selectedDriver]}
                      />
                    )}
                  </div>
                )}

                {/* Comparative Analysis */}
                {insights.insights?.insights?.comparative_analysis && (
                  <div className="insights-section">
                    <h3>Comparative Analysis</h3>
                    <div className="comparative-grid">
                      <div className="comparative-item">
                        <CheckCircle size={20} className="icon-success" />
                        <div>
                          <span className="label">Best Strategist</span>
                          <strong>{insights.insights.insights.comparative_analysis.best_strategist}</strong>
                        </div>
                      </div>
                      <div className="comparative-item">
                        <TrendingUp size={20} className="icon-info" />
                        <div>
                          <span className="label">Most Consistent</span>
                          <strong>{insights.insights.insights.comparative_analysis.most_consistent}</strong>
                        </div>
                      </div>
                      <div className="comparative-item">
                        <XCircle size={20} className="icon-error" />
                        <div>
                          <span className="label">Highest Error Rate</span>
                          <strong>{insights.insights.insights.comparative_analysis.highest_error_rate}</strong>
                        </div>
                      </div>
                    </div>

                    {insights.insights.insights.comparative_analysis.optimal_race_strategy && (
                      <div className="optimal-strategy">
                        <h4>Optimal Race Strategy</h4>
                        <div className="strategy-details">
                          <div className="strategy-item">
                            <span>Stops:</span>
                            <strong>{insights.insights.insights.comparative_analysis.optimal_race_strategy.stop_count}</strong>
                          </div>
                          <div className="strategy-item">
                            <span>Compounds:</span>
                            <strong>{insights.insights.insights.comparative_analysis.optimal_race_strategy.compounds?.join(' → ')}</strong>
                          </div>
                          <div className="strategy-rationale">
                            {insights.insights.insights.comparative_analysis.optimal_race_strategy.rationale}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Data Sources Footer */}
                <div className="insights-footer">
                  <div className="data-sources">
                    <span>Data Sources:</span>
                    <span>{insights.insights?.data_sources?.telemetry_samples || 0} telemetry samples</span>
                    <span>•</span>
                    <span>{insights.insights?.data_sources?.pit_stop_events || 0} pit stops</span>
                    <span>•</span>
                    <span>{insights.insights?.data_sources?.error_events || 0} errors</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Floating Insights Button */}
      {raceFinished && !showInsights && (
        <motion.button
          className="insights-trigger"
          onClick={() => setShowInsights(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Brain size={24} />
          <span>View AI Insights</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Driver-specific insights panel
const DriverInsightsPanel = ({ driver, data }) => {
  return (
    <motion.div
      className="driver-insights-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Performance Rating */}
      {data.performance_rating !== undefined && (
        <div className="performance-rating">
          <span className="rating-label">Performance Rating</span>
          <div className="rating-visual">
            <motion.div
              className="rating-bar"
              initial={{ width: 0 }}
              animate={{ width: `${(data.performance_rating / 10) * 100}%` }}
              transition={{ duration: 1 }}
            />
            <span className="rating-value">{data.performance_rating.toFixed(1)}/10</span>
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="strengths-weaknesses">
        {data.strengths && data.strengths.length > 0 && (
          <div className="sw-section">
            <h4><CheckCircle size={16} /> Strengths</h4>
            <ul>
              {data.strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {data.weaknesses && data.weaknesses.length > 0 && (
          <div className="sw-section">
            <h4><AlertCircle size={16} /> Areas for Improvement</h4>
            <ul>
              {data.weaknesses.map((weakness, idx) => (
                <li key={idx}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Optimal Strategy */}
      {data.optimal_strategy && (
        <div className="optimal-strategy-panel">
          <h4>Recommended Strategy</h4>
          <div className="strategy-comparison">
            <div className="strategy-col">
              <span className="col-label">Recommended</span>
              <div className="strategy-data">
                <span>{data.optimal_strategy.recommended_stops}-stop</span>
                <span className="compounds">{data.optimal_strategy.recommended_compounds?.join(' → ')}</span>
              </div>
            </div>
            {data.actual_vs_optimal && (
              <div className="strategy-col">
                <span className="col-label">Actual</span>
                <div className="strategy-data">
                  <span>{data.actual_vs_optimal.actual_stops}-stop</span>
                  <span className="compounds">{data.actual_vs_optimal.actual_compounds?.join(' → ')}</span>
                </div>
              </div>
            )}
          </div>
          {data.optimal_strategy.potential_time_gain && (
            <div className="time-gain">
              Potential gain: <strong>{data.optimal_strategy.potential_time_gain}</strong>
            </div>
          )}
        </div>
      )}

      {/* Improvement Recommendations */}
      {data.improvement_recommendations && data.improvement_recommendations.length > 0 && (
        <div className="recommendations">
          <h4>Recommendations</h4>
          <ul>
            {data.improvement_recommendations.map((rec, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {rec}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default RaceInsights;
