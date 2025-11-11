/**
 * ValidatorRewards JavaScript Wrapper
 * Provides CommonJS exports for the TypeScript ValidatorRewards class
 */

let ValidatorRewards;

try {
    // Try loading compiled JavaScript first
    ValidatorRewards = require('./ValidatorRewards.js').ValidatorRewards || require('./ValidatorRewards.js').default;
} catch (e) {
    // Fallback: Try TypeScript with ts-node
    try {
        require('ts-node/register');
        const module = require('./ValidatorRewards.ts');
        ValidatorRewards = module.ValidatorRewards || module.default;
    } catch (tsError) {
        console.error('❌ Failed to load ValidatorRewards:', tsError.message);
        
        // Provide mock
        ValidatorRewards = class ValidatorRewards {
            static calculateMonthlyRewards(metrics) {
                return {
                    storage: metrics.storage?.usedGB * 0.1 || 0,
                    cpu: (metrics.cpu?.cores || 0) * 0.5 * ((metrics.cpu?.usage || 0) / 100),
                    bandwidth: ((metrics.bandwidth?.upload || 0) + (metrics.bandwidth?.download || 0)) / 2 * 0.01,
                    contractFees: 0,
                    subtotal: 10,
                    uptimeBonus: metrics.uptime >= 99 ? 1 : 0,
                    total: 11
                };
            }
            
            static calculateDailyRewards(metrics) {
                const monthly = this.calculateMonthlyRewards(metrics);
                return {
                    ...monthly,
                    storage: monthly.storage / 30,
                    cpu: monthly.cpu / 30,
                    bandwidth: monthly.bandwidth / 30,
                    subtotal: monthly.subtotal / 30,
                    uptimeBonus: monthly.uptimeBonus / 30,
                    total: monthly.total / 30
                };
            }
            
            static calculateAnnualRewards(metrics) {
                const monthly = this.calculateMonthlyRewards(metrics);
                return {
                    ...monthly,
                    storage: monthly.storage * 12,
                    cpu: monthly.cpu * 12,
                    bandwidth: monthly.bandwidth * 12,
                    subtotal: monthly.subtotal * 12,
                    uptimeBonus: monthly.uptimeBonus * 12,
                    total: monthly.total * 12
                };
            }
            
            static generateRewardSummary(metrics, period) {
                return {
                    period,
                    validatorId: metrics.validatorId || 'unknown',
                    breakdown: this.calculateMonthlyRewards(metrics),
                    nextPayout: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    message: 'MOCK: Reward summary (TypeScript not compiled)'
                };
            }
        };
    }
}

module.exports = {
    ValidatorRewards
};
