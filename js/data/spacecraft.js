// ================================
// ORBITAL - Spacecraft Components
// Available components for building missions
// ================================

/**
 * Spacecraft bus options
 * The main structure and systems of the spacecraft
 */
export const spacecraftBuses = {
    small: {
        id: 'small',
        name: 'Small Bus',
        description: 'Compact spacecraft bus suitable for simple missions',
        mass: 500,           // kg
        power: 100,          // watts (base systems)
        cost: 50000000,      // $50M
        capacity: {
            instruments: 3,
            maxPayloadMass: 200
        },
        suitableFor: ['earth']
    },
    
    medium: {
        id: 'medium',
        name: 'Medium Bus',
        description: 'Standard spacecraft bus for moderate complexity missions',
        mass: 1200,          // kg
        power: 200,          // watts
        cost: 120000000,     // $120M
        capacity: {
            instruments: 5,
            maxPayloadMass: 500
        },
        suitableFor: ['earth', 'asteroid']
    },
    
    large: {
        id: 'large',
        name: 'Large Bus',
        description: 'Heavy spacecraft bus for complex deep space missions',
        mass: 2500,          // kg
        power: 400,          // watts
        cost: 250000000,     // $250M
        capacity: {
            instruments: 8,
            maxPayloadMass: 1500
        },
        suitableFor: ['mars', 'asteroid']
    }
};

/**
 * Power systems
 * Generate electricity for spacecraft and instruments
 */
export const powerSystems = {
    solar_small: {
        id: 'solar_small',
        name: 'Small Solar Arrays',
        description: 'Compact solar panels for near-Earth missions',
        mass: 150,           // kg
        power: 500,          // watts generated
        cost: 30000000,      // $30M
        lifetime: 3650,      // 10 years
        efficiency: 0.28,
        suitableFor: ['earth']
    },
    
    solar_medium: {
        id: 'solar_medium',
        name: 'Medium Solar Arrays',
        description: 'Standard solar arrays with good efficiency',
        mass: 400,           // kg
        power: 2000,         // watts generated
        cost: 80000000,      // $80M
        lifetime: 3650,      // 10 years
        efficiency: 0.30,
        suitableFor: ['earth', 'mars', 'asteroid']
    },
    
    solar_large: {
        id: 'solar_large',
        name: 'Large Solar Arrays',
        description: 'High-power solar arrays for demanding missions',
        mass: 800,           // kg
        power: 5000,         // watts generated
        cost: 150000000,     // $150M
        lifetime: 3650,      // 10 years
        efficiency: 0.32,
        suitableFor: ['earth', 'mars']
    },
    
    rtg_small: {
        id: 'rtg_small',
        name: 'Small RTG',
        description: 'Radioisotope thermoelectric generator for deep space',
        mass: 55,            // kg
        power: 300,          // watts generated
        cost: 100000000,     // $100M (expensive but reliable)
        lifetime: 5475,      // 15 years
        efficiency: 0.07,
        suitableFor: ['mars', 'asteroid']
    },
    
    rtg_large: {
        id: 'rtg_large',
        name: 'Large RTG',
        description: 'High-output RTG for extended deep space missions',
        mass: 110,           // kg
        power: 1000,         // watts generated
        cost: 200000000,     // $200M
        lifetime: 5475,      // 15 years
        efficiency: 0.08,
        suitableFor: ['mars', 'asteroid']
    }
};

/**
 * Propulsion systems
 * For orbital maneuvers and trajectory corrections
 */
export const propulsionSystems = {
    chemical_small: {
        id: 'chemical_small',
        name: 'Small Chemical Thruster',
        description: 'Basic propulsion for orbital adjustments',
        mass: 200,           // kg (dry)
        fuelMass: 300,       // kg
        cost: 25000000,      // $25M
        deltaV: 500,         // m/s capability
        thrust: 100,         // Newtons
        suitableFor: ['earth']
    },
    
    chemical_medium: {
        id: 'chemical_medium',
        name: 'Medium Chemical Thruster',
        description: 'Standard propulsion system',
        mass: 400,           // kg (dry)
        fuelMass: 800,       // kg
        cost: 60000000,      // $60M
        deltaV: 1500,        // m/s capability
        thrust: 500,         // Newtons
        suitableFor: ['earth', 'asteroid']
    },
    
    chemical_large: {
        id: 'chemical_large',
        name: 'Large Chemical Thruster',
        description: 'High-performance propulsion for interplanetary missions',
        mass: 800,           // kg (dry)
        fuelMass: 2000,      // kg
        cost: 150000000,     // $150M
        deltaV: 3500,        // m/s capability
        thrust: 2000,        // Newtons
        suitableFor: ['mars', 'asteroid']
    },
    
    ion_drive: {
        id: 'ion_drive',
        name: 'Ion Drive',
        description: 'Efficient electric propulsion for long-duration missions',
        mass: 300,           // kg
        fuelMass: 150,       // kg (xenon)
        cost: 120000000,     // $120M
        deltaV: 8000,        // m/s capability (high efficiency)
        thrust: 0.5,         // Newtons (very low thrust)
        power: 3000,         // watts required
        suitableFor: ['asteroid', 'mars']
    }
};

/**
 * Communications systems
 * For data transmission to Earth
 */
