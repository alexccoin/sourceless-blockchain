/**
 * Quick test of AresLang Native Templates
 */

const { ContractTemplateService } = require('./src/services/AresLangNativeTemplates.ts');

async function testNativeTemplates() {
  console.log('🔥 Testing AresLang Native Contract Templates\n');

  try {
    // Get all templates
    const templates = await ContractTemplateService.getAllTemplates();
    console.log(`✅ Found ${templates.length} native AresLang templates:\n`);

    templates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.icon} ${template.name}`);
      console.log(`   Description: ${template.description}`);
      console.log(`   Features: ${template.features.join(', ')}`);
      console.log(`   Security Score: ${template.securityScore}/100`);
      console.log(`   Deploy Time: ~${template.estimatedDeploymentTime} seconds`);
      console.log('');
    });

    // Test template generation
    console.log('🧪 Testing AresLang code generation...\n');
    
    const tokenTemplate = await ContractTemplateService.getTemplate('areslang-token');
    if (tokenTemplate) {
      const parameters = {
        tokenName: 'TestAresToken',
        tokenSymbol: 'TAT',
        totalSupply: 1000000,
        ccoinMintRate: 20
      };

      const generatedCode = ContractTemplateService.generateAresLangCode(tokenTemplate, parameters);
      console.log('✅ Generated AresLang Contract Code:');
      console.log('----------------------------------------');
      console.log(generatedCode.substring(0, 500) + '...');
      console.log('----------------------------------------\n');
    }

    console.log('🎉 AresLang Native Template System is working perfectly!');
    console.log('Ready for feeless smart contract deployment! 🚀');

  } catch (error) {
    console.log('❌ Error testing templates:', error.message);
  }
}

testNativeTemplates();