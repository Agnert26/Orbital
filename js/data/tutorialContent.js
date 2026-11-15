// ================================
// ORBITAL - Tutorial & Guide Content
// All new authored prose for the "How to Play" guide.
// Numeric facts are NEVER hardcoded here — tutorialUI.js interpolates
// them live from constants.js / simulationConfig.js / missions.js /
// spacecraft.js so the guide can never drift from the real game data.
// ================================

export const WELCOME_TEXT = {
    title: 'Welcome to ORBITAL',
    intro: `ORBITAL is a space mission design game. You play the role of a mission
        engineer: you pick a destination, design a spacecraft within real
        resource limits, choose the scientific instruments it carries, and then
        watch your design actually fly the mission — phase by phase — to see
        whether it succeeds.`,
    flowTitle: 'The gameplay flow',
    flowSteps: [
        { icon: '🚀', label: 'Select a Mission', detail: 'Choose Earth, Mars, or Asteroid. Each has different objectives and challenges.' },
        { icon: '📋', label: 'Read the Mission Briefing', detail: 'See exactly what your spacecraft needs to succeed before you start building.' },
        { icon: '🛰️', label: 'Build Your Spacecraft', detail: 'Pick a bus, power system, propulsion, and communications antenna.' },
        { icon: '🔬', label: 'Choose Instruments', detail: 'Add the scientific instruments that match your mission\'s goals.' },
        { icon: '🎬', label: 'Run the Simulation', detail: 'Your spacecraft flies the mission through five real phases. Your choices along the way matter.' },
        { icon: '🏆', label: 'Review Your Results', detail: 'See which objectives you completed, what went wrong (and why), and your final score.' }
    ],
    closing: `You can revisit this guide at any time from the "How to Play" button in
        the sidebar — you never have to see it again if you don't want to, but
        it's always there.`
};

export const RULE_SECTIONS = {
    resources: {
        title: 'Resource Constraints',
        intro: `Every spacecraft you design is limited by four real resources. Go over
            any of them and your design will show an error or warning before you
            can launch.`
        // Specific margin numbers (mass/power/budget) are interpolated live
        // in tutorialUI.js from VALIDATION_THRESHOLDS / RESOURCE_LIMITS.
    },
    validation: {
        title: 'Validation: Errors vs. Warnings',
        intro: `Before you can start a mission, your design is checked automatically.`,
        errors: `Errors block you from launching entirely — things like a missing
            required component, too few instruments, or not enough fuel (delta-v)
            to reach your destination.`,
        warnings: `Warnings let you proceed, but flag a design choice worth
            reconsidering — like a thin safety margin, a component that isn't
            ideal for this mission, or low overall science coverage.`
    },
    simulation: {
        title: 'Mission Success and Failure',
        intro: `Passing validation only means your design is allowed to launch — it
            doesn't guarantee success. The mission simulation then plays out five
            real phases (Launch, Transit, Arrival, Science Operations, Data
            Return). Tight margins can trigger decisions mid-mission, and the
            choices you make there affect your final outcome, your objectives,
            and your score.`
    },
    scoring: {
        title: 'How Your Final Score Works',
        intro: `Your final score is a weighted average of five factors, each one
            tied directly to decisions you made.`
        // The five named weights/percentages are interpolated live from
        // SCORING_WEIGHTS in constants.js, and the grade bands from
        // SCORE_GRADE_BANDS in simulationConfig.js.
    }
};

export const MISSION_GUIDE_INTRO = `Each mission has its own objectives, environment, and
    challenges. Read a mission's details below, or open its full briefing
    in-game for mission-specific tips.`;

export const COMPONENT_CATEGORY_INFO = {
    bus: {
        icon: '🛸',
        title: 'Spacecraft Bus',
        blurb: `The bus is your spacecraft's main structure. It determines how many
            instruments you can carry and how much payload mass you can bring.`
    },
    power: {
        icon: '⚡',
        title: 'Power System',
        blurb: `Power systems generate the electricity your spacecraft and
            instruments need to run. Solar arrays are cheaper but produce less
            power far from the Sun; RTGs (radioisotope generators) cost more but
            work reliably anywhere.`
    },
    propulsion: {
        icon: '🚀',
        title: 'Propulsion',
        blurb: `Propulsion is what moves your spacecraft. It gives you delta-v —
            how much your spacecraft can change its speed and direction — which
            you need to reach your destination and make course corrections along
            the way. Different missions need very different amounts of delta-v.`
    },
    communications: {
        icon: '📡',
        title: 'Communications',
        blurb: `Your antenna determines how much science data you can send home
            each day, and the maximum distance it can reliably reach.`
    }
};

export const INSTRUMENT_GUIDE_INTRO = `Instruments are what actually accomplish your mission's
    science objectives. Each one measures something specific, at a cost in
    mass, power, budget, and the data it generates every day.`;

export const CONTEXTUAL_TIPS = {
    missionSelection: '💡 Pick a mission to see its goals and requirements — compare all three before committing.',
    missionBriefing: '💡 This is your full mission briefing. Scroll down to see exactly what your spacecraft will need.',
    spacecraftBuilder: '💡 Choose one option in each category below. Watch the resource bars above — they turn orange or red if you go too far.',
    instrumentSelection: '💡 Pick instruments that match your mission\'s science goals. The coverage bar shows how well your choices align.',
    missionSimulation: '💡 Your mission plays out phase by phase. When a decision appears, think about your spacecraft\'s margins before choosing.',
    missionResults: '💡 Review what succeeded and what didn\'t — then use "Redesign Spacecraft" to try fixing it with the same mission.'
};

export default {
    WELCOME_TEXT,
    RULE_SECTIONS,
    MISSION_GUIDE_INTRO,
    COMPONENT_CATEGORY_INFO,
    INSTRUMENT_GUIDE_INTRO,
    CONTEXTUAL_TIPS
};
