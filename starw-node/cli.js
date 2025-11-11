#!/usr/bin/env node

/**
 * STARW Node CLI
 * Command-line interface for managing personal validator nodes
 * 
 * Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team
 * Copyright (c) 2024-2025 Alexandru Marius Stratulat
 */

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const program = new Command();

// Configuration
const CONFIG_DIR = path.join(os.homedir(), '.starw');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DEFAULT_API_URL = 'http://localhost:3002';

// Utility functions
async function loadConfig() {
    try {
        const configData = await fs.readFile(CONFIG_FILE, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        return {
            apiUrl: DEFAULT_API_URL,
            validators: []
        };
    }
}

async function saveConfig(config) {
    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
        console.error(chalk.red('❌ Failed to save configuration:'), error.message);
    }
}

async function apiRequest(endpoint, method = 'GET', data = null) {
    const config = await loadConfig();
    const url = `${config.apiUrl}${endpoint}`;
    
    try {
        const response = await axios({
            method,
            url,
            data,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.error || error.response.data.message || 'API request failed');
        }
        throw error;
    }
}

// Commands

program
    .name('starw')
    .description('STARW Node - Personal Validator CLI for Sourceless Blockchain')
    .version('0.21.0-beta');

// Install command
program
    .command('install')
    .description('Install and configure STARW node software')
    .action(async () => {
        console.log(chalk.cyan('\n🚀 STARW Node Installation\n'));

        const spinner = ora('Checking system requirements...').start();

        // Check system requirements
        await new Promise(resolve => setTimeout(resolve, 1000));
        const totalMemory = os.totalmem() / (1024 ** 3); // GB
        const cpuCores = os.cpus().length;

        spinner.succeed(chalk.green('System requirements checked'));
        
        console.log(chalk.gray(`   Memory: ${totalMemory.toFixed(2)} GB`));
        console.log(chalk.gray(`   CPU Cores: ${cpuCores}`));

        // Configuration wizard
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'apiUrl',
                message: 'API URL:',
                default: DEFAULT_API_URL
            },
            {
                type: 'input',
                name: 'dataPath',
                message: 'Data storage path:',
                default: path.join(os.homedir(), '.starw', 'data')
            },
            {
                type: 'number',
                name: 'storage',
                message: 'Storage to allocate (GB):',
                default: Math.min(10, Math.floor(totalMemory * 0.1)),
                validate: (value) => value >= 1 || 'Minimum 1GB required'
            },
            {
                type: 'number',
                name: 'cpu',
                message: 'CPU cores to allocate:',
                default: Math.max(1, Math.floor(cpuCores * 0.5)),
                validate: (value) => value >= 1 || 'Minimum 1 core required'
            }
        ]);

        const installSpinner = ora('Installing STARW node...').start();
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create data directory
        await fs.mkdir(answers.dataPath, { recursive: true });

        // Save configuration
        const config = {
            apiUrl: answers.apiUrl,
            dataPath: answers.dataPath,
            resources: {
                storage: answers.storage,
                cpu: answers.cpu
            },
            validators: []
        };
        await saveConfig(config);

        installSpinner.succeed(chalk.green('✅ STARW node installed successfully!'));

        console.log(chalk.cyan('\n📋 Next steps:'));
        console.log(chalk.gray('   1. Register your validator: starw register'));
        console.log(chalk.gray('   2. Start validation: starw start'));
        console.log(chalk.gray('   3. Check status: starw status\n'));
    });

