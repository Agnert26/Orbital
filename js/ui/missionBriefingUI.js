// ================================
// ORBITAL - Mission Briefing UI
// Educational mission context before spacecraft building
// ================================

import { gameState, setSelectedMission } from '../core/gameState.js';
import { PHYSICS } from '../data/constants.js';
import { formatCurrency } from '../utils/formatters.js';
import { showMissionBriefing as showBriefingScreen, showMissionSelection } from './screenManager.js';
import { renderContextualTip } from './contextualTipUI.js';

/**
 * Show mission briefing screen
 */
export function showMissionBriefing(mission) {
    console.log('📋 Showing mission briefing for:', mission.name);
    
    // Set selected mission
    setSelectedMission(mission);
    
    // Use centralized screen manager
    showBriefingScreen();
    
    // Render briefing content
    renderBriefingContent(mission);
    
    // Contextual tip for this screen
    renderContextualTip('missionBriefing', document.querySelector('.mission-briefing .glass-panel'));
    
    // Real NASA/JPL data (asteroid mission only) — fire-and-forget, never
    // blocks or alters the rest of the briefing/game if it fails.
    if (mission.id === 'asteroid') {
        loadRealAsteroidData();
    }
}

/**
 * Fetch real Bennu data from the official NASA/JPL Small-Body Database API
 * and render it into the #real-asteroid-data placeholder. Read-only,
 * display-only — never touches mission logic, scoring, or validation.
 */
async function loadRealAsteroidData() {
    const target = document.getElementById('real-asteroid-data');
    if (!target) return;
    
    const SBDB_URL = 'https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=Bennu&phys-par=1';
    const SBDB_DOC_URL = 'https://ssd-api.jpl.nasa.gov/doc/sbdb.html';
    
    try {
        const response = await fetch(SBDB_URL);
        if (!response.ok) {
            throw new Error(`NASA/JPL API returned HTTP ${response.status}`);
        }
        const data = await response.json();
        
        // Guard again in case the player navigated away before this resolved
        const stillPresent = document.getElementById('real-asteroid-data');
        if (!stillPresent) return;
        
        renderRealAsteroidData(stillPresent, data, SBDB_DOC_URL);
    } catch (error) {
        console.warn('⚠️ Could not load live NASA/JPL asteroid data:', error);
        const stillPresent = document.getElementById('real-asteroid-data');
        if (stillPresent) {
            stillPresent.innerHTML = `
                <p class="nasa-data-error">
                    ⚠️ Couldn't reach the NASA/JPL Small-Body Database right now.
                    This is a live external API, so it can be temporarily unavailable
                    or blocked by network restrictions. The rest of the game is
                    unaffected — you can continue your mission normally.
                </p>
            `;
        }
    }
}

/**
 * Find a named entry in an SBDB elements/phys_par array.
 */
function findSbdbField(list, name) {
    if (!Array.isArray(list)) return null;
    return list.find(item => item.name === name) || null;
}

/**
 * Render the fetched SBDB data. Only shows fields the API actually
 * returned — never invents or fills in missing values.
 */
