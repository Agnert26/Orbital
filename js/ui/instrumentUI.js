// ================================
// ORBITAL - Instrument Selection UI
// Scientific instrument management
// ================================

import { gameState, updateSpacecraftComponent, removeInstrument } from '../core/gameState.js';
import { instruments } from '../data/spacecraft.js';
import { updateAllResources, getResourceSummary } from '../managers/resourceManager.js';
import { validateMission, getValidationSummary } from '../engines/validationEngine.js';
import { updateResourceDisplay, showResourceError, showResourceSuccess, showResourceWarning } from './resourceUI.js';
import { formatCurrency, formatMass, formatPower, formatDataRate } from '../utils/formatters.js';
import { calculateScienceScore } from '../utils/calculations.js';
import { showInstrumentSelection as showInstrumentScreen } from './screenManager.js';
import { renderContextualTip } from './contextualTipUI.js';
import { getScienceFieldLabel } from '../data/glossary.js';

/**
 * Initialize instrument selection
 */
export function initInstrumentSelection() {
    const mission = gameState.selectedMission;
    if (!mission) {
        console.error('❌ No mission selected');
        return;
    }
    
    console.log('🔬 Initializing Instrument Selection for:', mission.name);
    
    // Use centralized screen manager
    showInstrumentScreen();
    console.log('✅ Instrument screen should now be visible');
    
    // Render available instruments
    renderAvailableInstruments();
    
    // Render selected instruments panel
    renderSelectedInstruments();
    
    // Setup validation panel
    setupValidationPanel();
    
    // Setup buttons
    setupInstrumentButtons();
    
    // Initial update
    updateAllResources();
    updateResourceDisplay();
    updateValidationDisplay();
    
    // Contextual tip for this screen
    renderContextualTip('instrumentSelection', document.querySelector('.instrument-selection .glass-panel'));
    
    console.log('✅ Instrument selection initialized');
}

/**
 * Render available instruments
 */
function renderAvailableInstruments() {
    const container = document.getElementById('available-instruments');
    if (!container) return;
    
    // Get instruments suitable for current mission
    const mission = gameState.selectedMission;
    const suitableInstruments = Object.values(instruments).filter(inst => 
        inst.suitableFor.includes(mission.id)
    );
    
    container.innerHTML = '<h3>Available Instruments (click to add)</h3>';
    
    const grid = document.createElement('div');
    grid.className = 'instrument-grid';
    
    suitableInstruments.forEach(instrument => {
        const card = createInstrumentCard(instrument);
        grid.appendChild(card);
    });
    
    container.appendChild(grid);
}

/**
 * Create instrument card
 */
function createInstrumentCard(instrument) {
    const card = document.createElement('div');
    card.className = 'instrument-card';
    card.dataset.instrumentId = instrument.id;
    
    // Check if already selected
    const isSelected = gameState.spacecraft.instruments.some(inst => inst.id === instrument.id);
    if (isSelected) {
        card.classList.add('selected');
    }
    
    // Get science value summary, shown in plain English (not raw data keys)
    const scienceFields = Object.keys(instrument.scienceValue || {});
    const scienceText = scienceFields.slice(0, 2).map(getScienceFieldLabel).join(', ');
    
    card.innerHTML = `
        <div class="instrument-icon">${getInstrumentIcon(instrument.id)}</div>
        <h4>${instrument.name}</h4>
        <p class="instrument-description">${instrument.description}</p>
        <div class="instrument-specs">
            <div class="spec-mini">
                <span>⚖️ ${formatMass(instrument.mass)}</span>
            </div>
            <div class="spec-mini">
                <span>⚡ ${formatPower(instrument.power)}</span>
            </div>
            <div class="spec-mini">
                <span>💰 ${formatCurrency(instrument.cost)}</span>
            </div>
            <div class="spec-mini">
                <span>📊 ${formatDataRate(instrument.dataRate)}</span>
            </div>
        </div>
        <div class="instrument-science">
            <small>Studies: ${scienceText}</small>
        </div>
        ${isSelected ? '<div class="instrument-selected-badge">✓ Added</div>' : ''}
    `;
    
    card.addEventListener('click', () => {
        toggleInstrument(instrument, card);
    });
    
    return card;
}

