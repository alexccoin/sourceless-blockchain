/**
 * Validator Database Schema
 * MongoDB/PostgreSQL schema for validator registry
 * 
 * Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team
 * Copyright (c) 2024-2025 Alexandru Marius Stratulat
 */

/**
 * VALIDATORS TABLE/COLLECTION
 * Stores all registered personal validators
 */
export const ValidatorSchema = {
  // Primary key
  validatorId: {
    type: 'string',
    unique: true,
    required: true,
    index: true,
    description: 'Unique identifier for the validator (PVAL_*)'
  },

  // Domain and wallet
  domain: {
    type: 'string',
    unique: true,
    required: true,
    index: true,
    pattern: '^STR\\.[a-z0-9]{3,32}$',
    description: 'STR.DOMAIN (must be unique)'
  },

  wallet: {
    type: 'string',
    required: true,
    index: true,
    pattern: '^zk13str_[a-zA-Z0-9]+$',
    description: 'zk13str wallet address owning this validator'
  },

  // Stake and economics
  stake: {
    type: 'number',
    required: true,
    min: 1000,
    description: 'STR tokens staked (minimum 1000)'
  },

  stakeStatus: {
    type: 'string',
    enum: ['locked', 'unlocking', 'unlocked'],
    default: 'locked',
    description: 'Current stake status'
  },

  stakeLockDate: {
    type: 'date',
    required: true,
    description: 'When stake was locked'
  },

  // Resources
  resources: {
    storage: {
      allocated: { type: 'number', required: true, min: 1, description: 'GB allocated' },
      available: { type: 'number', required: true, description: 'GB currently available' },
      used: { type: 'number', default: 0, description: 'GB currently used' },
      path: { type: 'string', required: true, description: 'Local storage path' }
    },
    cpu: {
      cores: { type: 'number', required: true, min: 1, description: 'Number of CPU cores' },
      maxUsage: { type: 'number', min: 50, max: 100, default: 80, description: 'Max CPU usage %' },
      currentUsage: { type: 'number', default: 0, description: 'Current CPU usage %' },
      priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' }
    },
    bandwidth: {
      upload: { type: 'number', required: true, min: 10, description: 'Upload speed (Mbps)' },
      download: { type: 'number', required: true, min: 10, description: 'Download speed (Mbps)' },
      monthlyLimit: { type: 'number', default: 1000, description: 'Monthly bandwidth limit (GB)' },
      used: { type: 'number', default: 0, description: 'Bandwidth used this month (GB)' }
    },
    uptime: {
      target: { type: 'number', min: 95, max: 100, description: 'Target uptime %' },
      current: { type: 'number', default: 0, description: 'Current uptime %' },
      lastOnline: { type: 'date', nullable: true, description: 'Last time validator was online' },
      downtimeHistory: {
        type: 'array',
        items: {
          start: { type: 'date' },
          end: { type: 'date' },
          reason: { type: 'string' }
        },
        description: 'History of downtime events'
      }
    }
  },

  // Rewards
  rewards: {
    accumulated: { type: 'number', default: 0, description: 'Total STR tokens earned' },
    lastPayout: { type: 'date', nullable: true, description: 'Last payout date' },
    payoutAddress: { type: 'string', required: true, description: 'Wallet for payouts' },
    monthlyEstimate: { type: 'number', default: 0, description: 'Estimated monthly earnings' },
    breakdown: {
      storage: { type: 'number', default: 0 },
      cpu: { type: 'number', default: 0 },
      bandwidth: { type: 'number', default: 0 },
      uptime: { type: 'number', default: 0 },
      contracts: { type: 'number', default: 0 }
    }
  },

  // Status and dates
  status: {
    type: 'string',
    enum: ['pending', 'active', 'paused', 'suspended', 'terminated'],
    default: 'pending',
    index: true,
    description: 'Current validator status'
  },

  registrationDate: {
    type: 'date',
    required: true,
    index: true,
    description: 'When validator was registered'
  },

  lastActive: {
    type: 'date',
    required: true,
    index: true,
    description: 'Last activity timestamp'
  },

  // Reputation
  reputation: {
    score: { type: 'number', min: 0, max: 100, default: 100, description: 'Reputation score' },
    validationsCompleted: { type: 'number', default: 0, description: 'Number of validations' },
    contractsHosted: { type: 'number', default: 0, description: 'Smart contracts hosted' },
    uptimeScore: { type: 'number', default: 0, description: 'Historical uptime score' },
    complaints: { type: 'number', default: 0, description: 'Number of complaints' }
  },

  // Network information
  network: {
    publicKey: { type: 'string', description: 'Public key for P2P communication' },
    address: { type: 'string', description: 'IP:Port for P2P' },
    peers: { type: 'array', items: { type: 'string' }, description: 'Connected peer IDs' },
    blockHeight: { type: 'number', default: 0, description: 'Current synced block height' },
    lastBlockHash: { type: 'string', description: 'Hash of last synced block' }
  },

  // Metadata
  metadata: {
    nodeVersion: { type: 'string', description: 'STARW node software version' },
    platform: { type: 'string', description: 'Operating system' },
    region: { type: 'string', description: 'Geographic region' },
    tags: { type: 'array', items: { type: 'string' }, description: 'Custom tags' }
  }
};

