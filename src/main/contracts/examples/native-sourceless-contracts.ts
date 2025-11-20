/**
 * Native SourceLess™ Contract Examples
 * Showcasing pure SourceLess blockchain features with ZK13STR addresses and AresLang
 * 
 * Key Features:
 * - ZK13STR Address Format: zk13str_{40hex}_{4hex}
 * - AresLang Native Programming Language 
 * - CCOIN Reward System (2.5-10% dynamic rewards)
 * - HOSTLESS Gas-Free Transactions
 * - STR.Domain Integration
 * - 6-Ledger Architecture Support
 * - Quantum-Safe Cryptography
 */

export interface NativeSourceLessContract {
  id: string;
  name: string;
  description: string;
  language: 'ares';
  category: 'native' | 'quantum' | 'governance' | 'defi' | 'nft' | 'privacy';
  features: string[];
  code: string;
  zk13str_compatible: boolean;
  ccoin_integrated: boolean;
  gas_free: boolean;
}

export const nativeSourceLessContracts: NativeSourceLessContract[] = [
  {
    id: 'native_str_token',
    name: 'NativeSTRToken',
    description: 'Pure SourceLess STR token with full ecosystem integration',
    language: 'ares',
    category: 'native',
    features: ['ZK13STR addresses', 'CCOIN rewards', 'Gas-free transactions', 'STR.domain support'],
    zk13str_compatible: true,
    ccoin_integrated: true,
    gas_free: true,
    code: `// Native SourceLess STR Token Contract
token_contract NativeSTRToken {
    # Token metadata following SourceLess standards
    name: string = "Native SourceLess Token";
    symbol: string = "STR";
    decimals: uint8 = 13;  # All SourceLess tokens use 13 decimals
    total_supply: uint256 = 4_300_000_000;  # 4.3B STR total supply
    
    # Native ZK13STR address mappings
    balances: mapping<zk13str_address, uint256>;
    allowances: mapping<zk13str_address, mapping<zk13str_address, uint256>>;
    
    # SourceLess ecosystem integration
    str_domains: mapping<zk13str_address, str_domain>;
    ccoin_rewards: mapping<zk13str_address, uint256>;
    ledger_type: ledger = MAIN_LEDGER;
    
    # Native SourceLess events
    event STRTransfer(zk13str_address indexed from, zk13str_address indexed to, uint256 value);
    event STRApproval(zk13str_address indexed owner, zk13str_address indexed spender, uint256 value);
    event CCOINRewardMinted(zk13str_address indexed recipient, uint256 reward_amount);
    
    constructor() {
        balances[msg.sender] = total_supply;
        
        # Enable HOSTLESS gas-free transactions for all users
        enable_hostless_mode();
        
        # Setup dynamic CCOIN reward system (2.5-10% based on transaction size)
        setup_ccoin_integration(2.5, 10.0);
        
        # Register on Main Ledger
        register_on_ledger(MAIN_LEDGER);
        
        emit STRTransfer(zk13str_address_zero(), msg.sender, total_supply);
    }
    
    # Native STR transfer with automatic CCOIN rewards
    function transfer(zk13str_address to, uint256 amount) public hostless returns (bool) {
        require(validate_zk13str(to), "Invalid ZK13STR address format");
        require(to != zk13str_address_zero(), "Cannot transfer to zero address");
        require(balances[msg.sender] >= amount, "Insufficient STR balance");
        
        # Execute transfer
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        # Calculate and mint CCOIN rewards (2.5% base + volume bonus)
        uint256 ccoin_reward = calculate_dynamic_ccoin_reward(amount, msg.sender);
        ccoin.mint_transfer_reward(msg.sender, ccoin_reward);
        
        emit STRTransfer(msg.sender, to, amount);
        emit CCOINRewardMinted(msg.sender, ccoin_reward);
        
        return true;
    }
    
    # STR.domain registration with token integration
    function register_str_domain(str_domain domain) public hostless {
        require(balances[msg.sender] >= 100 * 10**13, "Need 100 STR for domain registration");
        require(!str_domains_registry.is_registered(domain), "Domain already registered");
        
        # Burn 100 STR for domain registration
        balances[msg.sender] -= 100 * 10**13;
        
        # Register domain and link to address
        str_domains[msg.sender] = domain;
        str_domains_registry.register(domain, msg.sender);
        
        # Mint CCOIN bonus for domain registration (10% of burn amount)
        ccoin.mint_domain_reward(msg.sender, 10 * 10**13);
        
        emit STRDomainRegistered(msg.sender, domain);
    }
    
    # Multi-ledger balance query
    function get_cross_ledger_balance(zk13str_address account) public view returns (uint256) {
        uint256 main_balance = balances[account];
        uint256 asset_balance = asset_ledger.get_balance(account);
        uint256 governance_balance = governance_ledger.get_balance(account);
        
        return main_balance + asset_balance + governance_balance;
    }
}`
  },
  
  {
    id: 'sourceless_nft',
    name: 'SourceLessNFT',
    description: 'Native NFT with STR.domain integration and CCOIN rewards',
    language: 'ares',
    category: 'nft',
    features: ['ZK13STR ownership', 'STR.domain metadata', 'CCOIN minting rewards', 'Cross-ledger compatibility'],
    zk13str_compatible: true,
    ccoin_integrated: true,
    gas_free: true,
    code: `// Native SourceLess NFT Contract
nft_contract SourceLessNFT {
    # NFT metadata
    name: string = "SourceLess Native NFT";
    symbol: string = "SLNFT";
    next_token_id: uint256 = 1;
    
    # ZK13STR address ownership
    owners: mapping<uint256, zk13str_address>;
    token_uris: mapping<uint256, string>;
    str_domain_metadata: mapping<uint256, str_domain>;
    
    # Cross-ledger registration
    registered_ledgers: mapping<uint256, ledger[]>;
    
    event SourceLessNFTMinted(zk13str_address indexed owner, uint256 indexed token_id, str_domain domain);
    event SourceLessNFTTransfer(zk13str_address indexed from, zk13str_address indexed to, uint256 indexed token_id);
    
    constructor() {
        enable_hostless_mode();
        setup_ccoin_integration(2.5, 5.0);  # 2.5-5% CCOIN rewards for NFT operations
    }
    
    # Mint NFT with STR.domain integration
    function mint(
        zk13str_address to, 
        string memory uri, 
        str_domain domain
    ) public hostless returns (uint256) {
        require(validate_zk13str(to), "Invalid ZK13STR recipient");
        require(str_domains_registry.is_owned_by(domain, msg.sender), "Domain not owned by minter");
        
        uint256 token_id = next_token_id;
        next_token_id++;
        
        # Set NFT data
        owners[token_id] = to;
        token_uris[token_id] = uri;
        str_domain_metadata[token_id] = domain;
        
        # Register on Asset Ledger for NFT tracking
        asset_ledger.register_nft(token_id, to);
        registered_ledgers[token_id].push(ASSET_LEDGER);
        
        # Mint CCOIN rewards for NFT creation (fixed 25 CCOIN)
        ccoin.mint_nft_reward(msg.sender, 25 * 10**13);
        
        emit SourceLessNFTMinted(to, token_id, domain);
        return token_id;
    }
    
    # Transfer NFT with CCOIN rewards
    function transfer(uint256 token_id, zk13str_address to) public hostless {
        require(owners[token_id] == msg.sender, "Not NFT owner");
        require(validate_zk13str(to), "Invalid ZK13STR recipient");
        
        zk13str_address from = msg.sender;
        owners[token_id] = to;
        
        # Update all registered ledgers
        for (ledger l : registered_ledgers[token_id]) {
            l.transfer_nft(token_id, from, to);
        }
        
        # Mint CCOIN rewards for NFT transfer (10 CCOIN)
        ccoin.mint_transfer_reward(from, 10 * 10**13);
        
        emit SourceLessNFTTransfer(from, to, token_id);
    }
    
    # Get NFT with STR.domain metadata
    function get_nft_with_domain(uint256 token_id) public view returns (
        zk13str_address owner,
        string memory uri,
        str_domain domain
    ) {
        return (owners[token_id], token_uris[token_id], str_domain_metadata[token_id]);
    }
}`
  },
  
  {
    id: 'zkt13_privacy_token',
    name: 'ZKT13PrivacyToken', 
    description: 'Zero-knowledge privacy token with quantum-safe features',
    language: 'ares',
    category: 'privacy',
    features: ['Zero-knowledge proofs', 'Privacy levels 1-10', 'Quantum-safe encryption', 'Anonymous transactions'],
    zk13str_compatible: true,
    ccoin_integrated: true,
    gas_free: true,
    code: `// Native SourceLess ZKT13 Privacy Token
zkt13_token_contract ZKT13PrivacyToken {
    # Privacy token metadata
    name: string = "ZKT13 Privacy Token";
    symbol: string = "ZKT13";
    decimals: uint8 = 13;
    total_supply: uint256 = 1_000_000 * 10**13;  # 1M ZKT13 tokens
    
    # Zero-knowledge balance storage
    zk_balances: zk_mapping<zk13str_address, zk_uint256>;
    nullifiers: set<zk_hash>;  # Prevent double-spending
    commitments: set<zk_commitment>;  # Balance commitments
    
    # Privacy levels (1-10, higher = more private)
    privacy_levels: mapping<zk13str_address, uint8>;
    privacy_costs: mapping<uint8, uint256>;  # Cost in STR for each privacy level
    
    # Quantum-safe cryptography
    quantum_keys: mapping<zk13str_address, crystals_kyber_key>;
    
    event ZKT13Minted(zk13str_address indexed recipient, zk_uint256 amount, uint8 privacy_level);
    event ZKT13PrivateTransfer(zk_hash nullifier, zk_commitment new_commitment);
    
    constructor() {
        # Setup privacy level costs (in STR)
        for (uint8 level = 1; level <= 10; level++) {
            privacy_costs[level] = level * 10 * 10**13;  # 10-100 STR per level
        }
        
        enable_hostless_mode();
        setup_ccoin_integration(5.0, 15.0);  # 5-15% CCOIN for privacy operations
    }
    
    # Mint private tokens with chosen privacy level
    function mint_private(
        uint256 amount, 
        uint8 privacy_level,
        str_payment str_cost
    ) public hostless returns (bool) {
        require(privacy_level >= 1 && privacy_level <= 10, "Invalid privacy level");
        require(str_cost >= privacy_costs[privacy_level], "Insufficient STR for privacy level");
        
        # Burn STR for privacy service
        str_token.burn_from(msg.sender, str_cost);
        
        # Generate zero-knowledge proof for private minting
        zk_proof mint_proof = zk_mint.generate_proof(
            amount, 
            privacy_level, 
            msg.sender,
            quantum_keys[msg.sender]
        );
        
        # Create commitment for private balance
        zk_commitment commitment = zk_commit(amount, privacy_level);
        commitments.insert(commitment);
        
        # Update private balance
        zk_balances[msg.sender] = zk_balances[msg.sender] + zk_uint256(amount);
        privacy_levels[msg.sender] = privacy_level;
        
        # Mint enhanced CCOIN rewards based on privacy level (5% + level bonus)
        uint256 ccoin_reward = (amount * 50) / 1000 + (privacy_level * 10**13);
        ccoin.mint_privacy_reward(msg.sender, ccoin_reward);
        
        emit ZKT13Minted(msg.sender, zk_uint256(amount), privacy_level);
        return true;
    }
    
    # Private transfer with zero-knowledge proof
    function private_transfer(
        zk_commitment recipient_commitment,
        zk_proof transfer_proof,
        zk_hash nullifier
    ) public hostless returns (bool) {
        # Verify transfer proof
        require(zk_verify.verify_transfer_proof(transfer_proof), "Invalid transfer proof");
        
        # Prevent double-spending
        require(!nullifiers.contains(nullifier), "Nullifier already used");
        nullifiers.insert(nullifier);
        
        # Add new commitment
        commitments.insert(recipient_commitment);
        
        # Mint CCOIN rewards for private transfer (10% base + privacy bonus)
        uint256 privacy_bonus = privacy_levels[msg.sender] * 5 * 10**12;  # 0.5% per level
        ccoin.mint_transfer_reward(msg.sender, 100 * 10**12 + privacy_bonus);
        
        emit ZKT13PrivateTransfer(nullifier, recipient_commitment);
        return true;
    }
    
    # Generate quantum-safe key pair for enhanced privacy
    function generate_quantum_keys() public hostless {
        quantum_keys[msg.sender] = crystals_kyber.generate_keypair();
        
        # Mint CCOIN bonus for quantum key generation
        ccoin.mint_security_reward(msg.sender, 50 * 10**12);  # 5 CCOIN bonus
    }
}`
  },
  
  {
    id: 'str_governance',
    name: 'STRGovernance',
    description: 'Native SourceLess governance with voting and proposal system',
    language: 'ares',
    category: 'governance', 
    features: ['STR voting power', 'Proposal system', 'CCOIN delegation rewards', 'Multi-ledger governance'],
    zk13str_compatible: true,
    ccoin_integrated: true,
    gas_free: true,
    code: `// Native SourceLess Governance Contract
governance_contract STRGovernance {
    # Governance metadata
    name: string = "SourceLess Governance";
    min_proposal_stake: uint256 = 1000 * 10**13;  # 1000 STR to create proposal
    voting_period: uint256 = 604800;  # 7 days in seconds
    
    # Proposals
    struct Proposal {
        zk13str_address proposer;
        string title;
        string description;
        uint256 start_time;
        uint256 end_time;
        uint256 votes_for;
        uint256 votes_against;
        bool executed;
        str_domain associated_domain;
    }
    
    proposals: mapping<uint256, Proposal>;
    next_proposal_id: uint256 = 1;
    
    # Voting power (based on STR holdings + CCOIN bonuses)
    voting_power: mapping<zk13str_address, uint256>;
    voted: mapping<uint256, mapping<zk13str_address, bool>>;  # proposal_id -> voter -> voted
    
    event ProposalCreated(uint256 indexed proposal_id, zk13str_address indexed proposer, str_domain domain);
    event VoteCast(uint256 indexed proposal_id, zk13str_address indexed voter, bool support, uint256 power);
    
    constructor() {
        enable_hostless_mode();
        setup_ccoin_integration(3.0, 8.0);  # 3-8% CCOIN for governance participation
        
        # Register on Governance Ledger
        register_on_ledger(GOVERNANCE_LEDGER);
    }
    
    # Create governance proposal
    function create_proposal(
        string memory title,
        string memory description,
        str_domain domain
    ) public hostless returns (uint256) {
        require(str_token.balance_of(msg.sender) >= min_proposal_stake, "Insufficient STR for proposal");
        require(str_domains_registry.is_owned_by(domain, msg.sender), "Must own STR.domain for proposal");
        
        # Stake STR tokens for proposal
        str_token.transfer_from(msg.sender, address(this), min_proposal_stake);
        
        uint256 proposal_id = next_proposal_id;
        next_proposal_id++;
        
        proposals[proposal_id] = Proposal({
            proposer: msg.sender,
            title: title,
            description: description,
            start_time: block.timestamp,
            end_time: block.timestamp + voting_period,
            votes_for: 0,
            votes_against: 0,
            executed: false,
            associated_domain: domain
        });
        
        # Register proposal on Governance Ledger
        governance_ledger.register_proposal(proposal_id, msg.sender);
        
        # Mint CCOIN rewards for proposal creation (50 CCOIN)
        ccoin.mint_governance_reward(msg.sender, 50 * 10**13);
        
        emit ProposalCreated(proposal_id, msg.sender, domain);
        return proposal_id;
    }
    
    # Vote on proposal with STR-based voting power
    function vote(uint256 proposal_id, bool support) public hostless {
        require(proposals[proposal_id].proposer != zk13str_address_zero(), "Proposal does not exist");
        require(block.timestamp <= proposals[proposal_id].end_time, "Voting period ended");
        require(!voted[proposal_id][msg.sender], "Already voted on this proposal");
        
        # Calculate voting power (STR balance + CCOIN bonus + domain bonus)
        uint256 str_balance = str_token.balance_of(msg.sender);
        uint256 ccoin_bonus = ccoin.balance_of(msg.sender) / 100;  # 1% of CCOIN as bonus
        uint256 domain_bonus = str_domains_registry.get_domain_count(msg.sender) * 100 * 10**13;  # 100 STR per domain
        
        uint256 total_power = str_balance + ccoin_bonus + domain_bonus;
        voting_power[msg.sender] = total_power;
        
        # Cast vote
        if (support) {
            proposals[proposal_id].votes_for += total_power;
        } else {
            proposals[proposal_id].votes_against += total_power;
        }
        
        voted[proposal_id][msg.sender] = true;
        
        # Record vote on Governance Ledger
        governance_ledger.record_vote(proposal_id, msg.sender, support, total_power);
        
        # Mint CCOIN rewards for voting participation (5% of voting power)
        ccoin.mint_voting_reward(msg.sender, total_power / 20);
        
        emit VoteCast(proposal_id, msg.sender, support, total_power);
    }
    
    # Execute passed proposal
    function execute_proposal(uint256 proposal_id) public hostless {
        require(proposals[proposal_id].proposer != zk13str_address_zero(), "Proposal does not exist");
        require(block.timestamp > proposals[proposal_id].end_time, "Voting still active");
        require(!proposals[proposal_id].executed, "Proposal already executed");
        require(proposals[proposal_id].votes_for > proposals[proposal_id].votes_against, "Proposal did not pass");
        
        proposals[proposal_id].executed = true;
        
        # Return proposal stake to proposer
        str_token.transfer(proposals[proposal_id].proposer, min_proposal_stake);
        
        # Execute on Governance Ledger
        governance_ledger.execute_proposal(proposal_id);
        
        # Mint CCOIN rewards for execution (100 CCOIN)
        ccoin.mint_execution_reward(msg.sender, 100 * 10**13);
        
        emit ProposalExecuted(proposal_id, msg.sender);
    }
}`
  },
  
  {
    id: 'ccoin_staking',
    name: 'CCOINStaking',
    description: 'Native CCOIN staking with dynamic rewards and gas-free benefits',
    language: 'ares',
    category: 'defi',
    features: ['CCOIN staking', 'Dynamic APY 15-45%', 'Gas-free transactions', 'Multi-token rewards'],
    zk13str_compatible: true,
    ccoin_integrated: true,
    gas_free: true,
    code: `// Native SourceLess CCOIN Staking Contract
staking_contract CCOINStaking {
    # Staking parameters
    name: string = "CCOIN Staking Vault";
    min_stake: uint256 = 100 * 10**13;  # Minimum 100 CCOIN to stake
    base_apy: uint256 = 15;  # 15% base APY
    max_apy: uint256 = 45;   # 45% maximum APY with bonuses
    
    # Staking data
    struct StakeInfo {
        uint256 amount;
        uint256 stake_time;
        uint256 last_reward_time;
        uint8 tier_level;  # 1-5 based on stake size
        str_domain bonus_domain;
    }
    
    stakes: mapping<zk13str_address, StakeInfo>;
    total_staked: uint256;
    tier_thresholds: mapping<uint8, uint256>;  # CCOIN amounts for each tier
    tier_multipliers: mapping<uint8, uint256>;  # APY multipliers
    
    event CCOINStaked(zk13str_address indexed staker, uint256 amount, uint8 tier);
    event RewardsClaimed(zk13str_address indexed staker, uint256 str_reward, uint256 ccoin_reward);
    event CCOINUnstaked(zk13str_address indexed staker, uint256 amount);
    
    constructor() {
        # Setup staking tiers
        tier_thresholds[1] = 100 * 10**13;      # Bronze: 100 CCOIN
        tier_thresholds[2] = 1000 * 10**13;     # Silver: 1,000 CCOIN  
        tier_thresholds[3] = 10000 * 10**13;    # Gold: 10,000 CCOIN
        tier_thresholds[4] = 50000 * 10**13;    # Platinum: 50,000 CCOIN
        tier_thresholds[5] = 100000 * 10**13;   # Diamond: 100,000 CCOIN
        
        # Setup tier multipliers (base APY multipliers)
        tier_multipliers[1] = 100;  # 1.0x (15% APY)
        tier_multipliers[2] = 150;  # 1.5x (22.5% APY)
        tier_multipliers[3] = 200;  # 2.0x (30% APY)
        tier_multipliers[4] = 250;  # 2.5x (37.5% APY)
        tier_multipliers[5] = 300;  # 3.0x (45% APY)
        
        enable_hostless_mode();
        setup_ccoin_integration(20.0, 50.0);  # 20-50% additional CCOIN rewards
    }
    
    # Stake CCOIN tokens
    function stake_ccoin(uint256 amount, str_domain bonus_domain) public hostless {
        require(amount >= min_stake, "Below minimum stake amount");
        require(ccoin.balance_of(msg.sender) >= amount, "Insufficient CCOIN balance");
        
        # Transfer CCOIN to staking contract
        ccoin.transfer_from(msg.sender, address(this), amount);
        
        # Determine staking tier
        uint8 tier = calculate_tier(amount);
        
        # Update or create stake
        if (stakes[msg.sender].amount > 0) {
            # Claim existing rewards before updating
            claim_rewards_internal();
            stakes[msg.sender].amount += amount;
        } else {
            stakes[msg.sender] = StakeInfo({
                amount: amount,
                stake_time: block.timestamp,
                last_reward_time: block.timestamp,
                tier_level: tier,
                bonus_domain: bonus_domain
            });
        }
        
        total_staked += amount;
        
        # Update tier if necessary
        stakes[msg.sender].tier_level = calculate_tier(stakes[msg.sender].amount);
        
        # Enable permanent gas-free transactions for stakers
        hostless_registry.enable_permanent_hostless(msg.sender);
        
        emit CCOINStaked(msg.sender, amount, stakes[msg.sender].tier_level);
    }
    
    # Claim staking rewards (STR + bonus CCOIN)
    function claim_rewards() public hostless returns (uint256 str_reward, uint256 ccoin_bonus) {
        require(stakes[msg.sender].amount > 0, "No active stake");
        
        return claim_rewards_internal();
    }
    
    function claim_rewards_internal() internal returns (uint256 str_reward, uint256 ccoin_bonus) {
        StakeInfo storage stake = stakes[msg.sender];
        
        # Calculate time-based rewards
        uint256 time_elapsed = block.timestamp - stake.last_reward_time;
        uint256 base_reward = (stake.amount * base_apy * time_elapsed) / (365 days * 100);
        
        # Apply tier multiplier
        uint256 tier_multiplier = tier_multipliers[stake.tier_level];
        str_reward = (base_reward * tier_multiplier) / 100;
        
        # STR.domain bonus (10% extra if domain provided)
        if (stake.bonus_domain != str_domain_null()) {
            str_reward += str_reward / 10;  # +10% bonus
        }
        
        # Calculate bonus CCOIN rewards (20% of STR reward amount)
        ccoin_bonus = str_reward / 5;
        
        # Update last reward time
        stake.last_reward_time = block.timestamp;
        
        # Mint rewards
        str_token.mint(msg.sender, str_reward);
        ccoin.mint_staking_reward(msg.sender, ccoin_bonus);
        
        emit RewardsClaimed(msg.sender, str_reward, ccoin_bonus);
    }
    
    # Unstake CCOIN (with cooldown period)
    function unstake_ccoin(uint256 amount) public hostless {
        require(stakes[msg.sender].amount >= amount, "Insufficient staked amount");
        require(block.timestamp >= stakes[msg.sender].stake_time + 7 days, "Cooldown period active");
        
        # Claim final rewards
        claim_rewards_internal();
        
        # Update stake
        stakes[msg.sender].amount -= amount;
        total_staked -= amount;
        
        # Transfer CCOIN back to user
        ccoin.transfer(msg.sender, amount);
        
        # Remove stake if fully unstaked
        if (stakes[msg.sender].amount == 0) {
            delete stakes[msg.sender];
            # Note: Gas-free benefits remain permanent
        }
        
        emit CCOINUnstaked(msg.sender, amount);
    }
    
    # Calculate staking tier based on amount
    function calculate_tier(uint256 amount) internal view returns (uint8) {
        for (uint8 tier = 5; tier >= 1; tier--) {
            if (amount >= tier_thresholds[tier]) {
                return tier;
            }
        }
        return 1;  # Default to Bronze
    }
    
    # Get staking info and projected rewards
    function get_stake_info(zk13str_address staker) public view returns (
        uint256 staked_amount,
        uint8 tier,
        uint256 current_apy,
        uint256 pending_str_rewards,
        uint256 pending_ccoin_rewards
    ) {
        StakeInfo storage stake = stakes[staker];
        if (stake.amount == 0) return (0, 0, 0, 0, 0);
        
        staked_amount = stake.amount;
        tier = stake.tier_level;
        current_apy = (base_apy * tier_multipliers[tier]) / 100;
        
        # Calculate pending rewards
        uint256 time_elapsed = block.timestamp - stake.last_reward_time;
        uint256 base_pending = (stake.amount * current_apy * time_elapsed) / (365 days * 100);
        
        pending_str_rewards = base_pending;
        if (stake.bonus_domain != str_domain_null()) {
            pending_str_rewards += pending_str_rewards / 10;  # +10% domain bonus
        }
        
        pending_ccoin_rewards = pending_str_rewards / 5;  # 20% of STR rewards in CCOIN
    }
}`
  }
];

