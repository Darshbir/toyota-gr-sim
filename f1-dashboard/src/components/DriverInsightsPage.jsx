import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Zap, Award, AlertCircle } from 'lucide-react';
import './DriverInsightsPage.css';

const DriverInsightsPage = ({ driverName, insights, raceData, onBack }) => {
  if (!insights) {
    return (
      <div className="driver-insights-page">
        <div className="insights-error">No insights available for {driverName}</div>
      </div>
    );
  }

  const driverData = raceData?.drivers?.find(d => d.name === driverName);
  const overall = insights.overall_assessment || {};
  const pitStrategy = insights.pit_strategy_analysis || {};
  const tireMgmt = insights.tire_management || {};
  const sectorPerf = insights.sector_performance || {};
  const raceCraft = insights.race_craft || {};

  return (
    <div className="driver-insights-page">
      <div className="insights-page-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft />
          <span>Back to Dashboard</span>
        </button>
        <div className="driver-header-info">
          <h1>{driverName}</h1>
          {driverData && (
            <div className="driver-meta">
              <span>P{driverData.final_position}</span>
              <span>•</span>
              <span>{formatTime(driverData.total_time)}</span>
              <span>•</span>
              <span>{driverData.pitstop_count} Pit Stops</span>
            </div>
          )}
        </div>
      </div>

      <div className="overall-scores-section">
        <h2>Overall Performance Scores</h2>
        <div className="scores-grid">
          <ScoreCard
            label="Performance Score"
            value={overall.performance_score || 0}
            icon={<Award />}
            color="#E10600"
          />
          <ScoreCard
            label="Strategy Score"
            value={overall.strategy_score || 0}
            icon={<Target />}
            color="#8B0000"
          />
          <ScoreCard
            label="Execution Score"
            value={overall.execution_score || 0}
            icon={<Zap />}
            color="#FF1A0A"
          />
        </div>
      </div>

      <div className="insights-sections">
        <Section
          title="Pit Strategy Analysis"
          icon={<Target />}
        >
          <div className="strategy-info">
            <div className="strategy-item">
              <div className="strategy-label">Optimal Strategy</div>
              <div className="strategy-value">
                {pitStrategy.optimal_strategy || 'N/A'}
                <ConfidenceBadge confidence={pitStrategy.optimal_strategy_confidence || 0} />
              </div>
            </div>
            <div className="strategy-item">
              <div className="strategy-label">Strategy Efficiency</div>
              <div className="strategy-value">
                {Math.round((pitStrategy.strategy_efficiency_score || 0) * 100)}%
              </div>
            </div>
            {pitStrategy.recommended_pit_laps && pitStrategy.recommended_pit_laps.length > 0 && (
              <div className="strategy-item">
                <div className="strategy-label">Recommended Pit Laps</div>
                <div className="strategy-value">
                  {pitStrategy.recommended_pit_laps.join(', ')}
                </div>
              </div>
            )}
            {pitStrategy.recommended_tire_sequence && (
              <div className="strategy-item">
                <div className="strategy-label">Recommended Tire Sequence</div>
                <div className="tire-sequence">
                  {pitStrategy.recommended_tire_sequence.map((tire, idx) => (
                    <span key={idx} className={`tire-badge tire-${tire.toLowerCase()}`}>
                      {tire}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {pitStrategy.missed_opportunities && pitStrategy.missed_opportunities.length > 0 && (
            <div className="opportunities-section">
              <h3>Missed Opportunities</h3>
              {pitStrategy.missed_opportunities.map((opp, idx) => (
                <OpportunityCard key={idx} opportunity={opp} type="missed" />
              ))}
            </div>
          )}

          {pitStrategy.undercut_opportunities && pitStrategy.undercut_opportunities.length > 0 && (
            <div className="opportunities-section">
              <h3>Undercut Opportunities</h3>
              {pitStrategy.undercut_opportunities.map((opp, idx) => (
                <OpportunityCard key={idx} opportunity={opp} type="undercut" />
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Tire Management"
          icon={<Zap />}
        >
          <div className="tire-scores">
            <ScoreBar label="Tire Usage Score" value={tireMgmt.tire_usage_score || 0} />
            <ScoreBar label="Wear Rate Score" value={tireMgmt.tire_wear_analysis?.wear_rate_score || 0} />
            <ScoreBar label="Pit Timing Score" value={tireMgmt.tire_wear_analysis?.pit_timing_score || 0} />
          </div>

          {tireMgmt.optimal_compound_analysis && (
            <div className="compound-analysis">
              <h3>Optimal Compound Analysis</h3>
              <div className="compound-recommendation">
                <span className="compound-label">Recommended Starting Compound:</span>
                <span className={`tire-badge tire-${tireMgmt.optimal_compound_analysis.recommended_starting_compound?.toLowerCase() || 'medium'}`}>
                  {tireMgmt.optimal_compound_analysis.recommended_starting_compound || 'N/A'}
                </span>
                <ConfidenceBadge confidence={tireMgmt.optimal_compound_analysis.confidence || 0} />
              </div>
              {tireMgmt.optimal_compound_analysis.reasoning && (
                <p className="compound-reasoning">{tireMgmt.optimal_compound_analysis.reasoning}</p>
              )}
            </div>
          )}
        </Section>

        <Section
          title="Sector Performance"
          icon={<TrendingUp />}
        >
          <div className="sector-scores">
            <SectorCard
              sector="S1"
              score={sectorPerf.sector1_score || 0}
              best={sectorPerf.best_sector1}
              avg={sectorPerf.avg_sector1}
            />
            <SectorCard
              sector="S2"
              score={sectorPerf.sector2_score || 0}
              best={sectorPerf.best_sector2}
              avg={sectorPerf.avg_sector2}
            />
            <SectorCard
              sector="S3"
              score={sectorPerf.sector3_score || 0}
              best={sectorPerf.best_sector3}
              avg={sectorPerf.avg_sector3}
            />
          </div>

          {sectorPerf.improvement_potential && (
            <div className="improvement-section">
              <h3>Improvement Potential</h3>
              <div className="improvement-card">
                <div className="improvement-header">
                  <span className="improvement-sector">Sector {sectorPerf.improvement_potential.sector}</span>
                  <span className="improvement-gain">
                    Potential: {sectorPerf.improvement_potential.potential_time_gain}s
                  </span>
                </div>
                {sectorPerf.improvement_potential.recommendations && (
                  <ul className="improvement-recommendations">
                    {sectorPerf.improvement_potential.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </Section>

        <Section
          title="Race Craft"
          icon={<Award />}
        >
          <div className="race-craft-scores">
            <ScoreBar label="Overtaking Efficiency" value={raceCraft.overtaking_efficiency || 0} />
            <ScoreBar label="Defensive Driving" value={raceCraft.defensive_driving_score || 0} />
          </div>

          {raceCraft.position_gain_opportunities && raceCraft.position_gain_opportunities.length > 0 && (
            <div className="opportunities-section">
              <h3>Position Gain Opportunities</h3>
              {raceCraft.position_gain_opportunities.map((opp, idx) => (
                <OpportunityCard key={idx} opportunity={opp} type="position" />
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Top Recommendations"
          icon={<AlertCircle />}
        >
          {overall.top_3_recommendations && overall.top_3_recommendations.length > 0 ? (
            <div className="recommendations-list">
              {overall.top_3_recommendations.map((rec, idx) => (
                <RecommendationCard key={idx} recommendation={rec} priority={idx + 1} />
              ))}
            </div>
          ) : (
            <p className="no-recommendations">No specific recommendations available</p>
          )}
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <motion.div
    className="insights-section"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="section-header">
      {icon}
      <h2>{title}</h2>
    </div>
    <div className="section-content">
      {children}
    </div>
  </motion.div>
);

const ScoreCard = ({ label, value, icon, color }) => (
  <div className="score-card">
    <div className="score-card-icon" style={{ color }}>
      {icon}
    </div>
    <div className="score-card-value" style={{ color }}>
      {Math.round(value * 100)}%
    </div>
    <div className="score-card-label">{label}</div>
    <div className="score-card-bar">
      <div className="score-card-bar-fill" style={{ width: `${value * 100}%`, backgroundColor: color }} />
    </div>
  </div>
);

const ScoreBar = ({ label, value }) => (
  <div className="score-bar-item">
    <div className="score-bar-label">{label}</div>
    <div className="score-bar-container">
      <div className="score-bar-fill" style={{ width: `${value * 100}%` }} />
      <span className="score-bar-value">{Math.round(value * 100)}%</span>
    </div>
  </div>
);

const SectorCard = ({ sector, score, best, avg }) => (
  <div className="sector-card">
    <div className="sector-header">
      <span className="sector-name">{sector}</span>
      <span className="sector-score">{Math.round(score * 100)}%</span>
    </div>
    <div className="sector-bar">
      <div className="sector-bar-fill" style={{ width: `${score * 100}%` }} />
    </div>
    {best && <div className="sector-time">Best: {best}s</div>}
    {avg && <div className="sector-time">Avg: {avg}s</div>}
  </div>
);

const OpportunityCard = ({ opportunity, type }) => (
  <div className={`opportunity-card opportunity-${type}`}>
    <div className="opportunity-header">
      <span className="opportunity-type">{opportunity.opportunity_type || type}</span>
      {opportunity.lap && <span className="opportunity-lap">Lap {opportunity.lap}</span>}
    </div>
    <p className="opportunity-description">{opportunity.description}</p>
    {opportunity.potential_time_gain && (
      <div className="opportunity-gain">
        Potential Gain: {opportunity.potential_time_gain}s
      </div>
    )}
    {opportunity.potential_position_gain && (
      <div className="opportunity-gain">
        Potential Position Gain: {opportunity.potential_position_gain}
      </div>
    )}
    {opportunity.opportunity_score && (
      <ConfidenceBadge confidence={opportunity.opportunity_score} />
    )}
  </div>
);

const RecommendationCard = ({ recommendation, priority }) => (
  <div className="recommendation-card">
    <div className="recommendation-header">
      <span className="recommendation-priority">#{priority}</span>
      <span className="recommendation-category">{recommendation.category}</span>
      <ConfidenceBadge confidence={recommendation.confidence || 0} />
    </div>
    <p className="recommendation-text">{recommendation.recommendation}</p>
    {recommendation.expected_benefit && (
      <div className="recommendation-benefit">
        Expected Benefit: {recommendation.expected_benefit}
      </div>
    )}
  </div>
);

const ConfidenceBadge = ({ confidence }) => (
  <span className="confidence-badge">
    {Math.round(confidence * 100)}% confidence
  </span>
);

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default DriverInsightsPage;

