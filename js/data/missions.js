// ================================
// ORBITAL - Mission Definitions
// Extracted from original script.js
// ================================

/**
 * Mission templates with requirements and objectives
 */
export const missions = {
    mars: {
        id: 'mars',
        name: 'Mars Exploration',
        icon: '🔴',
        description: 'Lead a pioneering expedition to the Red Planet. Establish a sustainable base, conduct scientific research, and search for signs of ancient life.',
        duration: 687, // days (Mars sol)
        difficulty: 'High',
        
        // Resource requirements
        requirements: {
            budget: 2500000000,      // $2.5B
            mass: 8000,              // kg
            power: 2000,             // watts
            data: 5.0,               // GB/day
            lifetime: 687            // days
        },
        
        // Mission objectives
        objectives: [
            'Land safely on Mars surface',
            'Deploy research equipment',
            'Collect geological samples',
            'Establish communication relay'
        ],
        
        // Science goals (for scoring)
        scienceGoals: {
            geology: 30,
            atmosphere: 20,
            search_for_life: 30,
            climate: 20
        },
        
        // Environmental challenges
        environment: {
            radiation: 'high',
            temperature: 'extreme',
            dust: 'high',
            gravity: 0.38  // fraction of Earth
        },
        
        // Orbit parameters
        targetOrbit: {
            type: 'mars_orbit',
            altitude: 400,  // km above Mars surface
            inclination: 25 // degrees
        }
    },

    earth: {
        id: 'earth',
        name: 'Earth Observation',
        icon: '🌍',
        description: 'Deploy an advanced satellite network to monitor climate change, track natural disasters, and support global environmental research initiatives.',
        duration: 365, // days
        difficulty: 'Medium',
        
        // Resource requirements
        requirements: {
            budget: 1200000000,      // $1.2B
            mass: 3000,              // kg
            power: 1500,             // watts
            data: 10.0,              // GB/day (high data rate)
            lifetime: 1825           // 5 years
        },
        
        // Mission objectives
        objectives: [
            'Launch satellite constellation',
            'Monitor climate patterns',
            'Track deforestation rates',
            'Provide disaster early warning'
        ],
        
        // Science goals (for scoring)
        scienceGoals: {
            climate_monitoring: 35,
            disaster_response: 25,
            environmental_tracking: 25,
            agriculture: 15
        },
        
        // Environmental challenges
        environment: {
            radiation: 'moderate',
            temperature: 'controlled',
            debris: 'moderate',
            gravity: 1.0  // Earth
        },
        
        // Orbit parameters
        targetOrbit: {
            type: 'sun_synchronous',
            altitude: 800,  // km
            inclination: 98 // degrees
        }
    },

    asteroid: {
        id: 'asteroid',
        name: 'Asteroid Research',
        icon: '☄️',
        description: 'Intercept and study a near-Earth asteroid. Extract valuable resources, analyze composition, and assess planetary defense capabilities.',
        duration: 540, // days
        difficulty: 'Extreme',
        
        // Resource requirements
        requirements: {
            budget: 1800000000,      // $1.8B
            mass: 5000,              // kg
            power: 1000,             // watts
            data: 2.0,               // GB/day
            lifetime: 540            // days
        },
        
        // Mission objectives
        objectives: [
            'Rendezvous with target asteroid',
            'Deploy mining equipment',
            'Analyze mineral composition',
            'Test deflection technology'
        ],
        
        // Science goals (for scoring)
        scienceGoals: {
            composition_analysis: 30,
            resource_extraction: 25,
            planetary_defense: 30,
            trajectory_modification: 15
        },
        
        // Environmental challenges
        environment: {
            radiation: 'extreme',
            temperature: 'extreme',
            microgravity: 'extreme',
            gravity: 0.0001  // Nearly zero
        },
        
        // Orbit parameters
        targetOrbit: {
            type: 'heliocentric',
            altitude: 'variable',
            inclination: 'variable'
        }
    }
};

/**
 * Get mission by ID
 */
export function getMission(missionId) {
    return missions[missionId] || null;
}

/**
 * Get all available missions
 */
export function getAllMissions() {
    return Object.values(missions);
}

/**
 * Get mission IDs
 */
export function getMissionIds() {
    return Object.keys(missions);
}

export default missions;
