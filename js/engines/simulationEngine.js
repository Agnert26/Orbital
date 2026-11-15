// ================================
// ORBITAL - Mission Simulation Engine
// Phase-by-phase, deterministic mission simulation.
// No randomness: every outcome is a function of the spacecraft
// configuration already built, plus the player's decisions here.
// ================================

import { gameState, initSimulationState, appendSimulationLog, recordObjectiveResult, setSimulationResults, setScore } from '../core/gameState.js';
import { PHYSICS, SCORING_WEIGHTS } from '../data/constants.js';
import { SIMULATION_THRESHOLDS, SIMULATION_PENALTIES, SCORE_GRADE_BANDS, OBJECTIVE_MAP } from '../data/simulationConfig.js';
import * as calc from '../utils/calculations.js';

const PHASE_SEQUENCE = ['launch', 'transit', 'arrival', 'science_ops', 'data_return'];

function clamp01(x) {
    return Math.min(Math.max(x, 0), 1);
}

function bucketScore(score) {
    if (score >= 60) return 'achieved';
    if (score >= 20) return 'partial';
    return 'missed';
}

function scienceFieldOverlap(fields, instruments) {
    let score = 0;
    instruments.forEach(inst => {
        const sv = inst.scienceValue || {};
        fields.forEach(f => { score += sv[f] || 0; });
    });
    return score;
}

/**
 * Begin a new mission simulation. Returns the Launch phase view.
 */
export function startSimulation() {
    initSimulationState();
    const mission = gameState.selectedMission;
    const spacecraft = gameState.spacecraft;
    return computeLaunchView(mission, spacecraft);
}

// ========== PHASE 1: LAUNCH ==========

function computeLaunchView(mission, spacecraft) {
    gameState.simulation.currentPhaseIndex = 0;
    const resources = gameState.resources;
    const massMargin = calc.calculateMassMargin(resources.mass.used, resources.mass.available);
    gameState.simulation.phaseData.massMarginAtLaunch = massMargin;

    const tight = massMargin < SIMULATION_THRESHOLDS.mass_margin_tight;
    appendSimulationLog({
        phase: 'launch',
        type: tight ? 'warning' : 'info',
        message: tight
            ? `Your spacecraft's weight safety margin at launch was only ${(massMargin * 100).toFixed(1)}% — lower than the recommended ${(SIMULATION_THRESHOLDS.mass_margin_tight * 100).toFixed(0)}%. That can mean a rougher ride to orbit.`
            : `Your spacecraft had plenty of spare weight capacity at launch (${(massMargin * 100).toFixed(1)}%) — a clean, smooth liftoff.`
    });

    return {
        phase: 'launch',
        phaseIndex: 0,
        narrative: getLaunchNarrative(mission),
        goal: "Launch your spacecraft safely without going over its weight limit.",
        status: [{ label: 'Weight Safety Margin', percent: massMargin, threshold: SIMULATION_THRESHOLDS.mass_margin_tight }],
        decision: tight ? {
            id: 'launch_risk',
            prompt: "Your spacecraft is close to its weight limit. What do you want to do?",
            options: [
                { id: 'structural_check', label: 'Do an extra safety check first', detail: 'Takes a couple of extra days, but lowers the risk of launch damage.' },
                { id: 'launch_now', label: 'Launch as scheduled', detail: 'No delay, but you accept the risk of a rougher launch.' }
            ]
        } : null,
        isLastPhase: false
    };
}

function getLaunchNarrative(mission) {
    const texts = {
        earth: 'Your satellite lifts off aboard its launch vehicle, bound for low Earth orbit.',
        mars: 'Your spacecraft lifts off, beginning its journey toward the Red Planet.',
        asteroid: 'Your spacecraft lifts off, beginning pursuit of a fast-moving near-Earth object.'
    };
    return texts[mission.id] || 'Your spacecraft lifts off from Earth.';
}

// ========== PHASE 2: TRANSIT ==========