/**
 * VALIDATOR_REWARDS_HISTORY TABLE/COLLECTION
 * Track all reward payouts
 */
export const RewardHistorySchema = {
  rewardId: {
    type: 'string',
    unique: true,
    required: true,
    description: 'Unique reward payout ID'
  },

  validatorId: {
    type: 'string',
    required: true,
    index: true,
    foreignKey: 'validators.validatorId',
    description: 'Validator receiving the reward'
  },

  amount: {
    type: 'number',
    required: true,
    min: 0,
    description: 'STR tokens paid'
  },

  breakdown: {
    storage: { type: 'number', default: 0 },
    cpu: { type: 'number', default: 0 },
    bandwidth: { type: 'number', default: 0 },
    uptime: { type: 'number', default: 0 },
    contracts: { type: 'number', default: 0 }
  },

  period: {
    start: { type: 'date', required: true, description: 'Reward period start' },
    end: { type: 'date', required: true, description: 'Reward period end' }
  },

  transactionHash: {
    type: 'string',
    unique: true,
    description: 'Blockchain transaction hash'
  },

  payoutDate: {
    type: 'date',
    required: true,
    index: true,
    description: 'When reward was paid'
  },

  status: {
    type: 'string',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    description: 'Payout status'
  }
};

/**
 * VALIDATOR_RESOURCES_USAGE TABLE/COLLECTION
 * Track hourly resource usage for accurate reward calculation
 */
export const ResourceUsageSchema = {
  usageId: {
    type: 'string',
    unique: true,
    required: true
  },

  validatorId: {
    type: 'string',
    required: true,
    index: true,
    foreignKey: 'validators.validatorId'
  },

  timestamp: {
    type: 'date',
    required: true,
    index: true,
    description: 'Usage snapshot timestamp'
  },

  storage: {
    allocated: { type: 'number' },
    used: { type: 'number' },
    available: { type: 'number' }
  },

  cpu: {
    cores: { type: 'number' },
    usagePercent: { type: 'number' },
    tasksProcessed: { type: 'number', default: 0 }
  },

  bandwidth: {
    uploadedGB: { type: 'number', default: 0 },
    downloadedGB: { type: 'number', default: 0 }
  },

  uptime: {
    online: { type: 'boolean', default: true },
    latency: { type: 'number', description: 'Network latency (ms)' }
  }
};

/**
 * INDEXES for performance
 */
export const DatabaseIndexes = {
  validators: [
    { field: 'validatorId', type: 'unique' },
    { field: 'domain', type: 'unique' },
    { field: 'wallet', type: 'standard' },
    { field: 'status', type: 'standard' },
    { field: 'registrationDate', type: 'standard' },
    { field: 'lastActive', type: 'standard' },
    { field: ['status', 'lastActive'], type: 'compound' },
    { field: ['wallet', 'status'], type: 'compound' }
  ],
  
  rewardHistory: [
    { field: 'rewardId', type: 'unique' },
    { field: 'validatorId', type: 'standard' },
    { field: 'payoutDate', type: 'standard' },
    { field: 'transactionHash', type: 'unique' },
    { field: ['validatorId', 'payoutDate'], type: 'compound' }
  ],
  
  resourceUsage: [
    { field: 'usageId', type: 'unique' },
    { field: 'validatorId', type: 'standard' },
    { field: 'timestamp', type: 'standard' },
    { field: ['validatorId', 'timestamp'], type: 'compound' }
  ]
};

