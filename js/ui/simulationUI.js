// ================================
// ORBITAL - Mission Simulation UI
// Renders the current phase of the mission simulation
// ================================

import { gameState } from '../core/gameState.js';
import { startSimulation, submitDecision, continuePhase, computeFinalResults } from '../engines/simulationEngine.js';
import { showMissionSimulation as showSimScreen, showMissionResults } from './screenManager.js';
import { renderContextualTip } from './contextualTipUI.js';

const PHASE_LABELS = {
    launch: { icon: '🚀', name: 'Launch' },
    transit: { icon: '🛰️', name: 'Transit' },
    arrival: { icon: '🪐', name: 'Arrival' },
    science_ops: { icon: '🔬', name: 'Science Ops' },
    data_return: { icon: '📡', name: 'Data Return' }
};
const PHASE_ORDER = ['launch', 'transit', 'arrival', 'science_ops', 'data_return'];

/**
 * Begin the simulation and show the first phase.
 */
export function initMissionSimulation() {
    console.log('🎬 Starting mission simulation for', gameState.selectedMission?.name);
    showSimScreen();
    
    // Contextual tip for this screen
    renderContextualTip('missionSimulation', document.querySelector('.mission-simulation .glass-panel'));
    
    const view = startSimulation();
    render(view);
}

/**
 * Render a phase view into #simulation-content.
 */
function render(view) {
    const container = document.getElementById('simulation-content');
    if (!container) return;

    container.innerHTML = `
        ${renderStepper(view.phase)}
        <div class="sim-narrative-panel">
            <h3 class="sim-phase-title">${PHASE_LABELS[view.phase].icon} ${PHASE_LABELS[view.phase].name}</h3>
            <p class="sim-narrative-text">${view.narrative}</p>
            ${view.goal ? `<p class="sim-goal-text"><strong>Goal:</strong> ${view.goal}</p>` : ''}
        </div>

        ${renderStatus(view.status)}

        ${view.decision ? renderDecision(view.decision) : renderContinueButton(view.isLastPhase)}

        ${renderLog()}
    `;

    if (view.decision) {
        view.decision.options.forEach(opt => {
            const btn = document.getElementById(`decision-${opt.id}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    const next = submitDecision(view.decision.id, opt.id);
                    render(next);
                });
            }
        });
    } else {
        const continueBtn = document.getElementById('sim-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                if (view.isLastPhase) {
                    const results = computeFinalResults();
                    showResults(results);
                } else {
                    const next = continuePhase();
                    render(next);
                }
            });
        }
    }
}

function renderStepper(currentPhase) {
    const currentIndex = PHASE_ORDER.indexOf(currentPhase);
    const steps = PHASE_ORDER.map((key, i) => {
        const label = PHASE_LABELS[key];
        const state = i < currentIndex ? 'done' : (i === currentIndex ? 'active' : 'pending');
        return `<span class="sim-step sim-step-${state}">${label.icon} ${label.name}</span>`;
    }).join('<span class="sim-step-sep">→</span>');
    return `<div class="sim-stepper">${steps}</div>`;
}

function renderStatus(status) {
    if (!status || status.length === 0) return '';
    const rows = status.map(s => {
        if (s.percent !== undefined) {
            const pct = Math.max(0, Math.min(1, s.percent));
            const tight = s.threshold !== undefined && s.percent < s.threshold;
            const barClass = tight ? 'sim-bar-warning' : 'sim-bar-good';
            return `
                <div class="sim-status-row">
                    <span class="sim-status-label">${s.label}</span>
                    <div class="sim-status-bar"><div class="sim-status-fill ${barClass}" style="width:${(pct * 100).toFixed(1)}%"></div></div>
                    <span class="sim-status-value">${(s.percent * 100).toFixed(1)}%</span>
                </div>`;
        }
        return `
            <div class="sim-status-row">
                <span class="sim-status-label">${s.label}</span>
                <span class="sim-status-value">${s.text}</span>
            </div>`;
    }).join('');
    return `<div class="sim-status-panel"><h4>📊 Spacecraft Status</h4>${rows}</div>`;
}

function renderDecision(decision) {
    const options = decision.options.map(opt => `
        <button class="sim-decision-option" id="decision-${opt.id}">
            <span class="sim-decision-label">${opt.label}</span>
            ${opt.detail ? `<span class="sim-decision-detail">${opt.detail}</span>` : ''}
        </button>
    `).join('');
    return `
        <div class="sim-decision-panel">
            <h4>⚠️ Decision Required</h4>
            <p>${decision.prompt}</p>
            <div class="sim-decision-options">${options}</div>
        </div>
    `;
}

function renderContinueButton(isLastPhase) {
    return `
        <div class="sim-actions">
            <button id="sim-continue-btn" class="primary-btn">
                <span>${isLastPhase ? 'View Final Results →' : 'Continue →'}</span>
            </button>
        </div>
    `;
}

function renderLog() {
    const log = gameState.simulation.log;
    if (!log || log.length === 0) return '';
    const items = log.map(entry => {
        const icon = entry.type === 'error' ? '❌' : (entry.type === 'warning' ? '⚠️' : '✅');
        return `<li class="sim-log-${entry.type}">${icon} ${entry.message}</li>`;
    }).join('');
    return `<div class="sim-log-panel"><h4>📋 Mission Log</h4><ul>${items}</ul></div>`;
}

/**
 * Show the results screen.
 */
function showResults(results) {
    showMissionResults();
    import('./missionResultsUI.js').then(({ renderMissionResults }) => {
        renderMissionResults(results);
    });
}

export default {
    initMissionSimulation
};