function computeTransitView(mission, spacecraft) {
    gameState.simulation.currentPhaseIndex = 1;
    const required = PHYSICS.DELTA_V[mission.id] || 0;
    const margin = required > 0 ? (spacecraft.propulsion.deltaV - required) / required : 1;
    gameState.simulation.phaseData.deltaVMarginAtTransit = margin;

    const tight = margin < SIMULATION_THRESHOLDS.deltaV_margin_tight;
    appendSimulationLog({
        phase: 'transit',
        type: tight ? 'warning' : 'info',
        message: tight
            ? `Your fuel reserve for changing speed and direction (delta-v) was only ${(margin * 100).toFixed(1)}% above the minimum needed. Your ${spacecraft.propulsion.name} can provide ${spacecraft.propulsion.deltaV.toLocaleString()} m/s of speed change, but this trip needs at least ${required.toLocaleString()} m/s.`
            : `Your fuel reserve for changing speed and direction (delta-v) was a comfortable ${(margin * 100).toFixed(1)}% above the minimum needed.`
    });

    // Bug fix: always show the Transit phase itself, regardless of whether
    // a decision is needed. Previously, when the margin wasn't tight, this
    // function skipped straight to computeArrivalView() internally and
    // returned ITS view instead, so the player never saw a Transit screen
    // at all — advancePhase() would then be called from the Launch screen
    // and land directly on Arrival.
    if (!tight) {
        gameState.simulation.phaseData.deltaVMarginAtArrival = margin;
    }

    return {
        phase: 'transit',
        phaseIndex: 1,
        narrative: getTransitNarrative(mission),
        goal: 'Arrive with enough fuel and power left to complete the mission.',
        status: [{ label: 'Fuel Reserve for Maneuvering (Delta-v)', percent: margin, threshold: SIMULATION_THRESHOLDS.deltaV_margin_tight }],
        decision: tight ? {
            id: 'transit_correction',
            prompt: "You need to adjust your course. Your fuel reserve is tight — what do you want to do?",
            options: [
                { id: 'slow_correction', label: 'Slow, fuel-saving correction', detail: `Takes about ${Math.round(mission.duration * 0.01)} extra days, but protects your remaining fuel.` },
                { id: 'fast_correction', label: 'Fast correction, stay on schedule', detail: 'No delay, but uses more of your remaining fuel.' }
            ]
        } : null,
        isLastPhase: false
    };
}

function getTransitNarrative(mission) {
    const texts = {
        earth: 'Your satellite raises itself into its final sun-synchronous orbit.',
        mars: `Your spacecraft is partway through its ${mission.duration}-day cruise to Mars. At this distance, a radio signal takes several minutes to reach Earth — any correction you make now, Earth won't confirm until later.`,
        asteroid: 'Your spacecraft is accelerating to match the velocity of a fast-moving near-Earth object. Precision matters more than speed here.'
    };
    return texts[mission.id] || 'Your spacecraft is cruising toward its destination.';
}

// ========== DECISION HANDLER ==========

/**
 * Resolve a pending decision and return the next phase view.
 */
