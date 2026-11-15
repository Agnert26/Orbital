// ================================
// ORBITAL - Spacecraft Builder UI
// Component selection interface
// ================================

import { gameState, updateSpacecraftComponent, clearSpacecraftConfig } from '../core/gameState.js';
import { getComponentsByMission } from '../data/spacecraft.js';
import { updateAllResources, getResourceSummary } from '../managers/resourceManager.js';
import { validateMission } from '../engines/validationEngine.js';
import { updateResourceDisplay, showResourceError, showResourceSuccess } from './resourceUI.js';
import { formatCurrency, formatMass, formatPower } from '../utils/formatters.js';
import { showSpacecraftBuilder as showBuilderScreen } from './screenManager.js';
import { renderContextualTip } from './contextualTipUI.js';

let currentCategory = null;

/**
 * Initialize spacecraft builder
 */
export function initSpacecraftBuilder() {
    const mission = gameState.selectedMission;
    if (!mission) {
        console.error('No mission selected');
        return;
    }
    
    console.log('🛰️ Initializing Spacecraft Builder for', mission.name);
    
    // Use centralized screen manager
    showBuilderScreen();
    
    // Render component categories
    renderComponentCategories();
    
    // Set up reset button
    setupResetButton();
    
    // Set up continue button
    setupContinueButton();
    
    // Initial resource update
    updateAllResources();
    updateResourceDisplay();
    
    // Contextual tip for this screen
    renderContextualTip('spacecraftBuilder', document.querySelector('.spacecraft-builder .glass-panel'));
}

/**
 * Render all component categories
 */
function renderComponentCategories() {
    const categories = [
        { id: 'bus', name: 'Spacecraft Bus', icon: '🛸', description: 'Main structure and systems' },
        { id: 'power', name: 'Power System', icon: '⚡', description: 'Energy generation' },
        { id: 'propulsion', name: 'Propulsion', icon: '🚀', description: 'Orbital maneuvers' },
        { id: 'communications', name: 'Communications', icon: '📡', description: 'Data transmission' }
    ];
    
    categories.forEach(category => {
        renderComponentCategory(category);
    });
}

/**
 * Render a component category
 */
function renderComponentCategory(category) {
    const container = document.getElementById(`${category.id}-components`);
    if (!container) return;
    
    // Get components suitable for current mission
    const components = getComponentsByMission(category.id, gameState.selectedMission.id);
    
    // Clear container
    container.innerHTML = '';
    
    // Add category header
    const header = document.createElement('div');
    header.className = 'component-category-header';
    header.innerHTML = `
        <h3>${category.icon} ${category.name}</h3>
        <p>${category.description}</p>
    `;
    container.appendChild(header);
    
    // Create component grid
    const grid = document.createElement('div');
    grid.className = 'component-grid';
    
    components.forEach(component => {
        const card = createComponentCard(category.id, component);
        grid.appendChild(card);
    });
    
    container.appendChild(grid);
}

/**
 * Create component card
 */
function createComponentCard(category, component) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.dataset.category = category;
    card.dataset.componentId = component.id;
    
    // Check if selected
    const currentSelection = gameState.spacecraft[category === 'power' ? 'powerSystem' : category];
    const isSelected = currentSelection?.id === component.id;
    
    if (isSelected) {
        card.classList.add('selected');
    }
    
    // Build card content
    card.innerHTML = `
        <div class="component-card-header">
            <h4>${component.name}</h4>
        </div>
        <p class="component-description">${component.description}</p>
        <div class="component-specs">
            <div class="spec-row">
                <span class="spec-icon">⚖️</span>
                <span class="spec-label">Mass:</span>
                <span class="spec-value">${formatMass(component.mass + (component.fuelMass || 0))}</span>
            </div>
            <div class="spec-row">
                <span class="spec-icon">⚡</span>
                <span class="spec-label">Power:</span>
                <span class="spec-value">${formatPower(Math.abs(component.power))}</span>
            </div>
            <div class="spec-row">
                <span class="spec-icon">💰</span>
                <span class="spec-label">Cost:</span>
                <span class="spec-value">${formatCurrency(component.cost)}</span>
            </div>
        </div>
        ${isSelected ? '<div class="selected-badge">✓ Selected</div>' : ''}
    `;
    
    // Add click handler
    card.addEventListener('click', () => {
        selectComponent(category, component, card);
    });
    
    return card;
}

