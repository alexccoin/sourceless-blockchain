/**
 * SourceLess™ Ecosystem Validation Test
 * Comprehensive test of all native contracts with ZK13STR addresses
 */

import { nativeSourceLessContracts, nativeSourceLessUtils } from './examples/native-sourceless-contracts';

export class SourceLessEcosystemValidator {
    
    /**
     * Validate all native contract examples
     */
    static validateNativeContracts(): ValidationResult {
        const results: ValidationResult = {
            totalContracts: nativeSourceLessContracts.length,
            validContracts: 0,
            nativeFeatures: {
                zk13strAddresses: 0,
                ccoinIntegration: 0,
                gasFreeTransactions: 0,
                strDomainSupport: 0
            },
            contractCategories: {},
            validationErrors: []
        };

        nativeSourceLessContracts.forEach(contract => {
            try {
                // Validate contract structure
                this.validateContractStructure(contract, results);
                
                // Validate native features
                this.validateNativeFeatures(contract, results);
                
                // Validate AresLang syntax
                this.validateAresLangSyntax(contract, results);
                
                results.validContracts++;
                
            } catch (error) {
                results.validationErrors.push({
                    contractId: contract.id,
                    error: error.message
                });
            }
        });

        return results;
    }

    /**
     * Test ZK13STR address generation and validation
     */
    static testZK13STRAddresses(): ZK13STRTestResult {
        const testAddresses = [
            // Valid addresses
            'zk13str_1234567890abcdef1234567890abcdef12345678_a1b2',
            'zk13str_fedcba0987654321fedcba0987654321fedcba09_9f8e',
            
            // Invalid addresses
            'zk13str_invalid',
            '0x1234567890abcdef1234567890abcdef12345678',
            'str_1234567890abcdef1234567890abcdef12345678_a1b2'
        ];

        const results: ZK13STRTestResult = {
            validAddresses: 0,
            invalidAddresses: 0,
            generatedSamples: []
        };

        // Test validation
        testAddresses.forEach(address => {
            if (nativeSourceLessUtils.validateZK13STR(address)) {
                results.validAddresses++;
            } else {
                results.invalidAddresses++;
            }
        });

        // Generate sample addresses
        for (let i = 0; i < 5; i++) {
            const sample = nativeSourceLessUtils.generateSampleZK13STR();
            if (nativeSourceLessUtils.validateZK13STR(sample)) {
                results.generatedSamples.push(sample);
            }
        }

        return results;
    }

    /**
     * Test CCOIN reward calculations
     */
    static testCCOINRewards(): CCOINTestResult {
        const testAmounts = [
            100n * 10n**13n,    // 100 STR
            1000n * 10n**13n,   // 1,000 STR  
            10000n * 10n**13n,  // 10,000 STR
            100000n * 10n**13n  // 100,000 STR
        ];

        const results: CCOINTestResult = {
            rewardCalculations: []
        };

        testAmounts.forEach(amount => {
            const baseReward = nativeSourceLessUtils.calculateCCOINReward(amount, 2.5);
            const bonusReward = nativeSourceLessUtils.calculateCCOINReward(amount, 5.0);
            
            results.rewardCalculations.push({
                amount: amount.toString(),
                baseReward: baseReward.toString(),
                bonusReward: bonusReward.toString(),
                basePercentage: Number(baseReward * 100n / amount),
                bonusPercentage: Number(bonusReward * 100n / amount)
            });
        });

        return results;
    }

    /**
     * Test STR.domain validation
     */
    static testSTRDomains(): STRDomainTestResult {
        const testDomains = [
            // Valid domains
            'STR.alice',
            'STR.bob-crypto',
            'STR.company123',
            
            // Invalid domains
            'alice.str',
            'STR.',
            'STR..invalid',
            'STR.very-long-domain-name-that-exceeds-the-maximum-length-limit'
        ];

        const results: STRDomainTestResult = {
            validDomains: 0,
            invalidDomains: 0,
            examples: []
        };

        testDomains.forEach(domain => {
            const isValid = nativeSourceLessUtils.validateSTRDomain(domain);
            if (isValid) {
                results.validDomains++;
                results.examples.push(domain);
            } else {
                results.invalidDomains++;
            }
        });

        return results;
    }

    private static validateContractStructure(contract: any, results: ValidationResult): void {
        // Check required fields
        if (!contract.id || !contract.name || !contract.language || !contract.code) {
            throw new Error('Missing required contract fields');
        }

        // Validate language
        if (contract.language !== 'ares') {
            throw new Error(`Invalid language: ${contract.language}, expected 'ares'`);
        }

        // Count by category
        if (!results.contractCategories[contract.category]) {
            results.contractCategories[contract.category] = 0;
        }
        results.contractCategories[contract.category]++;
    }

