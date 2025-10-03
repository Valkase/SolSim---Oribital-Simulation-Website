"use client"

import { useState, useMemo } from "react"
import "./NEOSelector.css"

function NEOSelector({ neoData, onSelect, compact = false }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterHazardous, setFilterHazardous] = useState(false)
  const [sortBy, setSortBy] = useState("name")

  const filteredAndSortedNEOs = useMemo(() => {
    const filtered = neoData.filter((neo) => {
      const matchesSearch = neo.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesHazardous = !filterHazardous || neo.isPotentiallyHazardous
      return matchesSearch && matchesHazardous
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "size":
          return b.estimatedDiameter - a.estimatedDiameter
        case "velocity":
          const aVel = a.closeApproaches?.[0]?.relativeVelocity || 0
          const bVel = b.closeApproaches?.[0]?.relativeVelocity || 0
          return bVel - aVel
        case "distance":
          const aDist = a.closeApproaches?.[0]?.missDistance || Number.POSITIVE_INFINITY
          const bDist = b.closeApproaches?.[0]?.missDistance || Number.POSITIVE_INFINITY
          return aDist - bDist
        default:
          return 0
      }
    })

    return filtered
  }, [neoData, searchTerm, filterHazardous, sortBy])

  const getDangerLevel = (neo) => {
    if (!neo.isPotentiallyHazardous) return "safe"

    const sizeKm = neo.estimatedDiameter / 1000
    const distance = neo.closeApproaches?.[0]?.missDistance || Number.POSITIVE_INFINITY

    if (sizeKm > 1 && distance < 7500000) return "critical"
    if (sizeKm > 0.5 || distance < 10000000) return "high"
    return "moderate"
  }

  const getDangerColor = (level) => {
    switch (level) {
      case "critical":
        return "#ff0000"
      case "high":
        return "#ff6b00"
      case "moderate":
        return "#ffa500"
      case "safe":
        return "#00ff00"
      default:
        return "#a0aec0"
    }
  }

  return (
    <div className={`neo-selector ${compact ? "compact" : ""}`}>
      {!compact && (
        <div className="selector-header">
          <h2 className="selector-title">Select an Asteroid</h2>
          <p className="selector-subtitle">Choose from {neoData.length} near-Earth objects tracked by NASA</p>
        </div>
      )}

      <div className="selector-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="filter-controls">
          <label className="checkbox-label">
            <input type="checkbox" checked={filterHazardous} onChange={(e) => setFilterHazardous(e.target.checked)} />
            <span>Potentially Hazardous Only</span>
          </label>

          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="velocity">Sort by Velocity</option>
            <option value="distance">Sort by Distance</option>
          </select>
        </div>
      </div>

      <div className="neo-list">
        {filteredAndSortedNEOs.length === 0 ? (
          <div className="no-results">
            <p>No asteroids match your search criteria</p>
          </div>
        ) : (
          filteredAndSortedNEOs.map((neo) => {
            const dangerLevel = getDangerLevel(neo)
            const sizeKm = neo.estimatedDiameter / 1000
            const velocity = neo.closeApproaches?.[0]?.relativeVelocity
            const distance = neo.closeApproaches?.[0]?.missDistance

            return (
              <div key={neo.id} className="neo-card" onClick={() => onSelect(neo)}>
                <div className="neo-card-header">
                  <h3 className="neo-name">{neo.name}</h3>
                  <span className="danger-badge" style={{ background: getDangerColor(dangerLevel) }}>
                    {dangerLevel.toUpperCase()}
                  </span>
                </div>

                <div className="neo-stats">
                  <div className="stat">
                    <span className="stat-label">Diameter:</span>
                    <span className="stat-value">{sizeKm.toFixed(3)} km</span>
                  </div>
                  {velocity && (
                    <div className="stat">
                      <span className="stat-label">Velocity:</span>
                      <span className="stat-value">{velocity.toFixed(2)} km/s</span>
                    </div>
                  )}
                  {distance && (
                    <div className="stat">
                      <span className="stat-label">Miss Distance:</span>
                      <span className="stat-value">{(distance / 384400).toFixed(2)} LD</span>
                    </div>
                  )}
                </div>

                {neo.isPotentiallyHazardous && <div className="hazard-warning">⚠️ Potentially Hazardous Asteroid</div>}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default NEOSelector
