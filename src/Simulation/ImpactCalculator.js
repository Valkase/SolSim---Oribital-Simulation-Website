// ImpactCalculator.js
// Calculate asteroid impact effects: energy, craters, seismic activity, tsunamis

import { CONSTANTS, IMPACT_CONSTANTS, getDangerLevel } from './constants.js';

/**
 * ImpactCalculator
 * Physics-based calculations for asteroid impact scenarios
 */
class ImpactCalculator {
  constructor() {
    this.calculationCache = new Map();
  }

  /**
   * Calculate complete impact scenario
   * @param {ImpactScenario} scenario - Impact parameters
   * @returns {ImpactResults} Complete impact analysis
   */
  calculateImpact(scenario) {
    const cacheKey = this.generateCacheKey(scenario);
    
    if (this.calculationCache.has(cacheKey)) {
      return this.calculationCache.get(cacheKey);
    }

    const steps = [];
    
    // Step 1: Calculate atmospheric entry effects
    steps.push('Calculating atmospheric entry...');
    const atmospheric = this.calculateAtmosphericEntry(
      scenario.diameter,
      scenario.mass,
      scenario.velocity,
      scenario.angle
    );
    
    // Step 2: Calculate impact energy
    steps.push('Computing impact energy...');
    const energy = this.calculateImpactEnergy(
      scenario.mass,
      scenario.velocity,
      atmospheric.survivingMassFraction
    );
    
    // Step 3: Calculate crater formation
    steps.push('Modeling crater formation...');
    const crater = this.calculateCrater(
      energy.surfaceEnergyJoules,
      scenario.velocity,
      scenario.diameter,
      scenario.angle,
      scenario.surfaceType
    );
    
    // Step 4: Calculate seismic effects
    steps.push('Estimating seismic activity...');
    const seismic = this.calculateSeismicEffects(
      energy.surfaceEnergyJoules,
      scenario.surfaceType
    );
    
    // Step 5: Calculate tsunami (if ocean impact)
    steps.push('Analyzing tsunami potential...');
    const tsunami = scenario.surfaceType === 'OCEAN'
      ? this.calculateTsunami(
          energy.surfaceEnergyJoules,
          scenario.diameter,
          scenario.location
        )
      : null;
    
    // Step 6: Estimate damage zones
    steps.push('Computing damage zones...');
    const damage = this.calculateDamageZones(
      energy.kineticEnergyMegatons,
      crater.diameter,
      seismic.magnitude,
      scenario.surfaceType,
      atmospheric.airburstEnergy
    );
    
    const results = {
      energy,
      crater,
      seismic,
      tsunami,
      atmospheric,
      damage,
      calculationSteps: steps,
      dangerLevel: getDangerLevel(energy.kineticEnergyMegatons),
    };
    
    this.calculationCache.set(cacheKey, results);
    return results;
  }

  /**
   * Calculate atmospheric entry effects
   * @private
   */
  calculateAtmosphericEntry(diameter, mass, velocity, angle) {
    const radius = diameter / 2;
    const crossSectionalArea = Math.PI * radius * radius;
    
    // Calculate if asteroid fragments in atmosphere
    // Dynamic pressure: q = 0.5 * ρ * v²
    const entryVelocity = velocity * 1000; // Convert km/s to m/s
    
    // Altitude where fragmentation occurs (if it does)
    // Using pancake model approximation
    const strengthPa = IMPACT_CONSTANTS.FRAGMENTATION_STRENGTH_PA;
    
    // Calculate fragmentation altitude (simplified)
    let fragmentationAltitude = null;
    let fragmentationOccurred = false;
    let airburstEnergy = 0;
    
    // Small asteroids (<50m) often airburst
    if (diameter < 50) {
      // Calculate fragmentation height
      const rho0 = IMPACT_CONSTANTS.SEA_LEVEL_DENSITY_KG_M3;
      const H = IMPACT_CONSTANTS.ATMOSPHERE_SCALE_HEIGHT_KM * 1000; // to meters
      
      // Fragmentation occurs when dynamic pressure exceeds strength
      // q = 0.5 * ρ(h) * v² = strength
      // ρ(h) = ρ0 * exp(-h/H)
      const requiredDensity = (2 * strengthPa) / (entryVelocity * entryVelocity);
      
      if (requiredDensity < rho0) {
        fragmentationAltitude = -H * Math.log(requiredDensity / rho0) / 1000; // km
        fragmentationOccurred = true;
        
        // Energy released as airburst (fraction of total)
        const airburstFraction = 0.3 + (0.6 * (50 - diameter) / 50); // More airburst for smaller
        airburstEnergy = 0.5 * mass * (velocity * velocity) * airburstFraction * IMPACT_CONSTANTS.JOULES_TO_MEGATONS;
      }
    }
    
    // Calculate surviving mass fraction
    let survivingMassFraction = 1.0;
    
    if (fragmentationOccurred) {
      // Energy loss to ablation and fragmentation
      const energyLossFraction = 0.1 + (0.4 * Math.exp(-diameter / 20));
      survivingMassFraction = 1.0 - energyLossFraction;
    } else {
      // Small energy loss even for large asteroids
      const energyLossFraction = 0.01 * Math.exp(-diameter / 100);
      survivingMassFraction = 1.0 - energyLossFraction;
    }
    
    return {
      fragmentationOccurred,
      fragmentationAltitude,
      airburstEnergy,
      survivingMassFraction: Math.max(0.1, survivingMassFraction), // At least 10% survives
      entryAngle: angle,
    };
  }

