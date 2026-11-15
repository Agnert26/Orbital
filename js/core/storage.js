// ================================
// ORBITAL - localStorage Manager
// Save and load game state
// ================================

const STORAGE_KEY = 'orbital_game_save';
const VERSION = '1.0.0';

/**
 * Save game state to localStorage
 */
export function saveGame(gameState) {
    try {
        const saveData = {
            version: VERSION,
            timestamp: Date.now(),
            state: gameState
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        console.log('✅ Game saved successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to save game:', error);
        return false;
    }
}

/**
 * Load game state from localStorage
 */
export function loadGame() {
    try {
        const saveDataString = localStorage.getItem(STORAGE_KEY);
        
        if (!saveDataString) {
            console.log('ℹ️ No saved game found');
            return null;
        }
        
        const saveData = JSON.parse(saveDataString);
        
        // Version check
        if (saveData.version !== VERSION) {
            console.warn('⚠️ Save file version mismatch');
            // Could implement migration logic here
        }
        
        console.log('✅ Game loaded successfully');
        return saveData.state;
    } catch (error) {
        console.error('❌ Failed to load game:', error);
        return null;
    }
}

/**
 * Delete saved game
 */
export function deleteSave() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('✅ Save deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to delete save:', error);
        return false;
    }
}

/**
 * Check if save exists
 */
export function hasSavedGame() {
    return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Get save info without loading full state
 */
export function getSaveInfo() {
    try {
        const saveDataString = localStorage.getItem(STORAGE_KEY);
        
        if (!saveDataString) {
            return null;
        }
        
        const saveData = JSON.parse(saveDataString);
        
        return {
            version: saveData.version,
            timestamp: saveData.timestamp,
            date: new Date(saveData.timestamp).toLocaleString(),
            missionId: saveData.state?.selectedMission?.id || 'unknown'
        };
    } catch (error) {
        console.error('❌ Failed to get save info:', error);
        return null;
    }
}

export default {
    saveGame,
    loadGame,
    deleteSave,
    hasSavedGame,
    getSaveInfo
};