export function submitDecision(decisionId, choiceId) {
    const mission = gameState.selectedMission;
    const spacecraft = gameState.spacecraft;
    const pd = gameState.simulation.phaseData;

    if (decisionId === 'launch_risk') {
        pd.structuralCheckPerformed = (choiceId === 'structural_check');
        pd.riskAccepted_launchStress = (choiceId === 'launch_now');
        if (pd.structuralCheckPerformed) {
            pd.daysAdjusted += 2;
            appendSimulationLog({ phase: 'launch', type: 'info', message: "Did an extra safety check before launch — added 2 days, but lowered the risk of launch damage." });
        } else {
            appendSimulationLog({ phase: 'launch', type: 'warning', message: "Launched as scheduled even though the weight margin was tight — accepted the risk of launch stress on equipment." });
        }
        return computeTransitView(mission, spacecraft);
    }

    if (decisionId === 'transit_correction') {
        if (choiceId === 'slow_correction') {
            const days = Math.round(mission.duration * 0.01);
            pd.daysAdjusted += days;
            pd.deltaVMarginAtArrival = pd.deltaVMarginAtTransit;
            appendSimulationLog({ phase: 'transit', type: 'info', message: `Chose the slow, fuel-saving correction — added ${days} days, kept the fuel reserve at ${(pd.deltaVMarginAtArrival * 100).toFixed(1)}% above minimum.` });
        } else {
            pd.fastCorrectionChosen = true;
            pd.deltaVMarginAtArrival = pd.deltaVMarginAtTransit - 0.08;
            appendSimulationLog({ phase: 'transit', type: 'warning', message: `Chose the fast correction to stay on schedule — fuel reserve dropped to ${(pd.deltaVMarginAtArrival * 100).toFixed(1)}% by arrival.` });
            if (pd.deltaVMarginAtArrival < 0) {
                pd.degradedArrival = true;
                appendSimulationLog({ phase: 'arrival', type: 'error', message: "Ran short on fuel during arrival — the arrival maneuver was less precise, which also costs extra power for the rest of the mission." });
            }
        }
        return computeArrivalView(mission, spacecraft);
    }

    if (decisionId === 'data_priority') {
        const idx = parseInt(String(choiceId).replace('prioritize_', ''), 10);
        finalizeObjectiveResults(mission, spacecraft, idx);
        return computeDataReturnView(mission);
    }

    console.error('❌ Unknown simulation decision id:', decisionId);
    return null;
}

// ========== PHASE 3: ARRIVAL ==========

function computeArrivalView(mission, spacecraft) {
    gameState.simulation.currentPhaseIndex = 2;
    const resources = gameState.resources;
    let generated = resources.power.generated;

    const isSolar = spacecraft.powerSystem && spacecraft.powerSystem.id.startsWith('solar');
    if (isSolar && (mission.id === 'mars' || mission.id === 'asteroid')) {
        generated = generated * 0.75;
        appendSimulationLog({ phase: 'arrival', type: 'warning', message: `Solar panels make less power this far from the Sun — your actual power dropped to ${generated.toFixed(0)} W (about 75% of normal) for the rest of the mission.` });
    }

    if (gameState.simulation.phaseData.degradedArrival) {
        generated = generated * 0.90;
    }

    const margin = generated > 0 ? (generated - resources.power.consumed) / generated : 0;
    gameState.simulation.phaseData.powerMarginEffective = margin;

    appendSimulationLog({
        phase: 'arrival',
        type: margin < SIMULATION_THRESHOLDS.power_margin_tight ? 'warning' : 'info',
        message: `Spare power left after arrival: ${(margin * 100).toFixed(1)}%.`
    });

    // If delta-v margin at transit was never tight, it was already carried forward
    // as deltaVMarginAtArrival in computeTransitView before reaching here.

    return {
        phase: 'arrival',
        phaseIndex: 2,
        narrative: getArrivalNarrative(mission),
        goal: "Arrive at your destination without running out of fuel for maneuvering.",
        status: [{ label: 'Spare Power Left', percent: margin, threshold: SIMULATION_THRESHOLDS.power_margin_tight }],
        decision: null,
        isLastPhase: false
    };
}

function getArrivalNarrative(mission) {
    const texts = {
        earth: "Final engine burn complete — your satellite settles into its working orbit around Earth.",
        mars: "Your spacecraft fires its engines to slow down and enter orbit around Mars.",
        asteroid: "Your spacecraft fires its engines one last time to match the asteroid's speed and direction exactly."
    };
    return texts[mission.id] || 'Your spacecraft arrives at its destination.';
}

// ========== PHASE 4: SCIENCE OPERATIONS ==========

