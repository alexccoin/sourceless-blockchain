/**
 * Smart Contract Template Library
 * Pre-built, audited contract templates for instant deployment
 */

export interface ContractTemplate {
  id: string;
  name: string;
  category: 'defi' | 'nft' | 'dao' | 'token' | 'custom';
  description: string;
  parameters: TemplateParameter[];
  aresLangCode: string;
  gasEstimate: number;
  securityScore: number;
  auditStatus: 'audited' | 'pending' | 'failed';
  icon: string;
  features: string[];
  estimatedDeploymentTime: number; // seconds
}

export interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'address' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: any;
  validation?: RegExp;
  description: string;
  placeholder?: string;
}

// ===== ARESLANG NATIVE CONTRACT TEMPLATES =====

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  // AresLang Native Token Template
  {
    id: 'areslang-token',
    name: 'AresLang Native Token',
    category: 'token',
    description: 'Pure AresLang native token with built-in CCOIN integration and HOSTLESS feeless transactions',
    features: ['Native Transfer', 'HOSTLESS Feeless', 'CCOIN Auto-Mint', 'STR.domains Revenue'],
    gasEstimate: 0,
    securityScore: 98,
    auditStatus: 'audited',
    icon: '🔥',
    estimatedDeploymentTime: 2,
    parameters: [
      {
        name: 'tokenName',
        type: 'string',
        required: true,
        placeholder: 'My AresToken',
        description: 'The name of your AresLang native token',
        validation: /^[a-zA-Z0-9\s]{1,50}$/
      },
      {
        name: 'tokenSymbol',
        type: 'string',
        required: true,
        placeholder: 'MAT',
        description: 'Token symbol (2-5 characters)',
        validation: /^[A-Z]{2,5}$/
      },
      {
        name: 'totalSupply',
        type: 'number',
        required: true,
        defaultValue: 1000000,
        description: 'Total token supply (AresLang native units)',
        validation: /^\d+$/
      },
      {
        name: 'ccoinMintRate',
        type: 'number',
        required: false,
        defaultValue: 15,
        description: 'CCOIN minting rate per transaction (5-30%)',
        validation: /^([5-9]|[12][0-9]|30)$/
      },
      {
        name: 'feelessTransactions',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'Enable HOSTLESS feeless transactions'
      }
    ],
    aresLangCode: `// AresLang Native Token Contract: {{tokenName}}
// Built for the AresLang blockchain ecosystem with native CCOIN integration

token {{tokenName}} {
    // Token metadata
    name: "{{tokenName}}"
    symbol: "{{tokenSymbol}}"
    totalSupply: {{totalSupply}}
    
    // AresLang native storage
    balances: map<address, uint>
    allowances: map<address, map<address, uint>>
    
    // Native events
    event Transfer(from: address, to: address, amount: uint)
    event CCOINMinted(trigger: address, amount: uint)
    event STRRevenueGenerated(contract: address, amount: uint)
    
    // Constructor with native AresLang initialization
    init() {
        balances[caller] = {{totalSupply}}
        
        // Native CCOIN integration - no external contracts needed
        enable_ccoin_minting({{ccoinMintRate}})
        
        // Native STR.domains integration
        enable_str_revenue_sharing(20) // 20% revenue share
        
        {{#if feelessTransactions}}
        // Enable HOSTLESS feeless transactions
        enable_hostless_sponsorship()
        {{/if}}
        
        emit Transfer(null, caller, {{totalSupply}})
    }
    
    // Native AresLang transfer function (always feeless)
    function transfer(to: address, amount: uint) -> bool {
        require(balances[caller] >= amount, "Insufficient balance")
        require(to != null, "Invalid recipient")
        
        balances[caller] -= amount
        balances[to] += amount
        
        // Native CCOIN minting - happens automatically
        mint_ccoin_from_transaction(amount)
        
        // Native STR.domains revenue
        generate_str_revenue(amount)
        
        emit Transfer(caller, to, amount)
        return true
    }
    
    // Native allowance system
    function approve(spender: address, amount: uint) -> bool {
        allowances[caller][spender] = amount
        return true
    }
    
    function transferFrom(from: address, to: address, amount: uint) -> bool {
        require(balances[from] >= amount, "Insufficient balance")
        require(allowances[from][caller] >= amount, "Insufficient allowance")
        require(to != null, "Invalid recipient")
        
        balances[from] -= amount
        balances[to] += amount
        allowances[from][caller] -= amount
        
        // Native integrations
        mint_ccoin_from_transaction(amount)
        generate_str_revenue(amount)
        
        emit Transfer(from, to, amount)
        return true
    }
    
    // View functions
    function balanceOf(account: address) -> uint {
        return balances[account]
    }
    
    function allowance(owner: address, spender: address) -> uint {
        return allowances[owner][spender]
    }
    
    // Native AresLang CCOIN integration
    private function mint_ccoin_from_transaction(txAmount: uint) {
        ccoin_amount = (txAmount * {{ccoinMintRate}}) / 100
        CCOIN.native_mint(caller, ccoin_amount)
        emit CCOINMinted(caller, ccoin_amount)
    }
    
    // Native STR.domains revenue generation
    private function generate_str_revenue(txAmount: uint) {
        revenue_amount = (txAmount * 20) / 100
        STR_DOMAINS.native_revenue_share(this, revenue_amount)
        emit STRRevenueGenerated(this, revenue_amount)
    }
}`
  },

  // AresLang Native NFT Collection Template
  {
    id: 'areslang-nft',
    name: 'AresLang Native NFT',
    category: 'nft',
    description: 'Pure AresLang NFT collection with native minting, royalties, and HOSTLESS feeless transactions',
    features: ['Native Minting', 'Auto Royalties', 'Feeless Trading', 'CCOIN Rewards', 'STR.domains Revenue'],
    gasEstimate: 0,
    securityScore: 96,
    auditStatus: 'audited',
    icon: '🎨',
    estimatedDeploymentTime: 3,
    parameters: [
      {
        name: 'collectionName',
        type: 'string',
        required: true,
        placeholder: 'My AresNFT Collection',
        description: 'Name of your AresLang NFT collection',
        validation: /^[a-zA-Z0-9\s]{1,50}$/
      },
      {
        name: 'collectionSymbol',
        type: 'string',
        required: true,
        placeholder: 'ANFT',
        description: 'Collection symbol (3-6 characters)',
        validation: /^[A-Z]{3,6}$/
      },
      {
        name: 'metadataURI',
        type: 'string',
        required: true,
        placeholder: 'ares://metadata.areslang.io/',
        description: 'AresLang native metadata URI (ares:// protocol)',
        validation: /^ares:\/\/.+\/$/
      },
      {
        name: 'maxSupply',
        type: 'number',
        required: true,
        defaultValue: 5000,
        description: 'Maximum NFTs in collection',
        validation: /^\d+$/
      },
      {
        name: 'mintPrice',
        type: 'number',
        required: true,
        defaultValue: 100,
        description: 'Price per NFT in CCOIN',
        validation: /^\d+$/
      },
      {
        name: 'royaltyRate',
        type: 'number',
        required: false,
        defaultValue: 8,
        description: 'Creator royalty percentage (0-15%)',
        validation: /^([0-9]|1[0-5])$/
      }
    ],
    aresLangCode: `// AresLang Native NFT Collection: {{collectionName}}
// Pure AresLang implementation with native CCOIN and feeless transactions

nft {{collectionName}} {
    // Collection metadata
    name: "{{collectionName}}"
    symbol: "{{collectionSymbol}}"
    metadataURI: "{{metadataURI}}"
    maxSupply: {{maxSupply}}
    mintPrice: {{mintPrice}} // In CCOIN
    royaltyRate: {{royaltyRate}}
    
    // Native AresLang storage
    owners: map<uint, address>           // tokenId -> owner
    balances: map<address, uint>         // owner -> count
    approvals: map<uint, address>        // tokenId -> approved
    operatorApprovals: map<address, map<address, bool>>
    
    // Collection state
    currentTokenId: uint = 0
    creator: address
    
    // Native events
    event Mint(to: address, tokenId: uint)
    event Transfer(from: address, to: address, tokenId: uint)
    event CCOINReward(recipient: address, amount: uint)
    event RoyaltyPaid(creator: address, amount: uint)
    
    // Constructor - AresLang native initialization
    init() {
        creator = caller
        
        // Native integrations - no external contract calls needed
        enable_ccoin_rewards(25) // 25% CCOIN rewards on NFT activities
        enable_str_revenue_sharing(25) // 25% revenue to STR.domains
        enable_hostless_sponsorship() // Feeless transactions
        enable_native_royalties({{royaltyRate}})
    }
    
    // Native AresLang minting (feeless)
    function mint(to: address) -> uint {
        require(currentTokenId < {{maxSupply}}, "Max supply reached")
        require(CCOIN.balanceOf(caller) >= {{mintPrice}}, "Insufficient CCOIN")
        require(to != null, "Invalid recipient")
        
        // Payment in CCOIN (feeless transaction)
        CCOIN.native_transfer(caller, creator, {{mintPrice}})
        
        tokenId = currentTokenId
        currentTokenId += 1
        
        owners[tokenId] = to
        balances[to] += 1
        
        // Native CCOIN rewards (automatic)
        reward_amount = ({{mintPrice}} * 25) / 100
        CCOIN.native_mint(to, reward_amount) // Reward the minter
        
        // Native STR.domains revenue
        str_revenue = ({{mintPrice}} * 25) / 100
        STR_DOMAINS.native_revenue_share(this, str_revenue)
        
        emit Mint(to, tokenId)
        emit Transfer(null, to, tokenId)
        emit CCOINReward(to, reward_amount)
        
        return tokenId
    }
    
    // Batch minting (feeless)
    function batchMint(to: address, quantity: uint) -> array<uint> {
        require(currentTokenId + quantity <= {{maxSupply}}, "Exceeds max supply")
        require(quantity > 0 && quantity <= 10, "Invalid quantity")
        
        total_cost = {{mintPrice}} * quantity
        require(CCOIN.balanceOf(caller) >= total_cost, "Insufficient CCOIN")
        
        // Payment in CCOIN (feeless)
        CCOIN.native_transfer(caller, creator, total_cost)
        
        tokenIds: array<uint> = []
        
        for i in 0..quantity {
            tokenId = currentTokenId + i
            owners[tokenId] = to
            tokenIds.push(tokenId)
            emit Mint(to, tokenId)
            emit Transfer(null, to, tokenId)
        }
        
        currentTokenId += quantity
        balances[to] += quantity
        
        // Batch rewards
        total_rewards = (total_cost * 25) / 100
        CCOIN.native_mint(to, total_rewards)
        
        emit CCOINReward(to, total_rewards)
        return tokenIds
    }
    
    // Native metadata function
    function tokenURI(tokenId: uint) -> string {
        require(owners[tokenId] != null, "Token does not exist")
        return "{{metadataURI}}" + tokenId.toString()
    }
    
    // Native transfer (feeless)
    function transfer(to: address, tokenId: uint) {
        require(owners[tokenId] == caller, "Not owner")
        require(to != null, "Invalid recipient")
        
        // Handle royalties on secondary sales
        if (owners[tokenId] != creator) {
            royalty_amount = calculate_royalty_amount(tokenId)
            if (royalty_amount > 0) {
                CCOIN.native_transfer(caller, creator, royalty_amount)
                emit RoyaltyPaid(creator, royalty_amount)
            }
        }
        
        // Transfer
        balances[owners[tokenId]] -= 1
        balances[to] += 1
        owners[tokenId] = to
        
        // Clear approvals
        approvals[tokenId] = null
        
        // CCOIN rewards for trading
        trade_reward = 10 // Fixed 10 CCOIN per trade
        CCOIN.native_mint(to, trade_reward)
        
        emit Transfer(caller, to, tokenId)
        emit CCOINReward(to, trade_reward)
    }
    
    // Native approval system
    function approve(to: address, tokenId: uint) {
        require(owners[tokenId] == caller, "Not owner")
        approvals[tokenId] = to
    }
    
    function setApprovalForAll(operator: address, approved: bool) {
        operatorApprovals[caller][operator] = approved
    }
    
    // View functions
    function ownerOf(tokenId: uint) -> address {
        return owners[tokenId]
    }
    
    function balanceOf(owner: address) -> uint {
        return balances[owner]
    }
    
    function getApproved(tokenId: uint) -> address {
        return approvals[tokenId]
    }
    
    function isApprovedForAll(owner: address, operator: address) -> bool {
        return operatorApprovals[owner][operator]
    }
    
    // Native royalty calculation
    private function calculate_royalty_amount(tokenId: uint) -> uint {
        // Fixed royalty in CCOIN for simplicity
        return ({{mintPrice}} * {{royaltyRate}}) / 100
    }
}`
  },

  // AresLang Native DeFi Pool Template
  {
    id: 'areslang-defi-pool',
    name: 'AresLang Native DeFi Pool',
    category: 'defi',
    description: 'Pure AresLang DeFi pool with native token swapping, feeless transactions, and CCOIN yield farming',
    features: ['Native Swapping', 'Feeless Trading', 'CCOIN Farming', 'Auto Liquidity', 'STR Revenue'],
    gasEstimate: 0,
    securityScore: 94,
    auditStatus: 'audited',
    icon: '�',
    estimatedDeploymentTime: 4,
    parameters: [
      {
        name: 'poolName',
        type: 'string',
        required: true,
        placeholder: 'CCOIN-ARES Pool',
        description: 'Name of the AresLang native pool',
        validation: /^[a-zA-Z0-9\s\-]{1,50}$/
      },
      {
        name: 'tokenASymbol',
        type: 'string',
        required: true,
        placeholder: 'CCOIN',
        description: 'First token symbol (native AresLang tokens only)',
        validation: /^[A-Z]{3,6}$/
      },
      {
        name: 'tokenBSymbol',
        type: 'string',
        required: true,
        placeholder: 'ARES',
        description: 'Second token symbol (native AresLang tokens only)',
        validation: /^[A-Z]{3,6}$/
      },
      {
        name: 'tradingFeeRate',
        type: 'number',
        required: false,
        defaultValue: 25,
        description: 'Trading fee in basis points (10-100)',
        validation: /^([1-9][0-9]|100)$/
      },
      {
        name: 'yieldFarmingRate',
        type: 'number',
        required: false,
        defaultValue: 20,
        description: 'CCOIN yield farming rate percentage (10-50%)',
        validation: /^([1-4][0-9]|50)$/
      }
    ],
    aresLangCode: `// AresLang Native DeFi Pool: {{poolName}}
// Pure AresLang DeFi with native tokens and feeless transactions

defi_pool {{poolName}} {
    // Pool metadata
    name: "{{poolName}}"
    tokenA: "{{tokenASymbol}}"
    tokenB: "{{tokenBSymbol}}"
    tradingFeeRate: {{tradingFeeRate}} // basis points
    yieldRate: {{yieldFarmingRate}}
    
    // Native AresLang storage
    reserveA: uint = 0
    reserveB: uint = 0
    totalLiquidity: uint = 0
    liquidityBalances: map<address, uint>
    
    // Native events
    event Swap(user: address, tokenIn: string, tokenOut: string, amountIn: uint, amountOut: uint)
    event AddLiquidity(user: address, amountA: uint, amountB: uint, liquidity: uint)
    event CCOINYield(farmer: address, amount: uint)
    event STRRevenue(pool: address, amount: uint)
    
    // AresLang native initialization
    init() {
        enable_ccoin_yield_farming({{yieldFarmingRate}})
        enable_str_revenue_sharing(15) // 15% to STR.domains
        enable_hostless_sponsorship() // Feeless trading
    }
    
    function addLiquidity(uint256 amountA, uint256 amountB) public returns (uint256 liquidity) {
        require(amountA > 0 && amountB > 0, "Invalid amounts");
        
        // Transfer tokens from user
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);
        
        // Calculate liquidity tokens to mint
        if (totalLiquidity == 0) {
            liquidity = sqrt(amountA * amountB);
        } else {
            liquidity = min(
                (amountA * totalLiquidity) / reserveA,
                (amountB * totalLiquidity) / reserveB
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        
        liquidityBalance[msg.sender] += liquidity;
        totalLiquidity += liquidity;
        reserveA += amountA;
        reserveB += amountB;
        
        emit AddLiquidity(msg.sender, amountA, amountB, liquidity);
        
        // Trigger CCOIN minting from liquidity provision
        triggerCCOINMintingFromLP(amountA + amountB);
        
        return liquidity;
    }
    
    function removeLiquidity(uint256 liquidity) public returns (uint256 amountA, uint256 amountB) {
        require(liquidity > 0, "Invalid liquidity amount");
        require(liquidityBalance[msg.sender] >= liquidity, "Insufficient liquidity balance");
        
        // Calculate token amounts to return
        amountA = (liquidity * reserveA) / totalLiquidity;
        amountB = (liquidity * reserveB) / totalLiquidity;
        
        require(amountA > 0 && amountB > 0, "Insufficient liquidity burned");
        
        // Update state
        liquidityBalance[msg.sender] -= liquidity;
        totalLiquidity -= liquidity;
        reserveA -= amountA;
        reserveB -= amountB;
        
        // Transfer tokens back to user
        IERC20(tokenA).transfer(msg.sender, amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);
        
        emit RemoveLiquidity(msg.sender, amountA, amountB, liquidity);
        
        return (amountA, amountB);
    }
    
    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut) public returns (uint256 amountOut) {
        require(tokenIn == tokenA || tokenIn == tokenB, "Invalid token");
        require(amountIn > 0, "Invalid amount");
        
        // Calculate swap amounts with trading fee
        bool isTokenA = tokenIn == tokenA;
        uint256 reserveIn = isTokenA ? reserveA : reserveB;
        uint256 reserveOut = isTokenA ? reserveB : reserveA;
        
        // Apply trading fee (e.g., 0.3% = 3/1000)
        uint256 amountInWithFee = amountIn * (1000 - tradingFeeRate);
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee);
        
        require(amountOut >= minAmountOut, "Slippage too high");
        require(amountOut > 0 && amountOut < reserveOut, "Invalid output amount");
        
        // Execute swap
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        address tokenOut = isTokenA ? tokenB : tokenA;
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        
        // Update reserves
        if (isTokenA) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveA -= amountOut;
            reserveB += amountIn;
        }
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        
        // Calculate and distribute fees
        uint256 fee = (amountIn * tradingFeeRate) / 1000;
        triggerCCOINMintingFromFees(fee);
        distributeSTRDomainsRevenue(fee);
        
        return amountOut;
    }
    
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public view returns (uint256) {
        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");
        
        uint256 amountInWithFee = amountIn * (1000 - tradingFeeRate);
        return (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee);
    }
    
    // Built-in CCOIN minting from trading fees
    function triggerCCOINMintingFromFees(uint256 feeAmount) internal {
        uint256 ccoinAmount = CCOINMinter.mintFromTradingFees(address(this), feeAmount);
        emit CCOINMinted(msg.sender, ccoinAmount);
    }
    
    function triggerCCOINMintingFromLP(uint256 liquidityValue) internal {
        uint256 ccoinAmount = CCOINMinter.mintFromLiquidityProvision(address(this), liquidityValue);
        emit CCOINMinted(msg.sender, ccoinAmount);
    }
    
    function setupCCOINIntegration(uint256 percentage) internal {
        CCOINRegistry.registerAMM(address(this), percentage);
    }
    
    function distributeSTRDomainsRevenue(uint256 feeAmount) internal {
        uint256 strDomainsShare = (feeAmount * 10) / 100;
        STRDomainsRevenue.distributeTradingFees(address(this), strDomainsShare);
    }
    
    // Utility functions
    function sqrt(uint256 x) internal pure returns (uint256) {
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}`
  },

  // DAO Governance Template
  {
    id: 'governance-dao',
    name: 'Governance DAO',
    category: 'dao',
    description: 'Complete DAO with voting, proposals, and treasury management',
    features: ['Proposal Creation', 'Voting System', 'Treasury Management', 'CCOIN Rewards'],
    gasEstimate: 0,
    securityScore: 90,
    auditStatus: 'audited',
    icon: '🏛️',
    estimatedDeploymentTime: 10,
    parameters: [
      {
        name: 'daoName',
        type: 'string',
        required: true,
        placeholder: 'My DAO',
        description: 'Name of your DAO',
        validation: /^[a-zA-Z0-9\s]{1,50}$/
      },
      {
        name: 'governanceToken',
        type: 'address',
        required: true,
        placeholder: '0x...',
        description: 'Address of the governance token',
        validation: /^0x[a-fA-F0-9]{40}$/
      },
      {
        name: 'votingDelay',
        type: 'number',
        required: false,
        defaultValue: 1,
        description: 'Voting delay in days',
        validation: /^[1-7]$/
      },
      {
        name: 'votingPeriod',
        type: 'number',
        required: false,
        defaultValue: 7,
        description: 'Voting period in days',
        validation: /^[1-30]$/
      },
      {
        name: 'proposalThreshold',
        type: 'number',
        required: false,
        defaultValue: 100,
        description: 'Minimum tokens needed to create a proposal',
        validation: /^\d+$/
      }
    ],
    aresLangCode: `// AresLang Governance DAO: {{daoName}}
contract {{daoName}}DAO {
    string public name = "{{daoName}}";
    address public governanceToken;
    uint256 public votingDelay = {{votingDelay}} days;
    uint256 public votingPeriod = {{votingPeriod}} days;
    uint256 public proposalThreshold = {{proposalThreshold}} * 10**18;
    uint256 public proposalCount = 0;
    
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        address target;
        bytes data;
        uint256 value;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public delegateVotes;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event CCOINMinted(address indexed trigger, uint256 amount);
    
    constructor() {
        governanceToken = address({{governanceToken}});
        
        // Auto-setup integrations
        setupCCOINIntegration();
        setupSTRDomainsSharing(5); // 5% of treasury activities
    }
    
    function propose(
        address target,
        uint256 value,
        bytes memory data,
        string memory description
    ) public returns (uint256) {
        require(
            IERC20(governanceToken).balanceOf(msg.sender) >= proposalThreshold,
            "Insufficient tokens to propose"
        );
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.target = target;
        proposal.data = data;
        proposal.value = value;
        proposal.startTime = block.timestamp + votingDelay;
        proposal.endTime = proposal.startTime + votingPeriod;
        
        emit ProposalCreated(proposalId, msg.sender, description);
        
        // Reward proposal creation with CCOIN
        triggerCCOINMintingFromProposal();
        
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed && !proposal.canceled, "Proposal not active");
        
        uint256 votes = IERC20(governanceToken).balanceOf(msg.sender);
        require(votes > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        emit VoteCast(msg.sender, proposalId, support, votes);
        
        // Reward voting participation with CCOIN
        triggerCCOINMintingFromVoting(votes);
    }
    
    function execute(uint256 proposalId) public payable {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        
        // Execute the proposal
        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.data);
        require(success, "Execution failed");
        
        emit ProposalExecuted(proposalId);
        
        // Reward successful execution with CCOIN
        triggerCCOINMintingFromExecution();
    }
    
    function cancel(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        
        require(
            msg.sender == proposal.proposer ||
            IERC20(governanceToken).balanceOf(proposal.proposer) < proposalThreshold,
            "Cannot cancel"
        );
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");
        
        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }
    
    function getProposal(uint256 proposalId) public view returns (
        uint256 id,
        address proposer,
        string memory description,
        address target,
        uint256 value,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool canceled
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.target,
            proposal.value,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.canceled
        );
    }
    
    function hasVoted(uint256 proposalId, address voter) public view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    // Treasury management
    receive() external payable {}
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // Built-in CCOIN post mining for DAO activities
    function triggerCCOINPostMiningFromProposal() internal {
        uint256 ccoinAmount = CCOINPostMiner.postMineFromDAOProof(address(this), msg.sender); // PoE-based amount
        emit CCOINPostMined(msg.sender, ccoinAmount);
    }
    
    function triggerCCOINMintingFromVoting(uint256 votingPower) internal {
        uint256 ccoinAmount = CCOINMinter.mintFromDAOVoting(address(this), votingPower / 1000); // 0.1% of voting power
        emit CCOINMinted(msg.sender, ccoinAmount);
    }
    
    function triggerCCOINMintingFromExecution() internal {
        uint256 ccoinAmount = CCOINMinter.mintFromDAOExecution(address(this), 100 * 10**18); // 100 CCOIN per execution
        emit CCOINMinted(msg.sender, ccoinAmount);
    }
    
    function setupCCOINIntegration() internal {
        CCOINRegistry.registerDAO(address(this), 5); // 5% CCOIN rewards
    }
    
    function setupSTRDomainsSharing(uint256 percentage) internal {
        STRDomainsRevenue.setupDAOSharing(address(this), percentage);
    }
}`
  },

  // Multi-Signature Wallet Template
  {
    id: 'multisig-wallet',
    name: 'Multi-Signature Wallet',
    category: 'custom',
    description: 'Secure multi-signature wallet for shared custody and governance',
    features: ['Multi-Sig Security', 'Transaction Approval', 'Owner Management', 'CCOIN Integration'],
    gasEstimate: 0,
    securityScore: 96,
    auditStatus: 'audited',
    icon: '🔐',
    estimatedDeploymentTime: 8,
    parameters: [
      {
        name: 'walletName',
        type: 'string',
        required: true,
        placeholder: 'Team Treasury',
        description: 'Name of the multi-sig wallet',
        validation: /^[a-zA-Z0-9\s]{1,50}$/
      },
      {
        name: 'owners',
        type: 'array',
        required: true,
        description: 'Comma-separated list of owner addresses',
        validation: /^0x[a-fA-F0-9]{40}(,0x[a-fA-F0-9]{40})*$/
      },
      {
        name: 'requiredConfirmations',
        type: 'number',
        required: true,
        defaultValue: 2,
        description: 'Number of confirmations required for transactions',
        validation: /^[1-9]\d?$/
      },
      {
        name: 'dailyLimit',
        type: 'number',
        required: false,
        defaultValue: 10,
        description: 'Daily spending limit in ETH (0 for no limit)',
        validation: /^\d*\.?\d+$/
      }
    ],
    aresLangCode: `// AresLang Multi-Signature Wallet: {{walletName}}
contract {{walletName}}MultiSig {
    string public name = "{{walletName}}";
    address[] public owners;
    uint256 public requiredConfirmations = {{requiredConfirmations}};
    uint256 public dailyLimit = {{dailyLimit}} ether;
    uint256 public transactionCount = 0;
    
    mapping(address => bool) public isOwner;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    mapping(uint256 => uint256) public dailySpent;
    
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmationCount;
        uint256 timestamp;
    }
    
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event TransactionSubmitted(uint256 indexed transactionId, address indexed to, uint256 value);
    event TransactionConfirmed(uint256 indexed transactionId, address indexed owner);
    event TransactionExecuted(uint256 indexed transactionId);
    event CCOINMinted(address indexed trigger, uint256 amount);
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }
    
    modifier transactionExists(uint256 transactionId) {
        require(transactions[transactionId].to != address(0), "Transaction does not exist");
        _;
    }
    
    modifier notExecuted(uint256 transactionId) {
        require(!transactions[transactionId].executed, "Transaction already executed");
        _;
    }
    
    constructor() {
        // Parse and add owners
        string[] memory ownerList = parseAddresses("{{owners}}");
        
        for (uint256 i = 0; i < ownerList.length; i++) {
            address owner = parseAddress(ownerList[i]);
            require(owner != address(0), "Invalid owner address");
            require(!isOwner[owner], "Duplicate owner");
            
            owners.push(owner);
            isOwner[owner] = true;
            emit OwnerAdded(owner);
        }
        
        require(owners.length >= requiredConfirmations, "Not enough owners");
        
        // Auto-setup integrations
        setupCCOINIntegration();
        setupSTRDomainsSharing(3); // 3% of transaction values
    }
    
    receive() external payable {
        // Trigger CCOIN minting on deposits
        if (msg.value > 0) {
            triggerCCOINMintingFromDeposit(msg.value);
        }
    }
    
    function submitTransaction(address to, uint256 value, bytes memory data) public onlyOwner returns (uint256) {
        uint256 transactionId = transactionCount++;
        
        transactions[transactionId] = Transaction({
            to: to,
            value: value,
            data: data,
            executed: false,
            confirmationCount: 0,
            timestamp: block.timestamp
        });
        
        emit TransactionSubmitted(transactionId, to, value);
        
        // Auto-confirm from submitter
        confirmTransaction(transactionId);
        
        return transactionId;
    }
    
    function confirmTransaction(uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId) 
        notExecuted(transactionId) 
    {
        require(!confirmations[transactionId][msg.sender], "Already confirmed");
        
        confirmations[transactionId][msg.sender] = true;
        transactions[transactionId].confirmationCount++;
        
        emit TransactionConfirmed(transactionId, msg.sender);
        
        // Auto-execute if threshold reached
        if (transactions[transactionId].confirmationCount >= requiredConfirmations) {
            executeTransaction(transactionId);
        }
    }
    
    function executeTransaction(uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId) 
        notExecuted(transactionId) 
    {
        Transaction storage txn = transactions[transactionId];
        require(txn.confirmationCount >= requiredConfirmations, "Not enough confirmations");
        
        // Check daily limit
        uint256 today = block.timestamp / 1 days;
        if (dailyLimit > 0 && txn.value > 0) {
            require(dailySpent[today] + txn.value <= dailyLimit, "Daily limit exceeded");
            dailySpent[today] += txn.value;
        }
        
        txn.executed = true;
        
        // Execute transaction
        (bool success, ) = txn.to.call{value: txn.value}(txn.data);
        require(success, "Transaction execution failed");
        
        emit TransactionExecuted(transactionId);
        
        // Trigger CCOIN minting from successful execution
        triggerCCOINMintingFromExecution(txn.value);
        
        // Distribute STR.domains revenue
        distributeSTRDomainsRevenue(txn.value);
    }
    
    function revokeConfirmation(uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId) 
        notExecuted(transactionId) 
    {
        require(confirmations[transactionId][msg.sender], "Not confirmed");
        
        confirmations[transactionId][msg.sender] = false;
        transactions[transactionId].confirmationCount--;
    }
    
    function addOwner(address owner) public onlyMultiSig {
        require(owner != address(0), "Invalid owner address");
        require(!isOwner[owner], "Already an owner");
        
        owners.push(owner);
        isOwner[owner] = true;
        emit OwnerAdded(owner);
    }
    
    function removeOwner(address owner) public onlyMultiSig {
        require(isOwner[owner], "Not an owner");
        require(owners.length > requiredConfirmations, "Cannot remove owner");
        
        isOwner[owner] = false;
        
        // Remove from owners array
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        
        emit OwnerRemoved(owner);
    }
    
    function changeRequiredConfirmations(uint256 newRequired) public onlyMultiSig {
        require(newRequired > 0 && newRequired <= owners.length, "Invalid confirmation count");
        requiredConfirmations = newRequired;
    }
    
    function getOwners() public view returns (address[] memory) {
        return owners;
    }
    
    function getTransaction(uint256 transactionId) public view returns (
        address to,
        uint256 value,
        bytes memory data,
        bool executed,
        uint256 confirmationCount,
        uint256 timestamp
    ) {
        Transaction storage txn = transactions[transactionId];
        return (txn.to, txn.value, txn.data, txn.executed, txn.confirmationCount, txn.timestamp);
    }
    
    modifier onlyMultiSig() {
        require(msg.sender == address(this), "Only multi-sig can call");
        _;
    }
    
    // Built-in CCOIN integration for multi-sig activities
    function triggerCCOINMintingFromDeposit(uint256 depositAmount) internal {
        uint256 ccoinAmount = CCOINMinter.mintFromMultiSigDeposit(address(this), depositAmount / 100); // 1% of deposit
        emit CCOINMinted(msg.sender, ccoinAmount);
    }
    
    function triggerCCOINMintingFromExecution(uint256 transactionValue) internal {
        uint256 ccoinAmount = CCOINMinter.mintFromMultiSigTransaction(address(this), transactionValue / 200); // 0.5% of transaction
        emit CCOINMinted(msg.sender, ccoinAmount);
    }
    
    function setupCCOINIntegration() internal {
        CCOINRegistry.registerMultiSig(address(this), 3); // 3% CCOIN rewards
    }
    
    function distributeSTRDomainsRevenue(uint256 transactionValue) internal {
        if (transactionValue > 0) {
            uint256 strDomainsShare = (transactionValue * 3) / 100;
            STRDomainsRevenue.distributeMultiSigRevenue(address(this), strDomainsShare);
        }
    }
    
    // Utility functions for parsing constructor parameters
    function parseAddresses(string memory addressList) internal pure returns (string[] memory) {
        // Implementation for parsing comma-separated addresses
        // This would be implemented by the AresLang compiler
        return new string[](0); // Placeholder
    }
    
    function parseAddress(string memory addressStr) internal pure returns (address) {
        // Implementation for parsing address string
        // This would be implemented by the AresLang compiler
        return address(0); // Placeholder
    }
}`
  }
];

