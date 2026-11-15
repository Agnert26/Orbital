// ================================
// ORBITAL - Navigation UI
// Sidebar navigation menu
// ================================

import { scrollToSection } from './screenManager.js';
import { openTutorial } from './tutorialUI.js';
import { returnToMissionSelection } from './missionBriefingUI.js';

/**
 * Initialize navigation menu
 */
export function initNavigationUI() {
    console.log('🧭 Initializing Navigation UI');
    
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
    
    console.log(`✅ ${navItems.length} navigation items initialized`);
}

/**
 * Handle navigation clicks
 */
function handleNavigation(navText) {
    console.log(`🧭 Navigation: ${navText}`);
    
    switch(navText) {
        case 'Home':
            // Bug fix (Phase 6 QA): use the same reset used by the briefing's
            // own back button, so the mission card highlight and overview
            // panel don't stay stuck on a previously-selected mission.
            returnToMissionSelection();
            break;
        case 'Missions':
            scrollToSection('.mission-selection');
            break;
        case 'Resources':
            scrollToSection('.resource-panel');
            break;
        case 'How to Play':
            openTutorial('welcome');
            break;
        case 'About':
            showAboutInfo();
            break;
        default:
            console.warn('Unknown navigation:', navText);
    }
}

/**
 * Show about information
 */
function showAboutInfo() {
    alert(
        'ORBITAL - Beyond the Mission\n\n' +
        'A space mission design game for NASA Space Apps Challenge 2026.\n\n' +
        'Developed to inspire future space explorers and demonstrate mission planning challenges.\n\n' +
        'Version: 1.0.0'
    );
}

export default {
    initNavigationUI
};