function computeScienceOpsView(mission, spacecraft) {
    gameState.simulation.currentPhaseIndex = 3;
    const resources = gameState.resources;
    const dataOverflow = resources.data.generated > resources.data.transmissionCapacity;
    gameState.simulation.phaseData.dataOverflow = dataOverflow;

    const objectives = OBJECTIVE_MAP[mission.id] || [];
    const scienceObjectives = objectives.filter(o => o.type === 'science');

    const status = [
        { label: 'Data Collected Each Day', text: `${resources.data.generated.toFixed(1)} GB` },
        { label: 'Data You Can Send Home Each Day', text: `${resources.data.transmissionCapacity.toFixed(1)} GB` }
    ];

    const needsDecision = dataOverflow && scienceObjectives.length > 1;

    if (needsDecision) {
        appendSimulationLog({
            phase: 'science_ops',
            type: 'warning',
            message: `Your instruments collect more data each day (${resources.data.generated.toFixed(1)} GB) than your antenna can send to Earth (${resources.data.transmissionCapacity.toFixed(1)} GB). This comes from the instruments and antenna you chose while building your spacecraft.`
        });
    } else {
        if (dataOverflow) {
            appendSimulationLog({ phase: 'science_ops', type: 'info', message: "You collected more data than you could send home, but this mission only has one science goal that needs data, so there's no tradeoff to make." });
        }
        // No decision needed — objective results are deterministic given
        // what's already known, so they can be finalized now. The player
        // still sees this phase's own screen before continuing (bug fix
        // below), they just won't be asked to choose anything here.
        finalizeObjectiveResults(mission, spacecraft, null);
    }

    // Bug fix: always show the Science Operations phase itself, regardless
    // of whether a decision is needed. Previously, whenever there was no
    // data-priority decision to make, this function skipped straight to
    // computeDataReturnView() internally and returned ITS view instead, so
    // the player never saw a Science Operations screen at all.
    return {
        phase: 'science_ops',
        phaseIndex: 3,
        narrative: getScienceOpsNarrative(mission),
        goal: "Use your instruments to complete as many mission goals as you can.",
        status,
        decision: needsDecision ? {
            id: 'data_priority',
            prompt: "You're collecting more data than you can send home right now. Which goal should get priority?",
            options: scienceObjectives.map((o, i) => ({ id: `prioritize_${i}`, label: `Prioritize: ${o.objective}` }))
        } : null,
        isLastPhase: false
    };
}

function getScienceOpsNarrative(mission) {
    const texts = {
        earth: 'Your satellite begins continuous Earth observation, collecting data on climate, land use, and disaster risk.',
        mars: 'Your spacecraft begins its primary science mission, studying Mars\'s surface, atmosphere, and geology.',
        asteroid: 'Your spacecraft begins close-range study of the asteroid, analyzing its composition and structure.'
    };
    return texts[mission.id] || 'Your spacecraft begins its primary science mission.';
}

function resolveEngineeringObjective(entry, pd) {
    if (entry.tiedTo === 'deltaVMarginAtArrival') {
        const m = pd.deltaVMarginAtArrival;
        if (m >= 0) {
            return { status: 'achieved', reason: `Your fuel reserve at arrival was ${(m * 100).toFixed(1)}% above the minimum — the maneuver went exactly as planned.` };
        }
        if (m >= -0.15) {
            return { status: 'partial', reason: `Your fuel reserve dropped to ${(m * 100).toFixed(1)}% after the fast correction — the maneuver worked, but was less precise.` };
        }
        return { status: 'missed', reason: `Your fuel reserve fell to ${(m * 100).toFixed(1)}% — not enough fuel left to complete this maneuver reliably.` };
    }

    if (pd.degradedArrival) {
        return { status: 'partial', reason: 'The rushed arrival (from choosing the fast correction) left some systems not working at their best.' };
    }
    if (pd.riskAccepted_launchStress && pd.massMarginAtLaunch < SIMULATION_THRESHOLDS.mass_margin_tight) {
        return { status: 'partial', reason: `Your weight safety margin was tight at launch (${(pd.massMarginAtLaunch * 100).toFixed(1)}%) and you skipped the safety check, causing minor stress on your equipment.` };
    }
    return { status: 'achieved', reason: "Your spacecraft's safety margins held up well through launch and arrival — equipment deployed and is working normally." };
}

