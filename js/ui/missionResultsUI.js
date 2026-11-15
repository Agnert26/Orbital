// ================================
// ORBITAL - Mission Results UI
// Renders the final results screen: objectives, science data,
// problems encountered, final score, and redesign navigation
// ================================

import { gameState, clearSpacecraftConfig, initSimulationState } from '../core/gameState.js';
import { formatDataRate } from '../utils/formatters.js';
import { showSpacecraftBuilder } from './screenManager.js';
import { renderContextualTip } from './contextualTipUI.js';
import { returnToMissionSelection } from './missionBriefingUI.js';

const STATUS_ICON = { achieved: '✅', partial: '⚠️', missed: '❌' };
const STATUS_LABEL = { achieved: 'Achieved', partial: 'Partial', missed: 'Missed' };

/**
 * Render the results screen for a completed simulation.
 */
export function renderMissionResults(results) {
    const container = document.getElementById('results-content');
    if (!container) return;

    const mission = gameState.selectedMission;

    container.innerHTML = `
        <div class="results-header">
            <h2>${mission.icon} ${mission.name} — Mission Complete</h2>
            <p class="results-grade">${results.grade} — ${results.overall.toFixed(0)}/100</p>
        </div>

        <div class="results-section">
            <h3>🎯 Objectives Completed</h3>
            ${renderObjectives(results.objectiveResults)}
        </div>

        <div class="results-section">
            <h3>🔬 Science Data Collected</h3>
            <p>Total data collected: <strong>${formatDataRate(results.dataGenerated)}</strong></p>
            <p>How well your instruments matched this mission's science goals: <strong>${results.scienceCoverage.toFixed(0)}%</strong></p>
        </div>

        <div class="results-section">
            <h3>📋 Problems Encountered</h3>
            ${renderLog(results.log)}
        </div>

        <div class="results-section">
            <h3>🏆 Final Score</h3>
            ${renderScoreBreakdown(gameState.score.breakdown)}
            <p class="results-overall">Overall Mission Score: <strong>${results.overall.toFixed(0)}/100</strong> — ${results.grade}</p>
        </div>

        <div class="results-actions">
            <button id="redesign-spacecraft-btn" class="secondary-btn">
                <span>🔧 Redesign Spacecraft</span>
            </button>
            <button id="start-new-design-btn" class="secondary-btn">
                <span>🆕 Start New Design</span>
            </button>
            <button id="choose-new-mission-btn" class="primary-btn">
                <span>🌍 Choose New Mission</span>
            </button>
        </div>
    `;

    // Contextual tip for this screen
    renderContextualTip('missionResults', document.querySelector('.mission-results .glass-panel'));

    document.getElementById('redesign-spacecraft-btn').addEventListener('click', () => {
        initSimulationState();
        showSpacecraftBuilder();
        import('./spacecraftUI.js').then(({ initSpacecraftBuilder }) => initSpacecraftBuilder());
    });

    document.getElementById('start-new-design-btn').addEventListener('click', () => {
        clearSpacecraftConfig();
        initSimulationState();
        showSpacecraftBuilder();
        import('./spacecraftUI.js').then(({ initSpacecraftBuilder }) => initSpacecraftBuilder());
    });

    document.getElementById('choose-new-mission-btn').addEventListener('click', () => {
        clearSpacecraftConfig();
        initSimulationState();
        // Bug fix (Phase 6 QA): reset the card highlight and overview panel
        // too, not just the spacecraft state, so mission selection looks
        // genuinely fresh.
        returnToMissionSelection();
    });
}

function renderObjectives(objectiveResults) {
    if (!objectiveResults || objectiveResults.length === 0) {
        return '<p>No objective data recorded.</p>';
    }
    const items = objectiveResults.map(o => `
        <li class="results-objective results-objective-${o.status}">
            ${STATUS_ICON[o.status]} <strong>${o.objective}</strong> — ${STATUS_LABEL[o.status]}
            <div class="results-objective-reason">${o.reason}</div>
        </li>
    `).join('');
    return `<ul class="results-objectives-list">${items}</ul>`;
}

function renderLog(log) {
    if (!log || log.length === 0) {
        return '<p>No issues encountered.</p>';
    }
    const notable = log.filter(l => l.type === 'warning' || l.type === 'error');
    if (notable.length === 0) {
        return '<p>✅ No problems encountered — every phase performed within healthy margins.</p>';
    }
    const items = notable.map(l => {
        const icon = l.type === 'error' ? '❌' : '⚠️';
        return `<li>${icon} <strong>[${l.phase}]</strong> ${l.message}</li>`;
    }).join('');
    return `<ul class="results-log-list">${items}</ul>`;
}

function renderScoreBreakdown(breakdown) {
    if (!breakdown) return '';
    const rows = Object.entries(breakdown).map(([key, b]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return `
            <div class="results-score-row">
                <span class="results-score-label">${label} (${(b.weight * 100).toFixed(0)}%)</span>
                <span class="results-score-value">${b.score.toFixed(0)}/100</span>
                <div class="results-score-explanation">${b.explanation}</div>
            </div>`;
    }).join('');
    return `<div class="results-score-breakdown">${rows}</div>`;
}

export default {
    renderMissionResults
};
