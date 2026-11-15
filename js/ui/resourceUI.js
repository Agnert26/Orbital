// ================================
// ORBITAL - Resource UI
// Real-time resource dashboard updates
// ================================

import { getResourceSummary } from '../managers/resourceManager.js';
import { formatCurrency, formatMass, formatPower, formatDataRate, getResourceBarColor } from '../utils/formatters.js';

/**
 * Update all resource displays
 */
export function updateResourceDisplay() {
    const summary = getResourceSummary();
    
    updateBudgetDisplay(summary.budget);
    updatePowerDisplay(summary.power);
    updateMassDisplay(summary.mass);
    updateDataDisplay(summary.data);
    
    console.log('📊 Resource display updated');
}

/**
 * Update budget display
 */
function updateBudgetDisplay(budget) {
    const fillElement = document.querySelector('.resource-item:nth-child(1) .resource-fill');
    const valueElement = document.querySelector('.resource-item:nth-child(1) .resource-value');
    
    if (!fillElement || !valueElement) return;
    
    const percentage = budget.percentage || 0;
    const safePercentage = Math.min(Math.max(percentage, 0), 1);
    
    fillElement.style.width = `${(safePercentage * 100).toFixed(1)}%`;
    fillElement.style.background = getResourceBarColor(safePercentage);
    
    valueElement.textContent = `${formatCurrency(budget.spent)} / ${formatCurrency(budget.total)}`;
    
    // Add status indicator
    if (budget.status === 'exceeded') {
        valueElement.style.color = 'var(--danger)';
    } else if (safePercentage > 0.8) {
        valueElement.style.color = 'var(--warning)';
    } else {
        valueElement.style.color = 'var(--text-secondary)';
    }
}

/**
 * Update power display
 */
function updatePowerDisplay(power) {
    const fillElement = document.querySelector('.resource-item:nth-child(2) .resource-fill');
    const valueElement = document.querySelector('.resource-item:nth-child(2) .resource-value');
    
    if (!fillElement || !valueElement) return;
    
    // Handle edge case: no power system selected yet
    const percentage = (power.generated > 0) ? (power.consumed / power.generated) : 0;
    const safePercentage = Math.min(Math.max(percentage, 0), 1);
    
    fillElement.style.width = `${(safePercentage * 100).toFixed(1)}%`;
    fillElement.style.background = getResourceBarColor(safePercentage);
    
    valueElement.textContent = `${formatPower(power.consumed)} / ${formatPower(power.generated)}`;
    
    // Add status indicator
    if (power.status === 'exceeded') {
        valueElement.style.color = 'var(--danger)';
    } else if (safePercentage > 0.8) {
        valueElement.style.color = 'var(--warning)';
    } else {
        valueElement.style.color = 'var(--text-secondary)';
    }
}

/**
 * Update mass display
 */
function updateMassDisplay(mass) {
    const fillElement = document.querySelector('.resource-item:nth-child(3) .resource-fill');
    const valueElement = document.querySelector('.resource-item:nth-child(3) .resource-value');
    
    if (!fillElement || !valueElement) return;
    
    const percentage = mass.percentage || 0;
    const safePercentage = Math.min(Math.max(percentage, 0), 1);
    
    fillElement.style.width = `${(safePercentage * 100).toFixed(1)}%`;
    fillElement.style.background = getResourceBarColor(safePercentage);
    
    valueElement.textContent = `${formatMass(mass.used)} / ${formatMass(mass.available)}`;
    
    // Add status indicator
    if (mass.status === 'exceeded') {
        valueElement.style.color = 'var(--danger)';
    } else if (safePercentage > 0.8) {
        valueElement.style.color = 'var(--warning)';
    } else {
        valueElement.style.color = 'var(--text-secondary)';
    }
}

/**
 * Update data display
 */
function updateDataDisplay(data) {
    const fillElement = document.querySelector('.resource-item:nth-child(4) .resource-fill');
    const valueElement = document.querySelector('.resource-item:nth-child(4) .resource-value');
    
    if (!fillElement || !valueElement) return;
    
    const percentage = (data.capacity > 0) ? (data.generated / data.capacity) : 0;
    const safePercentage = Math.min(Math.max(percentage, 0), 1);
    
    fillElement.style.width = `${(safePercentage * 100).toFixed(1)}%`;
    fillElement.style.background = getResourceBarColor(safePercentage);
    
    valueElement.textContent = `${formatDataRate(data.generated)} / ${formatDataRate(data.capacity)}`;
    
    // Add status indicator
    if (data.status === 'warning') {
        valueElement.style.color = 'var(--warning)';
    } else {
        valueElement.style.color = 'var(--text-secondary)';
    }
}

/**
 * Show resource error notification
 */
export function showResourceError(message) {
    showNotification(message, 'error');
}

/**
 * Show resource warning notification
 */
export function showResourceWarning(message) {
    showNotification(message, 'warning');
}

/**
 * Show success notification
 */
export function showResourceSuccess(message) {
    showNotification(message, 'success');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `resource-notification resource-notification-${type}`;
    
    const colors = {
        success: 'rgba(0, 255, 136, 0.95)',
        error: 'rgba(255, 51, 102, 0.95)',
        warning: 'rgba(255, 165, 0, 0.95)',
        info: 'rgba(0, 217, 255, 0.95)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        font-size: 0.875rem;
        font-weight: 500;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Initialize resource UI
 */
export function initResourceUI() {
    console.log('✅ Resource UI initialized');
}

export default {
    updateResourceDisplay,
    showResourceError,
    showResourceWarning,
    showResourceSuccess,
    initResourceUI
};