function finalizeObjectiveResults(mission, spacecraft, prioritizedIndex) {
    const objectives = OBJECTIVE_MAP[mission.id] || [];
    const pd = gameState.simulation.phaseData;
    let scienceIdx = -1;

    objectives.forEach(entry => {
        if (entry.type === 'engineering') {
            const r = resolveEngineeringObjective(entry, pd);
            recordObjectiveResult({ objective: entry.objective, type: 'engineering', status: r.status, reason: r.reason });
            return;
        }

        scienceIdx += 1;
        let raw = scienceFieldOverlap(entry.scienceFields, spacecraft.instruments);
        const deprioritized = pd.dataOverflow && prioritizedIndex !== null && scienceIdx !== prioritizedIndex;
        if (deprioritized) {
            raw = raw * 0.5;
        }
        const status = bucketScore(raw);

        let reason;
        if (entry.completionNote) {
            reason = status === 'missed' ? entry.missedLabel : entry.achievedLabel;
        } else if (deprioritized) {
            reason = "Your instruments could study this, but it wasn't sent home first because of the data limit — only partial credit.";
        } else {
            reason = `How well your instruments matched this goal: ${raw.toFixed(0)} out of 100 (60+ = fully met, 20-59 = partly met, below 20 = not met).`;
        }
        recordObjectiveResult({ objective: entry.objective, type: 'science', status, reason });
    });
}

// ========== PHASE 5: DATA RETURN ==========

function computeDataReturnView(mission) {
    gameState.simulation.currentPhaseIndex = 4;
    appendSimulationLog({ phase: 'data_return', type: 'info', message: 'Final telemetry and science data downlinked to mission control.' });
    return {
        phase: 'data_return',
        phaseIndex: 4,
        narrative: getDataReturnNarrative(mission),
        goal: 'Confirm all remaining data has been transmitted and close out the mission.',
        status: [],
        decision: null,
        isLastPhase: true
    };
}

function getDataReturnNarrative(mission) {
    return 'Your spacecraft transmits its final data home. Mission control begins compiling the results.';
}

// ========== CONTINUE (phases with no decision) ==========

/**
 * Called by the UI's "Continue" button for phases that had no decision.
 */
export function continuePhase() {
    const mission = gameState.selectedMission;
    const spacecraft = gameState.spacecraft;
    const current = PHASE_SEQUENCE[gameState.simulation.currentPhaseIndex];

    switch (current) {
        case 'launch': return computeTransitView(mission, spacecraft);
        case 'transit': return computeArrivalView(mission, spacecraft);
        case 'arrival': return computeScienceOpsView(mission, spacecraft);
        case 'science_ops': return computeDataReturnView(mission);
        default:
            console.error('❌ continuePhase() called with no next phase from:', current);
            return null;
    }
}

// ========== FINAL RESULTS ==========

/**
 * Compute the final weighted score and commit results to gameState.
 * Called once, after the Data Return phase.
 */