  /**
   * Calculate impact energy
   * @private
   */
  calculateImpactEnergy(mass, velocity, survivingMassFraction) {
    // Kinetic energy: E = 0.5 * m * v²
    const velocityMs = velocity * 1000; // km/s to m/s
    const totalKineticEnergyJoules = 0.5 * mass * velocityMs * velocityMs;
    
    // Energy reaching surface
    const surfaceEnergyJoules = totalKineticEnergyJoules * survivingMassFraction;
    
    // Convert to megatons TNT
    const kineticEnergyMegatons = totalKineticEnergyJoules * IMPACT_CONSTANTS.JOULES_TO_MEGATONS;
    
    // Energy loss to atmosphere
    const energyLossFraction = 1.0 - survivingMassFraction;
    
    return {
      kineticEnergyJoules: totalKineticEnergyJoules,
      kineticEnergyMegatons,
      surfaceEnergyJoules,
      energyLossFraction,
    };
  }

  /**
   * Calculate crater dimensions
   * @private
   */
  calculateCrater(energyJoules, velocity, diameter, angle, surfaceType) {
    // Collins et al. (2005) crater scaling
    // D = K * (E^0.78) for simple craters
    
    const K = IMPACT_CONSTANTS.CRATER_SCALING_CONSTANT;
    const exponent = IMPACT_CONSTANTS.CRATER_DIAMETER_EXPONENT;
    
    // Surface type modifier
    const surfaceModifier = IMPACT_CONSTANTS.SURFACE_TYPES[surfaceType].crater;
    
    // Angle correction (vertical impact = 90°, grazing = 0°)
    const angleCorrection = Math.sin(angle * Math.PI / 180);
    
    // Energy in megatons for scaling law
    const energyMT = energyJoules * IMPACT_CONSTANTS.JOULES_TO_MEGATONS;
    
    // Crater diameter in meters
    let craterDiameter = K * Math.pow(energyMT, exponent) * 1000; // Convert km to m
    craterDiameter *= surfaceModifier * angleCorrection;
    
    // Crater depth
    const craterDepth = craterDiameter * IMPACT_CONSTANTS.CRATER_DEPTH_RATIO;
    
    // Crater volume (simplified cone)
    const craterVolume = (Math.PI / 3) * Math.pow(craterDiameter / 2, 2) * craterDepth;
    
    // Ejecta radius (typically 2-3x crater diameter)
    const ejectaRadius = craterDiameter * 2.5;
    
    // Crater type
    let craterType = 'simple';
    if (craterDiameter > 4000) {
      craterType = 'complex';
    }
    if (craterDiameter > 300000) {
      craterType = 'basin';
    }
    
    return {
      diameter: craterDiameter,
      depth: craterDepth,
      volume: craterVolume,
      type: craterType,
      ejectaRadius,
    };
  }

