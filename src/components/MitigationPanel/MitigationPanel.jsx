"use client"

import { useState } from "react"
import ImpactCalculator from "../../Simulation/ImpactCalculator"
import "./MitigationPanel.css"

function MitigationPanel({ neo, impactParams, impactScenario, onMitigate, standalone = false }) {
  const [strategy, setStrategy] = useState("kinetic")
  const [velocityReduction, setVelocityReduction] = useState(5)
  const [deflectionAngle, setDeflectionAngle] = useState(0.1)
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState(null)

  const calculateMitigation = () => {
    setCalculating(true)

    setTimeout(() => {
      try {
        // Determine which prop was passed and build complete impact scenario
        let fullScenario
        
        if (impactScenario) {
          // If full impactScenario is passed (from SimulationWizard), use it directly
          fullScenario = impactScenario
        } else if (impactParams) {
          // If impactParams is passed (from MitigationStrategies), build scenario
          fullScenario = {
            asteroidId: neo.id,
            asteroidName: neo.name,
            diameter: neo.estimated_diameter?.meters?.estimated_diameter_max || 
                     neo.estimated_diameter_max?.meters || 
                     100, // fallback
            mass: neo.estimated_diameter?.meters?.estimated_diameter_max 
                  ? (4/3) * Math.PI * Math.pow((neo.estimated_diameter.meters.estimated_diameter_max / 2), 3) * 2600
                  : 1.4e9, // fallback mass calculation
            velocity: impactParams.impactVelocity || 
                     parseFloat(neo.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second) || 
                     20,
            angle: impactParams.impactAngle || 45,
            location: { latitude: 0, longitude: 0, elevation: 0 },
            surfaceType: impactParams.targetType?.toUpperCase() || 'LAND',
          }
        } else {
          // Fallback: build from neo data only
          fullScenario = {
            asteroidId: neo.id,
            asteroidName: neo.name,
            diameter: neo.estimated_diameter?.meters?.estimated_diameter_max || 100,
            mass: neo.estimated_diameter?.meters?.estimated_diameter_max 
                  ? (4/3) * Math.PI * Math.pow((neo.estimated_diameter.meters.estimated_diameter_max / 2), 3) * 2600
                  : 1.4e9,
            velocity: parseFloat(neo.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second) || 20,
            angle: 45,
            location: { latitude: 0, longitude: 0, elevation: 0 },
            surfaceType: 'LAND',
          }
        }

        const mitigationResult = ImpactCalculator.calculateMitigation(
          fullScenario,
          velocityReduction,
          deflectionAngle,
        )

        setResult(mitigationResult)
        onMitigate(mitigationResult)
        setCalculating(false)

        console.log("Mitigation result:", mitigationResult)
      } catch (error) {
        console.error("Error calculating mitigation:", error)
        setCalculating(false)
      }
    }, 500)
  }

  const handleStrategyChange = (newStrategy) => {
    setStrategy(newStrategy)

    // Set typical values for each strategy
    if (newStrategy === "kinetic") {
      setVelocityReduction(5) // 5 km/s typical for kinetic impactor
      setDeflectionAngle(0.1) // 0.1 degrees
    } else if (newStrategy === "nuclear") {
      setVelocityReduction(10) // 10 km/s for nuclear deflection
      setDeflectionAngle(0.15) // 0.15 degrees
    } else if (newStrategy === "gravity") {
      setVelocityReduction(2) // 2 km/s for gravity tractor
      setDeflectionAngle(0.02) // 0.02 degrees (slow but precise)
    }
  }

  return (
    <div className={`mitigation-panel ${standalone ? "standalone" : ""}`}>
      <div className="mitigation-header">
        <h2 className="mitigation-title">Planetary Defense Strategies</h2>
        <p className="mitigation-subtitle">Test deflection methods to prevent impact</p>
      </div>

      <div className="strategy-selector">
        <label className="strategy-label">Select Deflection Strategy</label>
        <div className="strategy-options">
          <button
            className={`strategy-button ${strategy === "kinetic" ? "active" : ""}`}
            onClick={() => handleStrategyChange("kinetic")}
          >
            <div className="strategy-icon">🚀</div>
            <div className="strategy-name">Kinetic Impactor</div>
            <div className="strategy-desc">High-speed collision</div>
          </button>

          <button
            className={`strategy-button ${strategy === "nuclear" ? "active" : ""}`}
            onClick={() => handleStrategyChange("nuclear")}
          >
            <div className="strategy-icon">☢️</div>
            <div className="strategy-name">Nuclear Deflection</div>
            <div className="strategy-desc">Energy blast</div>
          </button>

          <button
            className={`strategy-button ${strategy === "gravity" ? "active" : ""}`}
            onClick={() => handleStrategyChange("gravity")}
          >
            <div className="strategy-icon">🛸</div>
            <div className="strategy-name">Gravity Tractor</div>
            <div className="strategy-desc">Slow gravitational pull</div>
          </button>
        </div>
      </div>

      <div className="mitigation-controls">
        <div className="control-group">
          <label className="control-label">
            Velocity Reduction: {velocityReduction} km/s
            <span className="control-hint">Change in asteroid velocity</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={velocityReduction}
            onChange={(e) => setVelocityReduction(Number(e.target.value))}
            className="range-input"
          />
          <div className="range-labels">
            <span>0.5 km/s</span>
            <span>20 km/s</span>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">
            Deflection Angle: {deflectionAngle}°
            <span className="control-hint">Angular deflection from original path</span>
          </label>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={deflectionAngle}
            onChange={(e) => setDeflectionAngle(Number(e.target.value))}
            className="range-input"
          />
          <div className="range-labels">
            <span>0.01°</span>
            <span>1°</span>
          </div>
        </div>
      </div>

      <button className="calculate-button" onClick={calculateMitigation} disabled={calculating}>
        {calculating ? "Calculating..." : "Calculate Deflection"}
      </button>

      {result && (
        <div className={`mitigation-result ${result.avoidsImpact ? "success" : "failure"}`}>
          <div className="result-header">
            <span className="result-icon">{result.avoidsImpact ? "✓" : "✗"}</span>
            <span className="result-status">{result.avoidsImpact ? "Impact Avoided!" : "Impact Still Occurs"}</span>
          </div>

          <div className="result-details">
            <div className="result-item">
              <span className="result-label">Original Energy:</span>
              <span className="result-value">{result.original.energy.kineticEnergyMegatons.toFixed(2)} MT</span>
            </div>
            <div className="result-item">
              <span className="result-label">Mitigated Energy:</span>
              <span className="result-value">{result.mitigated.energy.kineticEnergyMegatons.toFixed(2)} MT</span>
            </div>
            <div className="result-item">
              <span className="result-label">Energy Reduction:</span>
              <span className="result-value">{result.energyReductionPercent.toFixed(1)}%</span>
            </div>
            {!result.avoidsImpact && (
              <div className="result-item">
                <span className="result-label">Lives Saved:</span>
                <span className="result-value">{result.casualtyReduction.toLocaleString()}</span>
              </div>
            )}
          </div>

          {!result.avoidsImpact && (
            <div className="failure-message">
              Impact not fully prevented. Try increasing velocity reduction or deflection angle.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MitigationPanel