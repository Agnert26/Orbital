// ================================
// ORBITAL - Mission Selection UI
// Handles mission card clicks and overview panel
// ================================

import { getMission } from '../data/missions.js';
import { scrollToSection } from './screenManager.js';
import { renderContextualTip } from './contextualTipUI.js';

// DOM elements (initialized after DOM ready)
let missionCards;
let startMissionBtn;
let statusMessage;
let missionDetails;
let selectedMissionTitle;
let selectedMissionDescription;
let requirementsList;

/**
 * Initialize mission selection UI
 */
export function initMissionSelectionUI() {
    console.log('🎯 Initializing Mission Selection UI');
    
    // Get DOM elements
    missionCards = document.querySelectorAll('.mission-card');
    startMissionBtn = document.querySelector('.start-mission-btn');
    statusMessage = document.querySelector('.status-message');
    missionDetails = document.querySelector('.mission-details');
    selectedMissionTitle = document.querySelector('.selected-mission-title');
    selectedMissionDescription = document.querySelector('.selected-mission-description');
    requirementsList = document.querySelector('.requirements-list');
    
    console.log(`  Found ${missionCards.length} mission cards`);
    console.log(`  Start button:`, startMissionBtn ? '✅' : '❌');
    
    // Attach click handlers to mission cards
    initializeMissionCards();
    
    // Contextual tip for this screen
    renderContextualTip('missionSelection', document.querySelector('.mission-selection'));
}

/**
 * Attach click handlers to mission cards
 */
function initializeMissionCards() {
    missionCards.forEach(card => {
        card.addEventListener('click', () => {
            const missionId = card.dataset.mission;
            selectMission(missionId);
        });
    });
    
    console.log('✅ Mission card click handlers attached');
}

/**
 * Handle mission card selection
 */
function selectMission(missionId) {
    const mission = getMission(missionId);
    
    if (!mission) {
        console.error('❌ Mission not found:', missionId);
        return;
    }
    
    console.log(`🎯 Mission selected: ${mission.name}`);
    
    // Update visual selection state
    missionCards.forEach(card => card.classList.remove('selected'));
    const selectedCard = document.querySelector(`[data-mission="${missionId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Update mission overview panel
    updateMissionOverview(mission);
    
    // Scroll to overview panel
    setTimeout(() => {
        scrollToSection('.mission-overview-panel');
    }, 300);
}

/**
 * Update mission overview panel with selected mission details
 */
function updateMissionOverview(mission) {
    console.log('📋 Updating mission overview for:', mission.name);
    
    // Hide status message, show mission details
    if (statusMessage) statusMessage.style.display = 'none';
    if (missionDetails) missionDetails.style.display = 'block';
    
    // Update mission information
    if (selectedMissionTitle) {
        selectedMissionTitle.textContent = `${mission.icon} ${mission.name}`;
    }
    if (selectedMissionDescription) {
        selectedMissionDescription.textContent = mission.description;
    }
    
    // Update requirements list
    if (requirementsList) {
        requirementsList.innerHTML = '';
        mission.objectives.forEach(objective => {
            const li = document.createElement('li');
            li.textContent = objective;
            requirementsList.appendChild(li);
        });
    }
    
    // Enable start mission button and attach handler
    if (startMissionBtn) {
        startMissionBtn.disabled = false;
        startMissionBtn.onclick = () => startMission(mission.id);
        console.log('✅ Start button enabled for mission:', mission.id);
    }
}

/**
 * Start mission - trigger mission briefing
 */
function startMission(missionId) {
    console.log('🚀 Starting mission:', missionId);
    
    const mission = getMission(missionId);
    if (!mission) {
        console.error('❌ Mission not found:', missionId);
        return;
    }
    
    // Store selected mission in sessionStorage
    sessionStorage.setItem('selectedMissionId', missionId);
    
    // Dispatch event to show mission briefing
    console.log('📡 Dispatching showMissionBriefing event');
    const event = new CustomEvent('showMissionBriefing', { 
        detail: { missionId } 
    });
    window.dispatchEvent(event);
}

export default {
    initMissionSelectionUI,
    selectMission
};
