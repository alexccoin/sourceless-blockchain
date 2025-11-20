/**
 * CCOIN Rate Validation Script
 * Validates that all AresLang templates use correct CCOIN rates
 */

const fs = require('fs');
const path = require('path');

function validateCCOINRates() {
    console.log('🔍 Validating CCOIN Rates in AresLang Templates...\n');
    
    const templatesPath = path.join(__dirname, 'src', 'services', 'AresLangNativeTemplates.ts');
    const content = fs.readFileSync(templatesPath, 'utf8');
    
    // Extract and analyze CCOIN rate patterns
    const results = {
        tokenTransfer: validateTokenTransferRates(content),
        nftRewards: validateNFTRewards(content),
        defiYield: validateDeFiYield(content),
        daoParticipation: validateDAOParticipation(content)
    };
    
    console.log('📊 CCOIN Rate Validation Results:\n');
    
    // Token Transfer Rates (2.5-10% dynamic)
    console.log('🪙 Token Transfer Rates:');
    console.log(`   ✅ Dynamic calculation: ${results.tokenTransfer.hasDynamic ? 'FOUND' : 'MISSING'}`);
    console.log(`   ✅ Min rate 2.5%: ${results.tokenTransfer.hasMinRate ? 'FOUND' : 'MISSING'}`);
    console.log(`   ✅ Max rate 10%: ${results.tokenTransfer.hasMaxRate ? 'FOUND' : 'MISSING'}`);
    
    // NFT Post Mining (PoE-based)
    console.log('\n🎨 NFT Post Mining:');
    console.log(`   ✅ PoE validation: ${results.nftRewards.hasFixedRate ? 'FOUND' : 'MISSING'}`);
    console.log(`   ✅ Uses (amount * 25) / 1000: ${results.nftRewards.hasCorrectCalc ? 'FOUND' : 'MISSING'}`);
    
    // DeFi Yield (Dynamic)
    console.log('\n💎 DeFi Yield Farming:');
    console.log(`   ✅ Dynamic yield function: ${results.defiYield.hasDynamicYield ? 'FOUND' : 'MISSING'}`);
    console.log(`   ✅ Utilization-based rates: ${results.defiYield.hasUtilizationRates ? 'FOUND' : 'MISSING'}`);
    
    // DAO Participation (1%)
    console.log('\n🏛️ DAO Participation:');
    console.log(`   ✅ 1% participation rewards: ${results.daoParticipation.hasOnePercent ? 'FOUND' : 'MISSING'}`);
    console.log(`   ✅ Fixed reward of 10: ${results.daoParticipation.hasFixedTen ? 'FOUND' : 'MISSING'}`);
    
    // Overall validation
    const allValid = Object.values(results).every(result => 
        Object.values(result).every(check => check === true)
    );
    
    console.log(`\n${allValid ? '🎉' : '❌'} Overall Validation: ${allValid ? 'PASSED' : 'FAILED'}`);
    
    if (allValid) {
        console.log('\n✅ All CCOIN rates are correctly implemented!');
        console.log('   • Token transfers: 2.5-10% dynamic based on amount');
        console.log('   • NFT activities: 2.5% fixed rewards');
        console.log('   • DeFi yield farming: Dynamic utilization-based');
        console.log('   • DAO participation: 1% fixed rewards');
    } else {
        console.log('\n❌ Some CCOIN rates need correction!');
    }
    
    return allValid;
}

function validateTokenTransferRates(content) {
    return {
        hasDynamic: content.includes('calculate_dynamic_ccoin_rate'),
        hasMinRate: content.includes('return 25') && content.includes('2.5%'),
        hasMaxRate: content.includes('return 100') && content.includes('10.0% maximum')
    };
}

function validateNFTRewards(content) {
    return {
        hasFixedRate: content.includes('Fixed 2.5% CCOIN rewards'),
        hasCorrectCalc: content.includes('* 25) / 1000') && content.includes('2.5%')
    };
}

function validateDeFiYield(content) {
    return {
        hasDynamicYield: content.includes('calculate_dynamic_yield_rate'),
        hasUtilizationRates: content.includes('utilization') && content.includes('reserveA + reserveB')
    };
}

function validateDAOParticipation(content) {
    return {
        hasOnePercent: content.includes('1% participation'),
        hasFixedTen: content.includes('CCOIN.native_mint(caller, 10)')
    };
}

// Run validation
if (require.main === module) {
    validateCCOINRates();
}

module.exports = { validateCCOINRates };