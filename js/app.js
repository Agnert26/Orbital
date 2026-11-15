// ================================
// ORBITAL - Main Application Entry
// ES Module initialization
// ================================

import { gameState, setSelectedMission } from './core/gameState.js';
import { saveGame, loadGame, hasSavedGame } from './core/storage.js';
import { missions, getMission } from './data/missions.js';
import { spacecraftBuses, powerSystems, propulsionSystems, communicationsSystems, instruments } from './data/spacecraft.js';
import { updateAllResources, getResourceSummary } from './managers/resourceManager.js';
import { validateMission, getValidationSummary } from './engines/validationEngine.js';
import { formatCurrency, formatMass, formatPower, formatDataRate } from './utils/formatters.js';
import { initResourceUI } from './ui/resourceUI.js';
import { initSpacecraftBuilder } from './ui/spacecraftUI.js';
import { showMissionBriefing } from './ui/missionBriefingUI.js';
import { initMissionSelectionUI } from './ui/missionSelectionUI.js';
import { initNavigationUI } from './ui/navigationUI.js';
import { showWelcome } from './ui/screenManager.js';
import { initTutorialUI } from './ui/tutorialUI.js';

/**
 * Lazily load the simulation engine, only when a mission is actually
 * started. Cached after the first load so repeated calls (e.g. multiple
 * ORBITAL.testSimulation() runs) reuse the same module instance instead
 * of re-importing it.
 */
let simulationEnginePromise = null;
function loadSimulationEngine() {
    if (!simulationEnginePromise) {
        simulationEnginePromise = import('./engines/simulationEngine.js');
    }
    return simulationEnginePromise;
}

/**
 * Initialize the modular game system
 */
function init() {
    console.log('%c🛰️ ORBITAL - Modular System Initialized', 'font-size: 16px; font-weight: bold; color: #00d9ff;');
    console.log('%cPhase 1: Core Architecture & Resource Management', 'color: #b8c5d6;');
    console.log('%cPhase 2: Spacecraft Builder & Instruments', 'color: #b8c5d6;');
    console.log('%cPhase 0: Foundation Stabilization', 'color: #00ff88;');
    console.log('-----------------------------------');
    
    // Initialize UI modules
    initResourceUI();
    initMissionSelectionUI();
    initNavigationUI();
    initTutorialUI();
    
    // Setup spacecraft builder trigger
    setupSpacecraftBuilderTrigger();
    
    // Show initial screens (welcome + mission selection + dashboard)
    showWelcome();
    
    // Check for saved game
    if (hasSavedGame()) {
        console.log('💾 Saved game detected');
    }
    
    // Display available missions
    console.log('📋 Available Missions:', Object.keys(missions).length);
    Object.values(missions).forEach(mission => {
        console.log(`  - ${mission.icon} ${mission.name} (${mission.difficulty})`);
    });
    
    // Display game state
    console.log('🎮 Game State initialized');
    console.log('  - Current Phase:', gameState.currentPhase);
    console.log('  - Budget Available:', formatCurrency(gameState.resources.budget.total));
    
    console.log('-----------------------------------');
    console.log('✅ All systems operational');
    console.log('');
    console.log('💡 Try these commands in the console:');
    console.log('  ORBITAL.testMissionSelection("mars")');
    console.log('  ORBITAL.testResourceCalculation()');
    console.log('  ORBITAL.testSimulation("earth")');
    console.log('  ORBITAL.getGameState()');
    console.log('  ORBITAL.saveGame()');
}

/**
 * Setup spacecraft builder trigger from mission selection
 */
function setupSpacecraftBuilderTrigger() {
    // Listen for mission briefing event
    window.addEventListener('showMissionBriefing', (event) => {
        const missionId = event.detail.missionId;
        console.log('📋 Opening mission briefing for:', missionId);
        
        const mission = getMission(missionId);
        
        if (!mission) {
            console.error('❌ Mission not found:', missionId);
            return;
        }
        
        // Show mission briefing
        showMissionBriefing(mission);
    });
    
    // Listen for spacecraft builder event (from briefing screen)
    window.addEventListener('openSpacecraftBuilder', (event) => {
        const missionId = event.detail.missionId;
        console.log('🛰️ Opening spacecraft builder for mission:', missionId);
        
        // Get mission from Phase 1 data
        const mission = getMission(missionId);
        if (!mission) {
            console.error('Mission not found:', missionId);
            return;
        }
        
        // Set selected mission in Phase 2 game state
        setSelectedMission(mission);
        
        // Initialize the builder
        initSpacecraftBuilder();
    });
    
    console.log('✅ Mission briefing and spacecraft builder triggers ready');
}