/**
 * Get instrument icon
 */
function getInstrumentIcon(instrumentId) {
    const icons = {
        camera_visible: '📷',
        camera_infrared: '🌡️',
        spectrometer: '🔬',
        radar: '📡',
        magnetometer: '🧲',
        drill: '⛏️',
        weather_station: '💨',
        lidar: '📏'
    };
    return icons[instrumentId] || '🔬';
}

/**
 * Toggle instrument selection
 */
function toggleInstrument(instrument, cardElement) {
    const isSelected = gameState.spacecraft.instruments.some(inst => inst.id === instrument.id);
    
    if (isSelected) {
        // Remove instrument
        removeInstrumentFromSpacecraft(instrument, cardElement);
    } else {
        // Add instrument
        addInstrumentToSpacecraft(instrument, cardElement);
    }
}

/**
 * Add instrument to spacecraft
 */
function addInstrumentToSpacecraft(instrument, cardElement) {
    // Check instrument count limit
    const maxInstruments = gameState.spacecraft.bus?.capacity.instruments || 8;
    if (gameState.spacecraft.instruments.length >= maxInstruments) {
        showResourceError(
            `Your spacecraft bus can only carry ${maxInstruments} instruments. ` +
            `Remove one before adding another.`
        );
        return;
    }
    
    // Check budget
    const currentBudget = gameState.resources.budget.spent;
    const newCost = currentBudget + instrument.cost;
    
    if (newCost > gameState.resources.budget.total) {
        const deficit = newCost - gameState.resources.budget.total;
        showResourceError(
            `Not enough budget! Adding this instrument would put you ${formatCurrency(deficit)} over.`
        );
        return;
    }
    
    // Check power
    const summary = getResourceSummary();
    const newPowerConsumption = summary.power.consumed + instrument.power;
    
    if (newPowerConsumption > summary.power.generated) {
        const deficit = newPowerConsumption - summary.power.generated;
        showResourceError(
            `Not enough power! This instrument needs ${formatPower(deficit)} more than you're making. ` +
            `Choose a stronger power system, or remove a power-hungry instrument.`
        );
        return;
    }
    
    // Add instrument
    updateSpacecraftComponent('instrument', instrument);
    
    // Update UI
    cardElement.classList.add('selected');
    const badge = document.createElement('div');
    badge.className = 'instrument-selected-badge';
    badge.textContent = '✓ Added';
    cardElement.appendChild(badge);
    
    // Update everything
    updateAllResources();
    updateResourceDisplay();
    renderSelectedInstruments();
    updateValidationDisplay();
    
    showResourceSuccess(`${instrument.name} added`);
    console.log(`✅ Added instrument: ${instrument.name}`);
}

/**
 * Remove instrument from spacecraft
 */
function removeInstrumentFromSpacecraft(instrument, cardElement) {
    // Remove from state
    removeInstrument(instrument.id);
    
    // Update UI
    cardElement.classList.remove('selected');
    const badge = cardElement.querySelector('.instrument-selected-badge');
    if (badge) badge.remove();
    
    // Update everything
    updateAllResources();
    updateResourceDisplay();
    renderSelectedInstruments();
    updateValidationDisplay();
    
    showResourceSuccess(`${instrument.name} removed`);
    console.log(`🗑️ Removed instrument: ${instrument.name}`);
}

/**
 * Render selected instruments panel
 */
function renderSelectedInstruments() {
    const container = document.getElementById('selected-instruments-list');
    if (!container) return;
    
    const selectedInstruments = gameState.spacecraft.instruments;
    const maxInstruments = gameState.spacecraft.bus?.capacity.instruments || 8;
    
    container.innerHTML = `<h3>Selected Instruments (${selectedInstruments.length}/${maxInstruments})</h3>`;
    
    if (selectedInstruments.length === 0) {
        container.innerHTML += '<p class="no-instruments">No instruments selected yet. Click instruments above to add them.</p>';
        return;
    }
    
    const list = document.createElement('div');
    list.className = 'selected-instruments-list';
    
    selectedInstruments.forEach(instrument => {
        const item = document.createElement('div');
        item.className = 'selected-instrument-item';
        item.innerHTML = `
            <div class="selected-instrument-info">
                <span class="instrument-icon-small">${getInstrumentIcon(instrument.id)}</span>
                <span class="instrument-name">${instrument.name}</span>
            </div>
            <button class="remove-instrument-btn" data-instrument-id="${instrument.id}">✕</button>
        `;
        
        // Add remove button handler
        const removeBtn = item.querySelector('.remove-instrument-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = document.querySelector(`[data-instrument-id="${instrument.id}"]`);
            removeInstrumentFromSpacecraft(instrument, card);
        });
        
        list.appendChild(item);
    });
    
    container.appendChild(list);
    
    // Show science coverage
    showScienceCoverage();
}

