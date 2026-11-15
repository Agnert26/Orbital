// ================================
// ORBITAL - Simulation Configuration
// Thresholds, penalties, grade bands, and the per-mission
// objective classification table used by simulationEngine.js
//
// All tunable numbers live here so they can be adjusted without
// touching engine logic. Nothing here is random; every value is
// a fixed, documented constant applied deterministically.
// ================================

import { VALIDATION_THRESHOLDS } from './constants.js';

/**
 * Thresholds used during the simulation to decide when a margin counts
 * as "tight" enough to trigger a decision point or a log warning.
 *
 * mass_margin_tight and power_margin_tight are reused directly from
 * VALIDATION_THRESHOLDS (approved baseline) — they mean something
 * different in context (simulation = "how well is this performing",
 * validation = "is this design allowed to launch at all") even though
 * the numeric value is shared.
 *
 * deltaV_margin_tight is new: it mirrors the 10% margin already
 * implied by validationEngine/calculations.js's checkDeltaV(), which
 * requires propulsion.deltaV >= required * 0.9.
 */
export const SIMULATION_THRESHOLDS = {
    mass_margin_tight: VALIDATION_THRESHOLDS.mass_margin,   // 0.10
    power_margin_tight: VALIDATION_THRESHOLDS.power_margin, // 0.15
    deltaV_margin_tight: 0.10
};

/**
 * Fixed point penalties subtracted from the Risk Management score.
 * Every one of these is tied to a specific, logged event — never random.
 */
export const SIMULATION_PENALTIES = {
    riskAccepted_launchStress: 20,   // launched despite tight mass margin, skipped structural check
    riskAccepted_fastCorrection: 15, // chose the fast transit correction despite a tight delta-v margin
    degradedArrival: 15,            // fast correction pushed delta-v margin below 0 at arrival
    dataDownlinkConflict: 10        // data generated exceeded transmission capacity at all
};

/**
 * Final score -> grade label. Checked in descending order of `min`.
 */
export const SCORE_GRADE_BANDS = [
    { min: 85, label: 'Outstanding Mission' },
    { min: 70, label: 'Successful Mission, with Lessons Learned' },
    { min: 50, label: 'Mission Completed with Significant Issues' },
    { min: 0,  label: 'Mission Mostly Failed' }
];

/**
 * Per-mission objective classification.
 *
 * type: 'engineering' — tracked by simulated margin performance, not instruments.
 * type: 'science'     — tracked by selected instruments' scienceValue overlap
 *                        with the listed scienceFields.
 *
 * Verified against the actual instrument catalog in spacecraft.js:
 * every 'science' row below has at least one real, mission-selectable
 * instrument that can score it.
 */
export const OBJECTIVE_MAP = {
    earth: [
        { objective: 'Launch satellite constellation', type: 'engineering' },
        { objective: 'Monitor climate patterns', type: 'science', scienceFields: ['climate_monitoring'] },
        { objective: 'Track deforestation rates', type: 'science', scienceFields: ['environmental_tracking'] },
        { objective: 'Provide disaster early warning', type: 'science', scienceFields: ['disaster_response'] }
    ],
    mars: [
        { objective: 'Land safely on Mars surface', type: 'engineering' },
        { objective: 'Deploy research equipment', type: 'engineering' },
        { objective: 'Collect geological samples', type: 'science', scienceFields: ['geology', 'search_for_life'] },
        { objective: 'Establish communication relay', type: 'engineering' }
    ],
    asteroid: [
        { objective: 'Rendezvous with target asteroid', type: 'engineering' },
        {
            objective: 'Deploy mining equipment',
            type: 'science',
            scienceFields: ['resource_extraction'],
            // A Spectrometer identifies whether resources are present and worth
            // extracting — it does not perform extraction itself. Wording below
            // reflects that distinction exactly; never claim mining happened.
            completionNote: "A Spectrometer aboard can identify which materials are present and worth extracting. This is the scientific groundwork a mining operation would depend on — the spacecraft doesn't perform the extraction itself.",
            achievedLabel: 'Scientifically supported (Spectrometer identified extractable resource composition)',
            missedLabel: 'Not addressed (no instrument aboard can assess resource composition)'
        },
        { objective: 'Analyze mineral composition', type: 'science', scienceFields: ['composition_analysis'] },
        { objective: 'Test deflection technology', type: 'engineering', tiedTo: 'deltaVMarginAtArrival' }
    ]
};

export default {
    SIMULATION_THRESHOLDS,
    SIMULATION_PENALTIES,
    SCORE_GRADE_BANDS,
    OBJECTIVE_MAP
};
