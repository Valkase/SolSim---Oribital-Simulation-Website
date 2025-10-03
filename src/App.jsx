"use client"

import { useState, useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import Navigation from "./components/Navigation/Navigation"
import HomePage from "./pages/HomePage/HomePage"
import SimulationWizard from "./pages/SimulationWizard/SimulationWizard"
import MitigationStrategies from "./pages/MitigationStrategies/MitigationStrategies"
import GameMode from "./pages/GameMode/GameMode"
import NEODataService from "./Simulation/NEODataService"
import "./App.css"

function App() {
  const [neoData, setNeoData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadNEOData()
  }, [])

  const loadNEOData = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await NEODataService.fetchRecentNEOs()
      setNeoData(data)
      console.log("Loaded NEO data:", data.length, "asteroids")
    } catch (err) {
      console.error("Error loading NEO data:", err)
      setError(err.message)

      // Try to load from cache
      const cachedData = NEODataService.getCachedData()
      if (cachedData && cachedData.length > 0) {
        setNeoData(cachedData)
        setError("Using cached data - API unavailable")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/simulation"
            element={<SimulationWizard neoData={neoData} loading={loading} error={error} onRetry={loadNEOData} />}
          />
          <Route
            path="/mitigation"
            element={<MitigationStrategies neoData={neoData} loading={loading} error={error} />}
          />
          <Route path="/game" element={<GameMode />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
