// OrbitCalculator.js
// Orbital mechanics calculations for NEO trajectory simulation

import { CONSTANTS, VIZ_CONFIG } from './constants.js';

/**
 * OrbitCalculator
 * Computes orbital trajectories using Keplerian orbital mechanics
 */
class OrbitCalculator {
  constructor() {
    this.orbitCache = new Map(); // Cache calculated orbits
  }

  /**
   * Calculate complete orbit path for an asteroid
   * @param {NEOData} neoData - NEO object with orbital elements
   * @param {number} startTimeMs - Start time (Unix timestamp ms)
   * @param {number} durationDays - Duration to calculate (days)
   * @param {string} referenceFrame - 'heliocentric' or 'geocentric'
   * @returns {OrbitPoint[]} Array of orbital positions
   */
  calculateOrbitPath(neoData, startTimeMs, durationDays, referenceFrame = 'heliocentric') {
    const cacheKey = `${neoData.id}_${startTimeMs}_${durationDays}_${referenceFrame}`;
    
    // Return cached orbit if available
    if (this.orbitCache.has(cacheKey)) {
      return this.orbitCache.get(cacheKey);
    }

    const orbitalElements = neoData.orbitalData;
    const orbitPoints = [];
    
    // Determine time step based on view mode
    const timeStepDays = referenceFrame === 'geocentric' 
      ? CONSTANTS.CLOSE_APPROACH_TIME_STEP_HOURS / 24 
      : CONSTANTS.ORBIT_TIME_STEP_DAYS;
    
    const numSteps = Math.ceil(durationDays / timeStepDays);

    // Calculate positions at each time step
    for (let i = 0; i <= numSteps; i++) {
      const currentTimeDays = i * timeStepDays;
      const currentTimeMs = startTimeMs + (currentTimeDays * CONSTANTS.SECONDS_PER_DAY * 1000);
      
      // Calculate mean anomaly at current time
      const M = this.calculateMeanAnomalyAtTime(
        orbitalElements.meanAnomaly,
        orbitalElements.orbitalPeriod,
        currentTimeDays
      );
      
      // Solve Kepler's equation to get eccentric anomaly
      const E = this.solveKeplersEquation(M, orbitalElements.eccentricity);
      
      // Calculate true anomaly
      const nu = this.eccentricToTrueAnomaly(E, orbitalElements.eccentricity);
      
      // Calculate position in orbital plane
      const r = this.calculateOrbitalRadius(
        orbitalElements.semiMajorAxis,
        orbitalElements.eccentricity,
        nu
      );
      
      // Transform to 3D coordinates
      let position = this.orbitalToCartesian(
        r,
        nu,
        orbitalElements.inclination,
        orbitalElements.longitudeAscendingNode,
        orbitalElements.argumentPerihelion
      );
      
      // Calculate velocity
      const velocity = this.calculateVelocity(
        orbitalElements.semiMajorAxis,
        r,
        CONSTANTS.GM_SUN
      );
      
      // If geocentric, transform to Earth-centered coordinates
      if (referenceFrame === 'geocentric') {
        const earthPos = this.calculateEarthPosition(currentTimeMs);
        position = {
          x: (position.x - earthPos.x) * CONSTANTS.AU_TO_KM,
          y: (position.y - earthPos.y) * CONSTANTS.AU_TO_KM,
          z: (position.z - earthPos.z) * CONSTANTS.AU_TO_KM,
        };
      } else {
        // Convert AU to km for heliocentric
        position = {
          x: position.x * CONSTANTS.AU_TO_KM,
          y: position.y * CONSTANTS.AU_TO_KM,
          z: position.z * CONSTANTS.AU_TO_KM,
        };
      }
      
      // Calculate distance from Earth
      const earthPos = referenceFrame === 'heliocentric' 
        ? this.calculateEarthPosition(currentTimeMs)
        : { x: 0, y: 0, z: 0 };
      
      const distanceFromEarth = referenceFrame === 'heliocentric'
        ? Math.sqrt(
            Math.pow((position.x / CONSTANTS.AU_TO_KM) - earthPos.x, 2) +
            Math.pow((position.y / CONSTANTS.AU_TO_KM) - earthPos.y, 2) +
            Math.pow((position.z / CONSTANTS.AU_TO_KM) - earthPos.z, 2)
          ) * CONSTANTS.AU_TO_KM
        : Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
      
      orbitPoints.push({
        x: position.x,
        y: position.y,
        z: position.z,
        time: currentTimeMs,
        velocity,
        distanceFromEarth,
      });
    }
    
    // Cache the result
    this.orbitCache.set(cacheKey, orbitPoints);
    
    return orbitPoints;
  }