/**
 * SQL CREATE TABLE STATEMENTS (PostgreSQL)
 */
export const PostgreSQLTables = `
-- Validators table
CREATE TABLE validators (
  validator_id VARCHAR(100) PRIMARY KEY,
  domain VARCHAR(50) UNIQUE NOT NULL,
  wallet VARCHAR(100) NOT NULL,
  stake DECIMAL(18, 8) NOT NULL CHECK (stake >= 1000),
  stake_status VARCHAR(20) DEFAULT 'locked',
  stake_lock_date TIMESTAMP NOT NULL,
  
  -- Resources (stored as JSONB for flexibility)
  resources JSONB NOT NULL,
  
  -- Rewards
  rewards JSONB NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  registration_date TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Reputation
  reputation JSONB NOT NULL,
  
  -- Network
  network JSONB,
  
  -- Metadata
  metadata JSONB,
  
  -- Indexes
  CONSTRAINT check_domain_format CHECK (domain ~ '^STR\\.[a-z0-9]{3,32}$'),
  CONSTRAINT check_wallet_format CHECK (wallet ~ '^zk13str_[a-zA-Z0-9]+$')
);

CREATE INDEX idx_validators_wallet ON validators(wallet);
CREATE INDEX idx_validators_status ON validators(status);
CREATE INDEX idx_validators_registration ON validators(registration_date);
CREATE INDEX idx_validators_last_active ON validators(last_active);
CREATE INDEX idx_validators_status_active ON validators(status, last_active);

-- Reward history table
CREATE TABLE reward_history (
  reward_id VARCHAR(100) PRIMARY KEY,
  validator_id VARCHAR(100) NOT NULL REFERENCES validators(validator_id),
  amount DECIMAL(18, 8) NOT NULL,
  breakdown JSONB NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  transaction_hash VARCHAR(100) UNIQUE,
  payout_date TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending'
);

CREATE INDEX idx_rewards_validator ON reward_history(validator_id);
CREATE INDEX idx_rewards_payout ON reward_history(payout_date);
CREATE INDEX idx_rewards_validator_payout ON reward_history(validator_id, payout_date);

-- Resource usage table
CREATE TABLE resource_usage (
  usage_id VARCHAR(100) PRIMARY KEY,
  validator_id VARCHAR(100) NOT NULL REFERENCES validators(validator_id),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  storage JSONB NOT NULL,
  cpu JSONB NOT NULL,
  bandwidth JSONB NOT NULL,
  uptime JSONB NOT NULL
);

CREATE INDEX idx_usage_validator ON resource_usage(validator_id);
CREATE INDEX idx_usage_timestamp ON resource_usage(timestamp);
CREATE INDEX idx_usage_validator_timestamp ON resource_usage(validator_id, timestamp);
`;

/**
 * MongoDB collection definitions
 */
export const MongoDBCollections = {
  validators: {
    collection: 'validators',
    indexes: [
      { keys: { validatorId: 1 }, unique: true },
      { keys: { domain: 1 }, unique: true },
      { keys: { wallet: 1 } },
      { keys: { status: 1 } },
      { keys: { registrationDate: 1 } },
      { keys: { lastActive: 1 } },
      { keys: { status: 1, lastActive: 1 } }
    ]
  },
  
  rewardHistory: {
    collection: 'reward_history',
    indexes: [
      { keys: { rewardId: 1 }, unique: true },
      { keys: { validatorId: 1 } },
      { keys: { payoutDate: 1 } },
      { keys: { transactionHash: 1 }, unique: true, sparse: true },
      { keys: { validatorId: 1, payoutDate: 1 } }
    ]
  },
  
  resourceUsage: {
    collection: 'resource_usage',
    indexes: [
      { keys: { usageId: 1 }, unique: true },
      { keys: { validatorId: 1 } },
      { keys: { timestamp: 1 } },
      { keys: { validatorId: 1, timestamp: 1 } }
    ]
  }
};

export default {
  ValidatorSchema,
  RewardHistorySchema,
  ResourceUsageSchema,
  DatabaseIndexes,
  PostgreSQLTables,
  MongoDBCollections
};
