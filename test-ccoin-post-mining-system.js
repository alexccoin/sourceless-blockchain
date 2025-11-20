/**
 * Comprehensive CCOIN Post Mining System Test Runner
 * Validates corrected PoE-based crypto-financial mechanism
 */

const fs = require('fs');
const path = require('path');

class CCOINPostMiningValidator {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${level}: ${message}`;
        console.log(logMessage);
        
        if (level === 'ERROR' || level === 'SUCCESS') {
            this.testResults.push({
                message,
                level,
                timestamp
            });
        }
    }

    async validatePostMiningTerminology() {
        this.log('🔍 Validating CCOIN Post Mining Terminology Correction...', 'INFO');
        
        const filesToCheck = [
            'src/contracts/examples/sourceless-native-examples.ts',
            'src/services/CCOINPostMiningService.ts',
            'src/main/contracts/examples/catalog.ts',
            'src/core/FeelessTransactionEngine.ts',
            'demo-ccoin-post-mining-standalone.js'
        ];

        let terminologyCorrect = true;

        for (const file of filesToCheck) {
            const fullPath = path.join(process.cwd(), file);
            
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Check for old incorrect terminology
                const incorrectTerms = [
                    'ccoin_reward',
                    'mint_reward', 
                    'calculate_ccoin_reward',
                    'CCOINReward',
                    'rewards system',
                    'percentage reward'
                ];
                
                // Check for correct terminology
                const correctTerms = [
                    'post_mine',
                    'execute_poe_post_mining',
                    'proof of existence',
                    'CCOINPostMined',
                    'crypto-financial mechanism',
                    'validation_score'
                ];

                let fileCorrect = true;
                
                for (const term of incorrectTerms) {
                    if (content.includes(term)) {
                        this.log(`❌ Found incorrect term "${term}" in ${file}`, 'ERROR');
                        fileCorrect = false;
                        terminologyCorrect = false;
                    }
                }

                let correctTermsFound = 0;
                for (const term of correctTerms) {
                    if (content.includes(term)) {
                        correctTermsFound++;
                    }
                }

                if (correctTermsFound > 0) {
                    this.log(`✅ Found ${correctTermsFound} correct post mining terms in ${file}`, 'SUCCESS');
                } else if (fileCorrect) {
                    this.log(`⚠️  No post mining terms found in ${file} (may not be relevant)`, 'INFO');
                }
            } else {
                this.log(`⚠️  File ${file} not found, skipping...`, 'INFO');
            }
        }

        return terminologyCorrect;
    }

    async validatePoEIntegration() {
        this.log('🔐 Validating Proof of Existence Integration...', 'INFO');
        
        const poeComponents = [
            { file: 'src/security/CompactProofOfExistenceEngine.js', required: true },
            { file: 'src/security/EnhancedProofOfExistenceEngine.js', required: false },
            { file: 'src/main/starw/STARWMiniValidationNode.js', required: true },
            { file: 'src/services/CCOINPostMiningService.ts', required: true }
        ];

        let integrationValid = true;

        for (const component of poeComponents) {
            const fullPath = path.join(process.cwd(), component.file);
            
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                const poeFeatures = [
                    'ZK13',
                    'GodCypher',
                    'ProofOfExistence',
                    'validateExistence',
                    'cryptographic',
                    'consensus'
                ];

                let featuresFound = 0;
                for (const feature of poeFeatures) {
                    if (content.toLowerCase().includes(feature.toLowerCase())) {
                        featuresFound++;
                    }
                }

                if (featuresFound >= 3) {
                    this.log(`✅ PoE integration validated in ${component.file} (${featuresFound}/6 features)`, 'SUCCESS');
                } else if (component.required) {
                    this.log(`❌ Insufficient PoE integration in ${component.file} (${featuresFound}/6 features)`, 'ERROR');
                    integrationValid = false;
                }
            } else if (component.required) {
                this.log(`❌ Required PoE component ${component.file} not found`, 'ERROR');
                integrationValid = false;
            }
        }

        return integrationValid;
    }

    async validateNativeSourceLessStandards() {
        this.log('🌟 Validating Native SourceLess Standards...', 'INFO');
        
        const nativeFile = path.join(process.cwd(), 'src/contracts/examples/sourceless-native-examples.ts');
        
        if (!fs.existsSync(nativeFile)) {
            this.log('❌ Native SourceLess examples file not found', 'ERROR');
            return false;
        }

        const content = fs.readFileSync(nativeFile, 'utf8');
        
        const nativeStandards = [
            'zk13str_address',
            'language: \'areslang\'',
            'addressFormat: \'zk13str\'',
            'gasEstimate: 0',
            'hostless',
            'post_mine',
            'execute_poe_post_mining'
        ];

        let standardsValid = true;
        let standardsFound = 0;

        for (const standard of nativeStandards) {
            if (content.includes(standard)) {
                standardsFound++;
            } else {
                this.log(`⚠️  Native standard "${standard}" not found`, 'INFO');
            }
        }

        if (standardsFound >= 5) {
            this.log(`✅ Native SourceLess standards validated (${standardsFound}/${nativeStandards.length})`, 'SUCCESS');
        } else {
            this.log(`❌ Insufficient native standards implementation (${standardsFound}/${nativeStandards.length})`, 'ERROR');
            standardsValid = false;
        }

        return standardsValid;
    }

    async runPostMiningDemo() {
        this.log('🚀 Running CCOIN Post Mining Demonstration...', 'INFO');
        
        try {
            const { execSync } = require('child_process');
            const output = execSync('node demo-ccoin-post-mining-standalone.js', { 
                encoding: 'utf8',
                timeout: 30000 
            });
            
            if (output.includes('CCOIN Post Mined:') && output.includes('Proof Validation: PASSED')) {
                this.log('✅ CCOIN Post Mining demonstration successful', 'SUCCESS');
                
                // Extract key metrics from output
                const metrics = this.extractMetrics(output);
                this.log(`📊 Demo Results: ${metrics.successful}/${metrics.total} proofs successful`, 'INFO');
                
                return true;
            } else {
                this.log('❌ CCOIN Post Mining demonstration failed - invalid output', 'ERROR');
                return false;
            }
        } catch (error) {
            this.log(`❌ CCOIN Post Mining demonstration failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    extractMetrics(output) {
        const lines = output.split('\n');
        let total = 0;
        let successful = 0;
        
        for (const line of lines) {
            if (line.includes('Proof Validation: PASSED')) {
                successful++;
                total++;
            } else if (line.includes('Proof Validation: FAILED')) {
                total++;
            }
        }
        
        return { successful, total };
    }

