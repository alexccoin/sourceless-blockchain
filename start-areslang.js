#!/usr/bin/env node

/**
 * AresLang Automation System Startup Script
 * Starts the complete feeless smart contract deployment system
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting AresLang Automation System...\n');

// Color functions for better console output
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// System banner
console.log(colors.cyan(colors.bold('╔══════════════════════════════════════════════════════════════════╗')));
console.log(colors.cyan(colors.bold('║                    ARESLANG AUTOMATION SYSTEM                    ║')));
console.log(colors.cyan(colors.bold('║                                                                    ║')));
console.log(colors.cyan(colors.bold('║  🔥 Feeless Smart Contract Deployment                             ║')));
console.log(colors.cyan(colors.bold('║  🪙 Automatic CCOIN Minting                                       ║')));  
console.log(colors.cyan(colors.bold('║  🌐 STR.domains Revenue Sharing                                   ║')));
console.log(colors.cyan(colors.bold('║  🎨 Drag & Drop Visual Builder                                    ║')));
console.log(colors.cyan(colors.bold('║  ⚡ HOSTLESS Ledger Integration                                   ║')));
console.log(colors.cyan(colors.bold('╚══════════════════════════════════════════════════════════════════╝')));
console.log('');

// Configuration
const config = {
  apiPort: process.env.API_PORT || 3001,
  frontendPort: process.env.FRONTEND_PORT || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  nodeEnv: process.env.NODE_ENV || 'development'
};

console.log(colors.blue('📋 System Configuration:'));
console.log(`   ${colors.yellow('API Port:')} ${config.apiPort}`);
console.log(`   ${colors.yellow('Frontend Port:')} ${config.frontendPort}`);
console.log(`   ${colors.yellow('Environment:')} ${config.nodeEnv}`);
console.log(`   ${colors.yellow('Log Level:')} ${config.logLevel}`);
console.log('');

// Check if dependencies are installed
const packageJsonPath = path.join(__dirname, 'package.json');
const nodeModulesPath = path.join(__dirname, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
  console.log(colors.red('❌ Dependencies not found. Installing...'));
  console.log('');
  
  const installProcess = spawn('npm', ['install', '--legacy-peer-deps'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });
  
  installProcess.on('close', (code) => {
    if (code === 0) {
      console.log(colors.green('✅ Dependencies installed successfully'));
      startSystem();
    } else {
      console.log(colors.red('❌ Failed to install dependencies'));
      process.exit(1);
    }
  });
} else {
  startSystem();
}

function startSystem() {
  console.log(colors.green('🔧 Starting AresLang services...'));
  console.log('');

  // Start the backend API
  console.log(colors.blue('🚀 Starting Backend API Server...'));
  const apiProcess = spawn('node', ['-r', 'ts-node/register', 'src/api/AresLangDeploymentAPI.ts'], {
    stdio: 'pipe',
    shell: true,
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: config.apiPort,
      NODE_ENV: config.nodeEnv
    }
  });

  apiProcess.stdout.on('data', (data) => {
    console.log(colors.green('[API] ') + data.toString().trim());
  });

  apiProcess.stderr.on('data', (data) => {
    console.log(colors.red('[API ERROR] ') + data.toString().trim());
  });

  apiProcess.on('close', (code) => {
    console.log(colors.red(`[API] Process exited with code ${code}`));
  });

  // Display system status
  setTimeout(() => {
    console.log('');
    console.log(colors.bold('🎯 AresLang System Status:'));
    console.log('');
    console.log(colors.green('✅ Backend API: ') + `http://localhost:${config.apiPort}`);
    console.log(colors.green('✅ Health Check: ') + `http://localhost:${config.apiPort}/api/health`);
    console.log(colors.green('✅ Templates API: ') + `http://localhost:${config.apiPort}/api/templates`);
    console.log(colors.green('✅ Deploy Endpoint: ') + `http://localhost:${config.apiPort}/api/deploy`);
    console.log('');
    console.log(colors.bold('📊 Available Contract Templates:'));
    console.log(colors.cyan('   🪙 ERC-20 Token - Standard token with CCOIN integration'));
    console.log(colors.cyan('   🖼️ NFT Collection - Complete NFT marketplace integration'));
    console.log(colors.cyan('   🔄 AMM Pool - DeFi liquidity pool with rewards'));
    console.log(colors.cyan('   🏛️ DAO Governance - Voting and treasury management'));
    console.log(colors.cyan('   🔐 Multi-Sig Wallet - Secure shared custody'));
    console.log('');
    console.log(colors.bold('⚡ Key Features:'));
    console.log(colors.yellow('   • Zero gas fees through HOSTLESS ledger sponsorship'));
    console.log(colors.yellow('   • Automatic CCOIN minting from contract activity'));
    console.log(colors.yellow('   • 15-20% STR.domains revenue sharing'));
    console.log(colors.yellow('   • Drag & drop visual contract builder'));
    console.log(colors.yellow('   • Built-in security auditing'));
    console.log(colors.yellow('   • Multi-network deployment (ETH, BSC, Polygon, Arbitrum)'));
    console.log('');
    console.log(colors.bold('🔥 Ready to deploy feeless smart contracts!'));
    console.log('');
  }, 2000);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('');
    console.log(colors.yellow('🛑 Shutting down AresLang system...'));
    
    if (apiProcess) {
      apiProcess.kill('SIGTERM');
    }
    
    setTimeout(() => {
      console.log(colors.green('✅ AresLang system stopped'));
      process.exit(0);
    }, 1000);
  });

  // Handle errors
  process.on('uncaughtException', (error) => {
    console.log(colors.red('❌ Uncaught Exception:'), error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.log(colors.red('❌ Unhandled Rejection at:'), promise, 'reason:', reason);
  });
}

// Export for use as module
module.exports = { startSystem, config };