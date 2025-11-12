#!/usr/bin/env node

/**
 * AresLang System Demo
 * Demonstrates feeless smart contract deployment with CCOIN integration
 */

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Color functions
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

console.log(colors.cyan(colors.bold('\n🚀 AresLang Smart Contract Deployment Demo\n')));

async function main() {
  try {
    // Check API health
    console.log(colors.blue('🔍 Checking API health...'));
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log(colors.green('✅ API is healthy:', healthResponse.data.status));
    console.log('');

    // Get available templates
    console.log(colors.blue('📋 Fetching available templates...'));
    const templatesResponse = await axios.get(`${API_BASE_URL}/templates`);
    const templates = templatesResponse.data.templates;
    
    console.log(colors.green(`✅ Found ${templates.length} templates:`));
    templates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.icon} ${colors.cyan(template.name)} - ${template.description}`);
    });
    console.log('');

    // Interactive template selection
    const templateChoice = await askQuestion('Select a template number (1-' + templates.length + '): ');
    const selectedTemplate = templates[parseInt(templateChoice) - 1];
    
    if (!selectedTemplate) {
      console.log(colors.red('❌ Invalid template selection'));
      return;
    }

    console.log(colors.green(`\n✅ Selected: ${selectedTemplate.icon} ${selectedTemplate.name}`));
    console.log('');

    // Get template details
    console.log(colors.blue('📋 Fetching template details...'));
    const templateResponse = await axios.get(`${API_BASE_URL}/templates/${selectedTemplate.id}`);
    const templateDetails = templateResponse.data.template;

    console.log(colors.green('✅ Template loaded:'));
    console.log(`   ${colors.yellow('Security Score:')} ${templateDetails.securityScore}/100`);
    console.log(`   ${colors.yellow('Audit Status:')} ${templateDetails.auditStatus}`);
    console.log(`   ${colors.yellow('Features:')} ${templateDetails.features.join(', ')}`);
    console.log(`   ${colors.yellow('Deployment Time:')} ~${templateDetails.estimatedDeploymentTime} seconds`);
    console.log('');

    // Collect parameters
    console.log(colors.blue('⚙️ Configuring contract parameters...'));
    const parameters = {};

    for (const param of templateDetails.parameters) {
      if (param.required || Math.random() > 0.5) { // Include some optional params randomly
        const prompt = `${param.name} (${param.description}): `;
        const value = await askQuestion(prompt);
        parameters[param.name] = value || param.defaultValue;
      } else {
        parameters[param.name] = param.defaultValue;
      }
    }

    console.log(colors.green('\n✅ Parameters configured:'));
    Object.entries(parameters).forEach(([key, value]) => {
      console.log(`   ${colors.yellow(key + ':')} ${value}`);
    });
    console.log('');

    // Generate code preview
    console.log(colors.blue('🔍 Generating contract preview...'));
    const previewResponse = await axios.post(`${API_BASE_URL}/templates/${selectedTemplate.id}/preview`, {
      parameters
    });

    const preview = previewResponse.data;
    console.log(colors.green('✅ Contract generated:'));
    console.log(`   ${colors.yellow('Security Score:')} ${preview.securityAudit.score}/100`);
    console.log(`   ${colors.yellow('Security Issues:')} ${preview.securityAudit.issues.length}`);
    console.log(`   ${colors.yellow('Gas Cost:')} ${preview.estimatedGas} (Always 0 - Feeless!)`);
    console.log('');

    if (preview.securityAudit.issues.length > 0) {
      console.log(colors.yellow('⚠️ Security recommendations:'));
      preview.securityAudit.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
      console.log('');
    }

    // Confirm deployment
    const confirmDeploy = await askQuestion('Deploy this contract? (y/N): ');
    if (confirmDeploy.toLowerCase() !== 'y') {
      console.log(colors.yellow('❌ Deployment cancelled'));
      return;
    }

    // Deploy contract
    console.log(colors.blue('\n🚀 Deploying contract with feeless transaction...'));
    const deploymentRequest = {
      templateId: selectedTemplate.id,
      parameters: parameters,
      userAddress: 'ares1qxy2ml6pjhgmkd3jvdnp5lm8s2k7f9h2n3q4w5', // Demo AresLang address
      network: 'areslang',
      options: {
        enableCCOINMinting: true,
        strDomainsIntegration: true
      }
    };

    const deployResponse = await axios.post(`${API_BASE_URL}/deploy`, deploymentRequest);
    const deployment = deployResponse.data;

    if (deployment.success) {
      console.log(colors.green('\n🎉 Contract deployed successfully!'));
      console.log('');
      console.log(colors.bold('📊 Deployment Summary:'));
      console.log(`   ${colors.yellow('Contract Address:')} ${deployment.contractAddress}`);
      console.log(`   ${colors.yellow('Transaction Hash:')} ${deployment.transactionHash}`);
      console.log(`   ${colors.yellow('Gas Used:')} ${deployment.gasUsed} (Feeless!)`);
      console.log(`   ${colors.yellow('Deployment Time:')} ${deployment.deploymentTime}ms`);
      console.log(`   ${colors.yellow('CCOIN Minted:')} ${deployment.ccoinMinted} tokens`);
      console.log(`   ${colors.yellow('STR.domains Revenue:')} ${deployment.strDomainsRevenue} tokens`);
      console.log('');
      
      console.log(colors.bold('🎯 Key Benefits Achieved:'));
      console.log(colors.green('   ✅ Zero gas fees paid'));
      console.log(colors.green('   ✅ Automatic CCOIN rewards generated'));
      console.log(colors.green('   ✅ STR.domains revenue sharing active'));
      console.log(colors.green('   ✅ Instant deployment completed'));
      console.log(colors.green('   ✅ Built-in security validation'));
      console.log('');
      
      console.log(colors.cyan('🌟 Your contract is now live and integrated with the complete ecosystem!'));
    } else {
      console.log(colors.red('❌ Deployment failed:'), deployment.error);
    }

  } catch (error) {
    console.log(colors.red('❌ Demo failed:'), error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log(colors.yellow('\n💡 Make sure the AresLang API is running:'));
      console.log('   node start-areslang.js');
    }
  } finally {
    rl.close();
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(colors.cyan(question), (answer) => {
      resolve(answer);
    });
  });
}

// Run the demo
main().catch(console.error);