    private static validateNativeFeatures(contract: any, results: ValidationResult): void {
        const code = contract.code;

        // Check for ZK13STR address usage
        if (code.includes('zk13str_address') || code.includes('validate_zk13str')) {
            results.nativeFeatures.zk13strAddresses++;
        }

        // Check for CCOIN integration
        if (code.includes('ccoin') || code.includes('mint_reward')) {
            results.nativeFeatures.ccoinIntegration++;
        }

        // Check for gas-free transactions
        if (code.includes('hostless') || code.includes('enable_hostless_mode')) {
            results.nativeFeatures.gasFreeTransactions++;
        }

        // Check for STR.domain support
        if (code.includes('str_domain') || code.includes('STR.')) {
            results.nativeFeatures.strDomainSupport++;
        }
    }

    private static validateAresLangSyntax(contract: any, results: ValidationResult): void {
        const code = contract.code;

        // Check for forbidden Ethereum/Solidity syntax
        const forbiddenPatterns = [
            'pragma solidity',
            'contract.*{', // Generic contract (should be specific like token_contract)
            'address\\s+\\w+', // Generic address type
            'ERC20',
            'ERC721',
            'msg.sender.*address', // Should use zk13str_address
            '0x[0-9a-fA-F]+' // Ethereum addresses
        ];

        forbiddenPatterns.forEach(pattern => {
            if (new RegExp(pattern, 'i').test(code)) {
                throw new Error(`Forbidden pattern found: ${pattern}`);
            }
        });

        // Check for required AresLang patterns
        const requiredPatterns = [
            '\\w+_contract\\s+\\w+', // Specific contract types
            'zk13str_address|str_domain', // Native types
            'hostless|ccoin', // Native features
        ];

        const hasRequiredPattern = requiredPatterns.some(pattern => 
            new RegExp(pattern, 'i').test(code)
        );

        if (!hasRequiredPattern) {
            throw new Error('Missing required AresLang native patterns');
        }
    }
}

// Test result interfaces
interface ValidationResult {
    totalContracts: number;
    validContracts: number;
    nativeFeatures: {
        zk13strAddresses: number;
        ccoinIntegration: number;
        gasFreeTransactions: number;
        strDomainSupport: number;
    };
    contractCategories: Record<string, number>;
    validationErrors: Array<{
        contractId: string;
        error: string;
    }>;
}

interface ZK13STRTestResult {
    validAddresses: number;
    invalidAddresses: number;
    generatedSamples: string[];
}

interface CCOINTestResult {
    rewardCalculations: Array<{
        amount: string;
        baseReward: string;
        bonusReward: string;
        basePercentage: number;
        bonusPercentage: number;
    }>;
}

interface STRDomainTestResult {
    validDomains: number;
    invalidDomains: number;
    examples: string[];
}

/**
 * Run comprehensive ecosystem validation
 */
export function runSourceLessEcosystemValidation(): {
    contractValidation: ValidationResult;
    zk13strTesting: ZK13STRTestResult;
    ccoinTesting: CCOINTestResult;
    domainTesting: STRDomainTestResult;
    summary: string;
} {
    console.log('🔍 Running SourceLess™ Ecosystem Validation...\n');

    // Run all validations
    const contractValidation = SourceLessEcosystemValidator.validateNativeContracts();
    const zk13strTesting = SourceLessEcosystemValidator.testZK13STRAddresses();
    const ccoinTesting = SourceLessEcosystemValidator.testCCOINRewards();
    const domainTesting = SourceLessEcosystemValidator.testSTRDomains();

    // Generate summary
    const summary = `
✅ **SourceLess™ Ecosystem Validation Results**

📊 **Native Contracts**: ${contractValidation.validContracts}/${contractValidation.totalContracts} valid
   - ZK13STR Integration: ${contractValidation.nativeFeatures.zk13strAddresses} contracts
   - CCOIN Rewards: ${contractValidation.nativeFeatures.ccoinIntegration} contracts  
   - Gas-Free Transactions: ${contractValidation.nativeFeatures.gasFreeTransactions} contracts
   - STR.Domain Support: ${contractValidation.nativeFeatures.strDomainSupport} contracts

🔐 **ZK13STR Addresses**: ${zk13strTesting.validAddresses} valid, ${zk13strTesting.invalidAddresses} invalid
   - Sample Generated: ${zk13strTesting.generatedSamples[0]}

💰 **CCOIN Rewards**: ${ccoinTesting.rewardCalculations.length} test calculations
   - 100 STR → ${ccoinTesting.rewardCalculations[0]?.basePercentage}% CCOIN (base)
   - 100,000 STR → ${ccoinTesting.rewardCalculations[3]?.bonusPercentage}% CCOIN (bonus)

🌐 **STR.Domains**: ${domainTesting.validDomains} valid, ${domainTesting.invalidDomains} invalid
   - Examples: ${domainTesting.examples.join(', ')}

🎯 **Categories**: ${Object.entries(contractValidation.contractCategories)
        .map(([cat, count]) => `${cat}: ${count}`)
        .join(', ')}

${contractValidation.validationErrors.length === 0 
    ? '✅ **All validations passed! Pure SourceLess implementation confirmed.**'
    : `❌ **Errors found**: ${contractValidation.validationErrors.length}`
}
    `;

    return {
        contractValidation,
        zk13strTesting,
        ccoinTesting,
        domainTesting,
        summary
    };
}

// Export for use in tests
export default SourceLessEcosystemValidator;