/**
 * Select a component
 */
function selectComponent(category, component, cardElement) {
    // Check if would exceed budget
    const currentBudget = gameState.resources.budget.spent;
    
    // Map category to gameState property name
    const stateKey = category === 'power' ? 'powerSystem' : category;
    const previousComponent = gameState.spacecraft[stateKey];
    const previousCost = previousComponent ? previousComponent.cost : 0;
    const newCost = currentBudget - previousCost + component.cost;
    
    if (newCost > gameState.resources.budget.total) {
        const deficit = newCost - gameState.resources.budget.total;
        showResourceError(
            `Not enough budget! This would put you ${formatCurrency(deficit)} over. ` +
            `Try a cheaper option, or adjust your other choices.`
        );
        return;
    }
    
    // Remove selected class from all cards in this category
    const categoryCards = document.querySelectorAll(`[data-category="${category}"]`);
    categoryCards.forEach(c => {
        c.classList.remove('selected');
        const badge = c.querySelector('.selected-badge');
        if (badge) badge.remove();
    });
    
    // Add selected class to clicked card
    cardElement.classList.add('selected');
    const badge = document.createElement('div');
    badge.className = 'selected-badge';
    badge.textContent = '✓ Selected';
    cardElement.appendChild(badge);
    
    // Update game state with mapped key
    updateSpacecraftComponent(stateKey, component);
    
    // Update resources
    updateAllResources();
    updateResourceDisplay();
    
    // Validate
    validateMission();
    
    // Show success message
    showResourceSuccess(`${component.name} selected`);
    
    console.log(`✅ Selected ${category}: ${component.name}`);
}

/**
 * Setup reset button
 */
function setupResetButton() {
    const resetBtn = document.getElementById('reset-configuration-btn');
    if (!resetBtn || resetBtn.dataset.listenerAttached) return;
    resetBtn.dataset.listenerAttached = 'true';
    
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure? This will clear everything you\'ve chosen so far.')) {
            resetConfiguration();
        }
    });
}

/**
 * Reset configuration
 */
function resetConfiguration() {
    // Clear spacecraft config
    clearSpacecraftConfig();
    
    // Remove all selected states
    const allCards = document.querySelectorAll('.component-card');
    allCards.forEach(card => {
        card.classList.remove('selected');
        const badge = card.querySelector('.selected-badge');
        if (badge) badge.remove();
    });
    
    // Update resources
    updateAllResources();
    updateResourceDisplay();
    
    showResourceSuccess('Configuration reset');
    console.log('🔄 Configuration reset');
}

/**
 * Setup continue button
 */
function setupContinueButton() {
    const continueBtn = document.getElementById('continue-to-instruments-btn');
    if (!continueBtn || continueBtn.dataset.listenerAttached) return;
    continueBtn.dataset.listenerAttached = 'true';
    
    continueBtn.addEventListener('click', async () => {
        // Check if all required components are selected
        const spacecraft = gameState.spacecraft;
        
        if (!spacecraft.bus || !spacecraft.powerSystem || !spacecraft.propulsion || !spacecraft.communications) {
            showResourceError('Please choose one option in each category: Bus, Power, Propulsion, and Communications.');
            return;
        }
        
        // Transition to instrument selection
        const { initInstrumentSelection } = await import('./instrumentUI.js');
        initInstrumentSelection();
    });
}

export default {
    initSpacecraftBuilder
};
