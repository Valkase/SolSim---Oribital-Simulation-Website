"use client"

import { useState } from "react"
import NEOSelector from "../../components/NEOSelector/NEOSelector"
import MitigationPanel from "../../components/MitigationPanel/MitigationPanel"
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner"
import "./MitigationStrategies.css"

function MitigationStrategies({ neoData, loading, error }) {
  const [selectedNEO, setSelectedNEO] = useState(null)
  const [mitigationHistory, setMitigationHistory] = useState([])

  const handleMitigationTest = (results) => {
    setMitigationHistory((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        neo: selectedNEO,
        ...results,
      },
    ])
  }

  const handleClearHistory = () => {
    setMitigationHistory([])
  }

  if (loading) {
    return (
      <div className="mitigation-loading">
        <LoadingSpinner />
        <p>Loading NEO data...</p>
      </div>
    )
  }

  return (
    <div className="mitigation-strategies">
      <div className="mitigation-header">
        <h1 className="mitigation-title">Planetary Defense Laboratory</h1>
        <p className="mitigation-subtitle">
          Test and compare different deflection strategies to protect Earth from asteroid impacts
        </p>
      </div>

      {error && (
        <div className="warning-banner">
          <span className="warning-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="mitigation-layout">
        <div className="mitigation-selector">
          <h2 className="section-heading">Select Target Asteroid</h2>
          <NEOSelector neoData={neoData} onSelect={setSelectedNEO} compact={true} />
        </div>

        {selectedNEO && (
          <div className="mitigation-panel-container">
            <MitigationPanel
              neo={selectedNEO}
              impactParams={{
                impactAngle: 45,
                impactVelocity: selectedNEO.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 20,
                targetType: "land",
              }}
              onMitigate={handleMitigationTest}
              standalone={true}
            />
          </div>
        )}

        {mitigationHistory.length > 0 && (
          <div className="mitigation-history">
            <div className="history-header">
              <h2 className="section-heading">Test History</h2>
              <button className="clear-button" onClick={handleClearHistory}>
                Clear History
              </button>
            </div>

            <div className="history-list">
              {mitigationHistory.map((test, index) => (
                <div key={index} className="history-item">
                  <div className="history-item-header">
                    <span className="history-neo-name">{test.neo.name}</span>
                    <span className="history-timestamp">{new Date(test.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="history-item-details">
                    <span>Strategy: {test.strategy}</span>
                    <span className={`history-success ${test.success ? "success" : "failure"}`}>
                      {test.success ? "✓ Successful" : "✗ Failed"}
                    </span>
                  </div>
                  {test.velocityChange && (
                    <div className="history-item-stats">ΔV: {test.velocityChange.toFixed(2)} m/s</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MitigationStrategies