  /**
   * Calculate mean anomaly at a given time
   * @private
   * @param {number} M0 - Initial mean anomaly (degrees)
   * @param {number} period - Orbital period (days)
   * @param {number} timeDays - Time elapsed (days)
   * @returns {number} Mean anomaly (radians)
   */
  calculateMeanAnomalyAtTime(M0, period, timeDays) {
    const M0_rad = M0 * Math.PI / 180;
    const n = (2 * Math.PI) / period; // Mean motion (rad/day)
    const M = M0_rad + n * timeDays;
    return M % (2 * Math.PI); // Normalize to 0-2π
  }

  /**
   * Solve Kepler's equation: M = E - e*sin(E)
   * Uses Newton-Raphson iteration
   * @private
   * @param {number} M - Mean anomaly (radians)
   * @param {number} e - Eccentricity
   * @returns {number} Eccentric anomaly (radians)
   */
  solveKeplersEquation(M, e) {
    // Initial guess
    let E = M + e * Math.sin(M);
    
    // Newton-Raphson iteration
    for (let i = 0; i < CONSTANTS.MAX_ITERATIONS; i++) {
      const f = E - e * Math.sin(E) - M;
      const fPrime = 1 - e * Math.cos(E);
      const E_new = E - f / fPrime;
      
      if (Math.abs(E_new - E) < CONSTANTS.CONVERGENCE_THRESHOLD) {
        return E_new;
      }
      
      E = E_new;
    }
    
    console.warn('Kepler equation did not converge');
    return E;
  }

  /**
   * Convert eccentric anomaly to true anomaly
   * @private
   * @param {number} E - Eccentric anomaly (radians)
   * @param {number} e - Eccentricity
   * @returns {number} True anomaly (radians)
   */
  eccentricToTrueAnomaly(E, e) {
    const nu = 2 * Math.atan2(
      Math.sqrt(1 + e) * Math.sin(E / 2),
      Math.sqrt(1 - e) * Math.cos(E / 2)
    );
    return nu;
  }

  /**
   * Calculate orbital radius from semi-major axis and true anomaly
   * @private
   * @param {number} a - Semi-major axis (AU)
   * @param {number} e - Eccentricity
   * @param {number} nu - True anomaly (radians)
   * @returns {number} Orbital radius (AU)
   */
  calculateOrbitalRadius(a, e, nu) {
    return a * (1 - e * e) / (1 + e * Math.cos(nu));
  }

  /**
   * Transform orbital coordinates to 3D cartesian
   * @private
   * @param {number} r - Orbital radius (AU)
   * @param {number} nu - True anomaly (radians)
   * @param {number} i - Inclination (degrees)
   * @param {number} Omega - Longitude of ascending node (degrees)
   * @param {number} omega - Argument of perihelion (degrees)
   * @returns {Vector3D} Position in AU
   */
  orbitalToCartesian(r, nu, i, Omega, omega) {
    // Convert angles to radians
    const i_rad = i * Math.PI / 180;
    const Omega_rad = Omega * Math.PI / 180;
    const omega_rad = omega * Math.PI / 180;
    
    // Position in orbital plane
    const x_orb = r * Math.cos(nu);
    const y_orb = r * Math.sin(nu);
    
    // Rotation matrices (standard orbital element transformation)
    const cos_omega = Math.cos(omega_rad);
    const sin_omega = Math.sin(omega_rad);
    const cos_i = Math.cos(i_rad);
    const sin_i = Math.sin(i_rad);
    const cos_Omega = Math.cos(Omega_rad);
    const sin_Omega = Math.sin(Omega_rad);
    
    // Transform to heliocentric ecliptic coordinates
    const x = (cos_Omega * cos_omega - sin_Omega * sin_omega * cos_i) * x_orb +
              (-cos_Omega * sin_omega - sin_Omega * cos_omega * cos_i) * y_orb;
    
    const y = (sin_Omega * cos_omega + cos_Omega * sin_omega * cos_i) * x_orb +
              (-sin_Omega * sin_omega + cos_Omega * cos_omega * cos_i) * y_orb;
    
    const z = (sin_omega * sin_i) * x_orb + (cos_omega * sin_i) * y_orb;
    
    return { x, y, z };
  }

  /**
   * Calculate velocity at given orbital position
   * @private
   * @param {number} a - Semi-major axis (AU)
   * @param {number} r - Current radius (AU)
   * @param {number} GM - Gravitational parameter (km³/s²)
   * @returns {number} Velocity (km/s)
   */
  calculateVelocity(a, r, GM) {
    // Vis-viva equation: v² = GM * (2/r - 1/a)
    const a_km = a * CONSTANTS.AU_TO_KM;
    const r_km = r * CONSTANTS.AU_TO_KM;
    const v_squared = GM * (2 / r_km - 1 / a_km);
    return Math.sqrt(Math.abs(v_squared));
  }

