// ================================
// ORBITAL - Game Constants
// Physics and Engineering Parameters
// ================================

/**
 * Resource limits and constraints for mission design
 */
export const RESOURCE_LIMITS = {
    // Budget limits (USD)
    MAX_BUDGET: 5000000000, // $5 billion
    MIN_BUDGET_PER_MISSION: {
        mars: 2000000000,      // $2B minimum
        earth: 800000000,      // $800M minimum
        asteroid: 1500000000   // $1.5B minimum
    },

    // Mass limits (kg) - depends on launch vehicle
    MASS_LIMITS: {
        small: 2000,    // Small launch vehicle
        medium: 5000,   // Medium launch vehicle
        heavy: 15000,   // Heavy launch vehicle
        superheavy: 50000 // Super heavy launch vehicle
    },

    // Power generation (watts)
    POWER_GENERATION: {
        solar_small: 500,
        solar_medium: 2000,
        solar_large: 5000,
        rtg_small: 300,
        rtg_large: 1000
    },

    // Data rates (GB/day)
    DATA_RATES: {
        low_bandwidth: 0.5,
        medium_bandwidth: 2.0,
        high_bandwidth: 10.0
    },

    // Mission lifetime (days)
    LIFETIME_LIMITS: {
        min: 30,
        typical: 365,
        extended: 1825,  // 5 years
        max: 3650        // 10 years
    }
};

/**
 * Physics constants for simplified calculations
 */
export const PHYSICS = {
    // Delta-v requirements (m/s) - simplified arcade-style for gameplay
    // Values represent on-orbit maneuvers, not launch from Earth surface
    DELTA_V: {
        earth: 800,          // LEO station-keeping and orbit adjustments
        mars: 3500,          // Mars transfer with aerobraking (simplified)
        asteroid: 6000       // Near-Earth asteroid rendezvous
    },

    // Orbital altitudes (km)
    ORBITS: {
        leo: 400,
        meo: 20000,
        geo: 35786,
        heo: 50000
    },

    // Communication distances (AU)
    DISTANCES: {
        earth: 0,            // Earth orbit - no deep space communications needed
        mars: 2.0,           // Mars at mid-range distance
        asteroid: 1.0        // Typical near-Earth asteroid distance
    }
};

/**
 * Cost multipliers for different mission types
 */
export const COST_MULTIPLIERS = {
    spacecraft: {
        bus: 1.0,
        power: 0.8,
        propulsion: 1.2,
        communications: 0.6
    },
    mission: {
        mars: 1.5,
        earth: 1.0,
        asteroid: 1.3
    },
    complexity: {
        simple: 1.0,
        moderate: 1.3,
        complex: 1.8
    }
};

/**
 * Scoring weights for mission evaluation
 */
export const SCORING_WEIGHTS = {
    science_return: 0.30,        // 30% - Scientific value
    cost_efficiency: 0.25,       // 25% - Budget efficiency
    technical_success: 0.25,     // 25% - Engineering success
    innovation: 0.10,            // 10% - Innovation factor
    risk_management: 0.10        // 10% - Risk mitigation
};

/**
 * Resource type definitions
 */
export const RESOURCE_TYPES = {
    MASS: 'mass',
    POWER: 'power',
    BUDGET: 'budget',
    DATA: 'data',
    COMMUNICATIONS: 'communications',
    LIFETIME: 'lifetime'
};

/**
 * Validation thresholds
 */
export const VALIDATION_THRESHOLDS = {
    mass_margin: 0.10,           // 10% mass margin required
    power_margin: 0.15,          // 15% power margin required
    budget_margin: 0.05,         // 5% budget margin required
    data_storage_days: 7,        // Must store 7 days of data
    min_instruments: 1,          // At least 1 instrument
    max_instruments: 8           // Maximum 8 instruments
};

export default {
    RESOURCE_LIMITS,
    PHYSICS,
    COST_MULTIPLIERS,
    SCORING_WEIGHTS,
    RESOURCE_TYPES,
    VALIDATION_THRESHOLDS
};