function renderRealAsteroidData(target, data, docUrl) {
    const obj = data.object || {};
    const orbitElements = (data.orbit && data.orbit.elements) || [];
    const physParams = data.phys_par || [];
    
    const semiMajorAxis = findSbdbField(orbitElements, 'a');
    const eccentricity = findSbdbField(orbitElements, 'e');
    const diameter = findSbdbField(physParams, 'diameter');
    
    const rows = [];
    rows.push(`<li><strong>Name:</strong> ${obj.fullname || 'Bennu'}</li>`);
    if (obj.orbit_class && obj.orbit_class.name) {
        rows.push(`<li><strong>Orbit classification:</strong> ${obj.orbit_class.name} (${obj.orbit_class.code || ''})</li>`);
    }
    if (semiMajorAxis) {
        rows.push(`<li><strong>Semi-major axis:</strong> ${semiMajorAxis.value} ${semiMajorAxis.units || ''}</li>`);
    }
    if (eccentricity) {
        rows.push(`<li><strong>Eccentricity:</strong> ${eccentricity.value}</li>`);
    }
    if (diameter) {
        rows.push(`<li><strong>Diameter:</strong> ${diameter.value} ${diameter.units || ''}</li>`);
    } else {
        rows.push(`<li><em>Diameter not provided by the API for this query.</em></li>`);
    }
    
    target.innerHTML = `
        <p class="nasa-data-intro">This is real data about the asteroid Bennu, fetched live from NASA/JPL — not part of the game's invented mission numbers.</p>
        <ul class="nasa-data-list">${rows.join('')}</ul>
        <p class="nasa-data-attribution">
            Data source: <a href="${docUrl}" target="_blank" rel="noopener noreferrer">NASA/JPL Small-Body Database (SBDB)</a>
        </p>
    `;
}

/**
 * Render mission briefing content
 */
