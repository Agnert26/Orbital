// ================================
// ORBITAL - Validation Engine
// Validate mission configuration
// ================================

import { gameState, setValidationState } from '../core/gameState.js';
import { VALIDATION_THRESHOLDS } from '../data/constants.js';
import * as calc from '../utils/calculations.js';
import { checkResourceLimits } from '../managers/resourceManager.js';

/**
 * Validate complete mission configuration
 */
export function validateMission() {
    const errors = [];
    const warnings = [];
    
    // Check if mission is selected
    if (!gameState.selectedMission) {
        errors.push({
            category: 'mission',
            message: 'No mission selected'
        });
        setValidationState(false, errors, warnings);
        return { isValid: false, errors, warnings };
    }
    
    // Validate spacecraft components
    validateSpacecraftComponents(errors, warnings);
    
    // Validate resources
    validateResources(errors, warnings);
    
    // Validate margins
    validateMargins(errors, warnings);
    
    // Validate compatibility
    validateCompatibility(errors, warnings);
    
    // Determine if valid
    const isValid = errors.length === 0;
    
    // Update game state
    setValidationState(isValid, errors, warnings);
    
    console.log(`${isValid ? '✅' : '❌'} Validation: ${errors.length} errors, ${warnings.length} warnings`);
    
    return { isValid, errors, warnings };
}

/**
 * Validate spacecraft components are selected
 */
function validateSpacecraftComponents(errors, warnings) {
    const spacecraft = gameState.spacecraft;
    
    // Required components
    if (!spacecraft.bus) {
        errors.push({
            category: 'spacecraft',
            message: "You haven't chosen a spacecraft bus yet (the main body that holds everything together)."
        });
    }
    
    if (!spacecraft.powerSystem) {
        errors.push({
            category: 'spacecraft',
            message: "You haven't chosen a power system yet (what makes electricity for your spacecraft)."
        });
    }
    
    if (!spacecraft.propulsion) {
        errors.push({
            category: 'spacecraft',
            message: "You haven't chosen a propulsion system yet (what moves your spacecraft)."
        });
    }
    
    if (!spacecraft.communications) {
        errors.push({
            category: 'spacecraft',
            message: "You haven't chosen a communications antenna yet (what sends your data back to Earth)."
        });
    }
    
    // Instruments
    if (spacecraft.instruments.length < VALIDATION_THRESHOLDS.min_instruments) {
        errors.push({
            category: 'instruments',
            message: `You need at least ${VALIDATION_THRESHOLDS.min_instruments} scientific instrument to study your mission's goals.`
        });
    }
    
    if (spacecraft.instruments.length > VALIDATION_THRESHOLDS.max_instruments) {
        warnings.push({
            category: 'instruments',
            message: `Carrying more than ${VALIDATION_THRESHOLDS.max_instruments} instruments may be more than your spacecraft needs.`
        });
    }
    
    // Check bus capacity
    if (spacecraft.bus && spacecraft.instruments.length > spacecraft.bus.capacity.instruments) {
        errors.push({
            category: 'instruments',
            message: `Your spacecraft bus can only carry ${spacecraft.bus.capacity.instruments} instruments, but you've chosen ${spacecraft.instruments.length}.`
        });
    }
}

/**
 * Validate resource constraints
 */
function validateResources(errors, warnings) {
    const resourceIssues = checkResourceLimits();
    
    resourceIssues.forEach(issue => {
        if (issue.type === 'error') {
            errors.push({
                category: 'resources',
                message: issue.message
            });
        } else {
            warnings.push({
                category: 'resources',
                message: issue.message
            });
        }
    });
}

/**
 * Validate safety margins
 */
