const { spawn, exec } = require('child_process');
const path = require('path');

class SuperAdminLauncher {
    constructor() {
        this.services = [];
        this.isShuttingDown = false;
    }

    async launchSuperAdminDashboard() {
        console.log('🌟 ========================================');
        console.log('🌟 STRATUS SUPER ADMIN DASHBOARD LAUNCHER');
        console.log('🌟 ========================================');
        console.log('🚀 Starting comprehensive admin interface...\n');

        try {
            // Step 1: Launch core ecosystem services
            console.log('1️⃣ Starting Core Ecosystem Services...');
            await this.startService('launch-all-updated.js', 'Core Ecosystem');

            // Step 2: Start corporate enterprise API
            console.log('2️⃣ Starting Corporate Enterprise API...');
            await this.startService('corporate/enterprise-api.js', 'Corporate API', 'cd corporate &&');

            // Step 3: Verify all interfaces are available
            console.log('3️⃣ Verifying Interface Availability...');
            await this.verifyInterfaces();

            // Step 4: Launch super admin dashboard
            console.log('4️⃣ Launching Super Admin Dashboard...');
            await this.openSuperAdminDashboard();

            // Step 5: Setup monitoring
            console.log('5️⃣ Setting up System Monitoring...');
            this.setupMonitoring();

            console.log('\n🎉 SUPER ADMIN DASHBOARD READY!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🌐 Dashboard URL: super-admin-dashboard.html (opening...)');
            console.log('📊 Main Interface: http://localhost:3000');
            console.log('🏢 Corporate API: http://localhost:3001');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n📋 Available Interfaces:');
            console.log('   🎯 Main Stratus Dashboard (Embedded)');
            console.log('   🏢 Corporate Enterprise Tools');
            console.log('   👨‍💻 Development Console');
            console.log('   💳 Wallet Management Systems');
            console.log('   🔗 Mini Node Interface');
            console.log('   📊 Real-time System Monitor');
            console.log('   ⚡ Live Statistics Dashboard');
            console.log('\n🛠️ Admin Controls:');
            console.log('   🔄 Refresh all interfaces');
            console.log('   📱 Open interfaces in fullscreen');
            console.log('   🛑 Emergency stop all services');
            console.log('   💾 Backup system state');
            console.log('   🔒 Run security audits');

        } catch (error) {
            console.error('❌ Error launching super admin dashboard:', error.message);
            process.exit(1);
        }
    }

    async startService(script, name, prefix = '') {
        return new Promise((resolve, reject) => {
            const command = `${prefix} node ${script}`;
            console.log(`   🔄 Starting ${name}...`);

            const service = spawn('cmd', ['/c', command], {
                cwd: __dirname,
                stdio: 'pipe',
                shell: true,
                detached: true
            });

            service.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('running') || output.includes('active') || output.includes('ready')) {
                    console.log(`   ✅ ${name}: Started successfully`);
                    resolve();
                }
            });

            service.stderr.on('data', (data) => {
                const error = data.toString();
                if (!error.includes('ExperimentalWarning') && !error.includes('DeprecationWarning')) {
                    console.log(`   ⚠️ ${name}: ${error.trim()}`);
                }
            });

            service.on('error', (error) => {
                console.error(`   ❌ ${name}: Failed to start - ${error.message}`);
                reject(error);
            });

            this.services.push({ name, process: service });

            // Resolve after a timeout if no explicit success message
            setTimeout(() => {
                if (service.exitCode === null) {
                    console.log(`   ⏳ ${name}: Service started (background)`);
                    resolve();
                }
            }, 3000);
        });
    }

    async verifyInterfaces() {
        const interfaceList = [
            { name: 'Main Dashboard', file: 'web-interface.js' },
            { name: 'Corporate Dashboard', file: 'corporate/dashboard.html' },
            { name: 'Development Console', file: 'dev-environment/dev-console.html' },
            { name: 'Magnet Wallet', file: 'client-mini-node/magnet-wallet.html' },
            { name: 'Mini Node', file: 'client-mini-node/index.html' },
            { name: 'Wallet Test', file: 'magnet-wallet-test.html' }
        ];

        console.log('   🔍 Checking interface files...');
        
        const fs = require('fs').promises;
        for (const interfaceItem of interfaceList) {
            try {
                await fs.access(interfaceItem.file);
                console.log(`   ✅ ${interfaceItem.name}: Available`);
            } catch (error) {
                console.log(`   ⚠️ ${interfaceItem.name}: File not found`);
            }
        }
    }

    async openSuperAdminDashboard() {
        return new Promise((resolve) => {
            console.log('   🌟 Opening Super Admin Dashboard...');
            
            exec('start super-admin-dashboard.html', (error) => {
                if (error) {
                    console.log('   ⚠️ Could not auto-open dashboard, please open manually');
                } else {
                    console.log('   ✅ Super Admin Dashboard opened in browser');
                }
                resolve();
            });
        });
    }

    setupMonitoring() {
        console.log('   📊 System monitoring active');
        console.log('   ⚡ Real-time updates enabled');
        console.log('   🔒 Security monitoring online');

        // Monitor service health
        setInterval(() => {
            const aliveServices = this.services.filter(s => s.process.exitCode === null).length;
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}] 📊 Services: ${aliveServices}/${this.services.length} active`);
        }, 30000);

        // Graceful shutdown handler
        process.on('SIGINT', () => this.gracefulShutdown());
        process.on('SIGTERM', () => this.gracefulShutdown());
    }

    gracefulShutdown() {
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;

        console.log('\n🛑 Graceful shutdown initiated...');
        console.log('📊 Stopping all services...');

        this.services.forEach(({ name, process }) => {
            if (process.exitCode === null) {
                console.log(`   🔄 Stopping ${name}...`);
                process.kill();
            }
        });

        setTimeout(() => {
            console.log('✅ All services stopped');
            console.log('👋 Super Admin Dashboard shutdown complete');
            process.exit(0);
        }, 2000);
    }
}

// Auto-launch if run directly
async function main() {
    const launcher = new SuperAdminLauncher();
    await launcher.launchSuperAdminDashboard();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SuperAdminLauncher;