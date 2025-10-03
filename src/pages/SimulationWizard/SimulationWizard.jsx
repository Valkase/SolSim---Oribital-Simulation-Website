"use client"

import { useState } from "react"
import NEOSelector from "../../components/NEOSelector/NEOSelector"
import OrbitVisualization from "../../components/OrbitVisualization/OrbitVisualization"
import ImpactSimulator from "../../components/ImpactSimulator/ImpactSimulator"
import ImpactResults from "../../components/ImpactResults/ImpactResults"
import MitigationPanel from "../../components/MitigationPanel/MitigationPanel"
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner"
import "./SimulationWizard.css"

function SimulationWizard({ neoData, loading, error, onRetry }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedNEO, setSelectedNEO] = useState(null)
  const [impactScenario, setImpactScenario] = useState(null)
  const [impactResults, setImpactResults] = useState(null)
  const [mitigationResults, setMitigationResults] = useState(null)

  const steps = [
    { number: 1, title: "Select Asteroid", icon: "🔍" },
    { number: 2, title: "View Orbit", icon: "🛰️" },
    { number: 3, title: "Simulate Impact", icon: "💥" },
    { number: 4, title: "Test Mitigation", icon: "🚀" },
  ]

  const handleNEOSelect = (neo) => {
    setSelectedNEO(neo)
    setCurrentStep(2)
  }

  const handleViewOrbit = () => {
    setCurrentStep(3)
  }

  const handleImpactSimulation = (scenario, results) => {
    setImpactScenario(scenario)
    setImpactResults(results)
    setCurrentStep(4)
  }

  const handleMitigationTest = (results) => {
    setMitigationResults(results)
  }

  const handleReset = () => {
    setCurrentStep(1)
    setSelectedNEO(null)
    setImpactScenario(null)
    setImpactResults(null)
    setMitigationResults(null)
  }

  if (loading) {
    return (
      <div className="wizard-loading">
        <LoadingSpinner />
        <p>Loading NEO data from NASA...</p>
      </div>
    )
  }

  if (error && neoData.length === 0) {
    return (
      <div className="wizard-error">
        <div className="error-icon">⚠️</div>
        <h2>Unable to Load Data</h2>
        <p>{error}</p>
        <button className="retry-button" onClick={onRetry}>
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="simulation-wizard">
      {error && (
        <div className="warning-banner">
          <span className="warning-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="wizard-header">
        <h1 className="wizard-title">Orbit & Impact Simulator</h1>
        <p className="wizard-subtitle">
          Follow the guided workflow to analyze asteroid trajectories and potential impacts
        </p>
      </div>

      <div className="wizard-steps">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`step ${currentStep === step.number ? "active" : ""} ${
              currentStep > step.number ? "completed" : ""
            }`}
          >
            <div className="step-number">{currentStep > step.number ? "✓" : step.icon}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>

      <div className="wizard-content">
        {currentStep === 1 && <NEOSelector neoData={neoData} onSelect={handleNEOSelect} />}

        {currentStep === 2 && selectedNEO && <OrbitVisualization neo={selectedNEO} onContinue={handleViewOrbit} />}

        {currentStep === 3 && selectedNEO && <ImpactSimulator neo={selectedNEO} onSimulate={handleImpactSimulation} />}

        {currentStep === 4 && selectedNEO && impactResults && (
          <div className="results-mitigation-container">
            <ImpactResults results={impactResults} neo={selectedNEO} />
            <MitigationPanel neo={selectedNEO} impactScenario={impactScenario} onMitigate={handleMitigationTest} />
          </div>
        )}
      </div>

      {currentStep > 1 && (
        <div className="wizard-actions">
          <button className="wizard-button secondary" onClick={handleReset}>
            Start Over
          </button>
          {currentStep > 2 && currentStep < 4 && (
            <button className="wizard-button secondary" onClick={() => setCurrentStep(currentStep - 1)}>
              Previous Step
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default SimulationWizard