function renderBriefingContent(mission) {
    const container = document.getElementById('briefing-content');
    if (!container) return;
    
    // Get technical requirements
    const deltaV = PHYSICS.DELTA_V[mission.id] || 0;
    const commRange = PHYSICS.DISTANCES[mission.id] || 0;
    
    // Difficulty indicator
    const difficultyBars = getDifficultyBars(mission.difficulty);
    
    // Build briefing HTML
    container.innerHTML = `
        <div class="briefing-header">
            <div class="briefing-mission-icon">${mission.icon}</div>
            <div class="briefing-title-section">
                <h2 class="briefing-mission-title">${mission.name}</h2>
                <div class="briefing-difficulty">
                    <span class="difficulty-label">Mission Difficulty:</span>
                    <div class="difficulty-bars">${difficultyBars}</div>
                    <span class="difficulty-text">${mission.difficulty}</span>
                </div>
            </div>
        </div>

        <div class="briefing-section">
            <h3 class="briefing-section-title">📖 Mission Scenario</h3>
            <div class="briefing-scenario">
                <p>${mission.description}</p>
                ${getScenarioExplanation(mission.id)}
            </div>
        </div>

        ${mission.id === 'asteroid' ? `
        <div class="briefing-section">
            <h3 class="briefing-section-title">🛰️ Real Asteroid Data (NASA/JPL)</h3>
            <div id="real-asteroid-data" class="real-asteroid-data">
                <p class="nasa-data-loading">Loading real data from NASA/JPL...</p>
            </div>
        </div>
        ` : ''}

        <div class="briefing-section">
            <h3 class="briefing-section-title">🎯 Your Mission Objectives</h3>
            <div class="briefing-objectives">
                <p class="objectives-intro">Your spacecraft must accomplish these goals:</p>
                <ul class="objectives-list">
                    ${mission.objectives.map(obj => `<li class="objective-item">✓ ${obj}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="briefing-section">
            <h3 class="briefing-section-title">🔧 Technical Requirements</h3>
            <div class="briefing-requirements">
                <p class="requirements-intro">Your spacecraft must meet these specifications:</p>
                
                <div class="requirement-cards">
                    ${deltaV > 0 ? `
                    <div class="requirement-card">
                        <div class="requirement-icon">🚀</div>
                        <div class="requirement-content">
                            <div class="requirement-label">Fuel Power for Maneuvering (Delta-v)</div>
                            <div class="requirement-value">${deltaV.toLocaleString()} m/s</div>
                            <div class="requirement-explanation">
                                "Delta-v" means how much your spacecraft can change its speed and direction. Your spacecraft needs enough of it to ${getDeltaVExplanation(mission.id)}
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${commRange >= 0 ? `
                    <div class="requirement-card">
                        <div class="requirement-icon">📡</div>
                        <div class="requirement-content">
                            <div class="requirement-label">How Far Your Antenna Must Reach</div>
                            <div class="requirement-value">${commRange > 0 ? commRange + ' AU (a space-distance unit)' : 'Earth Orbit'}</div>
                            <div class="requirement-explanation">
                                ${getCommunicationsExplanation(mission.id)}
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="requirement-card">
                        <div class="requirement-icon">⚡</div>
                        <div class="requirement-content">
                            <div class="requirement-label">Power Generation</div>
                            <div class="requirement-value">${mission.requirements.power.toLocaleString()} watts minimum</div>
                            <div class="requirement-explanation">
                                Enough electricity to run the spacecraft systems and science instruments continuously.
                            </div>
                        </div>
                    </div>
                    
                    <div class="requirement-card">
                        <div class="requirement-icon">💰</div>
                        <div class="requirement-content">
                            <div class="requirement-label">Available Budget</div>
                            <div class="requirement-value">${formatCurrency(mission.requirements.budget)}</div>
                            <div class="requirement-explanation">
                                Total funds available for spacecraft design, components, and instruments.
                            </div>
                        </div>
                    </div>
                    
                    <div class="requirement-card">
                        <div class="requirement-icon">⏱️</div>
                        <div class="requirement-content">
                            <div class="requirement-label">Mission Duration</div>
                            <div class="requirement-value">${mission.duration} days</div>
                            <div class="requirement-explanation">
                                ${getMissionDurationExplanation(mission.id, mission.duration)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="requirement-card">
                        <div class="requirement-icon">⚖️</div>
                        <div class="requirement-content">
                            <div class="requirement-label">Mass Limit</div>
                            <div class="requirement-value">${mission.requirements.mass.toLocaleString()} kg maximum</div>
                            <div class="requirement-explanation">
                                Your spacecraft and all equipment must fit within this weight limit.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="briefing-section">
            <h3 class="briefing-section-title">✅ Success Criteria</h3>
            <div class="briefing-success">
                <p>To complete this mission successfully, you must:</p>
                <ul class="success-list">
                    <li>✓ Build a spacecraft that meets all technical requirements</li>
                    <li>✓ Select scientific instruments that can accomplish the mission objectives</li>
                    <li>✓ Stay within the allocated budget</li>
                    <li>✓ Ensure your spacecraft can survive for the full mission duration</li>
                </ul>
                ${getSuccessAdvice(mission.id)}
            </div>
        </div>

        <div class="briefing-actions">
            <button class="secondary-btn" onclick="window.returnToMissionSelection()">
                <span>← Back to Mission Selection</span>
            </button>
            <button class="primary-btn" onclick="window.beginSpacecraftDesign()">
                <span>Begin Spacecraft Design →</span>
            </button>
        </div>
    `;
}

/**
 * Get difficulty bar visualization
 */
function getDifficultyBars(difficulty) {
    const levels = {
        'Easy': 1,
        'Medium': 2,
        'High': 3,
        'Extreme': 4
    };
    
    const level = levels[difficulty] || 2;
    let bars = '';
    
    for (let i = 0; i < 5; i++) {
        bars += `<span class="difficulty-bar ${i < level ? 'filled' : ''}"></span>`;
    }
    
    return bars;
}

/**
 * Get scenario explanation based on mission
 */
function getScenarioExplanation(missionId) {
    const explanations = {
        earth: `
            <p class="scenario-context">
                <strong>Why this matters:</strong> Earth observation satellites help scientists track climate change, 
                predict natural disasters, and monitor environmental conditions across our planet. Your satellite 
                will be one of many working together to protect Earth and its inhabitants.
            </p>
        `,
        mars: `
            <p class="scenario-context">
                <strong>Why this matters:</strong> Mars is humanity's next frontier. Understanding the Red Planet's 
                geology, atmosphere, and potential for past life is crucial for future human exploration. Your 
                spacecraft will help answer fundamental questions about Mars and our solar system.
            </p>
        `,
        asteroid: `
            <p class="scenario-context">
                <strong>Why this matters:</strong> Near-Earth asteroids contain valuable resources and pose potential 
                threats to our planet. Your mission will help us understand their composition, test deflection 
                technologies, and pave the way for asteroid mining operations.
            </p>
        `
    };
    
    return explanations[missionId] || '';
}

/**
 * Get delta-v explanation based on mission
 */
function getDeltaVExplanation(missionId) {
    const explanations = {
        earth: 'reach and maintain your Earth orbit, making small adjustments as needed.',
        mars: 'travel from Earth to Mars, enter Mars orbit, and make course corrections.',
        asteroid: 'rendezvous with a fast-moving asteroid and match its trajectory precisely.'
    };
    
    return explanations[missionId] || 'complete the mission maneuvers.';
}

/**
 * Get communications explanation
 */
function getCommunicationsExplanation(missionId) {
    const explanations = {
        earth: 'Your satellite orbits Earth, so even a basic antenna can transmit data to ground stations below.',
        mars: 'Mars can be as far as 2.5 AU from Earth. You need an antenna powerful enough to send data across this vast distance.',
        asteroid: 'Near-Earth asteroids are typically around 1.0 AU away. Your antenna must maintain contact with Earth throughout the mission.'
    };
    
    return explanations[missionId] || 'Maintain communications with mission control on Earth.';
}

/**
 * Get mission duration explanation
 */
function getMissionDurationExplanation(missionId, duration) {
    const explanations = {
        earth: `About ${Math.round(duration / 365)} year${duration > 365 ? 's' : ''} of continuous Earth monitoring and data collection.`,
        mars: `One complete Martian year - the time needed for comprehensive surface and atmosphere studies.`,
        asteroid: `About ${Math.round(duration / 30)} months to travel to the asteroid, study it, and return data.`
    };
    
    return explanations[missionId] || `${duration} days of mission operations.`;
}

/**
 * Get mission-specific success advice
 */
function getSuccessAdvice(missionId) {
    const advice = {
        earth: `
            <div class="success-tip">
                <strong>💡 Tip for Earth Missions:</strong> Focus on selecting instruments that can collect 
                high-resolution data about Earth's surface, atmosphere, and oceans. Earth observation missions 
                require good data transmission capabilities.
            </div>
        `,
        mars: `
            <div class="success-tip">
                <strong>💡 Tip for Mars Missions:</strong> You'll need strong propulsion to reach Mars and 
                instruments capable of analyzing rocks, atmosphere, and searching for signs of life. Don't 
                forget - communications with Mars take several minutes even at light speed!
            </div>
        `,
        asteroid: `
            <div class="success-tip">
                <strong>💡 Tip for Asteroid Missions:</strong> Asteroids move fast! You'll need efficient 
                propulsion (like an Ion Drive) to match their speed. Choose instruments that can analyze 
                composition and test deflection technologies.
            </div>
        `
    };
    
    return advice[missionId] || '';
}

/**
 * Return to mission selection
 */
export function returnToMissionSelection() {
    // Use centralized screen manager
    showMissionSelection();
    
    // Clear selected mission from cards
    document.querySelectorAll('.mission-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset mission overview panel
    const statusMessage = document.querySelector('.status-message');
    const missionDetails = document.querySelector('.mission-details');
    if (statusMessage) statusMessage.style.display = 'block';
    if (missionDetails) missionDetails.style.display = 'none';
}

/**
 * Begin spacecraft design
 */
export function beginSpacecraftDesign() {
    // Trigger the spacecraft builder
    const event = new CustomEvent('openSpacecraftBuilder', { 
        detail: { missionId: gameState.selectedMission.id } 
    });
    window.dispatchEvent(event);
}

// Export functions to window for button onclick handlers
window.returnToMissionSelection = returnToMissionSelection;
window.beginSpacecraftDesign = beginSpacecraftDesign;

export default {
    showMissionBriefing,
    returnToMissionSelection,
    beginSpacecraftDesign
};
