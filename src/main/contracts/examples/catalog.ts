// ARESLang Dev Mode Examples Catalog (33+ examples)
// Realistic contract patterns + ARES Forge Genesis quantum-safe examples

import { ARES_FORGE_QUANTUM_EXAMPLES, type AresForgeExample } from './aresforge-quantum';

export interface AresExample {
  id: string;
  name: string;
  description: string;
  language: 'ares' | 'areslang' | 'solidity';
  code: string;
  category?: string;
  features?: string[];
}

export const ARES_EXAMPLES: AresExample[] = [
  {
    id: 'ex01',
    name: 'HelloWorld',
    description: 'Basic storage/set/get',
    language: 'ares',
    code: `contract HelloWorld {
    string public message;
    constructor() { message = "Hello, ARES!"; }
    function setMessage(string m) public { message = m; }
    function getMessage() public view returns (string) { return message; }
}`
  },
  {
    id: 'ex02',
    name: 'Counter',
    description: 'Increment/decrement counter',
    language: 'ares',
    code: `contract Counter {
    uint256 public count;
    constructor() { count = 0; }
    function increment() public { count++; }
    function decrement() public { if (count > 0) count--; }
    function reset() public { count = 0; }
}`
  },
  {
    id: 'ex03',
    name: 'NativeSTRToken',
    description: 'Native SourceLess STR token',
    language: 'ares',
    code: `// Native SourceLess STR Token
token_contract NativeSTRToken {
    balances: mapping<zk13str_address, uint256>;
    total_supply: uint256;
    decimals: uint8 = 13;
    
    constructor(uint256 initial) { 
        total_supply = initial; 
        balances[msg.sender] = initial;
        enable_hostless_mode();  // Gas-free for CCOS holders
    }
    
    function transfer(zk13str_address to, uint256 amount) public hostless {
        require(balances[msg.sender] >= amount, "Insufficient STR");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        # Execute PoE-based CCOIN post mining
        ccoin.post_mint(msg.sender, execute_poe_post_mining(msg.sender, amount));
        emit STRTransfer(msg.sender, to, amount);
    }
}`
  },
  {
    id: 'ex04',
    name: 'VotingSimple',
    description: 'Simple voting pattern',
    language: 'ares',
    code: `contract VotingSimple {
    mapping(address => bool) public hasVoted;
    uint256 public yesVotes;
    uint256 public noVotes;
    function voteYes() public {
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        yesVotes++;
    }
    function voteNo() public {
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        noVotes++;
    }
}`
  },
  {
    id: 'ex05',
    name: 'Treasury',
    description: 'Basic treasury accounting',
    language: 'ares',
    code: `contract Treasury {
    address public owner;
    uint256 public balance;
    constructor() { owner = msg.sender; }
    function deposit(uint256 amount) public payable { balance += amount; }
    function withdraw(uint256 amount) public {
        require(msg.sender == owner, "Not owner");
        require(balance >= amount, "Insufficient");
        balance -= amount;
    }
}`
  },
  {
    id: 'ex06',
    name: 'AccessControl',
    description: 'Owner-only modifiers',
    language: 'ares',
    code: `contract AccessControl {
    address public owner;
    mapping(address => bool) public admins;
    constructor() { owner = msg.sender; admins[msg.sender] = true; }
    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyAdmin() { require(admins[msg.sender], "Not admin"); _; }
    function addAdmin(address a) public onlyOwner { admins[a] = true; }
    function removeAdmin(address a) public onlyOwner { admins[a] = false; }
}`
  },
  {
    id: 'ex07',
    name: 'Registry',
    description: 'Key/value registry',
    language: 'ares',
    code: `contract Registry {
    mapping(string => string) public records;
    function set(string key, string value) public { records[key] = value; }
    function get(string key) public view returns (string) { return records[key]; }
    function remove(string key) public { delete records[key]; }
}`
  },
  {
    id: 'ex08',
    name: 'Faucet',
    description: 'Simple faucet pattern',
    language: 'ares',
    code: `contract Faucet {
    uint256 public dripAmount = 10;
    mapping(address => uint256) public lastClaim;
    uint256 public cooldown = 86400; // 1 day
    function claim() public {
        require(block.timestamp >= lastClaim[msg.sender] + cooldown, "Cooldown active");
        lastClaim[msg.sender] = block.timestamp;
        // transfer dripAmount to msg.sender
    }
}`
  },
  {
    id: 'ex09',
    name: 'Escrow',
    description: 'Timed escrow logic',
    language: 'ares',
    code: `contract Escrow {
    address public payer;
    address public payee;
    uint256 public amount;
    uint256 public releaseTime;
    bool public released;
    constructor(address _payee, uint256 _amount, uint256 _delay) {
        payer = msg.sender;
        payee = _payee;
        amount = _amount;
        releaseTime = block.timestamp + _delay;
    }
    function release() public {
        require(block.timestamp >= releaseTime, "Not yet");
        require(!released, "Already released");
        released = true;
        // transfer amount to payee
    }
}`
  },
  {
    id: 'ex10',
    name: 'Timelock',
    description: 'Delay-based execution',
    language: 'ares',
    code: `contract Timelock {
    uint256 public delay = 86400; // 1 day
    mapping(bytes32 => uint256) public queuedTxs;
    function queue(bytes32 txHash) public {
        queuedTxs[txHash] = block.timestamp + delay;
    }
    function execute(bytes32 txHash) public {
        require(queuedTxs[txHash] > 0, "Not queued");
        require(block.timestamp >= queuedTxs[txHash], "Timelock active");
        delete queuedTxs[txHash];
        // execute tx
    }
}`
  },
  {
    id: 'ex11',
    name: 'OracleMock',
    description: 'Mock oracle value',
    language: 'ares',
    code: `contract OracleMock {
    uint256 public latestPrice = 100;
    uint256 public lastUpdate;
    address public updater;
    constructor() { updater = msg.sender; }
    function updatePrice(uint256 newPrice) public {
        require(msg.sender == updater, "Not authorized");
        latestPrice = newPrice;
        lastUpdate = block.timestamp;
    }
}`
  },
  {
    id: 'ex12',
    name: 'MultiSig',
    description: 'Simple multisig gating',
    language: 'ares',
    code: `contract MultiSig {
    address[] public signers;
    uint256 public threshold;
    mapping(bytes32 => uint256) public approvals;
    constructor(address[] memory _signers, uint256 _threshold) {
        signers = _signers;
        threshold = _threshold;
    }
    function approve(bytes32 txHash) public {
        // simplified: increment approval count
        approvals[txHash]++;
    }
    function execute(bytes32 txHash) public {
        require(approvals[txHash] >= threshold, "Insufficient approvals");
        // execute tx
    }
}`
  },
  {
    id: 'ex13',
    name: 'SourceLessNFT',
    description: 'Native SourceLess NFT with STR.domain integration',
    language: 'ares',
    code: `// Native SourceLess NFT Contract
nft_contract SourceLessNFT {
    next_token_id: uint256 = 1;
    owners: mapping<uint256, zk13str_address>;
    token_uris: mapping<uint256, string>;
    str_domains: mapping<uint256, str_domain>;  # Link NFTs to STR.domains
    
    # Mint NFT with automatic STR.domain integration
    function mint(string memory uri, str_domain domain) public hostless {
        owners[next_token_id] = msg.sender;
        token_uris[next_token_id] = uri;
        str_domains[next_token_id] = domain;
        
        # Auto-mint CCOIN for NFT creation (2.5% fixed rate)
        ccoin.mint_nft_reward(msg.sender, 25);  # 2.5% in basis points
        
        emit SourceLessNFTMinted(msg.sender, next_token_id, domain);
        next_token_id++;
    }
    
    function transfer(uint256 token_id, zk13str_address to) public hostless {
        require(owners[token_id] == msg.sender, "Not NFT owner");
        owners[token_id] = to;
        emit SourceLessNFTTransfer(msg.sender, to, token_id);
    }
}`
  },
  {
    id: 'ex14',
    name: 'DEXPair',
    description: 'Toy AMM pair math',
    language: 'ares',
    code: `contract DEXPair {
    uint256 public reserveA;
    uint256 public reserveB;
    function addLiquidity(uint256 a, uint256 b) public {
        reserveA += a;
        reserveB += b;
    }
    function swap(uint256 aIn) public returns (uint256) {
        uint256 bOut = (aIn * reserveB) / (reserveA + aIn);
        reserveA += aIn;
        reserveB -= bOut;
        return bOut;
    }
}`
  },
  {
    id: 'ex15',
    name: 'StableMock',
    description: 'Mock stable mechanism',
    language: 'ares',
    code: `contract StableMock {
    uint256 public peg = 1e18; // 1 USD
    uint256 public totalSupply;
    mapping(address => uint256) public balances;
    function mint(uint256 amount) public {
        totalSupply += amount;
        balances[msg.sender] += amount;
    }
    function burn(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        totalSupply -= amount;
    }
}`
  },
  {
    id: 'ex16',
    name: 'WrappedSTR',
    description: 'wSTR wrapper logic',
    language: 'ares',
    code: `contract WrappedSTR {
    mapping(address => uint256) public balances;
    function wrap(uint256 amount) public payable {
        balances[msg.sender] += amount;
    }
    function unwrap(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        // transfer native STR
    }
}`
  },
  {
    id: 'ex17',
    name: 'StakingPool',
    description: 'Stake/unstake rewards',
    language: 'ares',
    code: `contract StakingPool {
    mapping(address => uint256) public stakes;
    uint256 public rewardRate = 5; // %
    function stake(uint256 amount) public {
        stakes[msg.sender] += amount;
    }
    function unstake(uint256 amount) public {
        require(stakes[msg.sender] >= amount);
        stakes[msg.sender] -= amount;
    }
    function claimReward() public {
        uint256 reward = (stakes[msg.sender] * rewardRate) / 100;
        // distribute reward
    }
}`
  },
  {
    id: 'ex18',
    name: 'YieldFarm',
    description: 'Basic yield farm',
    language: 'ares',
    code: `contract YieldFarm {
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public lastClaim;
    uint256 public apy = 10; // %
    function deposit(uint256 amount) public { deposits[msg.sender] += amount; lastClaim[msg.sender] = block.timestamp; }
    function withdraw(uint256 amount) public {
        require(deposits[msg.sender] >= amount);
        deposits[msg.sender] -= amount;
    }
    function harvest() public {
        uint256 elapsed = block.timestamp - lastClaim[msg.sender];
        uint256 yield = (deposits[msg.sender] * apy * elapsed) / (365 days * 100);
        lastClaim[msg.sender] = block.timestamp;
        // distribute yield
    }
}`
  },
  {
    id: 'ex19',
    name: 'Governor',
    description: 'Governance voting core',
    language: 'ares',
    code: `contract Governor {
    struct Proposal { string description; uint256 yesVotes; uint256 noVotes; bool executed; }
    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public voted;
    function propose(string memory desc) public { proposals.push(Proposal(desc, 0, 0, false)); }
    function vote(uint256 id, bool support) public {
        require(!voted[id][msg.sender]);
        voted[id][msg.sender] = true;
        if (support) proposals[id].yesVotes++; else proposals[id].noVotes++;
    }
    function execute(uint256 id) public {
        require(proposals[id].yesVotes > proposals[id].noVotes);
        proposals[id].executed = true;
    }
}`
  },
  {
    id: 'ex20',
    name: 'DomainAuction',
    description: 'Simple domain auction',
    language: 'ares',
    code: `contract DomainAuction {
    string public domain;
    address public highestBidder;
    uint256 public highestBid;
    uint256 public endTime;
    constructor(string memory _domain, uint256 duration) { domain = _domain; endTime = block.timestamp + duration; }
    function bid(uint256 amount) public {
        require(block.timestamp < endTime);
        require(amount > highestBid);
        highestBidder = msg.sender;
        highestBid = amount;
    }
    function finalize() public {
        require(block.timestamp >= endTime);
        // transfer domain to highestBidder
    }
}`
  },
  {
    id: 'ex21',
    name: 'BridgeLock',
    description: 'Lock/unlock bridging',
    language: 'ares',
    code: `contract BridgeLock {
    mapping(address => uint256) public locked;
    function lock(uint256 amount) public { locked[msg.sender] += amount; }
    function unlock(uint256 amount) public {
        require(locked[msg.sender] >= amount);
        locked[msg.sender] -= amount;
    }
}`
  },
  {
    id: 'ex22',
    name: 'FeeSplitter',
    description: 'Split fees logic',
    language: 'ares',
    code: `contract FeeSplitter {
    address[] public recipients;
    uint256[] public shares;
    function split(uint256 amount) public {
        uint256 total = 0;
        for (uint256 i = 0; i < shares.length; i++) total += shares[i];
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 portion = (amount * shares[i]) / total;
            // transfer portion to recipients[i]
        }
    }
}`
  },
  {
    id: 'ex23',
    name: 'PaymentChannel',
    description: 'Simple channels',
    language: 'ares',
    code: `contract PaymentChannel {
    address public sender;
    address public receiver;
    uint256 public expiration;
    uint256 public deposit;
    constructor(address _receiver, uint256 duration) payable {
        sender = msg.sender;
        receiver = _receiver;
        expiration = block.timestamp + duration;
        deposit = msg.value;
    }
    function close(uint256 amount, bytes memory signature) public {
        // verify signature, transfer amount to receiver, remainder to sender
    }
}`
  },
  {
    id: 'ex24',
    name: 'Subscription',
    description: 'Recurring payments',
    language: 'ares',
    code: `contract Subscription {
    mapping(address => uint256) public nextPayment;
    uint256 public interval = 30 days;
    uint256 public price = 10;
    function subscribe() public {
        nextPayment[msg.sender] = block.timestamp + interval;
    }
    function renew() public {
        require(block.timestamp >= nextPayment[msg.sender]);
        nextPayment[msg.sender] += interval;
        // charge price
    }
}`
  },
  {
    id: 'ex25',
    name: 'Lottery',
    description: 'Pseudo-random lottery',
    language: 'ares',
    code: `contract Lottery {
    address[] public players;
    uint256 public ticketPrice = 1;
    function enter() public payable {
        require(msg.value == ticketPrice);
        players.push(msg.sender);
    }
    function draw() public {
        uint256 index = uint256(keccak256(abi.encodePacked(block.timestamp))) % players.length;
        address winner = players[index];
        // transfer pot to winner
        delete players;
    }
}`
  },
  {
    id: 'ex26',
    name: 'STRCrowdfund',
    description: 'Native SourceLess STR crowdfunding',
    language: 'areslang',
    code: `# Native SourceLess Crowdfunding Contract
crowdfund_contract STRCrowdfund {
    goal: uint256;
    raised: uint256;
    deadline: uint256;
    contributions: mapping<zk13str_address, uint256>;
    
    constructor(uint256 _goal, uint256 duration) {
        goal = _goal;
        deadline = block.timestamp + duration;
        enable_hostless_mode();  # Gas-free for CCOS holders
    }
    
    function contribute(uint256 str_amount) public hostless {
        require(block.timestamp < deadline, "Campaign ended");
        contributions[msg.sender] += amount;
        raised += amount;
    }
    function finalize() public {
        require(block.timestamp >= deadline);
        if (raised >= goal) { /* success */ } else { /* refund */ }
    }
}`
  },
  {
    id: 'ex27',
    name: 'Identity',
    description: 'Simple identity store',
    language: 'ares',
    code: `contract Identity {
    mapping(address => string) public names;
    mapping(address => string) public emails;
    function setName(string memory name) public { names[msg.sender] = name; }
    function setEmail(string memory email) public { emails[msg.sender] = email; }
}`
  },
  {
    id: 'ex28',
    name: 'KYCRegistry',
    description: 'KYC registry stub',
    language: 'ares',
    code: `contract KYCRegistry {
    mapping(address => bool) public verified;
    address public verifier;
    constructor() { verifier = msg.sender; }
    function verify(address user) public {
        require(msg.sender == verifier);
        verified[user] = true;
    }
}`
  },
  {
    id: 'ex29',
    name: 'PoETracker',
    description: 'PoE linked logic',
    language: 'ares',
    code: `contract PoETracker {
    mapping(address => uint256) public lastActivity;
    function ping() public { lastActivity[msg.sender] = block.timestamp; }
    function isLive(address user) public view returns (bool) {
        return block.timestamp - lastActivity[user] < 60;
    }
}`
  },
  {
    id: 'ex30',
    name: 'EnergyToken',
    description: 'ESTR-like logic',
    language: 'ares',
    code: `contract EnergyToken {
    mapping(address => uint256) public balances;
    uint256 public regenRate = 1; // per block
    mapping(address => uint256) public lastRegen;
    function regenerate() public {
        uint256 blocks = block.number - lastRegen[msg.sender];
        balances[msg.sender] += blocks * regenRate;
        lastRegen[msg.sender] = block.number;
    }
}`
  },
  {
    id: 'ex31',
    name: 'CCOSRewards',
    description: 'IgniteHex rewards',
    language: 'ares',
    code: `contract CCOSRewards {
    mapping(address => uint256) public stakes;
    uint256 public rewardPool;
    function stake(uint256 amount) public { stakes[msg.sender] += amount; }
    function distribute() public {
        uint256 totalStake = 0;
        // calculate total, distribute proportionally
    }
}`
  },
  {
    id: 'ex32',
    name: 'ARSSMeter',
    description: 'ARSS metering logic',
    language: 'ares',
    code: `contract ARSSMeter {
    mapping(address => uint256) public used;
    mapping(address => uint256) public allocated;
    function allocate(address user, uint256 amount) public { allocated[user] += amount; }
    function consume(uint256 amount) public {
        require(allocated[msg.sender] - used[msg.sender] >= amount);
        used[msg.sender] += amount;
    }
}`
  },
  {
    id: 'ex33',
    name: 'STRStable',
    description: 'STR$ stable mock',
    language: 'ares',
    code: `contract STRStable {
    uint256 public peg = 1e18;
    mapping(address => uint256) public balances;
    function mint(uint256 amount) public {
        // collateralize with STR
        balances[msg.sender] += amount;
    }
    function burn(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        // return collateral
    }
}`
  }
];

// Export combined catalog including ARES Forge Genesis quantum-safe examples
export function getAllExamples(): AresExample[] {
  const aresForgeConverted: AresExample[] = ARES_FORGE_QUANTUM_EXAMPLES.map(ex => ({
    id: ex.id,
    name: ex.name,
    description: ex.description,
    language: ex.language,
    code: ex.code,
    category: ex.category,
    features: ex.features
  }));
  
  return [...ARES_EXAMPLES, ...aresForgeConverted];
}

export function getQuantumExamples(): AresExample[] {
  return ARES_FORGE_QUANTUM_EXAMPLES.map(ex => ({
    id: ex.id,
    name: ex.name,
    description: ex.description,
    language: ex.language,
    code: ex.code,
    category: ex.category,
    features: ex.features
  }));
}

export { ARES_FORGE_QUANTUM_EXAMPLES };
