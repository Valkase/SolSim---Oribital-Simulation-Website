import { Link } from "react-router-dom"
import "./HomePage.css"

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">Near-Earth Object Tracking & Impact Simulation</h1>
        <p className="hero-subtitle">
          Explore real asteroid data from NASA, visualize orbital trajectories, and simulate potential impact scenarios
          to understand planetary defense.
        </p>

        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-value">30,000+</div>
            <div className="stat-label">Known NEOs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">~2,300</div>
            <div className="stat-label">Potentially Hazardous</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">24/7</div>
            <div className="stat-label">NASA Monitoring</div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Explore Features</h2>

        <div className="features-grid">
          <Link to="/simulation" className="feature-card">
            <div className="feature-icon">🛰️</div>
            <h3 className="feature-title">Orbit Simulator</h3>
            <p className="feature-description">
              Select asteroids, visualize 3D orbital paths, and simulate close approaches to Earth.
            </p>
            <span className="feature-cta">Launch Simulator →</span>
          </Link>

          <Link to="/mitigation" className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3 className="feature-title">Mitigation Lab</h3>
            <p className="feature-description">
              Test planetary defense strategies including kinetic impactors and nuclear deflection.
            </p>
            <span className="feature-cta">Enter Lab →</span>
          </Link>

          <Link to="/game" className="feature-card feature-card-disabled">
            <div className="feature-icon">🎮</div>
            <h3 className="feature-title">Defend Earth</h3>
            <p className="feature-description">
              Challenge mode coming soon. Race against time to protect Earth from incoming threats.
            </p>
            <span className="feature-cta">Coming Soon</span>
          </Link>
        </div>
      </div>

      <div className="info-section">
        <h2 className="section-title">What are Near-Earth Objects?</h2>
        <div className="info-content">
          <p>
            Near-Earth Objects (NEOs) are asteroids and comets with orbits that bring them within 1.3 astronomical units
            (AU) of the Sun, potentially crossing Earth orbit. NASA Center for Near-Earth Object Studies (CNEOS) tracks
            these objects to assess potential impact risks.
          </p>
          <p>
            This application uses real data from NASA API to provide accurate orbital calculations and impact
            simulations based on established scientific models.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