  /**
   * Calculate Earth's position at given time (simplified circular orbit)
   * @private
   * @param {number} timeMs - Unix timestamp (ms)
   * @returns {Vector3D} Earth position in AU
   */
  calculateEarthPosition(timeMs) {
    // Julian date calculation
    const JD = 2440587.5 + (timeMs / (1000 * CONSTANTS.SECONDS_PER_DAY));
    
    // Days since J2000.0 epoch (Jan 1, 2000, 12:00 TT)
    const T = (JD - 2451545.0) / 36525; // Julian centuries
    
    // Earth's mean longitude (simplified)
    const L = 280.460 + 36000.771 * T; // degrees
    const L_rad = (L % 360) * Math.PI / 180;
    
    // Simplified circular orbit
    const a = CONSTANTS.EARTH_SEMI_MAJOR_AXIS_AU;
    const e = CONSTANTS.EARTH_ECCENTRICITY;
    
    // Approximate position (good enough for NEO calculations)
    const x = a * Math.cos(L_rad);
    const y = a * Math.sin(L_rad);
    const z = 0; // Assume ecliptic plane
    
    return { x, y, z };
  }

  /**
   * Find closest approach to Earth within orbit path
   * @param {OrbitPoint[]} orbitPoints - Calculated orbit path
   * @returns {Object} Closest approach data
   */
  findClosestApproach(orbitPoints) {
    let minDistance = Infinity;
    let closestPoint = null;
    let closestIndex = -1;
    
    for (let i = 0; i < orbitPoints.length; i++) {
      const point = orbitPoints[i];
      if (point.distanceFromEarth < minDistance) {
        minDistance = point.distanceFromEarth;
        closestPoint = point;
        closestIndex = i;
      }
    }
    
    return {
      distance: minDistance,
      time: closestPoint?.time,
      velocity: closestPoint?.velocity,
      position: closestPoint,
      index: closestIndex,
    };
  }

  /**
   * Predict impact trajectory based on close approach data
   * @param {NEOData} neoData - NEO object
   * @param {CloseApproachData} closeApproach - Close approach event
   * @returns {Object} Impact prediction
   */
  predictImpactTrajectory(neoData, closeApproach) {
    // Calculate if asteroid will actually impact Earth
    const earthRadiusKm = CONSTANTS.EARTH_RADIUS_KM;
    const missDistanceKm = closeApproach.missDistance;
    
    // Check if impact occurs
    const willImpact = missDistanceKm <= earthRadiusKm;
    
    if (!willImpact) {
      return {
        willImpact: false,
        missDistance: missDistanceKm,
        closestApproachTime: closeApproach.epochMillis,
      };
    }
    
    // Calculate impact location (simplified - assumes radial approach)
    // In reality, this requires detailed trajectory integration
    const velocity = closeApproach.relativeVelocity;
    
    // Estimate entry angle (typical range: 15-90 degrees)
    const entryAngle = 45; // Simplified assumption
    
    // Calculate impact coordinates (placeholder - would need detailed calculation)
    const impactLat = 0; // Equator
    const impactLon = 0; // Prime meridian
    
    return {
      willImpact: true,
      missDistance: 0,
      impactTime: closeApproach.epochMillis,
      impactLocation: {
        latitude: impactLat,
        longitude: impactLon,
        elevation: 0,
      },
      impactVelocity: velocity,
      entryAngle,
    };
  }

  /**
   * Calculate historical orbit (past trajectory)
   * @param {NEOData} neoData - NEO object
   * @param {number} daysBack - Days to calculate backward
   * @returns {OrbitPoint[]} Historical orbit path
   */
  calculateHistoricalOrbit(neoData, daysBack) {
    const currentTime = Date.now();
    const startTime = currentTime - (daysBack * CONSTANTS.SECONDS_PER_DAY * 1000);
    return this.calculateOrbitPath(neoData, startTime, daysBack, 'heliocentric');
  }

  /**
   * Calculate future orbit (predicted trajectory)
   * @param {NEOData} neoData - NEO object
   * @param {number} daysForward - Days to predict forward
   * @returns {OrbitPoint[]} Future orbit path
   */
  calculateFutureOrbit(neoData, daysForward) {
    const currentTime = Date.now();
    return this.calculateOrbitPath(neoData, currentTime, daysForward, 'heliocentric');
  }

  /**
   * Clear orbit cache
   */
  clearCache() {
    this.orbitCache.clear();
    console.log('Orbit cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      cachedOrbits: this.orbitCache.size,
      memoryEstimateMB: (this.orbitCache.size * 0.1).toFixed(2), // Rough estimate
    };
  }
}

// Export singleton instance
export default new OrbitCalculator();