/**
 * Test mission selection
 */
function testMissionSelection(missionId) {
    console.log(`\n🎯 Testing Mission Selection: ${missionId}`);
    
    const mission = getMission(missionId);
    if (!mission) {
        console.error('❌ Mission not found');
        return;
    }
    
    setSelectedMission(mission);
    console.log('✅ Mission selected:', mission.name);
    console.log('  - Duration:', mission.duration, 'days');
    console.log('  - Difficulty:', mission.difficulty);
    console.log('  - Budget Required:', formatCurrency(mission.requirements.budget));
    console.log('  - Mass Required:', formatMass(mission.requirements.mass));
    console.log('  - Power Required:', formatPower(mission.requirements.power));
    
    return mission;
}

/**
 * Test resource calculation
 */
function testResourceCalculation() {
    console.log('\n📊 Testing Resource Calculation');
    
    if (!gameState.selectedMission) {
        console.warn('⚠️ Select a mission first using ORBITAL.testMissionSelection("mars")');
        return;
    }
    
    // Add some test components (already imported at top)
    gameState.spacecraft.bus = spacecraftBuses.large;
    gameState.spacecraft.powerSystem = powerSystems.solar_medium;
    gameState.spacecraft.propulsion = propulsionSystems.chemical_large;
    gameState.spacecraft.communications = communicationsSystems.medium_gain;
    
    console.log('📦 Test configuration loaded');
    
    // Update resources
    updateAllResources();
    
    // Display summary
    const summary = getResourceSummary();
    
    console.log('\n💰 Budget:');
    console.log('  - Spent:', formatCurrency(summary.budget.spent));
    console.log('  - Remaining:', formatCurrency(summary.budget.remaining));
    console.log('  - Status:', summary.budget.status);
    
    console.log('\n⚖️ Mass:');
    console.log('  - Used:', formatMass(summary.mass.used));
    console.log('  - Available:', formatMass(summary.mass.available));
    console.log('  - Status:', summary.mass.status);
    
    console.log('\n⚡ Power:');
    console.log('  - Generated:', formatPower(summary.power.generated));
    console.log('  - Consumed:', formatPower(summary.power.consumed));
    console.log('  - Margin:', formatPower(summary.power.margin));
    console.log('  - Status:', summary.power.status);
    
    console.log('\n📡 Data:');
    console.log('  - Generated:', formatDataRate(summary.data.generated));
    console.log('  - Capacity:', formatDataRate(summary.data.capacity));
    console.log('  - Status:', summary.data.status);
    
    return summary;
}

/**
 * Test validation
 */