function validateMargins(errors, warnings) {
    const res = gameState.resources;
    const spacecraft = gameState.spacecraft;
    
    // Mass margin
    if (res.mass.available > 0) {
        const massMargin = calc.calculateMassMargin(res.mass.used, res.mass.available);
        
        if (massMargin < VALIDATION_THRESHOLDS.mass_margin) {
            warnings.push({
                category: 'margins',
                message: `Your weight safety margin is low (${(massMargin * 100).toFixed(1)}% spare). We recommend at least ${(VALIDATION_THRESHOLDS.mass_margin * 100)}%.`
            });
        }
    }
    
    // Power margin
    if (res.power.generated > 0) {
        const powerMargin = calc.calculatePowerMargin(res.power.generated, res.power.consumed);
        
        if (powerMargin < VALIDATION_THRESHOLDS.power_margin) {
            if (powerMargin < 0) {
                errors.push({
                    category: 'margins',
                    message: "Your spacecraft doesn't make enough power for everything aboard."
                });
            } else {
                warnings.push({
                    category: 'margins',
                    message: `Your power safety margin is low (${(powerMargin * 100).toFixed(1)}% spare). We recommend at least ${(VALIDATION_THRESHOLDS.power_margin * 100)}%.`
                });
            }
        }
    }
    
    // Budget margin
    const budgetMargin = (res.budget.total - res.budget.spent) / res.budget.total;
    
    if (budgetMargin < VALIDATION_THRESHOLDS.budget_margin) {
        warnings.push({
            category: 'margins',
            message: `You have very little budget left (${(budgetMargin * 100).toFixed(1)}%).`
        });
    }
}

/**
 * Validate component compatibility
 */
function validateCompatibility(errors, warnings) {
    const spacecraft = gameState.spacecraft;
    const mission = gameState.selectedMission;
    
    // Check if components are suitable for mission
    if (spacecraft.bus && !spacecraft.bus.suitableFor.includes(mission.id)) {
        warnings.push({
            category: 'compatibility',
            message: `The ${spacecraft.bus.name} isn't the best fit for a ${mission.name} mission.`
        });
    }
    
    if (spacecraft.powerSystem && !spacecraft.powerSystem.suitableFor.includes(mission.id)) {
        warnings.push({
            category: 'compatibility',
            message: `The ${spacecraft.powerSystem.name} isn't the best fit for a ${mission.name} mission.`
        });
    }
    
    if (spacecraft.propulsion && !spacecraft.propulsion.suitableFor.includes(mission.id)) {
        warnings.push({
            category: 'compatibility',
            message: `The ${spacecraft.propulsion.name} isn't the best fit for a ${mission.name} mission.`
        });
    }
    
    // Check delta-v requirement
    if (spacecraft.propulsion && !calc.checkDeltaV(spacecraft.propulsion, mission)) {
        errors.push({
            category: 'compatibility',
            message: "Your spacecraft doesn't have enough fuel power (delta-v — how much it can change speed and direction) to reach and maneuver at this destination."
        });
    }
    
    // Check communications range
    if (spacecraft.communications && !calc.checkCommunicationsRange(spacecraft.communications, mission)) {
        errors.push({
            category: 'compatibility',
            message: "Your antenna can't reach far enough to stay in contact at this mission's distance."
        });
    }
    
    // Check instrument compatibility
    spacecraft.instruments.forEach(inst => {
        if (!inst.suitableFor.includes(mission.id)) {
            warnings.push({
                category: 'compatibility',
                message: `The ${inst.name} isn't the best fit for a ${mission.name} mission.`
            });
        }
    });
    
    // Check science coverage
    const scienceScore = calc.calculateScienceScore(spacecraft.instruments, mission);
    if (scienceScore < 50) {
        warnings.push({
            category: 'science',
            message: `Your instruments only cover ${scienceScore.toFixed(0)}% of this mission's science goals. Try adding instruments that better match what this mission needs.`
        });
    }
}

/**
 * Quick validation check (returns boolean only)
 */
export function isValid() {
    return gameState.validation.isValid;
}

/**
 * Get validation errors
 */
export function getErrors() {
    return gameState.validation.errors;
}

/**
 * Get validation warnings
 */
export function getWarnings() {
    return gameState.validation.warnings;
}

/**
 * Get validation summary for display
 */
export function getValidationSummary() {
    const { isValid, errors, warnings } = gameState.validation;
    
    return {
        isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
        errors: errors.map(e => e.message),
        warnings: warnings.map(w => w.message),
        categories: {
            mission: errors.filter(e => e.category === 'mission').length,
            spacecraft: errors.filter(e => e.category === 'spacecraft').length,
            instruments: errors.filter(e => e.category === 'instruments').length,
            resources: errors.filter(e => e.category === 'resources').length,
            margins: errors.filter(e => e.category === 'margins').length,
            compatibility: errors.filter(e => e.category === 'compatibility').length
        }
    };
}

export default {
    validateMission,
    isValid,
    getErrors,
    getWarnings,
    getValidationSummary
};