// Register command
program
    .command('register')
    .description('Register a new validator')
    .action(async () => {
        console.log(chalk.cyan('\n📝 Validator Registration\n'));

        const config = await loadConfig();

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'domain',
                message: 'STR.DOMAIN:',
                validate: (value) => {
                    if (!/^STR\.[a-z0-9]{3,32}$/.test(value)) {
                        return 'Invalid format. Must be STR.NAME (3-32 alphanumeric lowercase)';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'wallet',
                message: 'Wallet address (zk13str_...):',
                validate: (value) => {
                    if (!/^zk13str_[a-zA-Z0-9]+$/.test(value)) {
                        return 'Invalid wallet format. Must start with zk13str_';
                    }
                    return true;
                }
            },
            {
                type: 'password',
                name: 'signature',
                message: 'Wallet signature:',
                validate: (value) => value.length >= 64 || 'Signature too short'
            },
            {
                type: 'input',
                name: 'message',
                message: 'Signed message:',
                default: 'I own this domain and wallet'
            },
            {
                type: 'number',
                name: 'stake',
                message: 'Stake amount (STR):',
                default: 1000,
                validate: (value) => value >= 1000 || 'Minimum stake is 1000 STR'
            },
            {
                type: 'number',
                name: 'bandwidth',
                message: 'Bandwidth (Mbps):',
                default: 100,
                validate: (value) => value >= 10 || 'Minimum 10 Mbps required'
            },
            {
                type: 'number',
                name: 'uptime',
                message: 'Target uptime (%):',
                default: 99,
                validate: (value) => (value >= 95 && value <= 100) || 'Must be between 95-100%'
            }
        ]);

        const spinner = ora('Registering validator...').start();

        try {
            const result = await apiRequest('/api/validator/register', 'POST', {
                domain: answers.domain,
                wallet: answers.wallet,
                signature: answers.signature,
                message: answers.message,
                stake: answers.stake,
                resources: {
                    storage: config.resources?.storage || 10,
                    cpu: config.resources?.cpu || 2,
                    bandwidth: {
                        upload: answers.bandwidth,
                        download: answers.bandwidth
                    },
                    uptime: answers.uptime
                }
            });

            spinner.succeed(chalk.green('✅ Validator registered successfully!'));

            console.log(chalk.cyan('\n📊 Registration Details:'));
            console.log(chalk.gray(`   Validator ID: ${result.validatorId}`));
            console.log(chalk.gray(`   Domain: ${answers.domain}`));
            console.log(chalk.gray(`   Monthly Reward: ${result.monthlyReward.toFixed(2)} STR`));

            // Save validator to config
            config.validators = config.validators || [];
            config.validators.push({
                id: result.validatorId,
                domain: answers.domain,
                wallet: answers.wallet
            });
            await saveConfig(config);

            console.log(chalk.cyan('\n📋 Next steps:'));
            result.nextSteps.forEach(step => {
                console.log(chalk.gray(`   • ${step}`));
            });
            console.log('');
        } catch (error) {
            spinner.fail(chalk.red('❌ Registration failed'));
            console.error(chalk.red(`   Error: ${error.message}\n`));
        }
    });

// Status command
program
    .command('status [validatorId]')
    .description('Check validator status')
    .action(async (validatorId) => {
        const config = await loadConfig();

        if (!validatorId && config.validators.length > 0) {
            validatorId = config.validators[0].id;
        }

        if (!validatorId) {
            console.log(chalk.red('❌ No validator found. Register first with: starw register\n'));
            return;
        }

        const spinner = ora('Fetching validator status...').start();

        try {
            const result = await apiRequest(`/api/validator/${validatorId}`);
            spinner.succeed(chalk.green('Validator status retrieved'));

            console.log(chalk.cyan('\n📊 Validator Status\n'));
            console.log(chalk.gray(`ID:              ${result.validator.id}`));
            console.log(chalk.gray(`Domain:          ${result.validator.domain}`));
            console.log(chalk.gray(`Status:          ${result.validator.status}`));
            console.log(chalk.gray(`Stake:           ${result.validator.stake} STR`));
            console.log(chalk.gray(`Registration:    ${new Date(result.validator.registrationDate).toLocaleDateString()}`));
            console.log(chalk.gray(`Last Active:     ${new Date(result.validator.lastActive).toLocaleString()}`));

            console.log(chalk.cyan('\n💾 Resources:'));
            console.log(chalk.gray(`Storage:         ${result.validator.resources.storage.allocated} GB`));
            console.log(chalk.gray(`CPU:             ${result.validator.resources.cpu.cores} cores`));
            console.log(chalk.gray(`Bandwidth:       ${result.validator.resources.bandwidth.upload}/${result.validator.resources.bandwidth.download} Mbps`));
            console.log(chalk.gray(`Uptime:          ${result.validator.resources.uptime.current}%`));

            console.log(chalk.cyan('\n⭐ Reputation:'));
            console.log(chalk.gray(`Score:           ${result.validator.reputation.score}/100`));
            console.log(chalk.gray(`Validations:     ${result.validator.reputation.validationsCompleted}`));
            console.log(chalk.gray(`Contracts:       ${result.validator.reputation.contractsHosted}`));
            console.log('');
        } catch (error) {
            spinner.fail(chalk.red('Failed to fetch status'));
            console.error(chalk.red(`   Error: ${error.message}\n`));
        }
    });

// Rewards command
program
    .command('rewards [validatorId]')
    .option('-p, --period <period>', 'Period (daily|monthly|yearly)', 'monthly')
    .description('Check validator rewards')
    .action(async (validatorId, options) => {
        const config = await loadConfig();

        if (!validatorId && config.validators.length > 0) {
            validatorId = config.validators[0].id;
        }

        if (!validatorId) {
            console.log(chalk.red('❌ No validator found\n'));
            return;
        }

        const spinner = ora('Fetching rewards...').start();

        try {
            const result = await apiRequest(`/api/validator/${validatorId}/rewards?period=${options.period}`);
            spinner.succeed(chalk.green('Rewards retrieved'));

            console.log(chalk.cyan(`\n💰 ${options.period.toUpperCase()} Rewards\n`));
            console.log(chalk.gray(result.summary));
            console.log('');
        } catch (error) {
            spinner.fail(chalk.red('Failed to fetch rewards'));
            console.error(chalk.red(`   Error: ${error.message}\n`));
        }
    });

