// types.js
// TypeScript-style JSDoc type definitions for the NEO simulation system

/**
 * @typedef {Object} Vector3D
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} z - Z coordinate
 */

/**
 * @typedef {Object} OrbitalElements
 * @property {number} semiMajorAxis - Semi-major axis (AU) KEPLER 3RD LAW T^2 is proportional to a^3  
 * @property {number} eccentricity - Orbital eccentricity (0-1)
 * @property {number} inclination - Orbital inclination (degrees)
 * @property {number} longitudeAscendingNode - Longitude of ascending node (degrees)
 * @property {number} argumentPerihelion - Argument of perihelion (degrees)
 * @property {number} meanAnomaly - Mean anomaly at epoch (degrees)
 * @property {number} orbitalPeriod - Orbital period (days)
 * @property {number} perihelionDistance - Closest approach to Sun (AU)
 * @property {number} aphelionDistance - Farthest distance from Sun (AU)
 */

/**
 * @typedef {Object} OrbitPoint
 * @property {number} x - X coordinate (km or AU)
 * @property {number} y - Y coordinate (km or AU)
 * @property {number} z - Z coordinate (km or AU)
 * @property {number} time - Timestamp (Unix time in ms)
 * @property {number} velocity - Velocity at this point (km/s)
 * @property {number} distanceFromEarth - Distance from Earth (km)
 */

/**
 * @typedef {Object} NEOData
 * @property {string} id - NASA NEO reference ID
 * @property {string} name - Asteroid name
 * @property {number} estimatedDiameter - Estimated diameter (meters)
 * @property {number} absoluteMagnitude - Absolute magnitude (H)
 * @property {boolean} isPotentiallyHazardous - PHO status
 * @property {OrbitalElements} orbitalData - Orbital parameters
 * @property {CloseApproachData[]} closeApproaches - Array of close approach events
 * @property {number} mass - Estimated mass (kg)
 * @property {string} firstObservation - First observation date
 * @property {string} lastObservation - Last observation date
 */

/**
 * @typedef {Object} CloseApproachData
 * @property {string} date - Close approach date (ISO 8601)
 * @property {number} epochMillis - Unix timestamp (ms)
 * @property {number} relativeVelocity - Velocity relative to Earth (km/s)
 * @property {number} missDistance - Miss distance from Earth (km)
 * @property {string} orbitingBody - Body being orbited (usually "Earth")
 */

/**
 * @typedef {Object} ImpactScenario
 * @property {string} asteroidId - Reference to NEO ID
 * @property {string} asteroidName - Asteroid name
 * @property {number} diameter - Asteroid diameter (meters)
 * @property {number} mass - Asteroid mass (kg)
 * @property {number} velocity - Impact velocity (km/s)
 * @property {number} angle - Impact angle (degrees from horizontal)
 * @property {ImpactLocation} location - Impact coordinates
 * @property {string} surfaceType - 'OCEAN' | 'LAND' | 'URBAN'
 */

/**
 * @typedef {Object} ImpactLocation
 * @property {number} latitude - Latitude (-90 to 90)
 * @property {number} longitude - Longitude (-180 to 180)
 * @property {number} elevation - Elevation above sea level (meters)
 * @property {string} region - Geographic region name (optional)
 */

/**
 * @typedef {Object} ImpactResults
 * @property {ImpactEnergy} energy - Energy calculations
 * @property {CraterData} crater - Crater formation data
 * @property {SeismicData} seismic - Earthquake effects
 * @property {TsunamiData|null} tsunami - Tsunami data (null if not ocean impact)
 * @property {AtmosphericEntry} atmospheric - Atmospheric entry effects
 * @property {DamageEstimate} damage - Damage zone estimates
 * @property {string[]} calculationSteps - Step-by-step explanation (optional)
 */

/**
 * @typedef {Object} ImpactEnergy
 * @property {number} kineticEnergyJoules - Total kinetic energy (joules)
 * @property {number} kineticEnergyMegatons - Energy in megatons TNT equivalent
 * @property {number} surfaceEnergyJoules - Energy reaching surface after atmospheric loss
 * @property {number} energyLossFraction - Fraction lost to atmosphere (0-1)
 */

/**
 * @typedef {Object} CraterData
 * @property {number} diameter - Crater diameter (meters)
 * @property {number} depth - Crater depth (meters)
 * @property {number} volume - Crater volume (cubic meters)
 * @property {string} type - 'simple' | 'complex' | 'basin'
 * @property {number} ejectaRadius - Radius of ejecta blanket (meters)
 */

/**
 * @typedef {Object} SeismicData
 * @property {number} magnitude - Richter/Moment magnitude
 * @property {number} energyJoules - Seismic energy (joules)
 * @property {number} feltRadius - Radius where shaking is felt (km)
 * @property {number} damageRadius - Radius of significant damage (km)
 * @property {string} description - Earthquake intensity description
 */

/**
 * @typedef {Object} TsunamiData
 * @property {number} waveHeight - Maximum wave height (meters)
 * @property {number} affectedCoastlineKm - Length of affected coastline
 * @property {number} travelSpeed - Wave propagation speed (km/h)
 * @property {number} energyJoules - Tsunami energy (joules)
 * @property {string[]} affectedRegions - List of regions at risk
 */

/**
 * @typedef {Object} AtmosphericEntry
 * @property {boolean} fragmentationOccurred - Did asteroid break up?
 * @property {number} fragmentationAltitude - Altitude of breakup (km)
 * @property {number} airburstEnergy - Energy released as airburst (megatons)
 * @property {number} survivingMassFraction - Fraction reaching ground (0-1)
 * @property {number} entryAngle - Angle of atmospheric entry (degrees)
 */

/**
 * @typedef {Object} DamageEstimate
 * @property {DamageZone[]} zones - Array of damage zones
 * @property {number} totalAffectedArea - Total area affected (sq km)
 * @property {number} estimatedCasualties - Rough casualty estimate (if urban)
 * @property {string} overallSeverity - 'local' | 'regional' | 'continental' | 'global'
 */

/**
 * @typedef {Object} DamageZone
 * @property {string} level - 'total_destruction' | 'severe' | 'moderate' | 'light'
 * @property {number} radius - Radius from impact (km)
 * @property {string} description - Human-readable description
 */

/**
 * @typedef {Object} SimulationState
 * @property {NEOData[]} asteroids - Array of loaded asteroids
 * @property {string|null} selectedAsteroidId - Currently selected asteroid
 * @property {number} currentTime - Simulation time (Unix timestamp ms)
 * @property {number} timeScale - Simulation speed multiplier
 * @property {string} viewMode - 'system' | 'detail'
 * @property {Map<string, OrbitPoint[]>} orbitCache - Cached orbit calculations
 */

/**
 * @typedef {Object} MitigationStrategy
 * @property {string} type - 'kinetic_impactor' | 'nuclear' | 'gravity_tractor' | 'laser'
 * @property {number} warningTime - Years before impact
 * @property {number} deltaV - Change in velocity (m/s)
 * @property {number} deflectionAngle - Trajectory change (degrees)
 * @property {number} successProbability - Estimated success rate (0-1)
 */

// Export empty object for module compatibility
export default {};
