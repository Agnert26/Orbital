// ================================
// ORBITAL - Formatting Utilities
// Format numbers, currency, and units
// ================================

/**
 * Format currency (USD)
 */
export function formatCurrency(amount) {
    if (amount >= 1000000000) {
        return '$' + (amount / 1000000000).toFixed(2) + 'B';
    } else if (amount >= 1000000) {
        return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return '$' + (amount / 1000).toFixed(0) + 'K';
    }
    return '$' + amount.toLocaleString();
}

/**
 * Format mass (kg)
 */
export function formatMass(mass) {
    if (mass >= 1000) {
        return (mass / 1000).toFixed(2) + ' tons';
    }
    return mass.toFixed(1) + ' kg';
}

/**
 * Format power (watts)
 */
export function formatPower(watts) {
    if (watts >= 1000) {
        return (watts / 1000).toFixed(2) + ' kW';
    }
    return watts.toFixed(0) + ' W';
}

/**
 * Format data rate (GB/day)
 */
export function formatDataRate(gbPerDay) {
    return gbPerDay.toFixed(2) + ' GB/day';
}

/**
 * Format distance (AU)
 */
export function formatDistance(au) {
    if (au < 0.01) {
        return (au * 149597870.7).toFixed(0) + ' km';
    }
    return au.toFixed(3) + ' AU';
}

/**
 * Format duration (days)
 */
export function formatDuration(days) {
    if (days >= 365) {
        const years = (days / 365).toFixed(1);
        return years + ' years';
    }
    return days + ' days';
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
    return (value * 100).toFixed(decimals) + '%';
}

/**
 * Format large number with commas
 */
export function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Format delta-v (m/s)
 */
export function formatDeltaV(ms) {
    if (ms >= 1000) {
        return (ms / 1000).toFixed(2) + ' km/s';
    }
    return ms.toFixed(0) + ' m/s';
}

/**
 * Abbreviate text to fit length
 */
export function abbreviate(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format resource bar percentage
 */
export function getResourceBarColor(percentage) {
    // Handle edge cases
    if (isNaN(percentage) || !isFinite(percentage) || percentage === 0) {
        return 'linear-gradient(90deg, var(--neon-cyan), var(--electric-blue))'; // Cyan (default/empty)
    }
    
    if (percentage > 0.8) {
        return 'linear-gradient(90deg, #ff3366, #ff6699)'; // Red (over limit)
    } else if (percentage > 0.6) {
        return 'linear-gradient(90deg, #ffa500, #ffcc00)'; // Orange (warning)
    } else {
        return 'linear-gradient(90deg, var(--neon-cyan), var(--electric-blue))'; // Cyan (good)
    }
}

export default {
    formatCurrency,
    formatMass,
    formatPower,
    formatDataRate,
    formatDistance,
    formatDuration,
    formatPercentage,
    formatNumber,
    formatDeltaV,
    abbreviate,
    getResourceBarColor
};
