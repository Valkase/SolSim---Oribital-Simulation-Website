"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import OrbitCalculator from "../../Simulation/OrbitCalculator"
import "./OrbitVisualization.css"

function OrbitVisualization({ neo, onContinue }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const rendererRef = useRef(null)
  const asteroidRef = useRef(null)
  const earthRef = useRef(null)
  const sunRef = useRef(null)
  const orbitLinesRef = useRef({ helio: null, geo: null })
  const particleTrailRef = useRef(null)
  const labelsRef = useRef([])

  const [orbitData, setOrbitData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [cameraMode, setCameraMode] = useState("heliocentric") // heliocentric, geocentric, asteroid, free
  const [isPlaying, setIsPlaying] = useState(true)
  const [timeSpeed, setTimeSpeed] = useState(1)
  const [showOrbits, setShowOrbits] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showTrails, setShowTrails] = useState(true)
  const [cameraPreset, setCameraPreset] = useState(null)
  const [measurementMode, setMeasurementMode] = useState(false)
  const [measurementPoints, setMeasurementPoints] = useState([])
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    if (!neo) return

    setLoading(true)
    try {
      const startTime = Date.now()
      const durationDays = 365

      const heliocentricOrbit = OrbitCalculator.calculateOrbitPath(neo, startTime, durationDays, "heliocentric")
      const geocentricOrbit = OrbitCalculator.calculateOrbitPath(neo, startTime, durationDays, "geocentric")
      const closeApproach = OrbitCalculator.findClosestApproach(heliocentricOrbit)

      setOrbitData({
        heliocentric: heliocentricOrbit,
        geocentric: geocentricOrbit,
        closeApproach: closeApproach,
      })
    } catch (error) {
      console.error("Error calculating orbit:", error)
    } finally {
      setLoading(false)
    }
  }, [neo])

  useEffect(() => {
    if (!containerRef.current || !orbitData) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Create starfield background
    const starGeometry = new THREE.BufferGeometry()
    const starVertices = []
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 4000
      const y = (Math.random() - 0.5) * 4000
      const z = (Math.random() - 0.5) * 4000
      starVertices.push(x, y, z)
    }
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3))
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000,
    )
    camera.position.set(0, 100, 250)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 10
    controls.maxDistance = 1000
    controlsRef.current = controls

    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)

    const sunLight = new THREE.PointLight(0xffffff, 2, 0)
    sunLight.position.set(0, 0, 0)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    scene.add(sunLight)

    const sunGeometry = new THREE.SphereGeometry(5, 64, 64)
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfdb813 })
    const sun = new THREE.Mesh(sunGeometry, sunMaterial)
    sun.userData.label = "Sun"
    scene.add(sun)
    sunRef.current = sun

    // Add sun glow
    const glowGeometry = new THREE.SphereGeometry(7, 64, 64)
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0xfdb813) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial)
    sun.add(sunGlow)

    const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      shininess: 25,
      specular: 0x333333,
    })
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    earth.position.set(150, 0, 0)
    earth.castShadow = true
    earth.receiveShadow = true
    earth.userData.label = "Earth"
    scene.add(earth)
    earthRef.current = earth

    // Add Earth atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(2.3, 64, 64)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x3399ff) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })
    const earthAtmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    earth.add(earthAtmosphere)

    if (orbitData.heliocentric && orbitData.heliocentric.length > 0) {
      const helioPoints = orbitData.heliocentric.map(
        (point) => new THREE.Vector3(point.x / 1e6, point.y / 1e6, point.z / 1e6),
      )
      const helioGeometry = new THREE.BufferGeometry().setFromPoints(helioPoints)
      const helioMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
        linewidth: 2,
      })
      const helioLine = new THREE.Line(helioGeometry, helioMaterial)
      scene.add(helioLine)
      orbitLinesRef.current.helio = helioLine
    }

    if (orbitData.geocentric && orbitData.geocentric.length > 0) {
      const geoPoints = orbitData.geocentric.map(
        (point) =>
          new THREE.Vector3(
            earth.position.x + point.x / 1e5,
            earth.position.y + point.y / 1e5,
            earth.position.z + point.z / 1e5,
          ),
      )
      const geoGeometry = new THREE.BufferGeometry().setFromPoints(geoPoints)
      const geoMaterial = new THREE.LineBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.6,
        linewidth: 2,
      })
      const geoLine = new THREE.Line(geoGeometry, geoMaterial)
      scene.add(geoLine)
      orbitLinesRef.current.geo = geoLine
    }

    const asteroidGeometry = new THREE.SphereGeometry(0.8, 32, 32)
    const asteroidMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.9,
      metalness: 0.1,
      emissive: 0x332211,
      emissiveIntensity: 0.2,
    })
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
    asteroid.castShadow = true
    asteroid.receiveShadow = true
    asteroid.userData.label = neo.name

    if (orbitData.heliocentric && orbitData.heliocentric.length > 0) {
      const asteroidPos = orbitData.heliocentric[0]
      asteroid.position.set(asteroidPos.x / 1e6, asteroidPos.y / 1e6, asteroidPos.z / 1e6)
    }
    scene.add(asteroid)
    asteroidRef.current = asteroid

    const trailGeometry = new THREE.BufferGeometry()
    const trailPositionsArray = new Float32Array(300 * 3) // 100 trail points
    trailGeometry.setAttribute("position", new THREE.BufferAttribute(trailPositionsArray, 3))
    const trailMaterial = new THREE.PointsMaterial({
      color: 0xff9900,
      size: 1.5,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })
    const trail = new THREE.Points(trailGeometry, trailMaterial)
    scene.add(trail)
    particleTrailRef.current = { mesh: trail, positions: [] }

    const createLabel = (text, position) => {
      const div = document.createElement("div")
      div.className = "orbit-label"
      div.textContent = text
      div.style.position = "absolute"
      div.style.color = "#00ffff"
      div.style.fontSize = "12px"
      div.style.fontWeight = "bold"
      div.style.padding = "4px 8px"
      div.style.background = "rgba(0, 0, 0, 0.7)"
      div.style.borderRadius = "4px"
      div.style.border = "1px solid #00ffff"
      div.style.pointerEvents = "none"
      div.style.userSelect = "none"
      containerRef.current.appendChild(div)
      return { element: div, position: position }
    }

    labelsRef.current = [
      createLabel("Sun", sun.position),
      createLabel("Earth", earth.position),
      createLabel(neo.name, asteroid.position),
    ]

    let animationId
    let progress = 0
    const trailPositions = []

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (isPlaying && orbitData.heliocentric && orbitData.heliocentric.length > 0) {
        progress += 0.001 * timeSpeed
        if (progress >= 1) progress = 0

        const index = Math.floor(progress * orbitData.heliocentric.length)
        const asteroidPos = orbitData.heliocentric[index]

        if (asteroidRef.current) {
          asteroidRef.current.position.set(asteroidPos.x / 1e6, asteroidPos.y / 1e6, asteroidPos.z / 1e6)

          // Update particle trail
          if (showTrails) {
            trailPositions.push(asteroidRef.current.position.clone())
            if (trailPositions.length > 100) trailPositions.shift()

            const positions = particleTrailRef.current.mesh.geometry.attributes.position.array
            for (let i = 0; i < trailPositions.length; i++) {
              positions[i * 3] = trailPositions[i].x
              positions[i * 3 + 1] = trailPositions[i].y
              positions[i * 3 + 2] = trailPositions[i].z
            }
            particleTrailRef.current.mesh.geometry.attributes.position.needsUpdate = true
          }
        }

        setAnimationProgress(progress)
      }

      // Update camera based on mode
      if (cameraMode === "heliocentric" && controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0)
      } else if (cameraMode === "geocentric" && earthRef.current && controlsRef.current) {
        controlsRef.current.target.copy(earthRef.current.position)
      } else if (cameraMode === "asteroid" && asteroidRef.current && controlsRef.current) {
        controlsRef.current.target.copy(asteroidRef.current.position)
        const offset = new THREE.Vector3(10, 10, 10)
        cameraRef.current.position.copy(asteroidRef.current.position).add(offset)
      }

      // Apply camera presets
      if (cameraPreset && cameraRef.current && controlsRef.current) {
        const target = controlsRef.current.target
        const distance = 200

        if (cameraPreset === "top") {
          cameraRef.current.position.set(target.x, target.y + distance, target.z)
        } else if (cameraPreset === "side") {
          cameraRef.current.position.set(target.x + distance, target.y, target.z)
        } else if (cameraPreset === "front") {
          cameraRef.current.position.set(target.x, target.y, target.z + distance)
        }
        setCameraPreset(null)
      }

      // Update labels
      if (showLabels && labelsRef.current.length > 0) {
        labelsRef.current.forEach((label, index) => {
          let worldPos
          if (index === 0) worldPos = sunRef.current.position
          else if (index === 1) worldPos = earthRef.current.position
          else if (index === 2) worldPos = asteroidRef.current.position

          if (worldPos) {
            const screenPos = worldPos.clone().project(cameraRef.current)
            const x = (screenPos.x * 0.5 + 0.5) * containerRef.current.clientWidth
            const y = (screenPos.y * -0.5 + 0.5) * containerRef.current.clientHeight

            label.element.style.left = `${x}px`
            label.element.style.top = `${y}px`
            label.element.style.display = screenPos.z < 1 ? "block" : "none"
          }
        })
      }

      // Toggle orbit visibility
      if (orbitLinesRef.current.helio) {
        orbitLinesRef.current.helio.visible = showOrbits
      }
      if (orbitLinesRef.current.geo) {
        orbitLinesRef.current.geo.visible = showOrbits
      }

      // Toggle trail visibility
      if (particleTrailRef.current) {
        particleTrailRef.current.mesh.visible = showTrails
      }

      // Toggle label visibility
      labelsRef.current.forEach((label) => {
        label.element.style.display = showLabels && label.element.style.display !== "none" ? "block" : "none"
      })

      controlsRef.current.update()
      rendererRef.current.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      labelsRef.current.forEach((label) => {
        if (label.element.parentNode) {
          label.element.parentNode.removeChild(label.element)
        }
      })
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [orbitData, isPlaying, timeSpeed, showOrbits, showLabels, showTrails, cameraMode, cameraPreset])

  const calculateDistance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2) + Math.pow(point2.z - point1.z, 2),
    )
  }

  if (loading) {
    return (
      <div className="orbit-loading">
        <div className="spinner"></div>
        <p>Calculating orbital trajectory...</p>
      </div>
    )
  }

  return (
    <div className="orbit-visualization">
      <div className="orbit-header">
        <h2 className="orbit-title">Orbital Trajectory: {neo.name}</h2>
        <p className="orbit-subtitle">Interactive 3D visualization with multiple viewing modes</p>
      </div>

      <div className="orbit-controls-panel">
        <div className="control-section">
          <h3 className="control-title">Camera Mode</h3>
          <div className="control-buttons">
            <button
              className={`control-btn ${cameraMode === "heliocentric" ? "active" : ""}`}
              onClick={() => setCameraMode("heliocentric")}
            >
              Sun-Centered
            </button>
            <button
              className={`control-btn ${cameraMode === "geocentric" ? "active" : ""}`}
              onClick={() => setCameraMode("geocentric")}
            >
              Earth-Centered
            </button>
            <button
              className={`control-btn ${cameraMode === "asteroid" ? "active" : ""}`}
              onClick={() => setCameraMode("asteroid")}
            >
              Follow Asteroid
            </button>
            <button
              className={`control-btn ${cameraMode === "free" ? "active" : ""}`}
              onClick={() => setCameraMode("free")}
            >
              Free Camera
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3 className="control-title">Time Controls</h3>
          <div className="control-buttons">
            <button className="control-btn" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button className="control-btn" onClick={() => setTimeSpeed(Math.max(0.1, timeSpeed - 0.5))}>
              ◀◀ Slower
            </button>
            <span className="speed-display">{timeSpeed}x</span>
            <button className="control-btn" onClick={() => setTimeSpeed(Math.min(5, timeSpeed + 0.5))}>
              ▶▶ Faster
            </button>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${animationProgress * 100}%` }}></div>
          </div>
        </div>

        <div className="control-section">
          <h3 className="control-title">View Options</h3>
          <div className="control-toggles">
            <label className="toggle-label">
              <input type="checkbox" checked={showOrbits} onChange={(e) => setShowOrbits(e.target.checked)} />
              <span>Show Orbit Paths</span>
            </label>
            <label className="toggle-label">
              <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
              <span>Show Labels</span>
            </label>
            <label className="toggle-label">
              <input type="checkbox" checked={showTrails} onChange={(e) => setShowTrails(e.target.checked)} />
              <span>Show Particle Trail</span>
            </label>
          </div>
        </div>

        <div className="control-section">
          <h3 className="control-title">Camera Presets</h3>
          <div className="control-buttons">
            <button className="control-btn" onClick={() => setCameraPreset("top")}>
              Top View
            </button>
            <button className="control-btn" onClick={() => setCameraPreset("side")}>
              Side View
            </button>
            <button className="control-btn" onClick={() => setCameraPreset("front")}>
              Front View
            </button>
          </div>
        </div>

        {measurementMode && measurementPoints.length === 2 && (
          <div className="measurement-display">
            <h3 className="control-title">Distance Measurement</h3>
            <p className="measurement-value">
              {(calculateDistance(measurementPoints[0], measurementPoints[1]) * 1e6).toFixed(0)} km
            </p>
          </div>
        )}
      </div>

      <div className="orbit-canvas-container" ref={containerRef}></div>

      <div className="orbit-info">
        <div className="info-grid">
          <div className="info-card">
            <div className="info-label">Orbital Period</div>
            <div className="info-value">
              {neo.orbitalData?.orbitalPeriod ? `${neo.orbitalData.orbitalPeriod.toFixed(2)} days` : "N/A"}
            </div>
          </div>

          <div className="info-card">
            <div className="info-label">Eccentricity</div>
            <div className="info-value">
              {neo.orbitalData?.eccentricity ? neo.orbitalData.eccentricity.toFixed(4) : "N/A"}
            </div>
          </div>

          <div className="info-card">
            <div className="info-label">Semi-Major Axis</div>
            <div className="info-value">
              {neo.orbitalData?.semiMajorAxis ? `${neo.orbitalData.semiMajorAxis.toFixed(4)} AU` : "N/A"}
            </div>
          </div>

          <div className="info-card">
            <div className="info-label">Inclination</div>
            <div className="info-value">
              {neo.orbitalData?.inclination ? `${neo.orbitalData.inclination.toFixed(2)}°` : "N/A"}
            </div>
          </div>
        </div>

        {orbitData?.closeApproach && (
          <div className="close-approach-info">
            <h3 className="approach-title">Close Approach Data</h3>
            <div className="approach-details">
              <div className="approach-item">
                <span className="approach-label">Date:</span>
                <span className="approach-value">{new Date(orbitData.closeApproach.time).toLocaleDateString()}</span>
              </div>
              <div className="approach-item">
                <span className="approach-label">Distance:</span>
                <span className="approach-value">
                  {(orbitData.closeApproach.distance / 1000).toFixed(0)} thousand km
                </span>
              </div>
              <div className="approach-item">
                <span className="approach-label">Velocity:</span>
                <span className="approach-value">{orbitData.closeApproach.velocity.toFixed(2)} km/s</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="orbit-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#ffff00" }}></div>
          <span>Sun</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#2233ff" }}></div>
          <span>Earth</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#00ffff" }}></div>
          <span>Heliocentric Orbit</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#ff6600" }}></div>
          <span>Geocentric Orbit</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: "#aaaaaa" }}></div>
          <span>Asteroid</span>
        </div>
      </div>

      <button className="continue-button" onClick={onContinue}>
        Continue to Impact Simulation →
      </button>
    </div>
  )
}

export default OrbitVisualization
