// ================================
// ORBITAL - Resource Manager
// Track and calculate all mission resources
// ================================

import { gameState } from '../core/gameState.js';
import * as calc from '../utils/calculations.js';

/**
 * Update all resources based on current spacecraft configuration
 */
export function updateAllResources() {
    const spacecraft = gameState.spacecraft;
    const mission = gameState.selectedMission;
    
    if (!mission) {
        console.warn('⚠️ No mission selected');
        return;
    }
    
    updateMassResources(spacecraft);
    updatePowerResources(spacecraft);
    updateBudgetResources(spacecraft);
    updateDataResources(spacecraft);
    updateCommunicationsResources(spacecraft);
    updateLifetimeResources(spacecraft, mission);
    
    console.log('✅ Resources updated');
}

/**
 * Update mass resources
 */
function updateMassResources(spacecraft) {
    const resources = gameState.resources.mass;
    
    // Calculate breakdown
    resources.breakdown.bus = spacecraft.bus?.mass || 0;
    resources.breakdown.power = spacecraft.powerSystem?.mass || 0;
    resources.breakdown.propulsion = spacecraft.propulsion?.mass || 0;
    resources.breakdown.propellant = spacecraft.propulsion?.fuelMass || 0;
    resources.breakdown.communications = spacecraft.communications?.mass || 0;
    
    resources.breakdown.instruments = spacecraft.instruments.reduce(
        (sum, inst) => sum + inst.mass, 0
    );
    
    // Total used mass
    resources.used = Object.values(resources.breakdown).reduce(
        (sum, val) => sum + val, 0
    );
    
    // Available mass depends on launch vehicle (set later in orbit manager)
    // For now, use a default if not set
    if (resources.available === 0) {
        resources.available = 10000; // Default placeholder
    }
}

/**
 * Update power resources
 */
function updatePowerResources(spacecraft) {
    const resources = gameState.resources.power;
    
    // Power generation
    resources.generated = calc.calculatePowerGeneration(spacecraft.powerSystem);
    
    // Power consumption breakdown
    resources.breakdown.bus = spacecraft.bus?.power || 0;
    resources.breakdown.communications = spacecraft.communications?.power || 0;
    resources.breakdown.propulsion = spacecraft.propulsion?.power || 0;
    
    resources.breakdown.instruments = spacecraft.instruments.reduce(
        (sum, inst) => sum + inst.power, 0
    );
    
    // Total consumed
    resources.consumed = Object.values(resources.breakdown).reduce(
        (sum, val) => sum + val, 0
    );
    
    // Power margin
    resources.margin = resources.generated - resources.consumed;
}

/**
 * Update budget resources
 */
function updateBudgetResources(spacecraft) {
    const resources = gameState.resources.budget;
    
    // Cost breakdown
    resources.breakdown.bus = spacecraft.bus?.cost || 0;
    resources.breakdown.power = spacecraft.powerSystem?.cost || 0;
    resources.breakdown.propulsion = spacecraft.propulsion?.cost || 0;
    resources.breakdown.communications = spacecraft.communications?.cost || 0;
    
    resources.breakdown.instruments = spacecraft.instruments.reduce(
        (sum, inst) => sum + inst.cost, 0
    );
    
    // Launch and operations costs (placeholder - will be set by orbit manager)
    // resources.breakdown.launch = 0;
    // resources.breakdown.operations = 0;
    
    // Total spent
    resources.spent = Object.values(resources.breakdown).reduce(
        (sum, val) => sum + val, 0
    );
    
    // Remaining
    resources.remaining = resources.total - resources.spent;
}

/**
 * Update data resources
 */
function updateDataResources(spacecraft) {
    const resources = gameState.resources.data;
    
    // Data generation by instruments
    resources.breakdown.instruments = {};
    spacecraft.instruments.forEach(inst => {
        resources.breakdown.instruments[inst.id] = inst.dataRate;
    });
    
    // Total data generated
    resources.generated = calc.calculateDataGeneration(spacecraft.instruments);
    
    // Transmission capacity
    resources.transmissionCapacity = calc.calculateDataTransmission(spacecraft.communications);
    
    // Storage required (assume need to store 7 days worth if downlink is insufficient)
    const dailyDeficit = Math.max(0, resources.generated - resources.transmissionCapacity);
    resources.storageRequired = dailyDeficit * 7; // 7 days of buffer
}

/**
 * Update communications resources
 */
