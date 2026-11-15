// ================================
// ORBITAL - Plain-Language Glossary
// Maps internal data keys (used by calculations/validation/scoring)
// to beginner-friendly display labels. This file is DISPLAY ONLY —
// it never changes any key, number, or logic anywhere else.
// ================================

/**
 * Science field keys (from spacecraft.js scienceValue / missions.js
 * scienceGoals) -> plain English labels for display.
 */
export const SCIENCE_FIELD_LABELS = {
    geology: 'Rocks & Ground Study',
    atmosphere: 'Air Study',
    environmental_tracking: 'Tracking Environmental Change',
    climate_monitoring: 'Climate Monitoring',
    temperature_mapping: 'Temperature Mapping',
    composition_analysis: "What It's Made Of",
    search_for_life: 'Searching for Signs of Life',
    resource_extraction: 'Finding Useful Resources',
    disaster_response: 'Disaster Warning',
    planetary_science: 'Planet Science',
    climate: 'Climate Study',
    agriculture: 'Farming & Crops Monitoring',
    deforestation: 'Forest Loss Tracking',
    planetary_defense: 'Planetary Defense (protecting Earth from asteroids)',
    trajectory_modification: "Changing an Object's Path"
};

/**
 * Get a plain label for a science field key, falling back to a
 * readable version of the key itself if it isn't in the map.
 */
export function getScienceFieldLabel(key) {
    if (SCIENCE_FIELD_LABELS[key]) return SCIENCE_FIELD_LABELS[key];
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Short plain-English glosses for technical terms we want to KEEP
 * (per the simplification rule: keep the real term, explain it).
 */
export const TERM_GLOSSES = {
    deltaV: 'how much your spacecraft can change its speed and direction',
    margin: 'how much spare safety capacity you have left',
    rtg: 'a nuclear battery that makes power without needing sunlight',
    au: 'Astronomical Unit — a way of measuring huge distances in space'
};

export default {
    SCIENCE_FIELD_LABELS,
    getScienceFieldLabel,
    TERM_GLOSSES
};