  /**
   * Calculate seismic effects
   * @private
   */
  calculateSeismicEffects(energyJoules, surfaceType) {
    // Seismic efficiency: fraction of energy converted to seismic waves
    const efficiency = IMPACT_CONSTANTS.SEISMIC_EFFICIENCY;
    const surfaceModifier = IMPACT_CONSTANTS.SURFACE_TYPES[surfaceType].seismic;
    
    const seismicEnergyJoules = energyJoules * efficiency * surfaceModifier;
    
    // Calculate magnitude using Gutenberg-Richter relation
    // M = (log10(E) - 4.8) / 1.5
    const magnitude = (Math.log10(seismicEnergyJoules) - IMPACT_CONSTANTS.RICHTER_SCALING_CONSTANT) / 1.5;
    
    // Calculate affected radii
    // Felt radius (Modified Mercalli III or higher)
    const feltRadius = Math.pow(10, 0.5 * magnitude) * 10; // km
    
    // Damage radius (MMI VI or higher - structural damage begins)
    const damageRadius = Math.pow(10, 0.5 * magnitude) * 2; // km
    
    // Description based on magnitude
    let description = 'Minor tremor';
    if (magnitude < 3) description = 'Not felt';
    else if (magnitude < 5) description = 'Light shaking, minor damage';
    else if (magnitude < 6) description = 'Moderate shaking, some structural damage';
    else if (magnitude < 7) description = 'Strong shaking, widespread damage';
    else if (magnitude < 8) description = 'Severe earthquake, major destruction';
    else description = 'Catastrophic earthquake, total devastation';
    
    return {
      magnitude: Math.max(0, magnitude),
      energyJoules: seismicEnergyJoules,
      feltRadius,
      damageRadius,
      description,
    };
  }

  /**
   * Calculate tsunami effects (ocean impacts only)
   * @private
   */
  calculateTsunami(energyJoules, diameter, location) {
    // Simplified tsunami model
    // Wave height scales with energy and impact diameter
    
    const energyMT = energyJoules * IMPACT_CONSTANTS.JOULES_TO_MEGATONS;
    
    // Initial wave height (at source)
    // H ∝ (E * d)^(1/3)
    const waveHeight = Math.pow(energyMT * diameter, 1/3) * IMPACT_CONSTANTS.TSUNAMI_WAVE_HEIGHT_SCALING;
    
    // Tsunami wave speed: c = √(g * h), where h is ocean depth
    // Assuming deep ocean: ~4000m
    const g = 9.81; // m/s²
    const oceanDepth = 4000; // meters
    const waveSpeed = Math.sqrt(g * oceanDepth) * 3.6; // Convert to km/h
    
    // Tsunami energy
    const tsunamiEnergy = energyJoules * 0.1; // ~10% of impact energy to tsunami
    
    // Affected coastline 
    const affectedCoastlineKm = Math.PI * 2 * 500; // 500km radius assumption
    
    // Placeholder for affected regions
    const affectedRegions = [
      'Coastal areas within 500 km',
      'Major port cities',
      'Low-lying islands',
    ];
    
    return {
      waveHeight,
      affectedCoastlineKm,
      travelSpeed: waveSpeed,
      energyJoules: tsunamiEnergy,
      affectedRegions,
    };
  }

  /**
   * Calculate damage zones
   * @private
   */
  calculateDamageZones(energyMT, craterDiameter, magnitude, surfaceType, airburstEnergy) {
    const zones = [];
    const urbanMultiplier = IMPACT_CONSTANTS.SURFACE_TYPES[surfaceType].damage_multiplier || 1.0;
    
    // Zone 1: Total destruction (crater + immediate vicinity)
    const totalDestructionRadius = (craterDiameter / 2000) * urbanMultiplier; // Convert m to km
    zones.push({
      level: 'total_destruction',
      radius: totalDestructionRadius,
      description: 'Complete vaporization and crater formation',
    });
    
    // Zone 2: Severe damage (blast wave, thermal radiation)
    // Scales with cube root of energy
    const severeRadius = Math.pow(energyMT, 1/3) * 5 * urbanMultiplier;
    zones.push({
      level: 'severe',
      radius: severeRadius,
      description: 'Structural collapse, severe fires, 90%+ casualties',
    });
    
    // Zone 3: Moderate damage (pressure wave, flying debris)
    const moderateRadius = Math.pow(energyMT, 1/3) * 15 * urbanMultiplier;
    zones.push({
      level: 'moderate',
      radius: moderateRadius,
      description: 'Partial building collapse, broken windows, injuries',
    });
    
    // Zone 4: Light damage (pressure effects, some structural damage)
    const lightRadius = Math.pow(energyMT, 1/3) * 30 * urbanMultiplier;
    zones.push({
      level: 'light',
      radius: lightRadius,
      description: 'Minor structural damage, shattered windows, minor injuries',
    });
    
    // Add airburst effects if applicable
    if (airburstEnergy > 0) {
      const airburstRadius = Math.pow(airburstEnergy, 1/3) * 10;
      zones.push({
        level: 'airburst',
        radius: airburstRadius,
        description: 'Atmospheric explosion effects - blast wave and thermal flash',
      });
    }
    
    // Calculate total affected area
    const totalAffectedArea = Math.PI * lightRadius * lightRadius;
    
    // Estimate casualties (very rough - depends heavily on population density)
    let estimatedCasualties = 0;
    if (surfaceType === 'URBAN') {
      // Assume urban density ~5000 people/km²
      const urbanDensity = 5000;
      const severeArea = Math.PI * severeRadius * severeRadius;
      const moderateArea = Math.PI * (moderateRadius * moderateRadius - severeRadius * severeRadius);
      
      estimatedCasualties = Math.floor(
        severeArea * urbanDensity * 0.9 + // 90% casualties in severe zone
        moderateArea * urbanDensity * 0.3   // 30% casualties in moderate zone
      );
    }
    
    // Determine overall severity
    let overallSeverity = 'local';
    if (energyMT > 1000000) overallSeverity = 'global';
    else if (energyMT > 10000) overallSeverity = 'continental';
    else if (energyMT > 100) overallSeverity = 'regional';
    
    return {
      zones,
      totalAffectedArea,
      estimatedCasualties,
      overallSeverity,
    };
  }