/**
 * Show science coverage
 */
function showScienceCoverage() {
    const container = document.getElementById('science-coverage');
    if (!container) return;
    
    const mission = gameState.selectedMission;
    const score = calculateScienceScore(gameState.spacecraft.instruments, mission);
    
    let status = '';
    let color = '';
    
    if (score >= 80) {
        status = 'Excellent';
        color = 'var(--success)';
    } else if (score >= 60) {
        status = 'Good';
        color = 'var(--neon-cyan)';
    } else if (score >= 40) {
        status = 'Fair';
        color = 'var(--warning)';
    } else {
        status = 'Low';
        color = 'var(--danger)';
    }
    
    container.innerHTML = `
        <div class="science-coverage-display">
            <h4>Science Coverage: <span style="color: ${color}">${score.toFixed(0)}% (${status})</span></h4>
            <div class="coverage-bar">
                <div class="coverage-fill" style="width: ${score}%; background: ${color}"></div>
            </div>
        </div>
    `;
}

/**
 * Setup validation panel
 */
function setupValidationPanel() {
    // Will be updated by updateValidationDisplay()
}

/**
 * Update validation display
 */
function updateValidationDisplay() {
    const container = document.getElementById('validation-panel');
    if (!container) return;
    
    const result = validateMission();
    const summary = getValidationSummary();
    
    container.innerHTML = '<h3>Mission Validation</h3>';
    
    if (summary.errorCount === 0 && summary.warningCount === 0) {
        container.innerHTML += '<div class="validation-success">✅ All checks passed! Ready to launch.</div>';
    } else {
        if (summary.errorCount > 0) {
            container.innerHTML += '<div class="validation-errors"><h4>❌ Errors:</h4><ul>';
            summary.errors.forEach(error => {
                container.innerHTML += `<li>${error}</li>`;
            });
            container.innerHTML += '</ul></div>';
        }
        
        if (summary.warningCount > 0) {
            container.innerHTML += '<div class="validation-warnings"><h4>⚠️ Warnings:</h4><ul>';
            summary.warnings.forEach(warning => {
                container.innerHTML += `<li>${warning}</li>`;
            });
            container.innerHTML += '</ul></div>';
        }
    }
}

/**
 * Setup instrument buttons
 */
function setupInstrumentButtons() {
    // Back button
    const backBtn = document.getElementById('back-to-builder-btn');
    if (backBtn && !backBtn.dataset.listenerAttached) {
        backBtn.dataset.listenerAttached = 'true';
        backBtn.addEventListener('click', async () => {
            const { initSpacecraftBuilder } = await import('./spacecraftUI.js');
            initSpacecraftBuilder();
        });
    }
    
    // Start mission button
    const startBtn = document.getElementById('start-mission-final-btn');
    if (startBtn && !startBtn.dataset.listenerAttached) {
        startBtn.dataset.listenerAttached = 'true';
        startBtn.addEventListener('click', async () => {
            const result = validateMission();
            
            if (!result.isValid) {
                showResourceError('You can\'t start the mission yet. Please fix the errors listed below first.');
                return;
            }
            
            if (result.warnings.length > 0) {
                if (!confirm('Your mission has some warnings. Do you still want to go ahead?')) {
                    return;
                }
            }
            
            console.log('🚀 Launching mission simulation!');
            const { initMissionSimulation } = await import('./simulationUI.js');
            initMissionSimulation();
        });
    }
}

export default {
    initInstrumentSelection
};