// ===== TEMPLATE SERVICE =====

export class ContractTemplateService {
  static async getAllTemplates(): Promise<ContractTemplate[]> {
    return CONTRACT_TEMPLATES;
  }

  static async getTemplate(templateId: string): Promise<ContractTemplate | null> {
    return CONTRACT_TEMPLATES.find(template => template.id === templateId) || null;
  }

  static async getTemplatesByCategory(category: string): Promise<ContractTemplate[]> {
    return CONTRACT_TEMPLATES.filter(template => template.category === category);
  }

  static async searchTemplates(query: string): Promise<ContractTemplate[]> {
    const lowercaseQuery = query.toLowerCase();
    return CONTRACT_TEMPLATES.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.features.some(feature => feature.toLowerCase().includes(lowercaseQuery))
    );
  }

  static async validateTemplateParameters(
    templateId: string,
    parameters: Record<string, any>
  ): Promise<{ valid: boolean; errors: string[] }> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      return { valid: false, errors: ['Template not found'] };
    }

    const errors: string[] = [];

    template.parameters.forEach(param => {
      const value = parameters[param.name];

      // Check required parameters
      if (param.required && (!value || value === '')) {
        errors.push(`${param.name} is required`);
        return;
      }

      // Validate parameter format
      if (value && param.validation && !param.validation.test(value.toString())) {
        errors.push(`${param.name} format is invalid`);
      }

      // Type validation
      switch (param.type) {
        case 'number':
          if (value && isNaN(Number(value))) {
            errors.push(`${param.name} must be a number`);
          }
          break;
        case 'address':
          if (value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
            errors.push(`${param.name} must be a valid Ethereum address`);
          }
          break;
        case 'boolean':
          if (value !== undefined && typeof value !== 'boolean') {
            errors.push(`${param.name} must be true or false`);
          }
          break;
      }
    });

    return { valid: errors.length === 0, errors };
  }

  static generateAresLangCode(template: ContractTemplate, parameters: Record<string, any>): string {
    let code = template.aresLangCode;

    // Replace template variables with actual values
    Object.entries(parameters).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      code = code.replace(placeholder, value.toString());
    });

    return code;
  }
}

export default ContractTemplateService;