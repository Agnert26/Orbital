// ================================
// ORBITAL - Screen Manager
// Centralized screen navigation system
// ================================

/**
 * All manageable screens in the application
 */
const SCREENS = {
    WELCOME: 'welcome-section',
    MISSION_SELECTION: 'mission-selection',
    DASHBOARD: 'dashboard-section',
    MISSION_BRIEFING: 'mission-briefing',
    SPACECRAFT_BUILDER: 'spacecraft-builder',
    INSTRUMENT_SELECTION: 'instrument-selection',
    MISSION_SIMULATION: 'mission-simulation',
    MISSION_RESULTS: 'mission-results'
};

/**
 * Show a specific screen and hide all others
 * @param {string} screenId - The ID of the screen to show (without dot prefix)
 */
export function showScreen(screenId) {
    console.log(`📺 Screen Manager: Showing ${screenId}`);
    
    // Hide all screens
    Object.values(SCREENS).forEach(id => {
        const screen = document.querySelector(`.${id}`);
        if (screen) {
            screen.style.display = 'none';
        }
    });
    
    // Show target screen
    const targetScreen = document.querySelector(`.${screenId}`);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        console.log(`  ✅ ${screenId} now visible`);
    } else {
        console.error(`  ❌ Screen not found: ${screenId}`);
    }
}

/**
 * Hide all screens
 */
export function hideAllScreens() {
    console.log('📺 Screen Manager: Hiding all screens');
    
    Object.values(SCREENS).forEach(id => {
        const screen = document.querySelector(`.${id}`);
        if (screen) {
            screen.style.display = 'none';
        }
    });
}

/**
 * Show welcome screen (initial state)
 */
export function showWelcome() {
    showScreen(SCREENS.WELCOME);
    // Also show mission selection below it initially
    document.querySelector('.mission-selection').style.display = 'block';
    document.querySelector('.dashboard-section').style.display = 'block';
}

/**
 * Show mission selection with dashboard
 */
export function showMissionSelection() {
    hideAllScreens();
    document.querySelector('.mission-selection').style.display = 'block';
    document.querySelector('.dashboard-section').style.display = 'block';
}

/**
 * Show mission briefing (hides everything else)
 */
export function showMissionBriefing() {
    showScreen(SCREENS.MISSION_BRIEFING);
}

/**
 * Show spacecraft builder (hides everything else)
 */
export function showSpacecraftBuilder() {
    showScreen(SCREENS.SPACECRAFT_BUILDER);
}

/**
 * Show instrument selection (hides everything else)
 */
export function showInstrumentSelection() {
    showScreen(SCREENS.INSTRUMENT_SELECTION);
}

/**
 * Show mission simulation (hides everything else)
 */
export function showMissionSimulation() {
    showScreen(SCREENS.MISSION_SIMULATION);
}

/**
 * Show mission results (hides everything else)
 */
export function showMissionResults() {
    showScreen(SCREENS.MISSION_RESULTS);
}

/**
 * Scroll to a section smoothly
 */
export function scrollToSection(selector) {
    const section = document.querySelector(selector);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

export default {
    SCREENS,
    showScreen,
    hideAllScreens,
    showWelcome,
    showMissionSelection,
    showMissionBriefing,
    showSpacecraftBuilder,
    showInstrumentSelection,
    showMissionSimulation,
    showMissionResults,
    scrollToSection
};
