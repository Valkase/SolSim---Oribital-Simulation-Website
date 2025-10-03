// constants.js
// Physical constants and configuration values for NEO simulation

/**
 * ASTRONOMICAL CONSTANTS
 * These values are used for orbital mechanics and coordinate transformations
 */
export const CONSTANTS = {
  // Distance units
  AU_TO_KM: 149597870.7, // 1 Astronomical Unit in kilometers
  KM_TO_AU: 1 / 149597870.7,
  EARTH_RADIUS_KM: 6371, // Mean Earth radius
  
  // Gravitational parameters (GM in km³/s²)
  GM_SUN: 1.32712440018e11, // Sun's gravitational parameter
  GM_EARTH: 398600.4418, // Earth's gravitational parameter
  
  // Time conversions
  SECONDS_PER_DAY: 86400,
  DAYS_PER_YEAR: 365.25,
  
  // Orbital calculation precision
  MAX_ITERATIONS: 100, // For iterative orbit calculations
  CONVERGENCE_THRESHOLD: 1e-8, // Convergence criterion
  
  // Simulation time steps
  ORBIT_TIME_STEP_DAYS: 1, // Days between orbit points (system view)
  CLOSE_APPROACH_TIME_STEP_HOURS: 1, // Hours for detailed view near Earth
  
  // Earth orbital elements (for reference)
  EARTH_SEMI_MAJOR_AXIS_AU: 1.00000011, // AU
  EARTH_ECCENTRICITY: 0.01671022,
  EARTH_ORBITAL_PERIOD_DAYS: 365.256363004,
};

/**
 * IMPACT MODELING CONSTANTS
 * Used for crater formation, seismic effects, and damage calculations
 */
export const IMPACT_CONSTANTS = {
  // Energy conversions
  JOULES_TO_MEGATONS: 2.39e-16, // Convert joules to megatons TNT
  MEGATONS_TO_JOULES: 4.184e15, // Convert megatons TNT to joules
  
  // Material properties
  ASTEROID_DENSITY_KG_M3: 2600, // Typical stony asteroid density
  IRON_DENSITY_KG_M3: 7800, // Iron asteroid density
  WATER_DENSITY_KG_M3: 1000, // For ocean impacts
  
  // Atmospheric constants
  ATMOSPHERE_SCALE_HEIGHT_KM: 8.5, // Exponential atmosphere scale height
  SEA_LEVEL_DENSITY_KG_M3: 1.225, // Air density at sea level
  FRAGMENTATION_STRENGTH_PA: 5e6, // Typical asteroid strength (5 MPa)
  
  // Crater scaling (Collins et al., 2005)
  CRATER_SCALING_CONSTANT: 1.161, // K1 for simple craters
  CRATER_DIAMETER_EXPONENT: 0.78, // Scaling exponent
  CRATER_DEPTH_RATIO: 0.14, // Depth/diameter ratio
  
  // Seismic scaling
  SEISMIC_EFFICIENCY: 0.0001, // Fraction of energy converted to seismic waves
  RICHTER_SCALING_CONSTANT: 4.8, // For magnitude calculation
  
  // Tsunami generation (ocean impacts)
  TSUNAMI_THRESHOLD_DEPTH_M: 1000, // Minimum depth for tsunami
  TSUNAMI_WAVE_HEIGHT_SCALING: 0.1, // Simplified scaling factor
  
  // Surface type modifiers
  SURFACE_TYPES: {
    OCEAN: { seismic: 0.5, crater: 0.3, tsunami: 1.0 },
    LAND: { seismic: 1.0, crater: 1.0, tsunami: 0.0 },
    URBAN: { seismic: 1.2, crater: 1.0, tsunami: 0.0, damage_multiplier: 2.5 },
  },
};

/**
 * API CONFIGURATION
 * NASA NeoWs API endpoints and parameters
 */
export const API_CONFIG = {

  // the Base URL and the API key are temporarly shown
  // Reminder: put the API key in an env before submit
  BASE_URL: 'https://api.nasa.gov/neo/rest/v1',
  API_KEY: 'Aogi42tvKa7VUpdF477lNIYUFS97v2fYjdnDr0bH',
  
  ENDPOINTS: {
    FEED: '/feed', // Get NEOs by date range
    NEO_LOOKUP: '/neo', // Get specific NEO by ID
    BROWSE: '/neo/browse', // Browse all NEOs
  },
  
  // Date range for real-time data (7 days back)
  LOOKBACK_DAYS: 7,
  
  // Request limits
  MAX_RETRIES: 3,
  TIMEOUT_MS: 10000,
};

/**
 * DANGER CLASSIFICATION
 * Categories for asteroid hazard levels
 */
export const DANGER_LEVELS = {
  SAFE: {
    label: 'Safe',
    color: '#10b981', // green
    minEnergy: 0,
    maxEnergy: 1, // < 1 megaton
  },
  LOW: {
    label: 'Low Risk',
    color: '#eab308', // yellow
    minEnergy: 1,
    maxEnergy: 100,
  },
  MODERATE: {
    label: 'Moderate Risk',
    color: '#f97316', // orange
    minEnergy: 100,
    maxEnergy: 10000,
  },
  HIGH: {
    label: 'High Risk',
    color: '#ef4444', // red
    minEnergy: 10000,
    maxEnergy: 1000000,
  },
  CATASTROPHIC: {
    label: 'Extinction Level',
    color: '#7c2d12', // dark red
    minEnergy: 1000000,
    maxEnergy: Infinity,
  },
};

/**
 * VISUALIZATION SETTINGS
 * Default values for 3D visualization
 */
export const VIZ_CONFIG = {
  // Scale factors for rendering
  SUN_SCALE: 10, // Visual size multiplier for Sun
  EARTH_SCALE: 50, // Visual size multiplier for Earth
  ASTEROID_SCALE: 10000, // Visual size multiplier for asteroids
  
  // Camera positions (in AU for system view)
  SYSTEM_VIEW_DISTANCE: 2.5,
  DETAIL_VIEW_DISTANCE: 0.05,
  
  // Orbit line resolution
  ORBIT_SEGMENTS: 200, // Number of points for orbit path
  
  // Animation
  DEFAULT_TIME_SCALE: 1, // Days per frame
  MAX_TIME_SCALE: 365, // Maximum fast-forward
};

/**
 * Helper function to get danger level from impact energy
 * @param {number} energyMegatons - Impact energy in megatons TNT
 * @returns {object} Danger level object
 */
export function getDangerLevel(energyMegatons) {
  for (const [key, level] of Object.entries(DANGER_LEVELS)) {
    if (energyMegatons >= level.minEnergy && energyMegatons < level.maxEnergy) {
      return { ...level, key };
    }
  }
  return DANGER_LEVELS.SAFE;
}

/**
 * Helper function to format large numbers
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
export function formatLargeNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

export default CONSTANTS;
