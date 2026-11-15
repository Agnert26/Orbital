// ================================
// ORBITAL - Beyond the Mission
// Game Logic and Interactivity
// NASA Space Apps Challenge 2026
// ================================

// ========== GAME STATE ==========
const gameState = {
    selectedMission: null,
    resources: {
        budget: 5000000000, // $5.0B
        maxBudget: 5000000000,
        energy: 100,
        maxEnergy: 100,
        crew: 50,
        maxCrew: 50,
        equipment: 100
    },
    missions: {
        mars: {
            id: 'mars',
            name: 'Mars Exploration',
            icon: '🔴',
            description: 'Lead a pioneering expedition to the Red Planet. Establish a sustainable base, conduct scientific research, and search for signs of ancient life.',
            duration: 687,
            difficulty: 'High',
            budget: 2500000000,
            objectives: [
                'Land safely on Mars surface',
                'Deploy research equipment',
                'Collect geological samples',
                'Establish communication relay'
            ],
            requirements: [
                'Budget: $2.5B available',
                'Crew: 25 trained personnel',
                'Energy: 75 units required',
                'Equipment: Advanced rover and habitat modules'
            ]
        },
        earth: {
            id: 'earth',
            name: 'Earth Observation',
            icon: '🌍',
            description: 'Deploy an advanced satellite network to monitor climate change, track natural disasters, and support global environmental research initiatives.',
            duration: 365,
            difficulty: 'Medium',
            budget: 1200000000,
            objectives: [
                'Launch satellite constellation',
                'Monitor climate patterns',
                'Track deforestation rates',
                'Provide disaster early warning'
            ],
            requirements: [
                'Budget: $1.2B available',
                'Crew: 15 trained personnel',
                'Energy: 50 units required',
                'Equipment: Satellite array and ground stations'
            ]
        },
        asteroid: {
            id: 'asteroid',
            name: 'Asteroid Research',
            icon: '☄️',
            description: 'Intercept and study a near-Earth asteroid. Extract valuable resources, analyze composition, and assess planetary defense capabilities.',
            duration: 540,
            difficulty: 'Extreme',
            budget: 1800000000,
            objectives: [
                'Rendezvous with target asteroid',
                'Deploy mining equipment',
                'Analyze mineral composition',
                'Test deflection technology'
            ],
            requirements: [
                'Budget: $1.8B available',
                'Crew: 20 trained personnel',
                'Energy: 80 units required',
                'Equipment: Mining spacecraft and analysis tools'
            ]
        }
    }
};

// ========== DOM ELEMENTS ==========
// Will be initialized after DOM is ready
let missionCards;
let startMissionBtn;
let statusMessage;
let missionDetails;
let selectedMissionTitle;
let selectedMissionDescription;
let requirementsList;

// ========== EVENT LISTENERS ==========

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ORBITAL - Beyond the Mission initialized');
    
    // Initialize DOM elements AFTER DOM is ready
    console.log('🔍 DEBUG: Initializing DOM elements...');
    missionCards = document.querySelectorAll('.mission-card');
    startMissionBtn = document.querySelector('.start-mission-btn');
    statusMessage = document.querySelector('.status-message');
    missionDetails = document.querySelector('.mission-details');
    selectedMissionTitle = document.querySelector('.selected-mission-title');
    selectedMissionDescription = document.querySelector('.selected-mission-description');
    requirementsList = document.querySelector('.requirements-list');
    
    console.log('🔍 DEBUG: startMissionBtn element found:', startMissionBtn);
    console.log('🔍 DEBUG: missionCards found:', missionCards.length);
    
    initializeMissionCards();
    initializeNavigation();
});

// Mission card selection
function initializeMissionCards() {
    missionCards.forEach(card => {
        card.addEventListener('click', () => {
            const missionId = card.dataset.mission;
            selectMission(missionId);
        });
    });
}

// Navigation menu
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get the nav text to determine action
            const navText = item.querySelector('.nav-text').textContent;
            handleNavigation(navText);
        });
    });
}

// Handle navigation clicks
function handleNavigation(navText) {
    console.log(`Navigation clicked: ${navText}`);
    
    // For now, just log the navigation
    // In future updates, we'll implement different views
    switch(navText) {
        case 'Home':
            console.log('Already on home page');
            break;
        case 'Missions':
            scrollToSection('.mission-selection');
            break;
        case 'Resources':
            scrollToSection('.resource-panel');
            break;
        case 'Objectives':
            console.log('Objectives view - to be implemented');
            break;
        case 'About':
            showAboutInfo();
            break;
    }
}

