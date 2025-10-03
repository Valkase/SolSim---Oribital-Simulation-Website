import { getDangerLevel } from "../../Simulation/constants"
import "./ImpactResults.css"

function ImpactResults({ results, neo }) {
  const dangerLevel = getDangerLevel(results.energy.kineticEnergyMegatons)

  const getDangerLevelColor = (level) => {
    // Use color from danger level object
    return level.color || "#a0aec0"
  }

  return (
    <div className="impact-results">
      <div className="results-header">
        <h2 className="results-title">Impact Analysis Results</h2>
        <div className="danger-level-badge" style={{ background: getDangerLevelColor(dangerLevel) }}>
          {dangerLevel.label.toUpperCase()}
        </div>
      </div>

      <div className="results-grid">
        <div className="result-card highlight">
          <div className="result-icon">💥</div>
          <div className="result-content">
            <div className="result-label">Impact Energy</div>
            <div className="result-value">{results.energy.kineticEnergyMegatons.toFixed(2)} MT</div>
            <div className="result-subtitle">({results.energy.kineticEnergyJoules.toExponential(2)} J)</div>
          </div>
        </div>

        <div className="result-card">
          <div className="result-icon">🕳️</div>
          <div className="result-content">
            <div className="result-label">Crater Diameter</div>
            <div className="result-value">{(results.crater.diameter / 1000).toFixed(2)} km</div>
            <div className="result-subtitle">
              Depth: {results.crater.depth.toFixed(2)} m, Type: {results.crater.type}
            </div>
          </div>
        </div>

        <div className="result-card">
          <div className="result-icon">📊</div>
          <div className="result-content">
            <div className="result-label">Seismic Effect</div>
            <div className="result-value">Magnitude {results.seismic.magnitude.toFixed(2)}</div>
            <div className="result-subtitle">{results.seismic.description}</div>
          </div>
        </div>

        {results.tsunami && (
          <div className="result-card warning">
            <div className="result-icon">🌊</div>
            <div className="result-content">
              <div className="result-label">Tsunami Wave</div>
              <div className="result-value">{results.tsunami.maxWaveHeight.toFixed(2)} m</div>
              <div className="result-subtitle">
                Affected coastline: {results.tsunami.affectedCoastlineKm.toFixed(2)} km
              </div>
            </div>
          </div>
        )}

        {results.atmospheric && (
          <div className="result-card">
            <div className="result-icon">💨</div>
            <div className="result-content">
              <div className="result-label">Atmospheric Entry</div>
              <div className="result-value">{results.atmospheric.fragmentationOccurred ? "Fragmented" : "Intact"}</div>
              <div className="result-subtitle">
                {results.atmospheric.fragmentationOccurred
                  ? `At ${results.atmospheric.fragmentationAltitude.toFixed(2)} km`
                  : `Surviving mass: ${(results.atmospheric.survivingMassFraction * 100).toFixed(2)}%`}
              </div>
            </div>
          </div>
        )}
      </div>

      {results.damage && results.damage.zones && (
        <div className="damage-zones">
          <h3 className="zones-title">Damage Zones</h3>
          <div className="zones-list">
            {results.damage.zones.map((zone, index) => (
              <div key={index} className={`zone-item ${zone.level.toLowerCase().replace(" ", "-")}`}>
                <div className="zone-header">
                  <span className="zone-name">{zone.level}</span>
                  <span className="zone-radius">{zone.radius.toFixed(2)} km radius</span>
                </div>
                <div className="zone-description">{zone.description}</div>
              </div>
            ))}
          </div>

          <div className="damage-summary">
            <div className="summary-item">
              <span className="summary-label">Total Affected Area:</span>
              <span className="summary-value">{results.damage.totalAffectedArea.toFixed(2)} km²</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Estimated Casualties:</span>
              <span className="summary-value">{results.damage.estimatedCasualties.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Overall Severity:</span>
              <span className="summary-value">{results.damage.overallSeverity.toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImpactResults
