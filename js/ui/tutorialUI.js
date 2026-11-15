// ================================
// ORBITAL - Tutorial / How to Play Guide UI
// Self-contained overlay, independent of screenManager's single-screen
// model. Can be opened from any screen, at any time.
// ================================

import { missions } from '../data/missions.js';
import { spacecraftBuses, powerSystems, propulsionSystems, communicationsSystems, instruments } from '../data/spacecraft.js';
import { VALIDATION_THRESHOLDS, RESOURCE_LIMITS, SCORING_WEIGHTS } from '../data/constants.js';
import { SCORE_GRADE_BANDS, OBJECTIVE_MAP } from '../data/simulationConfig.js';
import { formatCurrency, formatMass, formatPower, formatDataRate, formatDeltaV, formatDistance } from '../utils/formatters.js';
import { WELCOME_TEXT, RULE_SECTIONS, MISSION_GUIDE_INTRO, COMPONENT_CATEGORY_INFO, INSTRUMENT_GUIDE_INTRO } from '../data/tutorialContent.js';

const SEEN_FLAG_KEY = 'orbital_tutorial_seen';
const TABS = ['welcome', 'rules', 'missions', 'components', 'instruments'];
const TAB_LABELS = {
    welcome: '👋 Welcome',
    rules: '📜 Game Rules',
    missions: '🌍 Mission Guide',
    components: '🛰️ Components',
    instruments: '🔬 Instruments'
};

let initialized = false;
let activeTab = 'welcome';

/**
 * One-time setup: build the overlay DOM, wire close/backdrop clicks,
 * and auto-open on first-ever visit.
 */
export function initTutorialUI() {
    if (initialized) return;
    initialized = true;

    const overlay = document.getElementById('tutorial-overlay');
    if (!overlay) {
        console.error('❌ #tutorial-overlay not found in index.html');
        return;
    }

    overlay.innerHTML = `
        <div class="tutorial-modal glass-panel">
            <div class="tutorial-header">
                <h2>📖 How to Play ORBITAL</h2>
                <button id="tutorial-close-btn" class="tutorial-close-btn" aria-label="Close guide">✕</button>
            </div>
            <div class="tutorial-tabs" id="tutorial-tabs"></div>
            <div class="tutorial-tab-content" id="tutorial-tab-content"></div>
        </div>
    `;

    const tabsContainer = document.getElementById('tutorial-tabs');
    tabsContainer.innerHTML = TABS.map(tab =>
        `<button class="tutorial-tab-btn" data-tab="${tab}">${TAB_LABELS[tab]}</button>`
    ).join('');

    tabsContainer.querySelectorAll('.tutorial-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.getElementById('tutorial-close-btn').addEventListener('click', closeTutorial);

    // Close when clicking the dark backdrop, not the modal itself
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeTutorial();
    });

    // Auto-open once, on first-ever visit
    try {
        if (!localStorage.getItem(SEEN_FLAG_KEY)) {
            openTutorial('welcome');
        }
    } catch (e) {
        // localStorage unavailable (e.g. privacy mode) — skip auto-open, not fatal
        console.warn('⚠️ Could not check tutorial seen-flag:', e);
    }

    console.log('✅ Tutorial UI initialized');
}

/**
 * Open the guide overlay, optionally jumping straight to a tab.
 */
export function openTutorial(tabId = 'welcome') {
    const overlay = document.getElementById('tutorial-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    switchTab(TABS.includes(tabId) ? tabId : 'welcome');
}

/**
 * Close the overlay and mark the tutorial as seen.
 */
export function closeTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.display = 'none';
    try {
        localStorage.setItem(SEEN_FLAG_KEY, 'true');
    } catch (e) {
        // Non-fatal if storage is unavailable
    }
}

function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.tutorial-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    const content = document.getElementById('tutorial-tab-content');
    if (!content) return;

    switch (tabId) {
        case 'welcome': content.innerHTML = renderWelcomeTab(); break;
        case 'rules': content.innerHTML = renderRulesTab(); break;
        case 'missions': content.innerHTML = renderMissionsTab(); break;
        case 'components': content.innerHTML = renderComponentsTab(); break;
        case 'instruments': content.innerHTML = renderInstrumentsTab(); break;
        default: content.innerHTML = renderWelcomeTab();
    }

    attachAccordionHandlers(content);
}

// ========== WELCOME TAB ==========

function renderWelcomeTab() {
    const missionList = Object.values(missions)
        .map(m => `<li>${m.icon} <strong>${m.name}</strong> — ${m.difficulty} difficulty</li>`)
        .join('');

    const steps = WELCOME_TEXT.flowSteps.map(s => `
        <div class="tutorial-flow-step">
            <span class="tutorial-flow-icon">${s.icon}</span>
            <div>
                <strong>${s.label}</strong>
                <p>${s.detail}</p>
            </div>
        </div>
    `).join('');

    return `
        <h3>${WELCOME_TEXT.title}</h3>
        <p>${WELCOME_TEXT.intro}</p>
        <p><strong>Available missions right now:</strong></p>
        <ul>${missionList}</ul>
        <h4>${WELCOME_TEXT.flowTitle}</h4>
        <div class="tutorial-flow">${steps}</div>
        <p class="tutorial-closing">${WELCOME_TEXT.closing}</p>
    `;
}

// ========== GAME RULES TAB ==========

function renderRulesTab() {
    const r = RULE_SECTIONS;
    const massPct = (VALIDATION_THRESHOLDS.mass_margin * 100).toFixed(0);
    const powerPct = (VALIDATION_THRESHOLDS.power_margin * 100).toFixed(0);
    const budgetPct = (VALIDATION_THRESHOLDS.budget_margin * 100).toFixed(0);

    const weightRows = Object.entries(SCORING_WEIGHTS).map(([key, weight]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return `<li><strong>${label}</strong> — ${(weight * 100).toFixed(0)}%</li>`;
    }).join('');

    const gradeRows = SCORE_GRADE_BANDS.map(b => `<li>${b.min}+ : ${b.label}</li>`).join('');

    return `
        <h3>${r.resources.title}</h3>
        <p>${r.resources.intro}</p>
        <ul>
            <li>💰 <strong>Budget</strong> — the total money you have to spend is ${formatCurrency(RESOURCE_LIMITS.MAX_BUDGET)}.</li>
            <li>⚖️ <strong>Weight Safety Margin (mass margin)</strong> — spare weight capacity, left over after everything you've added. Keep at least ${massPct}% spare.</li>
            <li>⚡ <strong>Power Safety Margin (power margin)</strong> — spare electricity, left over after everything that uses power. Keep at least ${powerPct}% more than you use.</li>
            <li>💵 <strong>Budget Safety Margin (budget margin)</strong> — spare money left unspent. Keep at least ${budgetPct}% of your budget unspent.</li>
            <li>🔬 <strong>Instruments:</strong> bring between ${VALIDATION_THRESHOLDS.min_instruments} and ${VALIDATION_THRESHOLDS.max_instruments} instruments, and no more than your spacecraft bus can carry.</li>
        </ul>

        <h3>${r.validation.title}</h3>
        <p>${r.validation.intro}</p>
        <p><strong>❌ Errors</strong> — ${r.validation.errors}</p>
        <p><strong>⚠️ Warnings</strong> — ${r.validation.warnings}</p>

        <h3>${r.simulation.title}</h3>
        <p>${r.simulation.intro}</p>

        <h3>${r.scoring.title}</h3>
        <p>${r.scoring.intro}</p>
        <ul>${weightRows}</ul>
        <p><strong>Final grade bands:</strong></p>
        <ul>${gradeRows}</ul>
    `;
}

// ========== MISSION GUIDE TAB ==========

function renderMissionsTab() {
    const cards = Object.values(missions).map(m => {
        const env = Object.entries(m.environment || {})
            .map(([k, v]) => `<li>${k.replace(/_/g, ' ')}: ${v}</li>`)
            .join('');
        const objectives = m.objectives.map(o => `<li>${o}</li>`).join('');

        return `
            <div class="tutorial-accordion">
                <button class="tutorial-accordion-toggle">${m.icon} ${m.name} (${m.difficulty})</button>
                <div class="tutorial-accordion-body" style="display:none;">
                    <p>${m.description}</p>
                    <p><strong>Duration:</strong> ${m.duration} days &nbsp; <strong>Budget:</strong> ${formatCurrency(m.requirements.budget)}</p>
                    <p><strong>Objectives:</strong></p>
                    <ul>${objectives}</ul>
                    <p><strong>Environment challenges:</strong></p>
                    <ul>${env}</ul>
                </div>
            </div>
        `;
    }).join('');

    return `
        <h3>Mission Guide</h3>
        <p>${MISSION_GUIDE_INTRO}</p>
        ${cards}
    `;
}

// ========== COMPONENT GUIDE TAB ==========

function renderComponentsTab() {
    const categories = [
        { key: 'bus', data: spacecraftBuses },
        { key: 'power', data: powerSystems },
        { key: 'propulsion', data: propulsionSystems },
        { key: 'communications', data: communicationsSystems }
    ];

    const sections = categories.map(cat => {
        const info = COMPONENT_CATEGORY_INFO[cat.key];
        const options = Object.values(cat.data).map(c => {
            const specs = [];
            specs.push(`⚖️ ${formatMass(c.mass + (c.fuelMass || 0))}`);
            if (c.power) specs.push(`⚡ ${formatPower(Math.abs(c.power))}`);
            specs.push(`💰 ${formatCurrency(c.cost)}`);
            if (c.deltaV) specs.push(`🚀 ${formatDeltaV(c.deltaV)}`);
            if (c.dataRate) specs.push(`📊 ${formatDataRate(c.dataRate)}`);
            if (c.maxDistance !== undefined) specs.push(`📡 up to ${formatDistance(c.maxDistance)}`);
            return `
                <div class="tutorial-component-row">
                    <strong>${c.name}</strong> — ${c.description}
                    <div class="tutorial-component-specs">${specs.join(' &nbsp; ')}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="tutorial-accordion">
                <button class="tutorial-accordion-toggle">${info.icon} ${info.title}</button>
                <div class="tutorial-accordion-body" style="display:none;">
                    <p>${info.blurb}</p>
                    ${options}
                </div>
            </div>
        `;
    }).join('');

    return `<h3>Spacecraft Component Guide</h3>${sections}`;
}

// ========== INSTRUMENT GUIDE TAB ==========

function getSupportedObjectives(instrumentId) {
    const inst = instruments[instrumentId];
    const supports = [];
    Object.entries(OBJECTIVE_MAP).forEach(([missionId, objectives]) => {
        objectives.forEach(obj => {
            if (obj.type !== 'science') return;
            const overlap = obj.scienceFields.some(f => (inst.scienceValue || {})[f] > 0);
            if (overlap) {
                const mission = missions[missionId];
                supports.push(`${mission ? mission.icon + ' ' + mission.name : missionId}: ${obj.objective}`);
            }
        });
    });
    return supports;
}

function renderInstrumentsTab() {
    const rows = Object.values(instruments).map(inst => {
        const supports = getSupportedObjectives(inst.id);
        const supportList = supports.length > 0
            ? `<ul>${supports.map(s => `<li>${s}</li>`).join('')}</ul>`
            : `<p class="tutorial-muted">Contributes to overall science score, but isn't tied to a specific objective checklist item.</p>`;

        return `
            <div class="tutorial-accordion">
                <button class="tutorial-accordion-toggle">${inst.name}</button>
                <div class="tutorial-accordion-body" style="display:none;">
                    <p>${inst.description}</p>
                    <p>⚖️ ${formatMass(inst.mass)} &nbsp; ⚡ ${formatPower(inst.power)} &nbsp; 💰 ${formatCurrency(inst.cost)} &nbsp; 📊 ${formatDataRate(inst.dataRate)}</p>
                    <p><strong>Supports these mission objectives:</strong></p>
                    ${supportList}
                </div>
            </div>
        `;
    }).join('');

    return `
        <h3>Scientific Instrument Guide</h3>
        <p>${INSTRUMENT_GUIDE_INTRO}</p>
        ${rows}
    `;
}

// ========== ACCORDION BEHAVIOR ==========

function attachAccordionHandlers(root) {
    root.querySelectorAll('.tutorial-accordion-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const body = btn.nextElementSibling;
            if (!body) return;
            body.style.display = body.style.display === 'none' ? 'block' : 'none';
        });
    });
}

export default {
    initTutorialUI,
    openTutorial,
    closeTutorial
};
