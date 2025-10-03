"use client"

import { useState, useEffect } from "react"
import ImpactCalculator from "../../Simulation/ImpactCalculator"
import OrbitVisualization from "../../components/OrbitVisualization/OrbitVisualization"
import "./GameMode.css"

// Predefined threat scenarios
const SCENARIOS = [
  {
    id: "scenario-1",
    name: "2023 DW",
    description:
      "A 50-meter asteroid on collision course with Earth. Medium-sized threat requiring precise deflection.",
    difficulty: "medium",
    neo: {
      id: "2023-dw",
      name: "2023 DW",
      estimatedDiameter: 50,
      absoluteMagnitude: 24.3,
      isPotentiallyHazardous: true,
      orbitalData: {
        semiMajorAxis: 1.2,
        eccentricity: 0.15,
        inclination: 5.2,
        longitudeAscendingNode: 45,
        argumentPerihelion: 120,
        meanAnomaly: 180,
        orbitalPeriod: 480,
        perihelionDistance: 1.02,
        aphelionDistance: 1.38,
      },
    },
    impactScenario: {
      asteroidId: "2023-dw",
      asteroidName: "2023 DW",
      diameter: 50,
      mass: 3.27e8, // kg
      velocity: 18.5, // km/s
      angle: 45,
      location: {
        latitude: 35.6762,
        longitude: 139.6503,
        elevation: 40,
        region: "Tokyo, Japan",
      },
      surfaceType: "URBAN",
    },
    timeToImpact: 180, // days
  },
  {
    id: "scenario-2",
    name: "Apophis-Class",
    description:
      "A 370-meter asteroid similar to 99942 Apophis. Major regional threat requiring significant deflection.",
    difficulty: "medium",
    neo: {
      id: "apophis-class",
      name: "Apophis-Class",
      estimatedDiameter: 370,
      absoluteMagnitude: 19.7,
      isPotentiallyHazardous: true,
      orbitalData: {
        semiMajorAxis: 0.92,
        eccentricity: 0.19,
        inclination: 3.3,
        longitudeAscendingNode: 204,
        argumentPerihelion: 126,
        meanAnomaly: 90,
        orbitalPeriod: 324,
        perihelionDistance: 0.75,
        aphelionDistance: 1.09,
      },
    },
    impactScenario: {
      asteroidId: "apophis-class",
      asteroidName: "Apophis-Class",
      diameter: 370,
      mass: 6.1e10, // kg
      velocity: 12.6, // km/s
      angle: 30,
      location: {
        latitude: 40.7128,
        longitude: -74.006,
        elevation: 10,
        region: "New York, USA",
      },
      surfaceType: "URBAN",
    },
    timeToImpact: 365, // days
  },
  {
    id: "scenario-3",
    name: "Bennu-Type",
    description: "A 500-meter carbonaceous asteroid. Continental-scale threat requiring maximum deflection effort.",
    difficulty: "medium",
    neo: {
      id: "bennu-type",
      name: "Bennu-Type",
      estimatedDiameter: 500,
      absoluteMagnitude: 20.9,
      isPotentiallyHazardous: true,
      orbitalData: {
        semiMajorAxis: 1.13,
        eccentricity: 0.2,
        inclination: 6.0,
        longitudeAscendingNode: 2,
        argumentPerihelion: 66,
        meanAnomaly: 270,
        orbitalPeriod: 437,
        perihelionDistance: 0.9,
        aphelionDistance: 1.36,
      },
    },
    impactScenario: {
      asteroidId: "bennu-type",
      asteroidName: "Bennu-Type",
      diameter: 500,
      mass: 7.8e10, // kg
      velocity: 28.6, // km/s
      angle: 60,
      location: {
        latitude: 51.5074,
        longitude: -0.1278,
        elevation: 11,
        region: "London, UK",
      },
      surfaceType: "URBAN",
    },
    timeToImpact: 730, // days
  },
]

const STRATEGIES = {
  kinetic: {
    name: "Kinetic Impactor",
    icon: "🚀",
    description: "High-speed spacecraft collision to alter asteroid trajectory",
    cost: 500000000, // $500M
    defaultDeltaV: 5,
    defaultDeflection: 0.1,
  },
  nuclear: {
    name: "Nuclear Deflection",
    icon: "☢️",
    description: "Nuclear device detonation to vaporize surface material and create thrust",
    cost: 1500000000, // $1.5B
    defaultDeltaV: 10,
    defaultDeflection: 0.15,
  },
  gravity: {
    name: "Gravity Tractor",
    icon: "🛸",
    description: "Spacecraft uses gravitational pull to slowly alter trajectory over time",
    cost: 2000000000, // $2B
    defaultDeltaV: 2,
    defaultDeflection: 0.02,
  },
}

