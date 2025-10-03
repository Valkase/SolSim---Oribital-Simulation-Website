"use client"

import { useState } from "react"
import ImpactCalculator from "../../Simulation/ImpactCalculator"
import "./ImpactSimulator.css"

function ImpactSimulator({ neo, onSimulate }) {
  const [impactAngle, setImpactAngle] = useState(45)
  const [impactVelocity, setImpactVelocity] = useState(neo.closeApproaches?.[0]?.relativeVelocity || 20)
  const [surfaceType, setSurfaceType] = useState("LAND")
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [calculating, setCalculating] = useState(false)

  const handleSimulate = () => {
    setCalculating(true)

    setTimeout(() => {
      try {
        const scenario = {
          asteroidId: neo.id,
          asteroidName: neo.name,
          diameter: neo.estimatedDiameter, // in meters
          mass: neo.mass, // in kg
          velocity: impactVelocity, // km/s
          angle: impactAngle, // degrees
          location: {
            latitude: latitude,
            longitude: longitude,
            elevation: 0,
          },
          surfaceType: surfaceType, // 'LAND', 'OCEAN', 'URBAN'
        }

        const results = ImpactCalculator.calculateImpact(scenario)

        console.log("Impact simulation results:", results)
        onSimulate(scenario, results)
      } catch (error) {
        console.error("Error calculating impact:", error)
      } finally {
        setCalculating(false)
      }
    }, 500)
  }

  return (
    <div className="impact-simulator">
      <div className="simulator-header">
        <h2 className="simulator-title">Impact Simulation Parameters</h2>
        <p className="simulator-subtitle">Configure impact scenario for {neo.name}</p>
      </div>

      <div className="asteroid-properties">
        <h3 className="section-title">Asteroid Properties</h3>
        <div className="properties-grid">
          <div className="property-item">
            <span className="property-label">Diameter:</span>
            <span className="property-value">{(neo.estimatedDiameter / 1000).toFixed(2)} km</span>
          </div>
          <div className="property-item">
            <span className="property-label">Estimated Mass:</span>
            <span className="property-value">{(neo.mass / 1e12).toExponential(2)} × 10¹² kg</span>
          </div>
          <div className="property-item">
            <span className="property-label">Approach Velocity:</span>
            <span className="property-value">{impactVelocity.toFixed(2)} km/s</span>
          </div>
        </div>
      </div>

      <div className="simulation-controls">
        <h3 className="section-title">Impact Parameters</h3>

        <div className="control-group">
          <label className="control-label">
            Impact Angle: {impactAngle}°<span className="control-hint">(0° = horizontal, 90° = vertical)</span>
          </label>
          <input
            type="range"
            min="15"
            max="90"
            step="5"
            value={impactAngle}
            onChange={(e) => setImpactAngle(Number(e.target.value))}
            className="range-input"
          />
          <div className="range-labels">
            <span>15° Shallow</span>
            <span>90° Steep</span>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">
            Impact Velocity: {impactVelocity} km/s
            <span className="control-hint">(Typical range: 11-72 km/s)</span>
          </label>
          <input
            type="range"
            min="11"
            max="72"
            step="1"
            value={impactVelocity}
            onChange={(e) => setImpactVelocity(Number(e.target.value))}
            className="range-input"
          />
          <div className="range-labels">
            <span>11 km/s Min</span>
            <span>72 km/s Max</span>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">
            Surface Type
            <span className="control-hint">(Affects crater formation and secondary effects)</span>
          </label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="LAND"
                checked={surfaceType === "LAND"}
                onChange={(e) => setSurfaceType(e.target.value)}
              />
              <span>Land Impact</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="OCEAN"
                checked={surfaceType === "OCEAN"}
                onChange={(e) => setSurfaceType(e.target.value)}
              />
              <span>Ocean Impact</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="URBAN"
                checked={surfaceType === "URBAN"}
                onChange={(e) => setSurfaceType(e.target.value)}
              />
              <span>Urban Area</span>
            </label>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">
            Impact Location
            <span className="control-hint">(Latitude and Longitude)</span>
          </label>
          <div className="location-inputs">
            <input
              type="number"
              min="-90"
              max="90"
              step="0.1"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              placeholder="Latitude"
              className="location-input"
            />
            <input
              type="number"
              min="-180"
              max="180"
              step="0.1"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              placeholder="Longitude"
              className="location-input"
            />
          </div>
        </div>
      </div>

      <div className="simulation-warning">
        <span className="warning-icon">⚠️</span>
        <p>
          This simulation uses scientific models to estimate impact effects. Results are approximations based on
          asteroid size, velocity, and impact parameters.
        </p>
      </div>

      <button className="simulate-button" onClick={handleSimulate} disabled={calculating}>
        {calculating ? "Calculating Impact..." : "Run Impact Simulation"}
      </button>
    </div>
  )
}

export default ImpactSimulator
