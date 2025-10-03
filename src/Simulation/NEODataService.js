// NEODataService.js
// Service for fetching and processing NASA NEO data from NeoWs API

import { API_CONFIG, CONSTANTS, IMPACT_CONSTANTS } from './constants.js';

/**
 * NEODataService
 * Handles all interactions with NASA's Near Earth Object Web Service
 */
class NEODataService {
  constructor() {
    this.cache = new Map(); // Cache API responses
    this.lastFetchTime = null;
  }

  /**
   * Fetch NEO data for the past 7 days
   * @returns {Promise<NEOData[]>} Array of processed NEO objects
   */
  async fetchRecentNEOs() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - API_CONFIG.LOOKBACK_DAYS);

    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);

    // Check cache
    const cacheKey = `feed_${startStr}_${endStr}`;
    if (this.cache.has(cacheKey)) {
      console.log('Returning cached NEO data');
      return this.cache.get(cacheKey);
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FEED}?start_date=${startStr}&end_date=${endStr}&api_key=${API_CONFIG.API_KEY}`;
      
      console.log(`Fetching NEO data from ${startStr} to ${endStr}`);
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      // Process and flatten the nested structure
      const neos = this.processNEOFeedData(data);
      
      // Cache the results
      this.cache.set(cacheKey, neos);
      this.lastFetchTime = Date.now();

      console.log(`Successfully fetched ${neos.length} NEOs`);
      return neos;
    } catch (error) {
      console.error('Error fetching NEO data:', error);
      throw new Error(`Failed to fetch NEO data: ${error.message}`);
    }
  }

  /**
   * Fetch detailed data for a specific NEO by ID
   * @param {string} neoId - NASA NEO reference ID
   * @returns {Promise<NEOData>} Detailed NEO object
   */
  async fetchNEOById(neoId) {
    const cacheKey = `neo_${neoId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NEO_LOOKUP}/${neoId}?api_key=${API_CONFIG.API_KEY}`;
      
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      const neo = this.processNEODetailData(data);
      this.cache.set(cacheKey, neo);

      return neo;
    } catch (error) {
      console.error(`Error fetching NEO ${neoId}:`, error);
      throw new Error(`Failed to fetch NEO details: ${error.message}`);
    }
  }

  /**
   * Process NEO feed data from API
   * @private
   * @param {Object} apiData - Raw API response
   * @returns {NEOData[]} Processed array of NEOs
   */
  processNEOFeedData(apiData) {
    const neos = [];
    const nearEarthObjects = apiData.near_earth_objects;

    // Flatten the date-grouped structure
    for (const date in nearEarthObjects) {
      const dayNEOs = nearEarthObjects[date];
      
      for (const neo of dayNEOs) {
        neos.push(this.processNEOObject(neo));
      }
    }

    // Remove duplicates (same NEO can appear on multiple dates)
    const uniqueNEOs = this.removeDuplicates(neos);
    
    // Sort by closest approach distance
    uniqueNEOs.sort((a, b) => {
      const aMin = Math.min(...a.closeApproaches.map(ca => ca.missDistance));
      const bMin = Math.min(...b.closeApproaches.map(ca => ca.missDistance));
      return aMin - bMin;
    });

    return uniqueNEOs;
  }

  /**
   * Process detailed NEO data
   * @private
   * @param {Object} apiData - Raw API response for single NEO
   * @returns {NEOData} Processed NEO object
   */
  processNEODetailData(apiData) {
    return this.processNEOObject(apiData);
  }

  /**
   * Process a single NEO object from API
   * @private
   * @param {Object} neo - Raw NEO object from API
   * @returns {NEOData} Processed NEO object
   */
  processNEOObject(neo) {
    // Extract diameter (use average of min/max estimates)
    const diameterData = neo.estimated_diameter.meters;
    const estimatedDiameter = (diameterData.estimated_diameter_min + diameterData.estimated_diameter_max) / 2;

    // Calculate mass from diameter (assuming spherical asteroid)
    const radius = estimatedDiameter / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * IMPACT_CONSTANTS.ASTEROID_DENSITY_KG_M3;

    // Process orbital data
    const orbitalData = this.extractOrbitalElements(neo.orbital_data);

    // Process close approach data
    const closeApproaches = neo.close_approach_data.map(ca => ({
      date: ca.close_approach_date_full,
      epochMillis: parseInt(ca.epoch_date_close_approach),
      relativeVelocity: parseFloat(ca.relative_velocity.kilometers_per_second),
      missDistance: parseFloat(ca.miss_distance.kilometers),
      orbitingBody: ca.orbiting_body,
    }));

    return {
      id: neo.id,
      name: neo.name,
      estimatedDiameter,
      absoluteMagnitude: parseFloat(neo.absolute_magnitude_h),
      isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
      orbitalData,
      closeApproaches,
      mass,
      firstObservation: neo.orbital_data?.first_observation_date || 'Unknown',
      lastObservation: neo.orbital_data?.last_observation_date || 'Unknown',
    };
  }

  /**
   * Extract and calculate orbital elements
   * @private
   * @param {Object} orbitalData - Raw orbital data from API
   * @returns {OrbitalElements} Processed orbital elements
   */
  extractOrbitalElements(orbitalData) {
    if (!orbitalData) {
      return this.getDefaultOrbitalElements();
    }

    const a = parseFloat(orbitalData.semi_major_axis) || 1.0; // AU
    const e = parseFloat(orbitalData.eccentricity) || 0.1;
    const i = parseFloat(orbitalData.inclination) || 0;
    const omega = parseFloat(orbitalData.ascending_node_longitude) || 0; // Longitude of ascending node
    const w = parseFloat(orbitalData.perihelion_argument) || 0; // Argument of perihelion
    const M = parseFloat(orbitalData.mean_anomaly) || 0; // Mean anomaly

    // Calculate orbital period using Kepler's third law: T² = a³ (when a is in AU, T is in years)
    const periodYears = Math.pow(a, 1.5); // T = a^(3/2)
    const periodDays = periodYears * CONSTANTS.DAYS_PER_YEAR;

    // Calculate perihelion and aphelion distances
    const q = a * (1 - e); // Perihelion distance
    const Q = a * (1 + e); // Aphelion distance

    return {
      semiMajorAxis: a,
      eccentricity: e,
      inclination: i,
      longitudeAscendingNode: omega,
      argumentPerihelion: w,
      meanAnomaly: M,
      orbitalPeriod: periodDays,
      perihelionDistance: q,
      aphelionDistance: Q,
    };
  }

  /**
   * Get default orbital elements for NEOs without data
   * @private
   * @returns {OrbitalElements}
   */
  getDefaultOrbitalElements() {
    return {
      semiMajorAxis: 1.5,
      eccentricity: 0.2,
      inclination: 5,
      longitudeAscendingNode: 0,
      argumentPerihelion: 0,
      meanAnomaly: 0,
      orbitalPeriod: 633, // ~1.73 years
      perihelionDistance: 1.2,
      aphelionDistance: 1.8,
    };
  }

  /**
   * Remove duplicate NEOs from array
   * @private
   * @param {NEOData[]} neos - Array of NEOs
   * @returns {NEOData[]} Array with duplicates removed
   */
  removeDuplicates(neos) {
    const seen = new Map();
    
    for (const neo of neos) {
      if (!seen.has(neo.id)) {
        seen.set(neo.id, neo);
      } else {
        // Merge close approach data
        const existing = seen.get(neo.id);
        existing.closeApproaches = [
          ...existing.closeApproaches,
          ...neo.closeApproaches
        ];
        // Remove duplicate close approaches
        existing.closeApproaches = existing.closeApproaches.filter(
          (ca, index, self) => 
            index === self.findIndex(t => t.epochMillis === ca.epochMillis)
        );
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Fetch with retry logic
   * @private
   * @param {string} url - URL to fetch
   * @returns {Promise<Response>} Fetch response
   */
  async fetchWithRetry(url, retries = API_CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        
        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        console.log(`Retry ${i + 1}/${retries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Format date as YYYY-MM-DD for API
   * @private
   * @param {Date} date - Date object
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Clear the cache (useful for forcing refresh)
   */
  clearCache() {
    this.cache.clear();
    this.lastFetchTime = null;
    console.log('NEO data cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      itemsCount: this.cache.size,
      lastFetchTime: this.lastFetchTime,
      cacheAgeMs: this.lastFetchTime ? Date.now() - this.lastFetchTime : null,
    };
  }
}

// Export singleton instance
export default new NEODataService();
