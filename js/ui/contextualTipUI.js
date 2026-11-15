// ================================
// ORBITAL - Contextual Tip UI
// One short static tip line, inserted once per gameplay screen.
// ================================

import { CONTEXTUAL_TIPS } from '../data/tutorialContent.js';

/**
 * Insert a short contextual tip as the first child of containerEl,
 * unless one has already been inserted (guards against duplicate
 * insertion if a screen's render function runs more than once).
 *
 * @param {string} screenKey - key into CONTEXTUAL_TIPS
 * @param {HTMLElement} containerEl - element to prepend the tip into
 */
export function renderContextualTip(screenKey, containerEl) {
    if (!containerEl) return;

    const text = CONTEXTUAL_TIPS[screenKey];
    if (!text) return;

    // Avoid stacking duplicate tips if this is called again on re-render
    const existing = containerEl.querySelector(`.contextual-tip[data-screen="${screenKey}"]`);
    if (existing) return;

    const tip = document.createElement('div');
    tip.className = 'contextual-tip';
    tip.dataset.screen = screenKey;
    tip.textContent = text;

    containerEl.insertBefore(tip, containerEl.firstChild);
}

export default {
    renderContextualTip
};