/**
 * Utility functions for ZK13STR address validation and CCOIN calculations
 */
export const nativeSourceLessUtils = {
  /**
   * Validate ZK13STR address format
   * Format: zk13str_{40hex}_{4hex_checksum}
   */
  validateZK13STR: (address: string): boolean => {
    const zk13strRegex = /^zk13str_[0-9a-fA-F]{40}_[0-9a-fA-F]{4}$/;
    return zk13strRegex.test(address);
  },

  /**
   * Generate sample ZK13STR address for testing
   */
  generateSampleZK13STR: (): string => {
    const hex40 = Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const hex4 = Array.from({length: 4}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return `zk13str_${hex40}_${hex4}`;
  },

  /**
   * Calculate dynamic CCOIN reward (2.5% - 10% based on transaction size)
   */
  calculateCCOINReward: (amount: bigint, baseRate: number = 2.5): bigint => {
    const rate = Math.min(10, baseRate + Number(amount) / 1000000);  // Increase rate with volume
    return (amount * BigInt(Math.floor(rate * 100))) / 10000n;  // Convert to basis points
  },

  /**
   * STR.domain format validation
   */
  validateSTRDomain: (domain: string): boolean => {
    const strDomainRegex = /^STR\.[a-zA-Z0-9-]+$/;
    return strDomainRegex.test(domain) && domain.length <= 63;
  }
};

export default nativeSourceLessContracts;