export const communicationsSystems = {
    low_gain: {
        id: 'low_gain',
        name: 'Low Gain Antenna',
        description: 'Basic communications for near-Earth missions',
        mass: 20,            // kg
        power: 50,           // watts
        cost: 5000000,       // $5M
        dataRate: 0.5,       // GB/day
        maxDistance: 0.1,    // AU
        suitableFor: ['earth']
    },
    
    medium_gain: {
        id: 'medium_gain',
        name: 'Medium Gain Antenna',
        description: 'Standard deep space communications',
        mass: 50,            // kg
        power: 100,          // watts
        cost: 20000000,      // $20M
        dataRate: 2.0,       // GB/day
        maxDistance: 2.0,    // AU
        suitableFor: ['earth', 'mars', 'asteroid']
    },
    
    high_gain: {
        id: 'high_gain',
        name: 'High Gain Antenna',
        description: 'Advanced high-bandwidth communications',
        mass: 120,           // kg
        power: 200,          // watts
        cost: 50000000,      // $50M
        dataRate: 10.0,      // GB/day
        maxDistance: 3.0,    // AU
        suitableFor: ['earth', 'mars', 'asteroid']
    }
};

/**
 * Scientific instruments
 * Each instrument has specific science objectives
 */
export const instruments = {
    camera_visible: {
        id: 'camera_visible',
        name: 'Visible Light Camera',
        description: 'High-resolution optical imaging',
        mass: 30,            // kg
        power: 80,           // watts
        cost: 25000000,      // $25M
        dataRate: 2.0,       // GB/day
        scienceValue: {
            geology: 20,
            atmosphere: 10,
            environmental_tracking: 30
        },
        suitableFor: ['mars', 'earth', 'asteroid']
    },
    
    camera_infrared: {
        id: 'camera_infrared',
        name: 'Infrared Camera',
        description: 'Thermal imaging and night observation',
        mass: 35,            // kg
        power: 90,           // watts
        cost: 30000000,      // $30M
        dataRate: 1.5,       // GB/day
        scienceValue: {
            geology: 15,
            climate_monitoring: 25,
            temperature_mapping: 30
        },
        suitableFor: ['mars', 'earth', 'asteroid']
    },
    
    spectrometer: {
        id: 'spectrometer',
        name: 'Spectrometer',
        description: 'Analyze chemical composition',
        mass: 25,            // kg
        power: 60,           // watts
        cost: 35000000,      // $35M
        dataRate: 0.5,       // GB/day
        scienceValue: {
            composition_analysis: 40,
            atmosphere: 30,
            search_for_life: 20,
            // Spectral/compositional analysis is the real-world technique used to identify
            // whether a body contains extractable metals, water ice, or other volatiles
            // (e.g. the kind of spectral analysis flown on missions like OSIRIS-REx).
            // It identifies resource potential — it does not perform extraction.
            resource_extraction: 30
        },
        suitableFor: ['mars', 'asteroid']
    },
    
    radar: {
        id: 'radar',
        name: 'Synthetic Aperture Radar',
        description: 'All-weather surface imaging',
        mass: 150,           // kg
        power: 300,          // watts
        cost: 80000000,      // $80M
        dataRate: 5.0,       // GB/day
        scienceValue: {
            geology: 30,
            environmental_tracking: 35,
            disaster_response: 30
        },
        suitableFor: ['earth', 'mars']
    },
    
    magnetometer: {
        id: 'magnetometer',
        name: 'Magnetometer',
        description: 'Measure magnetic fields',
        mass: 10,            // kg
        power: 20,           // watts
        cost: 15000000,      // $15M
        dataRate: 0.1,       // GB/day
        scienceValue: {
            geology: 15,
            planetary_science: 30
        },
        suitableFor: ['mars', 'asteroid']
    },
    
    drill: {
        id: 'drill',
        name: 'Sample Drill',
        description: 'Collect subsurface samples',
        mass: 80,            // kg
        power: 150,          // watts
        cost: 60000000,      // $60M
        dataRate: 0.2,       // GB/day
        scienceValue: {
            geology: 40,
            search_for_life: 35,
            composition_analysis: 30
        },
        suitableFor: ['mars']
    },
    
    weather_station: {
        id: 'weather_station',
        name: 'Weather Station',
        description: 'Monitor atmospheric conditions',
        mass: 20,            // kg
        power: 40,           // watts
        cost: 20000000,      // $20M
        dataRate: 0.3,       // GB/day
        scienceValue: {
            atmosphere: 40,
            climate_monitoring: 35,
            climate: 30,
            // Weather stations measure temperature, precipitation, humidity and wind —
            // the standard real-world inputs to agricultural monitoring (frost warnings,
            // drought/irrigation timing, growing-season forecasting).
            agriculture: 30
        },
        suitableFor: ['mars', 'earth']
    },
    
    lidar: {
        id: 'lidar',
        name: 'LIDAR',
        description: 'Laser-based 3D mapping',
        mass: 40,            // kg
        power: 120,          // watts
        cost: 45000000,      // $45M
        dataRate: 3.0,       // GB/day
        scienceValue: {
            geology: 25,
            environmental_tracking: 30,
            deforestation: 35
        },
        suitableFor: ['earth', 'mars']
    }
};

/**
 * Helper functions
 */

export function getComponentById(category, id) {
    const categories = {
        bus: spacecraftBuses,
        power: powerSystems,
        propulsion: propulsionSystems,
        communications: communicationsSystems,
        instrument: instruments
    };
    
    return categories[category]?.[id] || null;
}

export function getComponentsByMission(category, missionId) {
    const categories = {
        bus: spacecraftBuses,
        power: powerSystems,
        propulsion: propulsionSystems,
        communications: communicationsSystems,
        instrument: instruments
    };
    
    const components = categories[category];
    if (!components) return [];
    
    return Object.values(components).filter(component => 
        component.suitableFor.includes(missionId)
    );
}

export default {
    spacecraftBuses,
    powerSystems,
    propulsionSystems,
    communicationsSystems,
    instruments,
    getComponentById,
    getComponentsByMission
};
