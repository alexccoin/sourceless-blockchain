-- Sourceless Blockchain - Validator System Database Initialization
-- Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team
-- Copyright (c) 2024-2025 Alexandru Marius Stratulat

-- =============================================================================
-- VALIDATORS TABLE
-- Stores all registered personal validators
-- =============================================================================

CREATE TABLE IF NOT EXISTS validators (
  -- Primary identifiers
  validator_id VARCHAR(100) PRIMARY KEY,
  domain VARCHAR(50) UNIQUE NOT NULL,
  wallet VARCHAR(100) NOT NULL,
  
  -- Stake and economics
  stake DECIMAL(18, 8) NOT NULL CHECK (stake >= 1000),
  stake_status VARCHAR(20) DEFAULT 'locked',
  stake_lock_date TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Resources (JSONB for flexibility and easy queries)
  resources JSONB NOT NULL,
  
  -- Rewards
  rewards JSONB NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  registration_date TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Reputation
  reputation JSONB NOT NULL,
  
  -- Network information
  network JSONB,
  
  -- Metadata
  metadata JSONB,
  
  -- Validation constraints
  CONSTRAINT check_domain_format CHECK (domain ~ '^STR\.[a-z0-9]{3,32}$'),
  CONSTRAINT check_wallet_format CHECK (wallet ~ '^zk13str_[a-zA-Z0-9]+$'),
  CONSTRAINT check_status_values CHECK (status IN ('pending', 'active', 'paused', 'suspended', 'terminated'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_validators_wallet ON validators(wallet);
CREATE INDEX IF NOT EXISTS idx_validators_status ON validators(status);
CREATE INDEX IF NOT EXISTS idx_validators_registration ON validators(registration_date);
CREATE INDEX IF NOT EXISTS idx_validators_last_active ON validators(last_active);
CREATE INDEX IF NOT EXISTS idx_validators_status_active ON validators(status, last_active);
CREATE INDEX IF NOT EXISTS idx_validators_wallet_status ON validators(wallet, status);

-- =============================================================================
-- REWARD HISTORY TABLE
-- Track all reward payouts to validators
-- =============================================================================

CREATE TABLE IF NOT EXISTS reward_history (
  -- Primary key
  reward_id VARCHAR(100) PRIMARY KEY,
  
  -- Foreign key to validator
  validator_id VARCHAR(100) NOT NULL REFERENCES validators(validator_id) ON DELETE CASCADE,
  
  -- Reward details
  amount DECIMAL(18, 8) NOT NULL CHECK (amount >= 0),
  breakdown JSONB NOT NULL,
  
  -- Period covered
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  
  -- Transaction details
  transaction_hash VARCHAR(100) UNIQUE,
  payout_date TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Validation
  CONSTRAINT check_payout_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT check_period_order CHECK (period_end > period_start)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rewards_validator ON reward_history(validator_id);
CREATE INDEX IF NOT EXISTS idx_rewards_payout ON reward_history(payout_date);
CREATE INDEX IF NOT EXISTS idx_rewards_status ON reward_history(status);
CREATE INDEX IF NOT EXISTS idx_rewards_validator_payout ON reward_history(validator_id, payout_date);
CREATE INDEX IF NOT EXISTS idx_rewards_transaction ON reward_history(transaction_hash);

-- =============================================================================
-- RESOURCE USAGE TABLE
-- Track hourly resource usage for accurate reward calculation
-- =============================================================================

CREATE TABLE IF NOT EXISTS resource_usage (
  -- Primary key
  usage_id VARCHAR(100) PRIMARY KEY,
  
  -- Foreign key to validator
  validator_id VARCHAR(100) NOT NULL REFERENCES validators(validator_id) ON DELETE CASCADE,
  
  -- Timestamp
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Resource metrics (JSONB for flexibility)
  storage JSONB NOT NULL,
  cpu JSONB NOT NULL,
  bandwidth JSONB NOT NULL,
  uptime JSONB NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_validator ON resource_usage(validator_id);
CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON resource_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_validator_timestamp ON resource_usage(validator_id, timestamp);

-- =============================================================================
-- SMART CONTRACTS TABLE
-- Track deployed smart contracts
-- =============================================================================

CREATE TABLE IF NOT EXISTS smart_contracts (
  -- Primary identifiers
  contract_address VARCHAR(100) PRIMARY KEY,
  deployment_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Contract details
  contract_name VARCHAR(100) NOT NULL,
  version VARCHAR(20) NOT NULL,
  deployer VARCHAR(100) NOT NULL,
  
  -- Contract code
  bytecode TEXT NOT NULL,
  abi JSONB,
  source_code TEXT,
  
  -- Hosting details
  hosting_validators JSONB NOT NULL,
  
  -- Deployment details
  deployment_date TIMESTAMP NOT NULL DEFAULT NOW(),
  deployment_fee DECIMAL(18, 8) DEFAULT 100,
  deployment_tx_hash VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Metadata
  metadata JSONB,
  
  -- Validation
  CONSTRAINT check_contract_status CHECK (status IN ('active', 'paused', 'terminated'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contracts_deployer ON smart_contracts(deployer);
CREATE INDEX IF NOT EXISTS idx_contracts_deployment_date ON smart_contracts(deployment_date);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON smart_contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_name ON smart_contracts(contract_name);

-- =============================================================================
-- CONTRACT EXECUTIONS TABLE
-- Track smart contract function executions
-- =============================================================================

CREATE TABLE IF NOT EXISTS contract_executions (
  -- Primary key
  execution_id VARCHAR(100) PRIMARY KEY,
  
  -- Contract reference
  contract_address VARCHAR(100) NOT NULL REFERENCES smart_contracts(contract_address),
  
  -- Execution details
  function_name VARCHAR(100) NOT NULL,
  parameters JSONB,
  caller VARCHAR(100) NOT NULL,
  
  -- Result
  result JSONB,
  gas_used DECIMAL(18, 8),
  gas_fee DECIMAL(18, 8),
  
  -- Hosting validator
  executed_by VARCHAR(100) NOT NULL,
  
  -- Timestamp
  execution_date TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Transaction
  tx_hash VARCHAR(100) UNIQUE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  
  -- Validation
  CONSTRAINT check_execution_status CHECK (status IN ('success', 'failed', 'pending'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_executions_contract ON contract_executions(contract_address);
CREATE INDEX IF NOT EXISTS idx_executions_caller ON contract_executions(caller);
CREATE INDEX IF NOT EXISTS idx_executions_date ON contract_executions(execution_date);
CREATE INDEX IF NOT EXISTS idx_executions_status ON contract_executions(status);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get total network stats
CREATE OR REPLACE FUNCTION get_network_stats()
RETURNS TABLE (
  total_validators BIGINT,
  active_validators BIGINT,
  total_storage_gb NUMERIC,
  total_cpu_cores NUMERIC,
  avg_bandwidth_mbps NUMERIC,
  total_contracts BIGINT,
  total_rewards_paid NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT,
    SUM((resources->'storage'->>'allocated')::NUMERIC),
    SUM((resources->'cpu'->>'cores')::NUMERIC),
    AVG(((resources->'bandwidth'->>'upload')::NUMERIC + (resources->'bandwidth'->>'download')::NUMERIC) / 2),
    (SELECT COUNT(*)::BIGINT FROM smart_contracts WHERE status = 'active'),
    (SELECT COALESCE(SUM(amount), 0) FROM reward_history WHERE status = 'completed')
  FROM validators;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate validator rank
CREATE OR REPLACE FUNCTION calculate_validator_rank(p_validator_id VARCHAR)
RETURNS TABLE (
  validator_id VARCHAR,
  rank INTEGER,
  percentile NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_validators AS (
    SELECT 
      v.validator_id,
      ROW_NUMBER() OVER (
        ORDER BY 
          (v.reputation->>'score')::NUMERIC DESC,
          (v.resources->'uptime'->>'current')::NUMERIC DESC,
          v.registration_date ASC
      ) AS rank_num,
      COUNT(*) OVER () AS total_validators
    FROM validators v
    WHERE v.status = 'active'
  )
  SELECT 
    rv.validator_id::VARCHAR,
    rv.rank_num::INTEGER,
    (100.0 * (total_validators - rank_num + 1) / total_validators)::NUMERIC AS percentile
  FROM ranked_validators rv
  WHERE rv.validator_id = p_validator_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SAMPLE DATA (for testing)
-- =============================================================================

-- Insert sample genesis validator reference
INSERT INTO validators (
  validator_id,
  domain,
  wallet,
  stake,
  resources,
  rewards,
  status,
  reputation,
  network,
  metadata
) VALUES (
  'PVAL_GENESIS_REFERENCE',
  'STR.GENESIS',
  'zk13str_genesis_treasury_0001',
  1000000,
  '{"storage": {"allocated": 1000, "available": 1000, "used": 0, "path": "/genesis/storage"}, "cpu": {"cores": 16, "maxUsage": 100, "currentUsage": 0, "priority": "high"}, "bandwidth": {"upload": 10000, "download": 10000, "monthlyLimit": 100000, "used": 0}, "uptime": {"target": 100, "current": 100, "lastOnline": null, "downtimeHistory": []}}',
  '{"accumulated": 0, "lastPayout": null, "payoutAddress": "zk13str_genesis_treasury_0001", "monthlyEstimate": 0, "breakdown": {"storage": 0, "cpu": 0, "bandwidth": 0, "uptime": 0, "contracts": 0}}',
  'active',
  '{"score": 100, "validationsCompleted": 1000000, "contractsHosted": 0, "uptimeScore": 100, "complaints": 0}',
  '{"publicKey": "GENESIS_PUB_KEY", "address": "genesis.sourceless.network:30303", "peers": [], "blockHeight": 1000000, "lastBlockHash": "0x0000000000000000000000000000000000000000000000000000000000000000"}',
  '{"nodeVersion": "1.0.0", "platform": "Linux", "region": "GLOBAL", "tags": ["genesis", "foundation"]}'
) ON CONFLICT (validator_id) DO NOTHING;

-- =============================================================================
-- GRANTS (if using specific database user)
-- =============================================================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO starw_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO starw_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO starw_user;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Sourceless Blockchain Validator Database';
  RAISE NOTICE 'Initialization Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✅ validators';
  RAISE NOTICE '  ✅ reward_history';
  RAISE NOTICE '  ✅ resource_usage';
  RAISE NOTICE '  ✅ smart_contracts';
  RAISE NOTICE '  ✅ contract_executions';
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes created: 20+';
  RAISE NOTICE 'Functions created: 2';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for validator registration!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created with ❤️ by AM Stratulat';
  RAISE NOTICE 'Copyright © 2024-2025';
  RAISE NOTICE '========================================';
END $$;