const STARTING_BUDGET = 3000000000 // $3B

function GameMode() {
  const [gamePhase, setGamePhase] = useState("scenario-select") // scenario-select, briefing, planning, execution, debrief
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [budget, setBudget] = useState(STARTING_BUDGET)
  const [deltaV, setDeltaV] = useState(5)
  const [deflectionAngle, setDeflectionAngle] = useState(0.1)
  const [launchTime, setLaunchTime] = useState(90) // days before impact
  const [countdown, setCountdown] = useState(10)
  const [missionResult, setMissionResult] = useState(null)
  const [attemptHistory, setAttemptHistory] = useState([])
  const [impactResults, setImpactResults] = useState(null)
  const [startTime, setStartTime] = useState(null)

  // Load attempt history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gamemode-attempts")
    if (saved) {
      setAttemptHistory(JSON.parse(saved))
    }
  }, [])

  // Save attempt to localStorage
  const saveAttempt = (attempt) => {
    const updated = [...attemptHistory, attempt]
    setAttemptHistory(updated)
    localStorage.setItem("gamemode-attempts", JSON.stringify(updated))
  }

  const selectScenario = (scenario) => {
    setSelectedScenario(scenario)
    setGamePhase("briefing")
    setStartTime(Date.now())

    // Calculate impact results for briefing
    const results = ImpactCalculator.calculateImpact(scenario.impactScenario)
    setImpactResults(results)
  }

  const proceedToPlanning = () => {
    setGamePhase("planning")
  }

  const selectStrategy = (strategyKey) => {
    const strategy = STRATEGIES[strategyKey]
    if (strategy.cost <= budget) {
      setSelectedStrategy(strategyKey)
      setDeltaV(strategy.defaultDeltaV)
      setDeflectionAngle(strategy.defaultDeflection)
    }
  }

  const launchMission = () => {
    if (!selectedStrategy) return

    // Deduct cost from budget
    const strategyCost = STRATEGIES[selectedStrategy].cost
    setBudget(budget - strategyCost)

    setGamePhase("execution")
    setCountdown(10)
  }

  const backToScenarios = () => {
    setGamePhase("scenario-select")
    setSelectedScenario(null)
    setSelectedStrategy(null)
    setBudget(STARTING_BUDGET)
    setMissionResult(null)
    setImpactResults(null)
    setStartTime(null)
  }

  const backToBriefing = () => {
    setGamePhase("briefing")
    setSelectedStrategy(null)
    setBudget(STARTING_BUDGET)
  }

  // Countdown timer for execution phase
  useEffect(() => {
    if (gamePhase === "execution" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gamePhase === "execution" && countdown === 0) {
      // Calculate mission results
      calculateMissionResults()
    }
  }, [gamePhase, countdown])

  const calculateMissionResults = () => {
    const mitigationResult = ImpactCalculator.calculateMitigation(
      selectedScenario.impactScenario,
      deltaV,
      deflectionAngle,
    )

    const timeElapsed = (Date.now() - startTime) / 1000 // seconds
    const timeBonus = Math.max(0, 1000 - Math.floor(timeElapsed / 10))

    const budgetRemaining = budget
    const budgetBonus = Math.floor(budgetRemaining / 1000000) // $1M = 1 point

    let livesSaved = 0
    let baseScore = 0

    if (mitigationResult.avoidsImpact) {
      // Full success - all lives saved
      livesSaved = impactResults.damage.estimatedCasualties || 0
      baseScore = 10000
    } else {
      // Partial success - some lives saved
      livesSaved = mitigationResult.casualtyReduction || 0
      baseScore = 5000
    }

    const livesSavedScore = Math.floor(livesSaved / 1000) // 1000 lives = 1 point
    const totalScore = baseScore + livesSavedScore + budgetBonus + timeBonus

    const result = {
      ...mitigationResult,
      score: totalScore,
      breakdown: {
        base: baseScore,
        livesSaved: livesSavedScore,
        budgetBonus: budgetBonus,
        timeBonus: timeBonus,
      },
      livesSaved: livesSaved,
      timeElapsed: Math.floor(timeElapsed),
      budgetSpent: STARTING_BUDGET - budget,
    }

    setMissionResult(result)

    // Save attempt
    saveAttempt({
      scenario: selectedScenario.name,
      strategy: STRATEGIES[selectedStrategy].name,
      success: mitigationResult.avoidsImpact,
      score: totalScore,
      timestamp: Date.now(),
    })

    setGamePhase("debrief")
  }

  const retryScenario = () => {
    setGamePhase("briefing")
    setSelectedStrategy(null)
    setBudget(STARTING_BUDGET)
    setMissionResult(null)
    setStartTime(Date.now())
  }

  const formatCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`
    return `$${value.toLocaleString()}`
  }

  const getDangerLevelClass = (energyMT) => {
    if (energyMT < 100) return "regional-threat"
    if (energyMT < 1000) return "continental-threat"
    return "global-threat"
  }

  const getDangerLevelText = (energyMT) => {
    if (energyMT < 100) return "Regional Threat"
    if (energyMT < 1000) return "Continental Threat"
    return "Global Threat"
  }

  // Scenario Selection Phase
  if (gamePhase === "scenario-select") {
    return (
      <div className="game-mode">
        <div className="scenario-select-container">
          <div className="scenario-header">
            <h1 className="scenario-title">Defend Earth Mode</h1>
            <p className="scenario-subtitle">Select a threat scenario and save humanity</p>
          </div>

          <div className="scenarios-grid">
            {SCENARIOS.map((scenario) => (
              <div key={scenario.id} className="scenario-card" onClick={() => selectScenario(scenario)}>
                <div className="scenario-card-header">
                  <h3 className="scenario-name">{scenario.name}</h3>
                  <span className={`difficulty-badge ${scenario.difficulty}`}>{scenario.difficulty}</span>
                </div>
                <p className="scenario-description">{scenario.description}</p>
                <div className="scenario-stats">
                  <div className="stat-item">
                    <span className="stat-label">Diameter</span>
                    <span className="stat-value">{scenario.neo.estimatedDiameter}m</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Velocity</span>
                    <span className="stat-value">{scenario.impactScenario.velocity} km/s</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Time to Impact</span>
                    <span className="stat-value">{scenario.timeToImpact} days</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Target</span>
                    <span className="stat-value">{scenario.impactScenario.location.region}</span>
                  </div>
                </div>
                <button className="select-scenario-btn">Select Mission</button>
              </div>
            ))}
          </div>

          {attemptHistory.length > 0 && (
            <div className="attempt-history">
              <h2 className="history-title">Mission History</h2>
              <div className="history-list">
                {attemptHistory
                  .slice(-5)
                  .reverse()
                  .map((attempt, index) => (
                    <div key={index} className="history-item">
                      <span className="history-scenario">{attempt.scenario}</span>
                      <span className="history-strategy">{attempt.strategy}</span>
                      <span className={`history-result ${attempt.success ? "success" : "failure"}`}>
                        {attempt.success ? "Success" : "Partial"}
                      </span>
                      <span className="history-score">{attempt.score.toLocaleString()} pts</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Mission Briefing Phase
  if (gamePhase === "briefing" && selectedScenario && impactResults) {
    return (
      <div className="game-mode">
        <div className="briefing-container">
          <div className="briefing-header">
            <h1 className="briefing-title">Mission Briefing: {selectedScenario.name}</h1>
            <p className="briefing-subtitle">Threat Assessment and Impact Analysis</p>
          </div>

          <div className="briefing-content">
            <div className="threat-overview">
              <h2 className="section-title">Threat Overview</h2>
              <div className={`danger-level-badge ${getDangerLevelClass(impactResults.energy.kineticEnergyMegatons)}`}>
                {getDangerLevelText(impactResults.energy.kineticEnergyMegatons)}
              </div>
              <div className="threat-stats-grid">
                <div className="threat-stat">
                  <span className="threat-stat-label">Asteroid Diameter</span>
                  <span className="threat-stat-value">{selectedScenario.neo.estimatedDiameter} meters</span>
                </div>
                <div className="threat-stat">
                  <span className="threat-stat-label">Estimated Mass</span>
                  <span className="threat-stat-value">
                    {(selectedScenario.impactScenario.mass / 1e6).toFixed(2)} million kg
                  </span>
                </div>
                <div className="threat-stat">
                  <span className="threat-stat-label">Impact Velocity</span>
                  <span className="threat-stat-value danger">{selectedScenario.impactScenario.velocity} km/s</span>
                </div>
                <div className="threat-stat">
                  <span className="threat-stat-label">Time to Impact</span>
                  <span className="threat-stat-value danger">{selectedScenario.timeToImpact} days</span>
                </div>
              </div>
            </div>

            <div className="impact-analysis">
              <h2 className="section-title">Impact Analysis</h2>
              <div className="impact-stats-grid">
                <div className="impact-stat">
                  <span className="impact-stat-label">Impact Energy</span>
                  <span className="impact-stat-value danger">
                    {impactResults.energy.kineticEnergyMegatons.toFixed(2)} MT
                  </span>
                  <span className="impact-stat-desc">TNT equivalent</span>
                </div>
                <div className="impact-stat">
                  <span className="impact-stat-label">Crater Diameter</span>
                  <span className="impact-stat-value">{(impactResults.crater.diameter / 1000).toFixed(2)} km</span>
                  <span className="impact-stat-desc">{impactResults.crater.type} crater</span>
                </div>
                <div className="impact-stat">
                  <span className="impact-stat-label">Seismic Magnitude</span>
                  <span className="impact-stat-value danger">{impactResults.seismic.magnitude.toFixed(1)}</span>
                  <span className="impact-stat-desc">{impactResults.seismic.description}</span>
                </div>
                <div className="impact-stat">
                  <span className="impact-stat-label">Estimated Casualties</span>
                  <span className="impact-stat-value danger">
                    {impactResults.damage.estimatedCasualties.toLocaleString()}
                  </span>
                  <span className="impact-stat-desc">{impactResults.damage.overallSeverity} impact</span>
                </div>
              </div>
            </div>

            <div className="target-location">
              <h2 className="section-title">Target Location</h2>
              <div className="location-info">
                <div className="location-item">
                  <span className="location-label">Region</span>
                  <span className="location-value">{selectedScenario.impactScenario.location.region}</span>
                </div>
                <div className="location-item">
                  <span className="location-label">Coordinates</span>
                  <span className="location-value">
                    {selectedScenario.impactScenario.location.latitude.toFixed(4)}°,{" "}
                    {selectedScenario.impactScenario.location.longitude.toFixed(4)}°
                  </span>
                </div>
                <div className="location-item">
                  <span className="location-label">Surface Type</span>
                  <span className="location-value">{selectedScenario.impactScenario.surfaceType}</span>
                </div>
                <div className="location-item">
                  <span className="location-label">Impact Angle</span>
                  <span className="location-value">{selectedScenario.impactScenario.angle}° from horizontal</span>
                </div>
              </div>
            </div>

            <div className="mission-objective">
              <h2 className="section-title">Mission Objective</h2>
              <p className="objective-text">
                Your mission is to select and deploy a deflection strategy to prevent this catastrophic impact. You have
                a budget of {formatCurrency(STARTING_BUDGET)} and {selectedScenario.timeToImpact} days before impact.
                Choose your strategy wisely - the fate of millions depends on your decision.
              </p>
            </div>
          </div>

          <div className="briefing-actions">
            <button className="back-btn" onClick={backToScenarios}>
              ← Back to Scenarios
            </button>
            <button className="proceed-btn" onClick={proceedToPlanning}>
              Proceed to Planning →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Planning Phase
  if (gamePhase === "planning" && selectedScenario) {
    return (
      <div className="game-mode">
        <div className="planning-container">
          <div className="planning-header">
            <h1 className="planning-title">Mission Planning</h1>
            <p className="planning-subtitle">Select deflection strategy and configure mission parameters</p>
            <div className="budget-display">
              <span className="budget-label">Available Budget:</span>
              <span className="budget-value">{formatCurrency(budget)}</span>
            </div>
          </div>

          <div className="planning-content">
            <div className="strategy-selection">
              <h2 className="section-title">Select Deflection Strategy</h2>
              <div className="strategies-grid">
                {Object.entries(STRATEGIES).map(([key, strategy]) => {
                  const canAfford = strategy.cost <= budget
                  const isSelected = selectedStrategy === key
                  return (
                    <div
                      key={key}
                      className={`strategy-card ${isSelected ? "selected" : ""} ${!canAfford ? "disabled" : ""}`}
                      onClick={() => canAfford && selectStrategy(key)}
                    >
                      <div className="strategy-icon-large">{strategy.icon}</div>
                      <h3 className="strategy-name">{strategy.name}</h3>
                      <p className="strategy-description">{strategy.description}</p>
                      <div className="strategy-cost">
                        <span className="cost-label">Cost:</span>
                        <span className="cost-value">{formatCurrency(strategy.cost)}</span>
                      </div>
                      {!canAfford && <div className="insufficient-funds">Insufficient Funds</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {selectedStrategy && (
              <div className="mission-parameters">
                <h2 className="section-title">Mission Parameters</h2>
                <div className="parameters-grid">
                  <div className="parameter-control">
                    <label className="parameter-label">Velocity Change (Δv): {deltaV} km/s</label>
                    <input
                      type="range"
                      min="0.5"
                      max="20"
                      step="0.5"
                      value={deltaV}
                      onChange={(e) => setDeltaV(Number(e.target.value))}
                      className="parameter-slider"
                    />
                    <div className="slider-labels">
                      <span>0.5 km/s</span>
                      <span>20 km/s</span>
                    </div>
                    <p className="parameter-hint">Higher values provide stronger deflection but require more energy</p>
                  </div>

                  <div className="parameter-control">
                    <label className="parameter-label">Deflection Angle: {deflectionAngle}°</label>
                    <input
                      type="range"
                      min="0.01"
                      max="1"
                      step="0.01"
                      value={deflectionAngle}
                      onChange={(e) => setDeflectionAngle(Number(e.target.value))}
                      className="parameter-slider"
                    />
                    <div className="slider-labels">
                      <span>0.01°</span>
                      <span>1°</span>
                    </div>
                    <p className="parameter-hint">
                      Angular change in trajectory - small changes can have large effects
                    </p>
                  </div>

                  <div className="parameter-control">
                    <label className="parameter-label">Launch Time: {launchTime} days before impact</label>
                    <input
                      type="range"
                      min="30"
                      max={selectedScenario.timeToImpact}
                      step="10"
                      value={launchTime}
                      onChange={(e) => setLaunchTime(Number(e.target.value))}
                      className="parameter-slider"
                    />
                    <div className="slider-labels">
                      <span>30 days</span>
                      <span>{selectedScenario.timeToImpact} days</span>
                    </div>
                    <p className="parameter-hint">Earlier launches allow more time for deflection to take effect</p>
                  </div>
                </div>

                <div className="mission-summary">
                  <h3 className="summary-title">Mission Summary</h3>
                  <div className="summary-items">
                    <div className="summary-item">
                      <span className="summary-label">Strategy</span>
                      <span className="summary-value">{STRATEGIES[selectedStrategy].name}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Cost</span>
                      <span className="summary-value">{formatCurrency(STRATEGIES[selectedStrategy].cost)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Δv</span>
                      <span className="summary-value">{deltaV} km/s</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Deflection</span>
                      <span className="summary-value">{deflectionAngle}°</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Launch</span>
                      <span className="summary-value">{launchTime} days before</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Remaining Budget</span>
                      <span className="summary-value">
                        {formatCurrency(budget - STRATEGIES[selectedStrategy].cost)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="planning-actions">
            <button className="back-btn" onClick={backToBriefing}>
              ← Back to Briefing
            </button>
            <button className="launch-btn" onClick={launchMission} disabled={!selectedStrategy}>
              Launch Mission 🚀
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Execution Phase
  if (gamePhase === "execution" && selectedScenario) {
    return (
      <div className="game-mode">
        <div className="execution-container">
          <div className="execution-header">
            <h1 className="execution-title">Mission Execution</h1>
            <p className="execution-subtitle">Deflection mission in progress</p>
            <div className="countdown-display">
              <span className="countdown-label">Calculating Results:</span>
              <span className="countdown-value">{countdown}s</span>
            </div>
          </div>

          <div className="execution-visualization">
            <OrbitVisualization neo={selectedScenario.neo} onContinue={() => {}} />
          </div>

          <div className="execution-status">
            <div className="status-item">
              <span className="status-label">Strategy</span>
              <span className="status-value">{STRATEGIES[selectedStrategy].name}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Δv Applied</span>
              <span className="status-value">{deltaV} km/s</span>
            </div>
            <div className="status-item">
              <span className="status-label">Deflection</span>
              <span className="status-value">{deflectionAngle}°</span>
            </div>
            <div className="status-item">
              <span className="status-label">Status</span>
              <span className="status-value">Analyzing...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Debrief Phase
  if (gamePhase === "debrief" && missionResult) {
    return (
      <div className="game-mode">
        <div className="debrief-container">
          <div className="debrief-header">
            <div className={`mission-result-badge ${missionResult.avoidsImpact ? "success" : "partial"}`}>
              {missionResult.avoidsImpact ? "Mission Success" : "Partial Success"}
            </div>
            <h1 className="debrief-title">Mission Debrief</h1>
            <p className="debrief-subtitle">
              {missionResult.avoidsImpact
                ? "Impact successfully avoided! Earth is safe thanks to your decisive action."
                : "Impact energy reduced but not fully prevented. Your efforts saved countless lives."}
            </p>
          </div>

          <div className="debrief-content">
            <div className="score-display">
              <h2 className="score-title">Final Score</h2>
              <div className="score-value-large">{missionResult.score.toLocaleString()}</div>
              <div className="score-breakdown">
                <div className="score-item">
                  <span className="score-label">Base Score</span>
                  <span className="score-points">+{missionResult.breakdown.base.toLocaleString()}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Lives Saved</span>
                  <span className="score-points">+{missionResult.breakdown.livesSaved.toLocaleString()}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Budget Bonus</span>
                  <span className="score-points">+{missionResult.breakdown.budgetBonus.toLocaleString()}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Time Bonus</span>
                  <span className="score-points">+{missionResult.breakdown.timeBonus.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="results-comparison">
              <h2 className="section-title">Impact Comparison</h2>
              <div className="comparison-grid">
                <div className="comparison-column">
                  <h3 className="comparison-header">Original Threat</h3>
                  <div className="comparison-stats">
                    <div className="comparison-stat">
                      <span className="stat-label">Energy</span>
                      <span className="stat-value">
                        {missionResult.original.energy.kineticEnergyMegatons.toFixed(2)} MT
                      </span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Crater</span>
                      <span className="stat-value">
                        {(missionResult.original.crater.diameter / 1000).toFixed(2)} km
                      </span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Magnitude</span>
                      <span className="stat-value">{missionResult.original.seismic.magnitude.toFixed(1)}</span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Casualties</span>
                      <span className="stat-value">
                        {missionResult.original.damage.estimatedCasualties.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="comparison-column">
                  <h3 className="comparison-header">After Mitigation</h3>
                  <div className="comparison-stats">
                    <div className="comparison-stat">
                      <span className="stat-label">Energy</span>
                      <span className="stat-value">
                        {missionResult.mitigated.energy.kineticEnergyMegatons.toFixed(2)} MT
                      </span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Crater</span>
                      <span className="stat-value">
                        {missionResult.avoidsImpact
                          ? "None"
                          : `${(missionResult.mitigated.crater.diameter / 1000).toFixed(2)} km`}
                      </span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Magnitude</span>
                      <span className="stat-value">
                        {missionResult.avoidsImpact ? "None" : missionResult.mitigated.seismic.magnitude.toFixed(1)}
                      </span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Casualties</span>
                      <span className="stat-value">
                        {missionResult.avoidsImpact
                          ? "0"
                          : missionResult.mitigated.damage.estimatedCasualties.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reduction-stats">
                <div className="reduction-item">
                  <span className="reduction-label">Energy Reduction</span>
                  <span className="reduction-value success">{missionResult.energyReductionPercent.toFixed(1)}%</span>
                </div>
                <div className="reduction-item">
                  <span className="reduction-label">Lives Saved</span>
                  <span className="reduction-value success">{missionResult.livesSaved.toLocaleString()}</span>
                </div>
                <div className="reduction-item">
                  <span className="reduction-label">Budget Spent</span>
                  <span className="reduction-value">{formatCurrency(missionResult.budgetSpent)}</span>
                </div>
                <div className="reduction-item">
                  <span className="reduction-label">Time Elapsed</span>
                  <span className="reduction-value">{missionResult.timeElapsed}s</span>
                </div>
              </div>
            </div>

            <div className="mission-details">
              <h2 className="section-title">Mission Details</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Asteroid</span>
                  <span className="detail-value">{selectedScenario.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Strategy</span>
                  <span className="detail-value">{STRATEGIES[selectedStrategy].name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Velocity Change</span>
                  <span className="detail-value">{deltaV} km/s</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Deflection Angle</span>
                  <span className="detail-value">{deflectionAngle}°</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Launch Timing</span>
                  <span className="detail-value">{launchTime} days before impact</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mission Cost</span>
                  <span className="detail-value">{formatCurrency(STRATEGIES[selectedStrategy].cost)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="debrief-actions">
            <button className="retry-btn" onClick={retryScenario}>
              🔄 Retry Scenario
            </button>
            <button className="new-mission-btn" onClick={backToScenarios}>
              🌍 New Mission
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default GameMode