export function computeFinalResults() {
    const mission = gameState.selectedMission;
    const spacecraft = gameState.spacecraft;
    const resources = gameState.resources;
    const pd = gameState.simulation.phaseData;

    const scienceReturn = calc.calculateScienceScore(spacecraft.instruments, mission);
    const costEfficiency = calc.calculateBudgetEfficiency(resources.budget.spent, resources.budget.total);

    const massScore = clamp01(pd.massMarginAtLaunch / SIMULATION_THRESHOLDS.mass_margin_tight) * 100;
    const powerScore = clamp01(pd.powerMarginEffective / SIMULATION_THRESHOLDS.power_margin_tight) * 100;
    const deltaVScore = clamp01(pd.deltaVMarginAtArrival / SIMULATION_THRESHOLDS.deltaV_margin_tight) * 100;

    const lifetime = calc.calculateLifetime(spacecraft, spacecraft.powerSystem, mission);
    const requiredDuration = mission.duration + pd.daysAdjusted;
    const lifetimeScore = requiredDuration > 0 ? clamp01(lifetime.actual / requiredDuration) * 100 : 100;

    const technicalSuccess = (massScore + powerScore + deltaVScore + lifetimeScore) / 4;

    const missionFields = Object.keys(mission.scienceGoals || {});
    const fieldsAddressed = missionFields.filter(f =>
        spacecraft.instruments.some(inst => (inst.scienceValue || {})[f] > 0)
    ).length;
    const innovation = missionFields.length > 0 ? (fieldsAddressed / missionFields.length) * 100 : 0;

    let riskPenalty = 0;
    const penaltyReasons = [];
    if (pd.riskAccepted_launchStress) {
        riskPenalty += SIMULATION_PENALTIES.riskAccepted_launchStress;
        penaltyReasons.push(`You launched even though your weight margin was tight, and skipped the extra safety check (-${SIMULATION_PENALTIES.riskAccepted_launchStress} points)`);
    }
    if (pd.fastCorrectionChosen) {
        riskPenalty += SIMULATION_PENALTIES.riskAccepted_fastCorrection;
        penaltyReasons.push(`You picked the faster course correction even though your fuel reserve was low (-${SIMULATION_PENALTIES.riskAccepted_fastCorrection} points)`);
    }
    if (pd.degradedArrival) {
        riskPenalty += SIMULATION_PENALTIES.degradedArrival;
        penaltyReasons.push(`The fast correction cost extra fuel, making your arrival less precise (-${SIMULATION_PENALTIES.degradedArrival} points)`);
    }
    if (pd.dataOverflow) {
        riskPenalty += SIMULATION_PENALTIES.dataDownlinkConflict;
        penaltyReasons.push(`Your instruments collected more data than your antenna could send home (-${SIMULATION_PENALTIES.dataDownlinkConflict} points)`);
    }
    const riskManagement = clamp01((100 - riskPenalty) / 100) * 100;

    const overall =
        scienceReturn * SCORING_WEIGHTS.science_return +
        costEfficiency * SCORING_WEIGHTS.cost_efficiency +
        technicalSuccess * SCORING_WEIGHTS.technical_success +
        innovation * SCORING_WEIGHTS.innovation +
        riskManagement * SCORING_WEIGHTS.risk_management;

    const grade = SCORE_GRADE_BANDS.find(b => overall >= b.min) || SCORE_GRADE_BANDS[SCORE_GRADE_BANDS.length - 1];

    const breakdown = {
        science_return: { score: scienceReturn, weight: SCORING_WEIGHTS.science_return, explanation: `How well your instruments matched what this ${mission.name} mission needed to study.` },
        cost_efficiency: { score: costEfficiency, weight: SCORING_WEIGHTS.cost_efficiency, explanation: `How wisely you spent your budget. Spending 60-80% works best. (You used ${((resources.budget.spent / resources.budget.total) * 100).toFixed(0)}%.)` },
        technical_success: { score: technicalSuccess, weight: SCORING_WEIGHTS.technical_success, explanation: "How well your spacecraft's weight, power, fuel, and expected lifespan held up during the mission." },
        innovation: { score: innovation, weight: SCORING_WEIGHTS.innovation, explanation: `How many different science goals your instruments covered (${fieldsAddressed} of ${missionFields.length}).` },
        risk_management: { score: riskManagement, weight: SCORING_WEIGHTS.risk_management, explanation: penaltyReasons.length > 0 ? penaltyReasons.join('; ') : "You avoided risky choices, and never ran into a data-sending problem." }
    };

    const results = {
        objectiveResults: gameState.simulation.objectiveResults,
        log: gameState.simulation.log,
        dataGenerated: resources.data.generated,
        scienceCoverage: scienceReturn,
        grade: grade.label,
        overall
    };

    setScore(overall, breakdown);
    setSimulationResults(overall >= 50, results);

    return results;
}

export default {
    startSimulation,
    submitDecision,
    continuePhase,
    computeFinalResults
};
