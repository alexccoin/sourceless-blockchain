# 🏗️ VALIDATOR EXPANSION SYSTEM - COMPLETE IMPLEMENTATION GUIDE
**SOURCELESS BLOCKCHAIN v0.21.0 Public Beta**

---

## 📚 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [API Reference](#api-reference)
5. [Database Schema](#database-schema)
6. [Economic Model](#economic-model)
7. [Deployment Guide](#deployment-guide)
8. [Testing Guide](#testing-guide)
9. [CLI Usage](#cli-usage)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 SYSTEM OVERVIEW

The Validator Expansion System allows anyone with a STR.DOMAIN and wallet to become a validator by contributing resources (storage, CPU, bandwidth) to the SOURCELESS BLOCKCHAIN network.

### Key Features

✅ **Open Participation:** Any STR.DOMAIN owner can register  
✅ **Resource Contribution:** Storage, CPU, bandwidth sharing  
✅ **Smart Contract Hosting:** 100 CCOS deployment fee → 70% to validators  
✅ **Automated Rewards:** 0.1 STR/GB, 0.5 STR/core, 0.01 STR/Mbps  
✅ **Uptime Bonuses:** +10% for ≥99% uptime  
✅ **Geographic Distribution:** Optimized file/task placement  
✅ **Real-time Monitoring:** 5-minute health checks  

### System Requirements

**Minimum (Home PC):**
- 10 GB available storage
- 1 CPU core
- 10 Mbps internet
- 1000 STR staked

**Recommended (Dedicated Server):**
- 500 GB available storage
- 4 CPU cores
- 100 Mbps internet
- 1000 STR staked

**Optimal (Data Center):**
- 10 TB available storage
- 32 CPU cores
- 10 Gbps internet
- 1000 STR staked

---

## 🏛️ ARCHITECTURE

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACES                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  STARW CLI   │  │  Dashboard   │  │  REST API        │  │
│  │  (10 cmds)   │  │  (React UI)  │  │  (8 endpoints)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                   CORE VALIDATORS                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PersonalValidator.ts - Individual validator logic   │  │
│  │  ValidatorRegistry.ts - Registration & management    │  │
│  │  ValidatorRewards.ts  - Reward calculations          │  │
│  │  ValidatorNetwork.ts  - P2P coordination             │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                 RESOURCE MANAGERS                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Storage    │  │     CPU     │  │    Bandwidth        │ │
│  │  Manager    │  │   Manager   │  │    Manager          │ │
│  │  (600 loc)  │  │  (550 loc)  │  │    (600 loc)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                         │                                   │
│  ┌──────────────────────┴───────────────────────────────┐  │
│  │  ResourceMonitor.ts - Unified monitoring (530 loc)   │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                SMART CONTRACT LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SmartContractDeployer.ts (600 loc)                  │  │
│  │  - 100 CCOS fee collection                           │  │
│  │  - 70/20/10 distribution                             │  │
│  │  - 3-validator deployment                            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (5 tables)                      │  │
│  │  - validators, reward_history, resource_usage        │  │
│  │  - smart_contracts, contract_executions              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 COMPONENTS

### 1. PersonalValidator.ts (500 lines)
**Purpose:** Individual validator node implementation

**Responsibilities:**
- Resource allocation and management
- Connection to genesis network
- Blockchain synchronization
- Reward accumulation
- Health monitoring

**Key Methods:**
```typescript
class PersonalValidator {
  register(domain, wallet, resources): Promise<void>
  start(): Promise<void>
  stop(): Promise<void>
  syncBlockchain(): Promise<void>
  getStatus(): ValidatorStatus
  calculateRewards(): number
}
```

---

### 2. ValidatorRegistry.ts (450 lines)
**Purpose:** Validator registration and lifecycle management

**12-Step Registration:**
1. Validate STR.DOMAIN format (^STR\.[a-z0-9]{3,32}$)
2. Verify domain ownership
3. Validate wallet address (^zk13str_)
4. Check minimum stake (1000 STR)
5. Lock stake in smart contract
6. Verify system resources
7. Test network connectivity
8. Generate validator ID
9. Assign to shard (if applicable)
10. Register in database
11. Connect to genesis network
12. Start contributing resources

**Key Methods:**
```typescript
class ValidatorRegistry {
  register(domain, wallet, stake, resources): Promise<ValidatorID>
  deregister(validatorId, signature): Promise<void>
  getValidator(id): Validator
  listActiveValidators(): Validator[]
  updateStatus(id, status): Promise<void>
}
```

---

### 3. ValidatorRewards.ts (400 lines)
**Purpose:** Reward calculation and distribution

**Reward Formula:**
```
Total Monthly Reward = (Storage + CPU + Bandwidth + Contracts) × (1 + UptimeBonus)

Where:
- Storage = usedGB × 0.1 STR/GB
- CPU = cores × 0.5 STR/core × avgUsage%
- Bandwidth = avgMbps × 0.01 STR/Mbps
- Contracts = contractFees received (70% of 100 CCOS per contract)
- UptimeBonus = 10% if uptime ≥ 99%
```

**Distribution Schedule:**
- **Hourly:** Rewards calculated but not distributed
- **Daily:** Cumulative rewards displayed in dashboard
- **Weekly:** Small rewards distributed (< 1 STR)
- **Monthly:** Full reward distribution

**Key Methods:**
```typescript
class ValidatorRewards {
  calculateHourlyReward(validatorId): number
  calculateMonthlyReward(validatorId): number
  distributeRewards(validatorId): Promise<TransactionHash>
  getRewardHistory(validatorId, period): RewardRecord[]
}
```

---

### 4. ValidatorNetwork.ts (350 lines)
**Purpose:** P2P coordination and communication

**Network Features:**
- **Genesis Connection:** Connect to 1313 STARW mini validators
- **Peer Discovery:** Find other personal validators
- **Heartbeat System:** 30-second keep-alive messages
- **Message Broadcasting:** Propagate transactions, blocks
- **Shard Communication:** Cross-shard coordination

**Key Methods:**
```typescript
class ValidatorNetwork {
  connectToGenesis(): Promise<void>
  discoverPeers(): Promise<Peer[]>
  broadcastMessage(message): void
  handleMessage(message): void
  getPeerCount(): number
}
```

---

### 5. SmartContractDeployer.ts (600 lines)
**Purpose:** Deploy smart contracts with fee collection

**Deployment Flow:**
1. **Validate contract:** Max 1MB, syntax check
2. **Check balance:** Deployer has 100 CCOS
3. **Select validators:** 3 validators with high uptime, geographic distribution
4. **Collect fee:** 100 CCOS from deployer
5. **Distribute fees:**
   - 70 CCOS → 3 hosting validators (~23.33 each)
   - 20 CCOS → Genesis network (1313 validators, ~0.0152 each)
   - 10 CCOS → STR.TREASURY (development fund)
6. **Compile contract:** STARW VM bytecode
7. **Deploy to validators:** Upload to 3 selected validators
8. **Register on-chain:** Record in blockchain
9. **Update stats:** Increment validator contract counts

**Refund Policy:**
- If deployment fails, 100 CCOS refunded
- If partial deployment (< 3 validators), refund and retry

**Key Methods:**
```typescript
class SmartContractDeployer {
  deployContract(code, deployer): Promise<ContractAddress>
  validateContract(code): boolean
  selectHostingValidators(count): Promise<ValidatorID[]>
  collectFee(from, amount): Promise<void>
  distributeFees(validators, amount): Promise<void>
  compileContract(code): Buffer
}
```

---

### 6. StorageManager.ts (600 lines)
**Purpose:** Distributed file storage with redundancy

**Storage Architecture:**
- **3-Replica Redundancy:** Every file stored on 3 validators
- **Geographic Distribution:** Spread replicas across regions
- **Integrity Verification:** SHA-256 hash checking
- **Automatic Cleanup:** Delete expired files

**File Storage Flow:**
1. Generate file ID and hash
2. Select 3 validators (uptime, location, available space)
3. Store file on each validator
4. Verify successful storage
5. Record file metadata
6. Update validator usage stats

**File Retrieval Flow:**
1. Look up file metadata
2. Check expiration date
3. Try each replica in order
4. Verify hash integrity
5. Return file data
6. Record transfer metrics

**Key Methods:**
```typescript
class StorageManager {
  registerStorage(validatorId, storageGB, path): Promise<Allocation>
  storeFile(name, data, uploader, expiresAt): Promise<StoredFile>
  retrieveFile(fileId): Promise<Buffer>
  deleteFile(fileId): Promise<void>
  cleanupExpiredFiles(): Promise<number>
  calculateStorageReward(validatorId, period): StorageMetrics
  verifyValidatorStorage(validatorId): Promise<VerificationResult>
}
```

---

### 7. CPUManager.ts (550 lines)
**Purpose:** CPU task scheduling and execution

**Task Types:**
- `smart-contract`: Execute contract code (gas metering)
- `computation`: General computational work
- `validation`: Block/transaction validation
- `mining`: Consensus/mining operations

**Task Priorities:**
- `critical`: Consensus, block validation (execute immediately)
- `high`: Smart contracts, urgent computations
- `medium`: Regular computations
- `low`: Background tasks, analytics

**Scheduling Algorithm:**
1. Sort validators by benchmark score (for high-priority)
2. Check current load (prefer less busy)
3. Consider task type specialization
4. Assign to best available validator

**Benchmark:**
- SHA-256 hashing iterations per millisecond
- Run on registration and every 24 hours
- Used to scale rewards (faster CPUs earn more for same task)

**Key Methods:**
```typescript
class CPUManager {
  registerCPU(validatorId, cores): Promise<Allocation>
  benchmarkCPU(): Promise<number>
  createTask(type, priority, estimatedTime): CPUTask
  executeTask(taskId): Promise<any>
  calculateCPUReward(validatorId, period): CPUMetrics
}
```

---

### 8. BandwidthManager.ts (600 lines)
**Purpose:** Network bandwidth contribution

**Speed Testing:**
- **Upload Test:** Send 1MB, measure time
- **Download Test:** Receive 1MB, measure time
- **Frequency:** Every 24 hours
- **Purpose:** Update allocation speeds, detect degradation

**Transfer Tracking:**
- Record every upload/download
- Purpose classification (file-storage, blockchain-sync, etc.)
- Speed calculation (Mbps)
- Monthly cap enforcement

**Geographic Routing:**
- Haversine formula for distance calculation
- Find nearest validators to target location
- Optimize latency and bandwidth costs

**Key Methods:**
```typescript
class BandwidthManager {
  registerBandwidth(validatorId, monthlyCap, location): Promise<Allocation>
  performSpeedTest(validatorId): Promise<{uploadMbps, downloadMbps}>
  recordTransfer(validatorId, type, size, duration, purpose): Transfer
  measureLatency(from, to): Promise<number>
  findNearestValidators(location, count): ValidatorID[]
  calculateBandwidthReward(validatorId, period): BandwidthMetrics
}
```

---

### 9. ResourceMonitor.ts (530 lines)
**Purpose:** Unified monitoring and combined rewards

**Monitoring Loop (Every 5 Minutes):**
1. Capture snapshots of all validators
2. Record uptime (online/offline)
3. Check validator health (healthy/degraded/offline)
4. Detect anomalies (high storage, CPU, latency)
5. Create alerts for issues
6. Update network statistics

**Health States:**
- **Healthy:** All systems operational, uptime ≥ 95%
- **Degraded:** Uptime < 95% or resource issues
- **Offline:** No activity in 30+ minutes

**Combined Reward Calculation:**
```typescript
{
  storage: StorageManager.calculateStorageReward(),
  cpu: CPUManager.calculateCPUReward(),
  bandwidth: BandwidthManager.calculateBandwidthReward(),
  contractFees: SmartContractDeployer.getFeesEarned(),
  subtotal: storage + cpu + bandwidth + contractFees,
  uptimeBonus: subtotal × 10% (if uptime ≥ 99%),
  total: subtotal + uptimeBonus
}
```

**Key Methods:**
```typescript
class ResourceMonitor {
  startMonitoring(): void
  getValidatorHealth(id): ValidatorHealth
  calculateUptime(id, days): number
  calculateCombinedReward(id, period): CombinedReward
  getNetworkStats(): NetworkStats
  getActiveAlerts(): PerformanceAlert[]
}
```

---

## 🔌 API REFERENCE

### Base URL
```
http://localhost:3002/api
```

### Endpoints

#### 1. Register Validator
```http
POST /validator/register
Content-Type: application/json

{
  "domain": "STR.miner",
  "wallet": "zk13str_abc123...",
  "stake": 1000,
  "resources": {
    "storage": 100,
    "cpu": 4,
    "bandwidth": {
      "upload": 100,
      "download": 100,
      "monthlyCap": 1000
    }
  },
  "signature": "0x..."
}

Response: {
  "success": true,
  "validatorId": "val_0001",
  "estimatedMonthlyReward": 12.5
}
```

#### 2. Get Validator Info
```http
GET /validator/:id

Response: {
  "validatorId": "val_0001",
  "domain": "STR.miner",
  "wallet": "zk13str_abc123...",
  "status": "active",
  "uptime": 99.87,
  "resources": {
    "storage": { "total": 100, "used": 45 },
    "cpu": { "cores": 4, "usage": 62 },
    "bandwidth": { "upload": 100, "download": 100 }
  },
  "reputation": { "score": 95, "contractsHosted": 12 }
}
```

#### 3. Get Validator Rewards
```http
GET /validator/:id/rewards?period=monthly

Response: {
  "validatorId": "val_0001",
  "period": "2025-11",
  "breakdown": {
    "storage": 4.5,
    "cpu": 1.24,
    "bandwidth": 1.75,
    "contractFees": 2.8,
    "subtotal": 10.29,
    "uptimeBonus": 1.03,
    "total": 11.32
  },
  "uptime": 99.87
}
```

#### 4. List Active Validators
```http
GET /validators/active?limit=10&offset=0

Response: {
  "validators": [
    {
      "validatorId": "val_0001",
      "domain": "STR.miner",
      "uptime": 99.87,
      "contractsHosted": 12
    },
    ...
  ],
  "total": 1523,
  "page": 1,
  "limit": 10
}
```

#### 5. Get Network Stats
```http
GET /validators/stats

Response: {
  "totalValidators": 1523,
  "genesisValidators": 1313,
  "personalValidators": 210,
  "totalStorage": 152300, // GB
  "totalCPU": 6092,       // cores
  "totalBandwidth": 15230, // Mbps
  "smartContracts": 342,
  "averageUptime": 98.7
}
```

#### 6. Lookup by Domain
```http
GET /validator/domain/:domain

Example: GET /validator/domain/STR.miner

Response: {
  "validatorId": "val_0001",
  "domain": "STR.miner",
  ...
}
```

#### 7. Lookup by Wallet
```http
GET /validator/wallet/:wallet

Response: {
  "validators": [
    {
      "validatorId": "val_0001",
      "domain": "STR.miner",
      ...
    },
    ...
  ]
}
```

#### 8. Deregister Validator
```http
DELETE /validator/:id
Content-Type: application/json

{
  "signature": "0x..."
}

Response: {
  "success": true,
  "stakeReturned": 1000,
  "finalReward": 11.32
}
```

---

## 🗄️ DATABASE SCHEMA

### validators
```sql
CREATE TABLE validators (
  validator_id VARCHAR(64) PRIMARY KEY,
  domain VARCHAR(64) UNIQUE NOT NULL,
  wallet VARCHAR(128) NOT NULL,
  stake DECIMAL(18, 8) NOT NULL,
  resources JSONB NOT NULL,
  rewards JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  reputation JSONB DEFAULT '{}',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### reward_history
```sql
CREATE TABLE reward_history (
  reward_id SERIAL PRIMARY KEY,
  validator_id VARCHAR(64) REFERENCES validators(validator_id),
  amount DECIMAL(18, 8) NOT NULL,
  breakdown JSONB NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  tx_hash VARCHAR(128),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### resource_usage
```sql
CREATE TABLE resource_usage (
  usage_id SERIAL PRIMARY KEY,
  validator_id VARCHAR(64) REFERENCES validators(validator_id),
  timestamp TIMESTAMP NOT NULL,
  storage JSONB NOT NULL,
  cpu JSONB NOT NULL,
  bandwidth JSONB NOT NULL,
  uptime JSONB NOT NULL
);
```

### smart_contracts
```sql
CREATE TABLE smart_contracts (
  contract_address VARCHAR(128) PRIMARY KEY,
  deployment_id VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(128),
  deployer VARCHAR(128) NOT NULL,
  bytecode TEXT NOT NULL,
  hosting_validators JSONB NOT NULL,
  deployment_fee DECIMAL(18, 8) DEFAULT 100,
  deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### contract_executions
```sql
CREATE TABLE contract_executions (
  execution_id SERIAL PRIMARY KEY,
  contract_address VARCHAR(128) REFERENCES smart_contracts(contract_address),
  function_name VARCHAR(128) NOT NULL,
  caller VARCHAR(128) NOT NULL,
  result JSONB,
  gas_used INTEGER,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💰 ECONOMIC MODEL

### Reward Rates

| Resource | Rate | Unit | Example |
|----------|------|------|---------|
| Storage | 0.1 STR | per GB/month | 100 GB = 10 STR/month |
| CPU | 0.5 STR | per core/month @ 100% | 4 cores @ 50% = 1 STR/month |
| Bandwidth | 0.01 STR | per Mbps/month | 100 Mbps = 1 STR/month |
| Contract Hosting | ~23.33 CCOS | per contract | 3 contracts = ~70 CCOS |

### Uptime Bonus
- **≥99% uptime:** +10% total rewards
- **95-99% uptime:** No bonus
- **<95% uptime:** Warning, potential deregistration

### Smart Contract Fees
- **Deployment Fee:** 100 CCOS
- **Distribution:**
  - 70 CCOS → 3 hosting validators (~23.33 each)
  - 20 CCOS → Genesis network (1313 validators, ~0.0152 each)
  - 10 CCOS → STR.TREASURY (development fund)

### Example Monthly Earnings

**Scenario 1: Small Home Validator**
- Storage: 50 GB → 5 STR
- CPU: 2 cores @ 40% → 0.4 STR
- Bandwidth: 50 Mbps → 0.5 STR
- Contracts: 2 hosted → ~46.66 CCOS
- **Subtotal:** 5.9 STR + 46.66 CCOS
- **Uptime Bonus (99.2%):** +0.59 STR
- **Total:** ~6.5 STR/month + 46.66 CCOS = **~78 STR/year**

**Scenario 2: Medium Dedicated Server**
- Storage: 1,000 GB → 100 STR
- CPU: 8 cores @ 75% → 3 STR
- Bandwidth: 500 Mbps → 5 STR
- Contracts: 10 hosted → ~233.3 CCOS
- **Subtotal:** 108 STR + 233.3 CCOS
- **Uptime Bonus (99.8%):** +10.8 STR
- **Total:** ~118.8 STR/month + 233.3 CCOS = **~1,425 STR/year**

**Scenario 3: Large Data Center**
- Storage: 50,000 GB → 5,000 STR
- CPU: 64 cores @ 90% → 28.8 STR
- Bandwidth: 10,000 Mbps → 100 STR
- Contracts: 100 hosted → ~2,333 CCOS
- **Subtotal:** 5,128.8 STR + 2,333 CCOS
- **Uptime Bonus (99.95%):** +512.88 STR
- **Total:** ~5,641 STR/month + 2,333 CCOS = **~67,700 STR/year**

---

## 🚀 DEPLOYMENT GUIDE

### Prerequisites
1. Node.js 18+
2. PostgreSQL 14+
3. Git

### Step 1: Clone Repository
```powershell
git clone https://github.com/alexccoin/sourceless-blockchain.git
cd sourceless-blockchain
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Initialize Database
```powershell
# Create database
psql -U postgres -c "CREATE DATABASE sourceless;"

# Run initialization script
psql -U postgres -d sourceless -f database/init-validator-db.sql
```

### Step 4: Configure Environment
```powershell
# Create .env file
@"
DATABASE_URL=postgresql://postgres:password@localhost:5432/sourceless
PORT=3002
NODE_ENV=production
"@ | Out-File .env
```

### Step 5: Start Server
```powershell
node server-production-hardened.js
```

### Step 6: Verify
```powershell
# Health check
curl http://localhost:3002/health

# Network stats
curl http://localhost:3002/api/validators/stats
```

---

## 🧪 TESTING GUIDE

### Unit Tests
```powershell
npm run test:unit
```

### Integration Tests
```powershell
npm run test:integration
```

### Load Tests
```powershell
npm run test:load
```

### Manual Testing

**Test Validator Registration:**
```powershell
curl -X POST http://localhost:3002/api/validator/register `
  -H "Content-Type: application/json" `
  -d '{
    "domain": "STR.test",
    "wallet": "zk13str_test123...",
    "stake": 1000,
    "resources": {
      "storage": 10,
      "cpu": 1,
      "bandwidth": { "upload": 10, "download": 10 }
    }
  }'
```

---

## 🖥️ CLI USAGE

### Installation
```powershell
cd starw-node
npm install -g
```

### Commands

**1. Install & Setup**
```powershell
starw install
# Interactive wizard:
# - System requirements check
# - STR.DOMAIN input
# - Wallet address input
# - Resource allocation
# - Config creation (~/.starw/config.json)
```

**2. Register Validator**
```powershell
starw register
# Uses config.json settings
# Prompts for confirmation
```

**3. Check Status**
```powershell
starw status [validatorId]
# Displays:
# - Current status (active/inactive)
# - Uptime percentage
# - Resources (storage/CPU/bandwidth)
# - Reputation score
```

**4. View Rewards**
```powershell
starw rewards [validatorId] -p monthly
# Options: daily, monthly, yearly
# Shows breakdown:
# - Storage earnings
# - CPU earnings
# - Bandwidth earnings
# - Contract fees
# - Uptime bonus
# - Total
```

**5. List Validators**
```powershell
starw list
# Paginated list of active validators
# Shows domain, uptime, contracts hosted
```

**6. Network Stats**
```powershell
starw network
# Displays:
# - Total validators (genesis + personal)
# - Total resources (storage TB, CPU cores, bandwidth Gbps)
# - Smart contracts deployed
# - Average uptime
```

**7. Deploy Smart Contract**
```powershell
starw deploy
# Prompts for:
# - Contract file path
# - Contract name
# - Deployment fee (100 CCOS)
# Returns:
# - Contract address
# - Hosting validators
# - Deployment transaction hash
```

**8. Update Config**
```powershell
starw config
# Interactive config editor
# Update API URL, validator ID, etc.
```

---

## 🔧 TROUBLESHOOTING

### Validator Won't Register

**Symptom:** Registration returns error

**Causes:**
1. Domain format invalid (must be STR.[a-z0-9]{3,32})
2. Wallet format invalid (must be zk13str_...)
3. Insufficient stake (minimum 1000 STR)
4. Insufficient resources (minimum 1 GB storage, 1 core CPU, 1 Mbps)

**Solution:**
```powershell
# Verify domain format
starw install
# Follow wizard, it validates inputs
```

---

### Low Uptime

**Symptom:** Uptime < 95%

**Causes:**
1. Internet connection unstable
2. System restarting frequently
3. Resource exhaustion (storage full, CPU overloaded)

**Solution:**
```powershell
# Check validator health
starw status

# Monitor resource usage
starw rewards -p daily
# If storage/CPU/bandwidth all low, increase resources
```

---

### No Rewards Earned

**Symptom:** Zero or very low rewards

**Causes:**
1. Resources not being used (no files stored, no tasks assigned)
2. Uptime too low (< 95%)
3. Network has excess capacity

**Solution:**
```powershell
# Check resource utilization
starw status

# If utilization is low:
# - Storage: Wait for files to be stored (automatic)
# - CPU: Wait for tasks to be assigned (automatic)
# - Bandwidth: Wait for transfers (automatic)

# If uptime is low:
# - Improve internet stability
# - Reduce system restarts
# - Check for errors in logs
```

---

### Smart Contract Deployment Fails

**Symptom:** Deployment returns error or refund

**Causes:**
1. Insufficient balance (need 100 CCOS)
2. Contract code invalid (syntax errors, > 1MB)
3. Not enough validators available (< 3 with sufficient resources)

**Solution:**
```powershell
# Check balance
# (use wallet command, not implemented in CLI yet)

# Validate contract code
# - Max 1MB size
# - Valid syntax for STARW VM
# - No malicious code

# Check network capacity
starw network
# If "personalValidators" < 3, wait for more validators to join
```

---

## 📞 SUPPORT

**Documentation:** /docs folder  
**CLI Help:** `starw --help`  
**API Docs:** This file  
**Issues:** GitHub repository (after creation)

---

**Last Updated:** November 11, 2025  
**Version:** 0.21.0 Public Beta  
**Status:** 75% Complete (Phase 3 Finished)