    async validateEcosystemIntegration() {
        this.log('🌐 Validating Ecosystem Integration...', 'INFO');
        
        const integrationPoints = [
            { name: 'STR Price API', file: 'str-price-api.js' },
            { name: 'Native Templates', file: 'src/services/NativeContractTemplateService.ts' },
            { name: 'PoE Engine', file: 'src/security/CompactProofOfExistenceEngine.js' },
            { name: 'ZK13STR Standards', file: 'src/contracts/examples/sourceless-native-examples.ts' }
        ];

        let integrationScore = 0;

        for (const point of integrationPoints) {
            const fullPath = path.join(process.cwd(), point.file);
            
            if (fs.existsSync(fullPath)) {
                integrationScore++;
                this.log(`✅ ${point.name} integration found`, 'SUCCESS');
            } else {
                this.log(`⚠️  ${point.name} integration missing`, 'INFO');
            }
        }

        const integrationPercentage = (integrationScore / integrationPoints.length) * 100;
        
        if (integrationPercentage >= 75) {
            this.log(`✅ Ecosystem integration: ${integrationPercentage.toFixed(1)}% complete`, 'SUCCESS');
            return true;
        } else {
            this.log(`❌ Ecosystem integration insufficient: ${integrationPercentage.toFixed(1)}% complete`, 'ERROR');
            return false;
        }
    }

    generateReport() {
        const endTime = Date.now();
        const duration = ((endTime - this.startTime) / 1000).toFixed(2);
        
        const successCount = this.testResults.filter(r => r.level === 'SUCCESS').length;
        const errorCount = this.testResults.filter(r => r.level === 'ERROR').length;
        
        const report = `
# CCOIN POST MINING SYSTEM VALIDATION REPORT
Generated: ${new Date().toISOString()}
Duration: ${duration} seconds

## Summary
- ✅ Successful Validations: ${successCount}
- ❌ Failed Validations: ${errorCount}
- 📊 Success Rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%

## Test Results
${this.testResults.map(result => `- ${result.level === 'SUCCESS' ? '✅' : '❌'} ${result.message}`).join('\n')}

## Status
${errorCount === 0 ? 
    '🚀 **SYSTEM READY**: All validations passed - CCOIN Post Mining system is correctly implemented' : 
    `⚠️  **ISSUES DETECTED**: ${errorCount} validation(s) failed - review and fix before deployment`
}
`;

        fs.writeFileSync('CCOIN_POST_MINING_VALIDATION_REPORT.md', report);
        return { successCount, errorCount, duration };
    }

    async runAllValidations() {
        console.log('\n🔄 CCOIN POST MINING SYSTEM VALIDATION');
        console.log('═'.repeat(60));
        
        const results = {
            terminology: await this.validatePostMiningTerminology(),
            poeIntegration: await this.validatePoEIntegration(),
            nativeStandards: await this.validateNativeSourceLessStandards(),
            demoExecution: await this.runPostMiningDemo(),
            ecosystemIntegration: await this.validateEcosystemIntegration()
        };

        const report = this.generateReport();
        
        console.log('\n📋 VALIDATION SUMMARY');
        console.log('━'.repeat(40));
        console.log(`✅ Successful: ${report.successCount}`);
        console.log(`❌ Failed: ${report.errorCount}`);
        console.log(`⏱️  Duration: ${report.duration}s`);
        console.log(`📄 Report: CCOIN_POST_MINING_VALIDATION_REPORT.md`);
        
        const allPassed = Object.values(results).every(result => result === true);
        
        if (allPassed) {
            console.log('\n🚀 STATUS: CCOIN POST MINING SYSTEM READY FOR DEPLOYMENT');
        } else {
            console.log('\n⚠️  STATUS: ISSUES DETECTED - REVIEW REQUIRED');
        }
        
        return allPassed;
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new CCOINPostMiningValidator();
    validator.runAllValidations().catch(console.error);
}

module.exports = { CCOINPostMiningValidator };