// Scroll to section
function scrollToSection(selector) {
    const section = document.querySelector(selector);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Show about information
function showAboutInfo() {
    alert('ORBITAL - Beyond the Mission\n\nA space mission design game for NASA Space Apps Challenge 2026.\n\nDeveloped to inspire future space explorers and demonstrate mission planning challenges.\n\nVersion: 1.0.0');
}

// ========== MISSION SELECTION ==========

function selectMission(missionId) {
    // Update game state
    gameState.selectedMission = missionId;
    const mission = gameState.missions[missionId];
    
    console.log(`Mission selected: ${mission.name}`);
    
    // Update UI - Remove selected class from all cards
    missionCards.forEach(card => card.classList.remove('selected'));
    
    // Add selected class to clicked card
    const selectedCard = document.querySelector(`[data-mission="${missionId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Update mission overview panel
    updateMissionOverview(mission);
    
    // Scroll to mission overview
    setTimeout(() => {
        scrollToSection('.mission-overview-panel');
    }, 300);
}

function updateMissionOverview(mission) {
    console.log('🔍 DEBUG: updateMissionOverview called for mission:', mission.id);
    
    // Hide status message, show mission details
    statusMessage.style.display = 'none';
    missionDetails.style.display = 'block';
    
    // Update mission information
    selectedMissionTitle.textContent = `${mission.icon} ${mission.name}`;
    selectedMissionDescription.textContent = mission.description;
    
    // Update requirements list
    requirementsList.innerHTML = '';
    mission.requirements.forEach(requirement => {
        const li = document.createElement('li');
        li.textContent = requirement;
        requirementsList.appendChild(li);
    });
    
    // Enable start mission button
    console.log('🔍 DEBUG: startMissionBtn element:', startMissionBtn);
    console.log('🔍 DEBUG: Setting onclick handler for mission:', mission.id);
    startMissionBtn.disabled = false;
    startMissionBtn.onclick = () => startMission(mission.id);
    console.log('🔍 DEBUG: onclick handler set successfully');
}

// ========== START MISSION ==========

function startMission(missionId) {
    console.log('🔍 DEBUG: startMission called with missionId:', missionId);
    
    const mission = gameState.missions[missionId];
    console.log('🔍 DEBUG: Retrieved mission:', mission);
    
    if (!mission) {
        console.error('❌ ERROR: Mission not found for id:', missionId);
        return;
    }
    
    console.log(`📋 Opening mission briefing for: ${mission.name}`);
    
    // Store selected mission in sessionStorage
    sessionStorage.setItem('selectedMissionId', missionId);
    
    // Show mission briefing instead of jumping directly to builder
    // Import and show briefing (will be handled by app.js)
    console.log('🔍 DEBUG: Dispatching showMissionBriefing event');
    const event = new CustomEvent('showMissionBriefing', { detail: { missionId } });
    window.dispatchEvent(event);
    console.log('🔍 DEBUG: Event dispatched');
}

// ========== RESOURCE MANAGEMENT ==========

function checkResources(mission) {
    return gameState.resources.budget >= mission.budget;
}

function updateResourceDisplay() {
    // Update budget display
    const budgetFill = document.querySelector('.resource-item:nth-child(1) .resource-fill');
    const budgetValue = document.querySelector('.resource-item:nth-child(1) .resource-value');
    
    const budgetPercentage = (gameState.resources.budget / gameState.resources.maxBudget) * 100;
    budgetFill.style.width = `${budgetPercentage}%`;
    budgetValue.textContent = `$${formatBudget(gameState.resources.budget)} / $${formatBudget(gameState.resources.maxBudget)}`;
    
    // Change color based on remaining budget
    if (budgetPercentage < 30) {
        budgetFill.style.background = 'linear-gradient(90deg, #ff3366, #ff6699)';
    } else if (budgetPercentage < 60) {
        budgetFill.style.background = 'linear-gradient(90deg, #ffa500, #ffcc00)';
    }
}

// ========== UTILITY FUNCTIONS ==========

function formatBudget(amount) {
    if (amount >= 1000000000) {
        return (amount / 1000000000).toFixed(1) + 'B';
    } else if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    }
    return amount.toLocaleString();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(255, 51, 102, 0.9)'};
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.5s ease;
        white-space: pre-line;
        font-weight: 500;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ========== CONSOLE WELCOME MESSAGE ==========
console.log('%c🛰️ ORBITAL - Beyond the Mission', 'font-size: 24px; font-weight: bold; color: #00d9ff;');
console.log('%cNASA Space Apps Challenge 2026', 'font-size: 14px; color: #b8c5d6;');
console.log('%cGame initialized successfully!', 'font-size: 12px; color: #00ff88;');
console.log('-----------------------------------');
console.log('Available missions:', Object.keys(gameState.missions).length);
console.log('Initial budget:', formatBudget(gameState.resources.budget));
console.log('-----------------------------------');
