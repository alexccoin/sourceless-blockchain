// Native SourceLess™ Smart Contract Examples
// ZK13STR addresses, AresLang contracts, STR.domains integration

export interface SourceLessContractExample {
  id: string;
  name: string;
  description: string;
  language: 'areslang';
  code: string;
  category: 'token' | 'nft' | 'defi' | 'dao' | 'utility';
  features: string[];
  gasEstimate: number; // 0 for gas-free contracts
  addressFormat: 'zk13str';
  integration: string[];
}

export const SOURCELESS_NATIVE_EXAMPLES: SourceLessContractExample[] = [
  {
    id: 'str-token-native',
    name: 'Native STR Token',
    description: 'Pure SourceLess STR token with ZK13STR addresses and gas-free transactions',
    language: 'areslang',
    gasEstimate: 0,
    addressFormat: 'zk13str',
    category: 'token',
    features: ['ZK13STR addresses', 'Gas-free transfers', 'Auto CCOIN post mining', 'STR.domain integration'],
    integration: ['CCOIN System', 'STR.domains', 'HOSTLESS Mode'],
    code: `# Native SourceLess STR Token Contract
token_contract NativeSTRToken {
    # Token metadata
    name: string = "SourceLess Native Token";
    symbol: string = "STR";
    decimals: uint8 = 13;  # All SourceLess tokens use 13 decimals
    total_supply: uint256 = 63000000000000000000000000000;  # 63B STR with 13 decimals
    
    # Native SourceLess balances use ZK13STR addresses
    balances: mapping<zk13str_address, uint256>;
    allowances: mapping<zk13str_address, mapping<zk13str_address, uint256>>;
    
    # SourceLess native events
    event STRTransfer(zk13str_address indexed from, zk13str_address indexed to, uint256 value);
    event STRApproval(zk13str_address indexed owner, zk13str_address indexed spender, uint256 value);
    event CCOINPostMined(zk13str_address indexed recipient, uint256 ccoin_amount);
    
    constructor() {
        balances[msg.sender] = total_supply;
        enable_hostless_mode();  # Gas-free for CCOS holders and STR domain owners
    }
    
    # Native gas-free transfer function
    function transfer(zk13str_address to, uint256 amount) public hostless returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient STR balance");
        require(to != zk13str_address(0), "Invalid ZK13STR address");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        # Execute PoE-based CCOIN post mining
        uint256 ccoin_post_mined = execute_poe_post_mining(msg.sender, amount);
        ccoin_post_mint(msg.sender, ccoin_post_mined);
        
        emit STRTransfer(msg.sender, to, amount);
        emit CCOINPostMined(msg.sender, ccoin_post_mined);
        
        return true;
    }
    
    function approve(zk13str_address spender, uint256 amount) public returns (bool) {
        allowances[msg.sender][spender] = amount;
        emit STRApproval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(zk13str_address from, zk13str_address to, uint256 amount) public hostless returns (bool) {
        require(balances[from] >= amount, "Insufficient balance");
        require(allowances[from][msg.sender] >= amount, "Insufficient allowance");
        
        balances[from] -= amount;
        balances[to] += amount;
        allowances[from][msg.sender] -= amount;
        
        # Auto-mint CCOIN via post miningt mining
        uint256 ccoin_post_mined = execute_poe_post_mining(msg.sender, amount);
        ccoin_mint(to, ccoin_post_mined);
        
        emit STRTransfer(from, to, amount);
        emit CCOINPostMined(to, ccoin_post_mined);mined);
        
        return true;
    }
    
    # PoE-based CCOIN post mining mechanism
    function execute_poe_post_mining(zk13str_address user, uint256 activity_value) private returns (uint256) {
        # Validate proof of existence
        ProofOfExistence memory poe = get_current_poe(user);
        require(poe.is_live && poe.zk13_score >= 50, "Insufficient PoE validation");
        
        # Calculate post mining amount based on existence proof strength
        uint256 base_mining = 1000000000000000000;  # 1 CCOIN base
        uint256 crypto_factor = (poe.zk13_score * base_mining) / 100;
        uint256 consensus_factor = (poe.consensus_level * base_mining) / 200;
        uint256 activity_factor = min((activity_value / 1000000000000000000), base_mining);
        
        return crypto_factor + consensus_factor + activity_factor;
    }
    
    # View functions
    function balanceOf(zk13str_address account) public view returns (uint256) {
        return balances[account];
    }
    
    function allowance(zk13str_address owner, zk13str_address spender) public view returns (uint256) {
        return allowances[owner][spender];
    }
}`
  },
  
  {
    id: 'sourceless-nft',
    name: 'Native SourceLess NFT',
    description: 'Pure SourceLess NFT collection with ZK13STR addresses and STR.domain integration',
    language: 'areslang',
    gasEstimate: 0,
    addressFormat: 'zk13str',
    category: 'nft',
    features: ['ZK13STR addresses', 'Gas-free minting', 'STR.domain metadata', 'Auto CCOIN post mining'],
    integration: ['CCOIN System', 'STR.domains', 'HOSTLESS Mode'],
    code: `# Native SourceLess NFT Collection Contract
nft_contract SourceLessNFT {
    # Collection metadata
    name: string = "SourceLess Native NFT";
    symbol: string = "SLNFT";
    base_uri: string = "https://nft.sourceless.io/metadata/";
    max_supply: uint256 = 10000;
    mint_price: uint256 = 1000000000000000000;  # 1 STR (with 13 decimals)
    next_token_id: uint256 = 1;
    
    # Native ZK13STR address mappings
    owners: mapping<uint256, zk13str_address>;
    token_uris: mapping<uint256, string>;
    approved: mapping<uint256, zk13str_address>;
    operator_approvals: mapping<zk13str_address, mapping<zk13str_address, bool>>;
    
    # STR.domain integration
    str_domains: mapping<uint256, str_domain>;
    domain_royalties: mapping<str_domain, uint256>;  # Revenue share per domain
    
    # SourceLess native events
    event SourceLessNFTMinted(zk13str_address indexed to, uint256 indexed tokenId, str_domain domain);
    event SourceLessNFTTransfer(zk13str_address indexed from, zk13str_address indexed to, uint256 indexed tokenId);
    event STRDomainRoyalty(str_domain indexed domain, uint256 amount);
    
    constructor() {
        enable_hostless_mode();  # Gas-free for CCOS holders
    }
    
    # Native gas-free minting with STR.domain integration
    function mint(zk13str_address to, string memory uri, str_domain domain) public payable hostless returns (uint256) {
        require(next_token_id <= max_supply, "Max supply reached");
        require(msg.value >= mint_price, "Insufficient STR payment");
        
        uint256 tokenId = next_token_id;
        owners[tokenId] = to;
        token_uris[tokenId] = uri;
        str_domains[tokenId] = domain;
        
        # Execute PoE-based CCOIN post mining for NFT creation
        uint256 ccoin_post_mined = validate_nft_existence_and_mine(to, msg.value);
        ccoin_post_mint(to, ccoin_post_mined);
        
        # STR.domain revenue sharing (20% to domain owner)
        if (domain != str_domain(0)) {
            uint256 domain_share = (msg.value * 2000) / 10000;  # 20%
            str_domain_transfer(domain, domain_share);
            emit STRDomainRoyalty(domain, domain_share);
        }
        
        emit SourceLessNFTMinted(to, tokenId, domain);
        next_token_id++;
        
        return tokenId;
    }
    
    # Gas-free transfer function
    function transfer(zk13str_address to, uint256 tokenId) public hostless {
        require(owners[tokenId] == msg.sender, "Not NFT owner");
        require(to != zk13str_address(0), "Invalid ZK13STR address");
        
        owners[tokenId] = to;
        approved[tokenId] = zk13str_address(0);  # Clear approval
        
        emit SourceLessNFTTransfer(msg.sender, to, tokenId);
    }
    
    function approve(zk13str_address to, uint256 tokenId) public {
        require(owners[tokenId] == msg.sender, "Not NFT owner");
        approved[tokenId] = to;
    }
    
    # View functions
    function ownerOf(uint256 tokenId) public view returns (zk13str_address) {
        return owners[tokenId];
    }
    
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        return string(abi.encodePacked(base_uri, token_uris[tokenId]));
    }
    
    function getSTRDomain(uint256 tokenId) public view returns (str_domain) {
        return str_domains[tokenId];
    }
}`
  },
  
  {
    id: 'sourceless-defi',
    name: 'Native SourceLess DeFi Pool',
    description: 'Pure SourceLess DeFi liquidity pool with native STR tokens and yield farming',
    language: 'areslang',
    gasEstimate: 0,
    addressFormat: 'zk13str',
    category: 'defi',
    features: ['STR/wSTR pools', 'Yield farming', 'Gas-free swaps', 'Dynamic CCOIN post mining'],
    integration: ['STR Tokens', 'wSTR Rewards', 'CCOIN System', 'HOSTLESS Mode'],
    code: `# Native SourceLess DeFi Liquidity Pool
defi_contract SourceLessDeFiPool {
    # Pool metadata
    name: string = "STR/wSTR Liquidity Pool";
    symbol: string = "SL-LP";
    
    # Pool reserves (using native STR tokens)
    str_reserve: uint256;
    wstr_reserve: uint256;
    total_liquidity: uint256;
    
    # Liquidity provider balances
    liquidity_balances: mapping<zk13str_address, uint256>;
    
    # Yield farming state
    last_reward_time: uint256;
    reward_rate: uint256 = 1000000000000000;  # wSTR per second per LP token
    
    # Native SourceLess events
    event LiquidityAdded(zk13str_address indexed provider, uint256 str_amount, uint256 wstr_amount, uint256 lp_tokens);
    event LiquidityRemoved(zk13str_address indexed provider, uint256 lp_tokens, uint256 str_amount, uint256 wstr_amount);
    event STRSwap(zk13str_address indexed trader, uint256 str_in, uint256 wstr_out);
    event YieldHarvested(zk13str_address indexed farmer, uint256 wstr_yield);
    
    constructor() {
        enable_hostless_mode();  # Gas-free for CCOS holders
        last_reward_time = block.timestamp;
    }
    
    # Add liquidity to the pool (gas-free)
    function addLiquidity(uint256 str_amount, uint256 wstr_amount) public hostless returns (uint256) {
        require(str_amount > 0 && wstr_amount > 0, "Invalid amounts");
        
        # Transfer tokens from user
        str_transfer_from(msg.sender, address(this), str_amount);
        wstr_transfer_from(msg.sender, address(this), wstr_amount);
        
        # Calculate LP tokens to mint
        uint256 lp_tokens;
        if (total_liquidity == 0) {
            lp_tokens = sqrt(str_amount * wstr_amount);
        } else {
            uint256 str_lp = (str_amount * total_liquidity) / str_reserve;
            uint256 wstr_lp = (wstr_amount * total_liquidity) / wstr_reserve;
            lp_tokens = min(str_lp, wstr_lp);
        }
        
        # Update reserves
        str_reserve += str_amount;
        wstr_reserve += wstr_amount;
        total_liquidity += lp_tokens;
        liquidity_balances[msg.sender] += lp_tokens;
        
        # Execute PoE-based CCOIN post mining for DeFi participation
        uint256 ccoin_post_mined = validate_defi_existence_and_mine(msg.sender, str_amount + wstr_amount);
        ccoin_post_mint(msg.sender, ccoin_post_mined);
        
        emit LiquidityAdded(msg.sender, str_amount, wstr_amount, lp_tokens);
        return lp_tokens;
    }
    
    # Swap STR for wSTR (gas-free)
    function swapSTRForwSTR(uint256 str_amount) public hostless returns (uint256) {
        require(str_amount > 0, "Invalid STR amount");
        require(str_reserve > 0 && wstr_reserve > 0, "No liquidity");
        
        # Calculate wSTR output using constant product formula
        uint256 str_amount_with_fee = (str_amount * 997) / 1000;  # 0.3% fee
        uint256 wstr_out = (str_amount_with_fee * wstr_reserve) / (str_reserve + str_amount_with_fee);
        
        require(wstr_out > 0 && wstr_out <= wstr_reserve, "Insufficient output");
        
        # Execute swap
        str_transfer_from(msg.sender, address(this), str_amount);
        wstr_transfer(msg.sender, wstr_out);
        
        # Update reserves
        str_reserve += str_amount;
        wstr_reserve -= wstr_out;
        
        # Auto-mint CCOIN via post mining (PoE validation required)
        uint256 ccoin_post_mined = execute_poe_post_mining(msg.sender, str_amount);
        ccoin_mint(msg.sender, ccoin_post_mined);
        
        emit STRSwap(msg.sender, str_amount, wstr_out);
        return wstr_out;
    }
    
    # Harvest yield farming rewards (gas-free)
    function harvestYield() public hostless returns (uint256) {
        uint256 lp_balance = liquidity_balances[msg.sender];
        require(lp_balance > 0, "No liquidity provided");
        
        # Calculate time-based yield
        uint256 time_elapsed = block.timestamp - last_reward_time;
        uint256 yield_amount = (lp_balance * reward_rate * time_elapsed) / 1000000000000000000;
        
        if (yield_amount > 0) {
            wstr_mint(msg.sender, yield_amount);  # Mint new wSTR as yield
            emit YieldHarvested(msg.sender, yield_amount);
        }
        
        return yield_amount;
    }
    
    # Native SourceLess dynamic CCOIN calculation for DeFi
    function calculate_dynamic_yield_rate(uint256 total_value) private pure returns (uint256) {
        # Higher rewards for larger liquidity provision
        if (total_value >= 100000000000000000000) {  # >= 100 STR equivalent
            return (total_value * 800) / 10000;  # 8% for large providers
        } else if (total_value >= 10000000000000000000) {  # >= 10 STR equivalent
            return (total_value * 500) / 10000;   # 5% for medium providers
        } else {
            return (total_value * 250) / 10000;   # 2.5% for small providers
        }
    }
    
    # Helper functions
    function sqrt(uint256 x) private pure returns (uint256) {
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
    
    # View functions
    function getLiquidityBalance(zk13str_address provider) public view returns (uint256) {
        return liquidity_balances[provider];
    }
    
    function getReserves() public view returns (uint256, uint256) {
        return (str_reserve, wstr_reserve);
    }
}`
  },
  
  {
    id: 'sourceless-dao',
    name: 'Native SourceLess DAO',
    description: 'Pure SourceLess DAO governance with CCOS token voting and gas-free participation',
    language: 'areslang',
    gasEstimate: 0,
    addressFormat: 'zk13str',
    category: 'dao',
    features: ['CCOS voting', 'Gas-free governance', 'STR.domain proposals', 'PoE post mining'],
    integration: ['CCOS Tokens', 'STR.domains', 'CCOIN Post Mining', 'HOSTLESS Mode'],
    code: `# Native SourceLess DAO Governance Contract
dao_contract SourceLessDAO {
    # DAO metadata
    name: string = "SourceLess Decentralized Autonomous Organization";
    symbol: string = "SLDAO";
    
    # Governance state
    proposal_count: uint256;
    voting_period: uint256 = 604800;  # 7 days in seconds
    execution_delay: uint256 = 86400;  # 1 day in seconds
    
    # Proposal structure
    struct Proposal {
        uint256 id;
        zk13str_address proposer;
        str_domain proposer_domain;
        string title;
        string description;
        uint256 votes_for;
        uint256 votes_against;
        uint256 start_time;
        uint256 end_time;
        bool executed;
        bool cancelled;
    }
    
    # Storage mappings
    proposals: mapping<uint256, Proposal>;
    votes: mapping<uint256, mapping<zk13str_address, bool>>;  # proposalId => voter => hasVoted
    vote_choices: mapping<uint256, mapping<zk13str_address, bool>>;  # proposalId => voter => choice (true=for, false=against)
    
    # SourceLess native events
    event ProposalCreated(uint256 indexed proposalId, zk13str_address indexed proposer, str_domain domain, string title);
    event VoteCast(uint256 indexed proposalId, zk13str_address indexed voter, bool choice, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event CCOINPostMined(zk13str_address indexed participant, uint256 amount, uint8 proof_strength);
    
    constructor() {
        enable_hostless_mode();  # Gas-free for CCOS holders
    }
    
    # Create new proposal (gas-free for STR.domain owners)
    function createProposal(string memory title, string memory description, str_domain proposer_domain) public hostless returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(bytes(description).length > 0, "Description required");
        require(ccos_balance_of(msg.sender) >= 1000000000000000000, "Minimum 1 CCOS required");  # 1 CCOS with 13 decimals
        
        uint256 proposalId = proposal_count++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            proposer_domain: proposer_domain,
            title: title,
            description: description,
            votes_for: 0,
            votes_against: 0,
            start_time: block.timestamp,
            end_time: block.timestamp + voting_period,
            executed: false,
            cancelled: false
        });
        
        # STR.domain bonus for proposals (if domain provided)
        if (proposer_domain != str_domain(0)) {
            str_domain_reward(proposer_domain, 5000000000000000000);  # 5 STR bonus
        }
        
        emit ProposalCreated(proposalId, msg.sender, proposer_domain, title);
        return proposalId;
    }
    
    # Cast vote with CCOS token weight (gas-free)
    function vote(uint256 proposalId, bool choice) public hostless {
        require(proposalId < proposal_count, "Invalid proposal");
        require(block.timestamp <= proposals[proposalId].end_time, "Voting ended");
        require(!votes[proposalId][msg.sender], "Already voted");
        
        # CCOS balance determines voting weight
        uint256 voting_weight = ccos_balance_of(msg.sender);
        require(voting_weight > 0, "No CCOS tokens to vote");
        
        votes[proposalId][msg.sender] = true;
        vote_choices[proposalId][msg.sender] = choice;
        
        if (choice) {
            proposals[proposalId].votes_for += voting_weight;
        } else {
            proposals[proposalId].votes_against += voting_weight;
        }
        
        # Execute PoE-based CCOIN post mining for DAO participation
        uint256 ccoin_post_mined = validate_dao_existence_and_mine(msg.sender, voting_weight);
        ccoin_post_mint(msg.sender, ccoin_post_mined);
        
        emit VoteCast(proposalId, msg.sender, choice, voting_weight);
        emit CCOINPostMined(msg.sender, ccoin_post_mined);
    }
    
    # Execute passed proposal (gas-free)
    function executeProposal(uint256 proposalId) public hostless {
        require(proposalId < proposal_count, "Invalid proposal");
        require(block.timestamp > proposals[proposalId].end_time, "Voting not ended");
        require(!proposals[proposalId].executed, "Already executed");
        require(!proposals[proposalId].cancelled, "Proposal cancelled");
        
        Proposal storage proposal = proposals[proposalId];
        
        # Check if proposal passed (simple majority)
        require(proposal.votes_for > proposal.votes_against, "Proposal failed");
        require(proposal.votes_for + proposal.votes_against > 0, "No votes cast");
        
        proposal.executed = true;
        
        # Execute proposal logic here
        # (Implementation would depend on specific proposal type)
        
        emit ProposalExecuted(proposalId);
    }
    
    # Delegate voting power to another address
    function delegate(zk13str_address delegate_to) public {
        # Implementation for delegation
        # This would allow users to delegate their CCOS voting power
    }
    
    # View functions
    function getProposal(uint256 proposalId) public view returns (Proposal memory) {
        require(proposalId < proposal_count, "Invalid proposal");
        return proposals[proposalId];
    }
    
    function hasVoted(uint256 proposalId, zk13str_address voter) public view returns (bool) {
        return votes[proposalId][voter];
    }
    
    function getVoteChoice(uint256 proposalId, zk13str_address voter) public view returns (bool) {
        require(votes[proposalId][voter], "Has not voted");
        return vote_choices[proposalId][voter];
    }
    
    function getProposalCount() public view returns (uint256) {
        return proposal_count;
    }
}`
  },
  
  {
    id: 'sourceless-strdomain',
    name: 'STR.Domain Registry',
    description: 'Native SourceLess domain name system with ZK13STR resolution and gas-free registration',
    language: 'areslang',
    gasEstimate: 0,
    addressFormat: 'zk13str',
    category: 'utility',
    features: ['Domain registration', 'ZK13STR resolution', 'Gas-free management', 'Revenue sharing'],
    integration: ['ZK13STR addresses', 'STR Payments', 'CCOIN Post Mining', 'HOSTLESS Mode'],
    code: `# Native SourceLess STR.Domain Registry Contract
domain_contract STRDomainRegistry {
    # Registry metadata
    name: string = "SourceLess Domain Name System";
    symbol: string = "STR";
    base_price: uint256 = 10000000000000000000;  # 10 STR with 13 decimals
    
    # Domain data structure
    struct Domain {
        zk13str_address owner;
        zk13str_address resolver;
        uint256 expiry_time;
        bool active;
        uint256 registration_fee_paid;
        string content_hash;
    }
    
    # Storage mappings
    domains: mapping<str_domain, Domain>;
    domain_to_address: mapping<str_domain, zk13str_address>;
    address_to_primary_domain: mapping<zk13str_address, str_domain>;
    
    # Revenue tracking for domain owners
    domain_revenues: mapping<str_domain, uint256>;
    unclaimed_revenues: mapping<zk13str_address, uint256>;
    
    # SourceLess native events
    event DomainRegistered(str_domain indexed domain, zk13str_address indexed owner, uint256 expiry);
    event DomainRenewed(str_domain indexed domain, uint256 new_expiry);
    event DomainTransferred(str_domain indexed domain, zk13str_address indexed from, zk13str_address indexed to);
    event AddressResolved(str_domain indexed domain, zk13str_address indexed resolved_address);
    event RevenueShared(str_domain indexed domain, uint256 amount);
    
    constructor() {
        enable_hostless_mode();  # Gas-free for CCOS holders
    }
    
    # Register new STR.domain (gas-free for CCOS holders)
    function registerDomain(str_domain domain, uint256 years) public payable hostless returns (bool) {
        require(years >= 1 && years <= 10, "Invalid registration period");
        require(!domains[domain].active, "Domain already registered");
        
        uint256 total_cost = base_price * years;
        require(msg.value >= total_cost, "Insufficient STR payment");
        
        uint256 expiry_time = block.timestamp + (years * 31536000);  # years * seconds per year
        
        domains[domain] = Domain({
            owner: msg.sender,
            resolver: msg.sender,  # Default resolver is owner
            expiry_time: expiry_time,
            active: true,
            registration_fee_paid: total_cost,
            content_hash: ""
        });
        
        domain_to_address[domain] = msg.sender;
        
        # Set as primary domain if user doesn't have one
        if (address_to_primary_domain[msg.sender] == str_domain(0)) {
            address_to_primary_domain[msg.sender] = domain;
        }
        
        # Execute PoE-based CCOIN post mining for domain registration
        uint256 ccoin_post_mined = execute_domain_poe_post_mining(msg.sender, total_cost);
        ccoin_post_mint(msg.sender, ccoin_post_mined);
        
        emit DomainRegistered(domain, msg.sender, expiry_time);
        return true;
    }
    
    # Resolve STR.domain to ZK13STR address
    function resolve(str_domain domain) public view returns (zk13str_address) {
        require(domains[domain].active, "Domain not registered");
        require(block.timestamp < domains[domain].expiry_time, "Domain expired");
        
        return domains[domain].resolver;
    }
    
    # Reverse resolve ZK13STR address to primary domain
    function reverseResolve(zk13str_address addr) public view returns (str_domain) {
        return address_to_primary_domain[addr];
    }
    
    # Update domain resolver (gas-free)
    function setResolver(str_domain domain, zk13str_address new_resolver) public hostless {
        require(domains[domain].owner == msg.sender, "Not domain owner");
        require(domains[domain].active, "Domain not active");
        
        domains[domain].resolver = new_resolver;
        domain_to_address[domain] = new_resolver;
        
        emit AddressResolved(domain, new_resolver);
    }
    
    # Transfer domain ownership (gas-free)
    function transferDomain(str_domain domain, zk13str_address to) public hostless {
        require(domains[domain].owner == msg.sender, "Not domain owner");
        require(to != zk13str_address(0), "Invalid ZK13STR address");
        
        zk13str_address from = domains[domain].owner;
        domains[domain].owner = to;
        
        # Update primary domain for new owner if they don't have one
        if (address_to_primary_domain[to] == str_domain(0)) {
            address_to_primary_domain[to] = domain;
        }
        
        # Clear primary domain for old owner if it was this domain
        if (address_to_primary_domain[from] == domain) {
            address_to_primary_domain[from] = str_domain(0);
        }
        
        emit DomainTransferred(domain, from, to);
    }
    
    # Renew domain registration
    function renewDomain(str_domain domain, uint256 years) public payable {
        require(domains[domain].active, "Domain not registered");
        require(domains[domain].owner == msg.sender, "Not domain owner");
        require(years >= 1 && years <= 10, "Invalid renewal period");
        
        uint256 renewal_cost = base_price * years;
        require(msg.value >= renewal_cost, "Insufficient STR payment");
        
        domains[domain].expiry_time += (years * 31536000);
        
        emit DomainRenewed(domain, domains[domain].expiry_time);
    }
    
    # Receive revenue share from integrated contracts
    function receiveRevenueShare(str_domain domain) public payable {
        require(domains[domain].active, "Domain not registered");
        require(msg.value > 0, "No revenue to share");
        
        domain_revenues[domain] += msg.value;
        unclaimed_revenues[domains[domain].owner] += msg.value;
        
        emit RevenueShared(domain, msg.value);
    }
    
    # Claim accumulated revenue (gas-free)
    function claimRevenue() public hostless returns (uint256) {
        uint256 amount = unclaimed_revenues[msg.sender];
        require(amount > 0, "No revenue to claim");
        
        unclaimed_revenues[msg.sender] = 0;
        str_transfer(msg.sender, amount);
        
        return amount;
    }
    
    # View functions
    function getDomainInfo(str_domain domain) public view returns (Domain memory) {
        return domains[domain];
    }
    
    function isAvailable(str_domain domain) public view returns (bool) {
        return !domains[domain].active || block.timestamp >= domains[domain].expiry_time;
    }
    
    function getUnclaimedRevenue(zk13str_address owner) public view returns (uint256) {
        return unclaimed_revenues[owner];
    }
    
    function getDomainRevenue(str_domain domain) public view returns (uint256) {
        return domain_revenues[domain];
    }
}`
  }
];

// Export all native SourceLess contract examples
export function getNativeSourceLessExamples(): SourceLessContractExample[] {
  return SOURCELESS_NATIVE_EXAMPLES;
}

export function getNativeExamplesByCategory(category: string): SourceLessContractExample[] {
  return SOURCELESS_NATIVE_EXAMPLES.filter(example => example.category === category);
}

export function getNativeExampleById(id: string): SourceLessContractExample | undefined {
  return SOURCELESS_NATIVE_EXAMPLES.find(example => example.id === id);
}