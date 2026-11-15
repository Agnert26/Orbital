// ================================
// ORBITAL - Central Game State
// Single source of truth for application state
// ================================

import { RESOURCE_LIMITS } from '../data/constants.js';

/**
 * Central game state object
 */
export const gameState = {
    // Current screen/phase
    currentPhase: 'mission-selection',
    
    // Selected mission
    selectedMission: null,
    
    // Spacecraft configuration
    spacecraft: {
        bus: null,
        powerSystem: null,
        propulsion: null,
        communications: null,
        instruments: []
    },
    
    // Resources
    resources: {
        // Mass (kg)
        mass: {
            used: 0,
            available: 0,  // Set by launch vehicle
            breakdown: {
                bus: 0,
                power: 0,
                propulsion: 0,
                propellant: 0,
                communications: 0,
                instruments: 0
            }
        },
        
        // Power (watts)
        power: {
            generated: 0,
            consumed: 0,
            margin: 0,
            breakdown: {
                bus: 0,
                propulsion: 0,
                communications: 0,
                instruments: 0
            }
        },
        
        // Budget (USD)
        budget: {
            total: RESOURCE_LIMITS.MAX_BUDGET,
            spent: 0,
            remaining: RESOURCE_LIMITS.MAX_BUDGET,
            breakdown: {
                bus: 0,
                power: 0,
                propulsion: 0,
                communications: 0,
                instruments: 0,
                launch: 0,
                operations: 0
            }
        },
        
        // Data (GB/day)
        data: {
            generated: 0,
            transmissionCapacity: 0,
            storageRequired: 0,
            breakdown: {
                instruments: {}
            }
        },
        
        // Communications
        communications: {
            dataRate: 0,        // GB/day
            maxDistance: 0,     // AU
            power: 0            // watts
        },
        
        // Mission lifetime (days)
        lifetime: {
            design: 0,
            powerLimited: 0,
            fuelLimited: 0,
            actual: 0
        }
    },
    
    // Validation state
    validation: {
        isValid: false,
        errors: [],
        warnings: []
    },
    
    // Simulation results (after simulation runs)
    simulation: {
        completed: false,
        success: false,
        currentPhaseIndex: 0,   // 0=launch, 1=transit, 2=arrival, 3=science_ops, 4=data_return
        phaseData: {
            massMarginAtLaunch: null,
            deltaVMarginAtTransit: null,
            deltaVMarginAtArrival: null,
            powerMarginEffective: null,
            daysAdjusted: 0,
            dataOverflow: false,
            degradedArrival: false,
            structuralCheckPerformed: false,
            riskAccepted_launchStress: false,
            fastCorrectionChosen: false
        },
        log: [],              // [{ phase, type: 'info'|'warning'|'error', message }]
        objectiveResults: [], // [{ objective, type, status: 'achieved'|'partial'|'missed', reason }]
        results: null
    },
    
    // Score (after mission evaluation)
    score: {
        total: 0,
        breakdown: {}
    }
};

/**
 * Get current game state
 */
export function getState() {
    return gameState;
}

/**
 * Set selected mission
 */
export function setSelectedMission(mission) {
    // Bug fix (Phase 6 QA): if the player is switching to a genuinely
    // different mission than before, clear any in-progress spacecraft
    // configuration. Without this, components picked for a previous
    // mission (which may not even be suitable for the new one) would
    // silently remain in gameState.spacecraft — not shown as selected
    // on the builder screen, but still counted in resource totals and
    // still satisfying the "all components selected" check. Re-selecting
    // the SAME mission (e.g. re-reading its briefing) does not clear
    // anything, so in-progress work on that mission is preserved.
    if (gameState.selectedMission && gameState.selectedMission.id !== mission.id) {
        clearSpacecraftConfig();
    }
    gameState.selectedMission = mission;
    gameState.currentPhase = 'spacecraft-builder';
}

/**
 * Update spacecraft component
 */
export function updateSpacecraftComponent(category, component) {
    if (category === 'instrument') {
        // Instruments are an array
        if (!gameState.spacecraft.instruments.includes(component)) {
            gameState.spacecraft.instruments.push(component);
        }
    } else {
        // Other components are single selections
        gameState.spacecraft[category] = component;
    }
}

/**
 * Remove instrument
 */
export function removeInstrument(instrumentId) {
    gameState.spacecraft.instruments = gameState.spacecraft.instruments.filter(
        inst => inst.id !== instrumentId
    );
}

/**
 * Clear spacecraft configuration
 */
export function clearSpacecraftConfig() {
    gameState.spacecraft = {
        bus: null,
        powerSystem: null,
        propulsion: null,
        communications: null,
        instruments: []
    };
}

/**
 * Reset game state to initial
 */
export function resetGameState() {
    gameState.currentPhase = 'mission-selection';
    gameState.selectedMission = null;
    clearSpacecraftConfig();
    
    // Reset resources
    gameState.resources.budget.spent = 0;
    gameState.resources.budget.remaining = gameState.resources.budget.total;
    
    // Reset validation
    gameState.validation = {
        isValid: false,
        errors: [],
        warnings: []
    };
    
    // Reset simulation
    initSimulationState();
    
    // Reset score
    gameState.score = {
        total: 0,
        breakdown: {}
    };
}

/**
 * Update validation state
 */
export function setValidationState(isValid, errors = [], warnings = []) {
    gameState.validation = {
        isValid,
        errors,
        warnings
    };
}

/**
 * Update simulation results
 */
export function setSimulationResults(success, results) {
    gameState.simulation.completed = true;
    gameState.simulation.success = success;
    gameState.simulation.results = results;
}

/**
 * Reset simulation state to defaults, ready for a new run.
 * Does NOT touch gameState.spacecraft — callers decide separately
 * whether to preserve or clear the spacecraft configuration.
 */
export function initSimulationState() {
    gameState.simulation = {
        completed: false,
        success: false,
        currentPhaseIndex: 0,
        phaseData: {
            massMarginAtLaunch: null,
            deltaVMarginAtTransit: null,
            deltaVMarginAtArrival: null,
            powerMarginEffective: null,
            daysAdjusted: 0,
            dataOverflow: false,
            degradedArrival: false,
            structuralCheckPerformed: false,
            riskAccepted_launchStress: false,
            fastCorrectionChosen: false
        },
        log: [],
        objectiveResults: [],
        results: null
    };
}

/**
 * Append an entry to the running mission log.
 */
export function appendSimulationLog(entry) {
    gameState.simulation.log.push(entry);
}

/**
 * Record a finalized objective result.
 */
export function recordObjectiveResult(entry) {
    gameState.simulation.objectiveResults.push(entry);
}

/**
 * Update score
 */
export function setScore(total, breakdown) {
    gameState.score = {
        total,
        breakdown
    };
}

export default {
    gameState,
    getState,
    setSelectedMission,
    updateSpacecraftComponent,
    removeInstrument,
    clearSpacecraftConfig,
    resetGameState,
    setValidationState,
    setSimulationResults,
    setScore,
    initSimulationState,
    appendSimulationLog,
    recordObjectiveResult
};