  /**
   * Generate cache key for impact scenario
   * @private
   */
  generateCacheKey(scenario) {
    return `${scenario.asteroidId}_${scenario.diameter}_${scenario.velocity}_${scenario.angle}_${scenario.surfaceType}`;
  }

  /**
   * Compare multiple impact scenarios
   * @param {ImpactScenario[]} scenarios - Array of scenarios to compare
   * @returns {Object} Comparison results
   */
  compareScenarios(scenarios) {
    const results = scenarios.map(scenario => ({
      scenario,
      impact: this.calculateImpact(scenario),
    }));
    
    // Sort by severity (energy)
    results.sort((a, b) => 
      b.impact.energy.kineticEnergyMegatons - a.impact.energy.kineticEnergyMegatons
    );
    
    return {
      scenarios: results,
      mostSevere: results[0],
      leastSevere: results[results.length - 1],
    };
  }

  /**
   * Calculate mitigation effectiveness
   * @param {ImpactScenario} originalScenario - Original impact scenario
   * @param {number} velocityReduction - Velocity reduction in km/s
   * @param {number} deflectionAngle - Deflection angle in degrees
   * @returns {Object} Mitigation analysis
   */
  calculateMitigation(originalScenario, velocityReduction, deflectionAngle) {
    // Original impact
    const originalImpact = this.calculateImpact(originalScenario);
    
    // Modified scenario after mitigation
    const mitigatedScenario = {
      ...originalScenario,
      velocity: Math.max(0.1, originalScenario.velocity - velocityReduction),
    };
    
    const mitigatedImpact = this.calculateImpact(mitigatedScenario);
    
    // Calculate if deflection avoids Earth entirely
    // Simplified: if deflection angle > threshold, miss Earth
    const earthRadius = CONSTANTS.EARTH_RADIUS_KM;
    const missDistance = Math.tan(deflectionAngle * Math.PI / 180) * 1000000; // Very simplified
    const avoidsImpact = missDistance > earthRadius;
    
    // Energy reduction
    const energyReduction = originalImpact.energy.kineticEnergyMegatons - 
                           mitigatedImpact.energy.kineticEnergyMegatons;
    const energyReductionPercent = (energyReduction / originalImpact.energy.kineticEnergyMegatons) * 100;
    
    return {
      original: originalImpact,
      mitigated: mitigatedImpact,
      avoidsImpact,
      energyReduction,
      energyReductionPercent,
      casualtyReduction: originalImpact.damage.estimatedCasualties - 
                        mitigatedImpact.damage.estimatedCasualties,
    };
  }

  /**
   * Calculate Tunguska-equivalent impacts (comparative analysis)
   * @param {ImpactScenario} scenario - Impact scenario
   * @returns {Object} Comparison to historical events
   */
  compareToHistoricalEvents(scenario) {
    const impact = this.calculateImpact(scenario);
    const energyMT = impact.energy.kineticEnergyMegatons;
    
    // Historical reference events
    const events = {
      tunguska: { name: 'Tunguska (1908)', energy: 15 },
      hiroshima: { name: 'Hiroshima bomb', energy: 0.015 },
      czar_bomba: { name: 'Tsar Bomba (largest nuke)', energy: 50 },
      krakatoa: { name: 'Krakatoa eruption (1883)', energy: 200 },
      chicxulub: { name: 'Chicxulub (dinosaur extinction)', energy: 100000000 },
    };
    
    const comparisons = {};
    for (const [key, event] of Object.entries(events)) {
      comparisons[key] = {
        name: event.name,
        ratio: energyMT / event.energy,
        comparison: energyMT > event.energy ? 'more powerful' : 'less powerful',
      };
    }
    
    return {
      energyMegatons: energyMT,
      comparisons,
    };
  }