function updateCommunicationsResources(spacecraft) {
    const resources = gameState.resources.communications;
    
    if (spacecraft.communications) {
        resources.dataRate = spacecraft.communications.dataRate;
        resources.maxDistance = spacecraft.communications.maxDistance;
        resources.power = spacecraft.communications.power;
    } else {
        resources.dataRate = 0;
        resources.maxDistance = 0;
        resources.power = 0;
    }
}

/**
 * Update lifetime resources
 */
function updateLifetimeResources(spacecraft, mission) {
    const resources = gameState.resources.lifetime;
    
    const lifetimeData = calc.calculateLifetime(
        spacecraft,
        spacecraft.powerSystem,
        mission
    );
    
    resources.design = mission.duration;
    resources.actual = lifetimeData.actual;
    
    // Extract specific limiting factors
    lifetimeData.breakdown.forEach(item => {
        if (item.factor === 'power') {
            resources.powerLimited = item.days;
        } else if (item.factor === 'fuel') {
            resources.fuelLimited = item.days;
        }
    });
}

/**
 * Get resource summary for display
 */
export function getResourceSummary() {
    const res = gameState.resources;
    
    return {
        mass: {
            used: res.mass.used,
            available: res.mass.available,
            percentage: res.mass.available > 0 ? res.mass.used / res.mass.available : 0,
            status: res.mass.used <= res.mass.available ? 'ok' : 'exceeded'
        },
        power: {
            generated: res.power.generated,
            consumed: res.power.consumed,
            margin: res.power.margin,
            percentage: res.power.generated > 0 ? res.power.consumed / res.power.generated : 0,
            status: res.power.margin >= 0 ? 'ok' : 'exceeded'
        },
        budget: {
            spent: res.budget.spent,
            total: res.budget.total,
            remaining: res.budget.remaining,
            percentage: res.budget.spent / res.budget.total,
            status: res.budget.remaining >= 0 ? 'ok' : 'exceeded'
        },
        data: {
            generated: res.data.generated,
            capacity: res.data.transmissionCapacity,
            storageNeeded: res.data.storageRequired,
            percentage: res.data.transmissionCapacity > 0 
                ? res.data.generated / res.data.transmissionCapacity 
                : (res.data.generated > 0 ? 1.5 : 0),
            status: res.data.generated <= res.data.transmissionCapacity ? 'ok' : 'warning'
        },
        lifetime: {
            design: res.lifetime.design,
            actual: res.lifetime.actual,
            status: res.lifetime.actual >= res.lifetime.design ? 'ok' : 'warning'
        }
    };
}

/**
 * Check if resources are within limits
 */
export function checkResourceLimits() {
    const summary = getResourceSummary();
    const issues = [];
    
    if (summary.mass.status === 'exceeded') {
        issues.push({
            type: 'error',
            resource: 'mass',
            message: `Your spacecraft is too heavy: ${summary.mass.used.toFixed(0)} kg, but the limit is ${summary.mass.available.toFixed(0)} kg.`
        });
    }
    
    if (summary.power.status === 'exceeded') {
        issues.push({
            type: 'error',
            resource: 'power',
            message: `You're using more power than you make: ${summary.power.consumed.toFixed(0)} W used, only ${summary.power.generated.toFixed(0)} W generated.`
        });
    }
    
    if (summary.budget.status === 'exceeded') {
        issues.push({
            type: 'error',
            resource: 'budget',
            message: `You've gone over budget: spent $${(summary.budget.spent / 1e9).toFixed(2)}B of your $${(summary.budget.total / 1e9).toFixed(2)}B.`
        });
    }
    
    if (summary.data.status === 'warning') {
        issues.push({
            type: 'warning',
            resource: 'data',
            message: `Your instruments collect more data than you can send home each day. You'd need ${summary.data.storageNeeded.toFixed(1)} GB of onboard storage to keep up.`
        });
    }
    
    if (summary.lifetime.status === 'warning') {
        issues.push({
            type: 'warning',
            resource: 'lifetime',
            message: `Your spacecraft may not last the whole mission: it's rated for about ${summary.lifetime.actual} days, but the mission needs ${summary.lifetime.design} days.`
        });
    }
    
    return issues;
}

/**
 * Reset resources to initial state
 */
export function resetResources() {
    const res = gameState.resources;
    
    // Reset all to zero/defaults
    res.mass.used = 0;
    res.power.generated = 0;
    res.power.consumed = 0;
    res.power.margin = 0;
    res.budget.spent = 0;
    res.budget.remaining = res.budget.total;
    res.data.generated = 0;
    res.data.transmissionCapacity = 0;
    res.data.storageRequired = 0;
    
    console.log('✅ Resources reset');
}

export default {
    updateAllResources,
    getResourceSummary,
    checkResourceLimits,
    resetResources
};
