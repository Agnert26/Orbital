// ================================
// ORBITAL - Physics Calculations
// Simplified arcade-style calculations
// ================================

import { PHYSICS } from '../data/constants.js';

/**
 * Calculate total mass of spacecraft configuration
 */
export function calculateTotalMass(spacecraft) {
    let total = 0;
    
    if (spacecraft.bus) total += spacecraft.bus.mass;
    if (spacecraft.powerSystem) total += spacecraft.powerSystem.mass;
    if (spacecraft.propulsion) {
        total += spacecraft.propulsion.mass;
        total += spacecraft.propulsion.fuelMass || 0;
    }
    if (spacecraft.communications) total += spacecraft.communications.mass;
    
    spacecraft.instruments.forEach(instrument => {
        total += instrument.mass;
    });
    
    return total;
}

/**
 * Calculate total cost of spacecraft configuration
 */
export function calculateTotalCost(spacecraft) {
    let total = 0;
    
    if (spacecraft.bus) total += spacecraft.bus.cost;
    if (spacecraft.powerSystem) total += spacecraft.powerSystem.cost;
    if (spacecraft.propulsion) total += spacecraft.propulsion.cost;
    if (spacecraft.communications) total += spacecraft.communications.cost;
    
    spacecraft.instruments.forEach(instrument => {
        total += instrument.cost;
    });
    
    return total;
}

/**
 * Calculate power generation
 */
export function calculatePowerGeneration(powerSystem) {
    if (!powerSystem) return 0;
    return powerSystem.power;
}

/**
 * Calculate power consumption
 */
export function calculatePowerConsumption(spacecraft) {
    let total = 0;
    
    // Bus base power
    if (spacecraft.bus) total += spacecraft.bus.power;
    
    // Communications power
    if (spacecraft.communications) total += spacecraft.communications.power;
    
    // Propulsion power (only for ion drives)
    if (spacecraft.propulsion && spacecraft.propulsion.power) {
        total += spacecraft.propulsion.power;
    }
    
    // Instruments power
    spacecraft.instruments.forEach(instrument => {
        total += instrument.power;
    });
    
    return total;
}

/**
 * Calculate data generation rate
 */
export function calculateDataGeneration(instruments) {
    let total = 0;
    
    instruments.forEach(instrument => {
        total += instrument.dataRate;
    });
    
    return total;
}

/**
 * Calculate data transmission capacity
 */
export function calculateDataTransmission(communications) {
    if (!communications) return 0;
    return communications.dataRate;
}

/**
 * Calculate mission lifetime based on limiting factors
 */
export function calculateLifetime(spacecraft, powerSystem, mission) {
    let lifetimes = [];
    
    // Power system lifetime
    if (powerSystem) {
        lifetimes.push({
            factor: 'power',
            days: powerSystem.lifetime
        });
    }
    
    // Fuel lifetime (simplified)
    if (spacecraft.propulsion && spacecraft.propulsion.fuelMass) {
        // Simplified: assume fuel consumption over mission duration
        const fuelLifetimeDays = mission.duration * 1.2; // 20% margin
        lifetimes.push({
            factor: 'fuel',
            days: fuelLifetimeDays
        });
    }
    
    // Mission design lifetime
    lifetimes.push({
        factor: 'design',
        days: mission.duration
    });
    
    // Return the minimum (limiting factor)
    const minLifetime = Math.min(...lifetimes.map(l => l.days));
    const limitingFactor = lifetimes.find(l => l.days === minLifetime);
    
    return {
        actual: minLifetime,
        limitingFactor: limitingFactor.factor,
        breakdown: lifetimes
    };
}

/**
 * Calculate science score contribution
 */
export function calculateScienceScore(instruments, mission) {
    let score = 0;
    const missionGoals = mission.scienceGoals || {};
    
    instruments.forEach(instrument => {
        const instrumentScience = instrument.scienceValue || {};
        
        // Match instrument capabilities with mission goals
        Object.keys(instrumentScience).forEach(field => {
            if (missionGoals[field]) {
                // Contribution is based on both instrument capability and mission priority
                score += (instrumentScience[field] * missionGoals[field]) / 100;
            }
        });
    });
    
    return Math.min(score, 100); // Cap at 100
}

/**
 * Check if delta-v is sufficient for mission
 */
export function checkDeltaV(propulsion, mission) {
    if (!propulsion) return false;
    
    const required = PHYSICS.DELTA_V[mission.id] || 10000;
    return propulsion.deltaV >= required * 0.9; // 10% margin
}

/**
 * Check if communications range is sufficient
 */
export function checkCommunicationsRange(communications, mission) {
    if (!communications) return false;
    
    const required = PHYSICS.DISTANCES[mission.id] || 1.0;
    return communications.maxDistance >= required;
}

/**
 * Calculate power margin percentage
 */
export function calculatePowerMargin(generated, consumed) {
    if (generated === 0) return 0;
    return (generated - consumed) / generated;
}

/**
 * Calculate mass margin percentage
 */
export function calculateMassMargin(used, limit) {
    if (limit === 0) return 0;
    return (limit - used) / limit;
}

/**
 * Calculate budget efficiency score
 */
export function calculateBudgetEfficiency(spent, total) {
    const percentage = spent / total;
    
    // Reward efficient spending (60-80% is optimal)
    if (percentage >= 0.6 && percentage <= 0.8) {
        return 100;
    } else if (percentage < 0.6) {
        return 50 + (percentage / 0.6) * 50;
    } else {
        return 100 - ((percentage - 0.8) / 0.2) * 50;
    }
}

/**
 * Simple orbital period calculation (Kepler's third law, simplified)
 */
export function calculateOrbitalPeriod(altitude) {
    // Simplified: T ≈ 90 minutes for LEO, scales with altitude
    const earthRadius = 6371; // km
    const baseOrbit = 400; // km (LEO)
    const basePeriod = 92; // minutes
    
    const ratio = (earthRadius + altitude) / (earthRadius + baseOrbit);
    return basePeriod * Math.pow(ratio, 1.5); // Simplified Kepler's third law
}

export default {
    calculateTotalMass,
    calculateTotalCost,
    calculatePowerGeneration,
    calculatePowerConsumption,
    calculateDataGeneration,
    calculateDataTransmission,
    calculateLifetime,
    calculateScienceScore,
    checkDeltaV,
    checkCommunicationsRange,
    calculatePowerMargin,
    calculateMassMargin,
    calculateBudgetEfficiency,
    calculateOrbitalPeriod
};