function testValidation() {
    console.log('\n✓ Testing Validation Engine');
    
    if (!gameState.selectedMission) {
        console.warn('⚠️ Select a mission first');
        return;
    }
    
    const result = validateMission();
    const summary = getValidationSummary();
    
    console.log(`\nValidation Result: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`  - Errors: ${summary.errorCount}`);
    console.log(`  - Warnings: ${summary.warningCount}`);
    
    if (summary.errorCount > 0) {
        console.log('\n❌ Errors:');
        summary.errors.forEach(error => console.log('  -', error));
    }
    
    if (summary.warningCount > 0) {
        console.log('\n⚠️ Warnings:');
        summary.warnings.forEach(warning => console.log('  -', warning));
    }
    
    return result;
}

/**
 * Test the full mission simulation headlessly, auto-driving every
 * decision to its first option, and logging each phase + final score.
 * Does not touch the UI. Mirrors the existing testResourceCalculation()
 * pattern of building a sample spacecraft config directly.
 */
async function testSimulation(missionId = 'earth') {
    console.log(`\n🎬 Testing Mission Simulation: ${missionId}`);

    const { startSimulation, submitDecision, continuePhase, computeFinalResults } = await loadSimulationEngine();

    const mission = getMission(missionId);
    if (!mission) {
        console.error('❌ Mission not found');
        return;
    }
    setSelectedMission(mission);

    // Sample spacecraft config suitable for the chosen mission
    const bus = Object.values(spacecraftBuses).find(b => b.suitableFor.includes(missionId));
    const power = Object.values(powerSystems).find(p => p.suitableFor.includes(missionId));
    const propulsion = Object.values(propulsionSystems).find(p => p.suitableFor.includes(missionId));
    const comms = Object.values(communicationsSystems).find(c => c.suitableFor.includes(missionId));

    gameState.spacecraft.bus = bus;
    gameState.spacecraft.powerSystem = power;
    gameState.spacecraft.propulsion = propulsion;
    gameState.spacecraft.communications = comms;
    gameState.spacecraft.instruments = Object.values(instruments).filter(i => i.suitableFor.includes(missionId)).slice(0, 3);

    console.log('📦 Sample configuration:', {
        bus: bus?.name, power: power?.name, propulsion: propulsion?.name, comms: comms?.name,
        instruments: gameState.spacecraft.instruments.map(i => i.name)
    });

    updateAllResources();

    let view = startSimulation();
    let guard = 0;
    while (view && guard < 20) {
        guard += 1;
        console.log(`\n--- Phase: ${view.phase} ---`);
        console.log('Narrative:', view.narrative);
        if (view.status && view.status.length) console.log('Status:', view.status);
        if (view.decision) {
            const choice = view.decision.options[0];
            console.log(`Decision "${view.decision.prompt}" → auto-choosing: ${choice.label}`);
            view = submitDecision(view.decision.id, choice.id);
        } else if (view.isLastPhase) {
            console.log('Reached final phase. Computing results...');
            const results = computeFinalResults();
            console.log('\n🏆 FINAL RESULTS');
            console.log('Grade:', results.grade, '| Overall:', results.overall.toFixed(1));
            console.log('Objective results:', results.objectiveResults);
            console.log('Score breakdown:', gameState.score.breakdown);
            return results;
        } else {
            view = continuePhase();
        }
    }
    console.warn('⚠️ testSimulation loop ended without reaching final results (guard limit or null view)');
    return null;
}

/**
 * Get current game state
 */
function getGameStateInfo() {
    console.log('\n🎮 Current Game State:');
    console.log('  - Phase:', gameState.currentPhase);
    console.log('  - Mission:', gameState.selectedMission?.name || 'None');
    console.log('  - Bus:', gameState.spacecraft.bus?.name || 'None');
    console.log('  - Power System:', gameState.spacecraft.powerSystem?.name || 'None');
    console.log('  - Propulsion:', gameState.spacecraft.propulsion?.name || 'None');
    console.log('  - Communications:', gameState.spacecraft.communications?.name || 'None');
    console.log('  - Instruments:', gameState.spacecraft.instruments.length);
    
    return gameState;
}

/**
 * Test save/load
 */
function testSave() {
    console.log('\n💾 Saving game...');
    const success = saveGame(gameState);
    if (success) {
        console.log('✅ Game saved successfully');
    }
    return success;
}

function testLoad() {
    console.log('\n📂 Loading game...');
    const loadedState = loadGame();
    if (loadedState) {
        console.log('✅ Game loaded successfully');
        console.log('  - Mission:', loadedState.selectedMission?.name || 'None');
    }
    return loadedState;
}

// Initialize on load
init();

// Export API for console testing
window.ORBITAL = {
    // State
    getGameState: getGameStateInfo,
    gameState,
    
    // Testing functions
    testMissionSelection,
    testResourceCalculation,
    testValidation,
    testSimulation,
    
    // Save/Load
    saveGame: testSave,
    loadGame: testLoad,
    
    // Managers
    updateResources: updateAllResources,
    getResourceSummary,
    validate: validateMission,
    
    // Utilities
    formatCurrency,
    formatMass,
    formatPower,
    formatDataRate
};

console.log('💡 ORBITAL API available via window.ORBITAL');