// List validators
program
    .command('list')
    .description('List all active validators')
    .action(async () => {
        const spinner = ora('Fetching validators...').start();

        try {
            const result = await apiRequest('/api/validators/active?limit=10');
            spinner.succeed(chalk.green(`Found ${result.total} active validators`));

            console.log(chalk.cyan('\n📋 Active Validators\n'));

            result.validators.forEach((validator, index) => {
                console.log(chalk.white(`${index + 1}. ${validator.domain}`));
                console.log(chalk.gray(`   Status: ${validator.status}`));
                console.log(chalk.gray(`   Uptime: ${validator.statistics.uptime}%`));
                console.log(chalk.gray(`   Reputation: ${validator.statistics.reputation}/100`));
                console.log('');
            });
        } catch (error) {
            spinner.fail(chalk.red('Failed to fetch validators'));
            console.error(chalk.red(`   Error: ${error.message}\n`));
        }
    });

// Network stats
program
    .command('network')
    .description('Show network statistics')
    .action(async () => {
        const spinner = ora('Fetching network stats...').start();

        try {
            const result = await apiRequest('/api/validators/stats');
            spinner.succeed(chalk.green('Network statistics retrieved'));

            console.log(chalk.cyan('\n🌐 Sourceless Blockchain Network\n'));
            console.log(chalk.gray(`Total Validators:     ${result.network.totalNetworkValidators}`));
            console.log(chalk.gray(`Genesis Validators:   ${result.breakdown.genesisValidators.count}`));
            console.log(chalk.gray(`Personal Validators:  ${result.breakdown.personalValidators.count}`));
            console.log(chalk.gray(`Total Storage:        ${result.network.resources.totalStorageGB} GB`));
            console.log(chalk.gray(`Total CPU Cores:      ${result.network.resources.totalCPUCores}`));
            console.log(chalk.gray(`Avg Bandwidth:        ${result.network.resources.avgBandwidthMbps.toFixed(2)} Mbps`));
            console.log('');
        } catch (error) {
            spinner.fail(chalk.red('Failed to fetch network stats'));
            console.error(chalk.red(`   Error: ${error.message}\n`));
        }
    });

// Deploy contract
program
    .command('deploy')
    .description('Deploy a smart contract (costs 100 CCOS)')
    .action(async () => {
        console.log(chalk.cyan('\n📄 Smart Contract Deployment\n'));
        console.log(chalk.yellow('⚠️  Deployment fee: 100 CCOS\n'));

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'contractPath',
                message: 'Contract file path:',
                validate: (value) => value.length > 0 || 'Path required'
            },
            {
                type: 'input',
                name: 'contractName',
                message: 'Contract name:',
                validate: (value) => value.length > 0 || 'Name required'
            },
            {
                type: 'input',
                name: 'deployer',
                message: 'Deployer wallet (zk13str_...):',
                validate: (value) => /^zk13str_[a-zA-Z0-9]+$/.test(value) || 'Invalid wallet format'
            },
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Confirm deployment (100 CCOS will be charged)?',
                default: false
            }
        ]);

        if (!answers.confirm) {
            console.log(chalk.yellow('\n⚠️  Deployment cancelled\n'));
            return;
        }

        const spinner = ora('Deploying contract...').start();

        try {
            // Read contract file
            const contractCode = await fs.readFile(answers.contractPath, 'utf8');

            // Deploy contract
            const result = await apiRequest('/api/contract/deploy', 'POST', {
                contractCode,
                deployer: answers.deployer,
                contractName: answers.contractName,
                version: '1.0.0'
            });

            spinner.succeed(chalk.green('✅ Contract deployed successfully!'));

            console.log(chalk.cyan('\n📊 Deployment Details:'));
            console.log(chalk.gray(`   Contract Address: ${result.contractAddress}`));
            console.log(chalk.gray(`   Deployment ID: ${result.deploymentId}`));
            console.log(chalk.gray(`   Hosting Validators: ${result.hostingValidators.length}`));
            console.log(chalk.gray(`   Transaction Hash: ${result.txHash}`));
            console.log('');
        } catch (error) {
            spinner.fail(chalk.red('❌ Deployment failed'));
            console.error(chalk.red(`   Error: ${error.message}\n`));
        }
    });

// Configure command
program
    .command('config')
    .description('Configure STARW node settings')
    .action(async () => {
        const config = await loadConfig();

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'apiUrl',
                message: 'API URL:',
                default: config.apiUrl || DEFAULT_API_URL
            }
        ]);

        config.apiUrl = answers.apiUrl;
        await saveConfig(config);

        console.log(chalk.green('\n✅ Configuration updated\n'));
    });

// Parse command-line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
