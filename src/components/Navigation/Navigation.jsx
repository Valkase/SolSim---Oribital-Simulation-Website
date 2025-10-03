import { Link, useLocation } from "react-router-dom"
import "./Navigation.css"

function Navigation() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="nav-icon">🌍</span>
          <h1 className="nav-title">Sol Sim</h1>
        </div>

        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/simulation" className={`nav-link ${isActive("/simulation") ? "active" : ""}`}>
              Orbit Simulator
            </Link>
          </li>
          <li>
            <Link to="/mitigation" className={`nav-link ${isActive("/mitigation") ? "active" : ""}`}>
              Mitigation Lab
            </Link>
          </li>
          <li>
            <Link to="/game" className={`nav-link ${isActive("/game") ? "active" : ""}`}>
              Defend Earth
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