  /**
   * Generate human-readable impact summary
   * @param {ImpactResults} impact - Impact results
   * @returns {string} Formatted summary
   */
  generateImpactSummary(impact) {
    const energy = impact.energy.kineticEnergyMegatons.toFixed(2);
    const crater = (impact.crater.diameter / 1000).toFixed(2);
    const magnitude = impact.seismic.magnitude.toFixed(1);
    const severity = impact.damage.overallSeverity;
    
    let summary = `Impact Energy: ${energy} megatons TNT equivalent\n`;
    summary += `Crater: ${crater} km diameter, ${(impact.crater.depth / 1000).toFixed(2)} km deep (${impact.crater.type})\n`;
    summary += `Seismic Activity: Magnitude ${magnitude} earthquake (${impact.seismic.description})\n`;
    summary += `Damage Radius: ${impact.damage.zones[impact.damage.zones.length - 1].radius.toFixed(1)} km\n`;
    summary += `Overall Severity: ${severity.toUpperCase()}\n`;
    
    if (impact.tsunami) {
      summary += `Tsunami: ${impact.tsunami.waveHeight.toFixed(1)}m waves\n`;
    }
    
    if (impact.atmospheric.fragmentationOccurred) {
      summary += `Atmospheric Breakup: ${impact.atmospheric.fragmentationAltitude.toFixed(1)} km altitude\n`;
      summary += `Airburst Energy: ${impact.atmospheric.airburstEnergy.toFixed(2)} megatons\n`;
    }
    
    if (impact.damage.estimatedCasualties > 0) {
      summary += `Est. Casualties: ${impact.damage.estimatedCasualties.toLocaleString()}\n`;
    }
    
    return summary;
  }

  /**
   * Calculate danger timeline (time-based risk assessment)
   * @param {NEOData} neoData - NEO object
   * @param {number} yearsForward - Years to assess
   * @returns {Array} Timeline of risk levels
   */
  calculateDangerTimeline(neoData, yearsForward = 100) {
    const timeline = [];
    
    // Analyze each close approach
    for (const ca of neoData.closeApproaches) {
      const approachDate = new Date(ca.epochMillis);
      const yearsFromNow = (approachDate - Date.now()) / (1000 * 60 * 60 * 24 * 365.25);
      
      if (yearsFromNow > 0 && yearsFromNow <= yearsForward) {
        // Create hypothetical impact scenario
        const scenario = {
          asteroidId: neoData.id,
          asteroidName: neoData.name,
          diameter: neoData.estimatedDiameter,
          mass: neoData.mass,
          velocity: ca.relativeVelocity,
          angle: 45, // Assume typical angle
          location: { latitude: 0, longitude: 0, elevation: 0 },
          surfaceType: 'LAND',
        };
        
        // Calculate potential impact
        const impact = this.calculateImpact(scenario);
        
        timeline.push({
          date: approachDate,
          yearsFromNow,
          missDistance: ca.missDistance,
          potentialImpact: impact,
          riskLevel: this.assessRiskLevel(ca.missDistance, impact.energy.kineticEnergyMegatons),
        });
      }
    }
    
    return timeline.sort((a, b) => a.yearsFromNow - b.yearsFromNow);
  }

  /**
   * Assess risk level based on miss distance and energy
   * @private
   */
  assessRiskLevel(missDistance, energyMT) {
    const lunarDistance = 384400; // km
    
    if (missDistance < CONSTANTS.EARTH_RADIUS_KM) return 'IMPACT';
    if (missDistance < lunarDistance * 0.1) return 'CRITICAL';
    if (missDistance < lunarDistance * 0.5) return 'HIGH';
    if (missDistance < lunarDistance) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Clear calculation cache
   */
  clearCache() {
    this.calculationCache.clear();
    console.log('Impact calculation cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      cachedCalculations: this.calculationCache.size,
    };
  }
}

// Export singleton instance
export default new ImpactCalculator();
