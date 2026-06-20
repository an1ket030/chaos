"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CARD_TIER_COLORS = void 0;
exports.getCardTier = getCardTier;
exports.getBaseValue = getBaseValue;
// Card tier calculation
function getCardTier(rating) {
    if (rating >= 95)
        return 'icon';
    if (rating >= 90)
        return 'special';
    if (rating >= 85)
        return 'rare-gold';
    if (rating >= 80)
        return 'gold';
    if (rating >= 70)
        return 'silver';
    return 'bronze';
}
// Base CP value calculation
function getBaseValue(rating) {
    if (rating >= 95)
        return 22;
    if (rating >= 90)
        return 18;
    if (rating >= 85)
        return 14;
    if (rating >= 80)
        return 10;
    if (rating >= 75)
        return 7;
    if (rating >= 70)
        return 5;
    return 3;
}
// Card tier colors for UI
exports.CARD_TIER_COLORS = {
    bronze: { frame: '#CD7F32', bg: '#8B4513', glow: 'rgba(205,127,50,0.4)' },
    silver: { frame: '#C0C0C0', bg: '#708090', glow: 'rgba(192,192,192,0.4)' },
    gold: { frame: '#FFD700', bg: '#B8860B', glow: 'rgba(255,215,0,0.4)' },
    'rare-gold': { frame: '#FF8C00', bg: '#D2691E', glow: 'rgba(255,140,0,0.5)' },
    special: { frame: '#9B59B6', bg: '#6C3483', glow: 'rgba(155,89,182,0.5)' },
    icon: { frame: '#C8FF00', bg: '#1a1a1a', glow: 'rgba(200,255,0,0.6)' },
};
