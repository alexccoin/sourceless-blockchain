// ARES Forge Genesis - Quantum-Safe Smart Contract Examples
// Integrated from https://github.com/alexccoin/ares-forge-genesis-code

export interface AresForgeExample {
  id: string;
  name: string;
  description: string;
  language: 'areslang';  // Native SourceLess AresLang only
  category: 'quantum' | 'entropy' | 'defi' | 'nft';
  code: string;
  features: string[];
  addressFormat: 'zk13str';  // ZK13STR addresses only
  gasEstimate: number;  // 0 for HOSTLESS mode
}

export const ARES_FORGE_QUANTUM_EXAMPLES: AresForgeExample[] = [
  {
    id: 'quantum01',
    name: 'QuantumSafeToken',
    description: 'Native SourceLess quantum-safe STR token with post-quantum cryptography',
    language: 'areslang',
    category: 'quantum',
    addressFormat: 'zk13str',
    gasEstimate: 0,  // HOSTLESS mode enabled
    features: ['CRYSTALS-Kyber encryption', 'Quantum-safe ZK13STR transfers', 'Lattice-based signatures', 'Native CCOIN rewards'],
    code: `// Native SourceLess Quantum-Safe STR Token
quantum_token_contract SourceLessQuantumToken {
    name: string = "SourceLess Quantum STR";
    symbol: string = "QSTR";
    decimals: uint8 = 13;  # Native SourceLess precision
    total_supply: uint256;
    quantum_enabled: bool = true;
    
    # Quantum-safe balance storage with ZK13STR addresses
    balances: quantum_mapping<zk13str_address, uint256>;
    quantum_keys: mapping<zk13str_address, crystals_kyber_key>;
    dilithium_sigs: mapping<zk13str_address, dilithium_signature>;
    
    # CCOIN integration for quantum transactions
    ccoin_rewards: mapping<zk13str_address, uint256>;
    
    constructor(uint256 _initial_supply) {
        total_supply = _initial_supply;
        balances[msg.sender] = _initial_supply;
        
        # Generate quantum-safe key pair for contract owner
        quantum_keys[msg.sender] = crystals_kyber.generate_keypair();
        
        # Enable HOSTLESS gas-free transactions
        enable_hostless_mode();
        
        # Setup CCOIN quantum reward system (5% for quantum transactions)
        setup_quantum_ccoin_rewards(5.0);
        
        emit QuantumTokenDeployed(msg.sender, _initial_supply);
    }
    
    # Quantum-safe transfer with post-quantum cryptography
    function quantum_transfer(
        zk13str_address to, 
        uint256 amount, 
        crystals_kyber_ciphertext encrypted_amount
    ) public hostless returns (bool) {
        require(validate_zk13str(to), "Invalid ZK13STR recipient");
        require(balances[msg.sender] >= amount, "Insufficient quantum balance");
        
        # Verify quantum-safe signature
        require(dilithium.verify_signature(
            quantum_keys[msg.sender], 
            encrypted_amount
        ), "Invalid quantum signature");
        
        # Execute quantum-safe transfer
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        # Mint enhanced CCOIN rewards for quantum transactions (5%)
        ccoin.mint_quantum_reward(msg.sender, amount * 0.05);
        
        emit QuantumTransfer(msg.sender, to, amount);
        return true;
    }
    
    # Generate quantum-safe proof for private transactions
    function generate_quantum_proof(uint256 amount) public view returns (quantum_proof) {
        return quantum_zkp.generate_proof(
            amount, 
            quantum_keys[msg.sender],
            msg.sender
        );
    }
}
    dilithium_sigs: mapping<zk13str_address, dilithium_signature>;
    
    # CCOIN integration for quantum transactions
    ccoin_rewards: mapping<zk13str_address, uint256>;
    
    constructor(uint256 _initial_supply) {
        total_supply = _initial_supply;
        balances[msg.sender] = _initial_supply;
        
        # Generate quantum-safe key pair for contract owner
        quantum_keys[msg.sender] = crystals_kyber.generate_keypair();
        
        # Enable HOSTLESS gas-free transactions
        enable_hostless_mode();
        
        # Setup CCOIN quantum reward system (5% for quantum transactions)
        setup_quantum_ccoin_rewards(5.0);
        
        emit QuantumTokenDeployed(msg.sender, _initial_supply);
    }
    
    # Quantum-safe transfer with post-quantum cryptography
    function quantum_transfer(
        zk13str_address to, 
        uint256 amount, 
        crystals_kyber_ciphertext encrypted_amount
    ) public hostless returns (bool) {
        require(validate_zk13str(to), "Invalid ZK13STR recipient");
        require(balances[msg.sender] >= amount, "Insufficient quantum balance");
        
        # Verify quantum-safe signature
        require(dilithium.verify_signature(
            quantum_keys[msg.sender], 
            encrypted_amount
        ), "Invalid quantum signature");
        
        # Execute quantum-safe transfer
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        # Mint enhanced CCOIN rewards for quantum transactions (5%)
        ccoin.mint_quantum_reward(msg.sender, amount * 0.05);
        
        emit QuantumTransfer(msg.sender, to, amount);
        return true;
    }
    
    # Generate quantum-safe proof for private transactions
    function generate_quantum_proof(uint256 amount) public view returns (quantum_proof) {
        return quantum_zkp.generate_proof(
            amount, 
            quantum_keys[msg.sender],
            msg.sender
        );
    }
}
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Quantum-safe transfer signatures
    mapping(bytes32 => bool) private usedQuantumSignatures;
    
    event QuantumTransfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 quantumSignature
    );
    
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * 10**uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
    }
    
    // Standard transfer with quantum-safe signature verification
    function quantumTransfer(
        address _to,
        uint256 _value,
        bytes memory _quantumSignature,
        uint256 _nonce
    ) public returns (bool success) {
        require(_to != address(0), "Invalid recipient");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        // Generate signature hash using quantum-resistant algorithm
        bytes32 sigHash = keccak256(
            abi.encodePacked(msg.sender, _to, _value, _nonce)
        );
        
        // Verify quantum signature hasn't been used (prevent replay)
        require(!usedQuantumSignatures[sigHash], "Signature already used");
        
        // Verify quantum-safe signature
        require(
            verifyQuantumSignature(msg.sender, sigHash, _quantumSignature),
            "Invalid quantum signature"
        );
        
        // Mark signature as used
        usedQuantumSignatures[sigHash] = true;
        
        // Execute transfer
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit QuantumTransfer(msg.sender, _to, _value, sigHash);
        return true;
    }
    
    // Emergency quantum-upgrade function for post-quantum migration
    function upgradeQuantumAlgorithm(bytes memory _newAlgorithmParams) 
        public 
        onlyOwner 
        returns (bool) 
    {
        return updateQuantumProtocol(_newAlgorithmParams);
    }
}`
  },
  {
    id: 'entropy01',
    name: 'EarthquakeDiceGame',
    description: 'Provably fair dice game using real seismic entropy',
    language: 'areslang',
    category: 'entropy',
    addressFormat: 'zk13str',
    gasEstimate: 0,
    features: ['Earthquake entropy', 'Provably fair randomness', 'Seismic data verification'],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@areslang/contracts/entropy/EarthquakeOracle.sol";

contract EarthquakeDiceGame is EarthquakeOracle {
    uint256 public minBet = 0.01 ether;
    uint256 public maxBet = 1 ether;
    
    struct Game {
        address player;
        uint256 betAmount;
        uint8 prediction;
        bool settled;
        uint8 result;
        uint256 earthquakeTimestamp;
        bytes32 earthquakeId;
    }
    
    mapping(bytes32 => Game) public games;
    
    event GameCreated(
        bytes32 indexed gameId,
        address indexed player,
        uint256 betAmount,
        uint8 prediction
    );
    
    event GameSettled(
        bytes32 indexed gameId,
        address indexed player,
        uint8 result,
        bool won,
        uint256 payout
    );
    
    // Create game with prediction (1-6)
    function createGame(uint8 _prediction) public payable returns (bytes32) {
        require(_prediction >= 1 && _prediction <= 6, "Invalid prediction");
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        
        bytes32 gameId = keccak256(
            abi.encodePacked(msg.sender, block.timestamp, msg.value)
        );
        
        games[gameId] = Game({
            player: msg.sender,
            betAmount: msg.value,
            prediction: _prediction,
            settled: false,
            result: 0,
            earthquakeTimestamp: 0,
            earthquakeId: bytes32(0)
        });
        
        emit GameCreated(gameId, msg.sender, msg.value, _prediction);
        return gameId;
    }
    
    // Settle game using earthquake entropy
    function settleGame(
        bytes32 _gameId,
        bytes32 _earthquakeId,
        uint256 _magnitude,
        uint256 _timestamp,
        bytes memory _oracleProof
    ) public {
        Game storage game = games[_gameId];
        require(!game.settled, "Game already settled");
        require(game.player != address(0), "Game not found");
        
        // Verify earthquake data from oracle
        require(
            verifyEarthquakeData(_earthquakeId, _magnitude, _timestamp, _oracleProof),
            "Invalid earthquake data"
        );
        
        // Generate dice result from earthquake entropy
        // Use magnitude decimals + timestamp for true randomness
        uint256 entropySource = uint256(
            keccak256(abi.encodePacked(_earthquakeId, _magnitude, _timestamp))
        );
        uint8 diceResult = uint8((entropySource % 6) + 1);
        
        game.result = diceResult;
        game.earthquakeTimestamp = _timestamp;
        game.earthquakeId = _earthquakeId;
        game.settled = true;
        
        bool won = (diceResult == game.prediction);
        uint256 payout = 0;
        
        if (won) {
            payout = game.betAmount * 6; // 6x payout
            payable(game.player).transfer(payout);
        }
        
        emit GameSettled(_gameId, game.player, diceResult, won, payout);
    }
}`
  },
  {
    id: 'defi01',
    name: 'QuantumDEX',
    description: 'Decentralized exchange with quantum-safe atomic swaps',
    language: 'areslang',
    category: 'defi',
    addressFormat: 'zk13str',
    gasEstimate: 0,
    features: ['Atomic swaps', 'Quantum-safe trading', 'Cross-chain bridges'],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@areslang/contracts/dex/QuantumSwap.sol";
import "@areslang/contracts/security/QuantumSafe.sol";

contract QuantumDEX is QuantumSwap, QuantumSafe {
    struct LiquidityPool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalShares;
    }
    
    mapping(bytes32 => LiquidityPool) public pools;
    mapping(address => mapping(bytes32 => uint256)) public liquidityShares;
    
    event PoolCreated(
        bytes32 indexed poolId,
        address indexed tokenA,
        address indexed tokenB
    );
    
    event LiquidityAdded(
        bytes32 indexed poolId,
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 shares
    );
    
    event QuantumSwapExecuted(
        bytes32 indexed poolId,
        address indexed trader,
        address tokenIn,
        uint256 amountIn,
        uint256 amountOut,
        bytes32 quantumProof
    );
    
    // Create liquidity pool
    function createPool(address _tokenA, address _tokenB) 
        public 
        returns (bytes32 poolId) 
    {
        require(_tokenA != _tokenB, "Identical tokens");
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid tokens");
        
        poolId = keccak256(abi.encodePacked(_tokenA, _tokenB));
        require(pools[poolId].tokenA == address(0), "Pool exists");
        
        pools[poolId] = LiquidityPool({
            tokenA: _tokenA,
            tokenB: _tokenB,
            reserveA: 0,
            reserveB: 0,
            totalShares: 0
        });
        
        emit PoolCreated(poolId, _tokenA, _tokenB);
    }
    
    // Add liquidity with quantum-safe proof
    function addLiquidity(
        bytes32 _poolId,
        uint256 _amountA,
        uint256 _amountB,
        bytes memory _quantumProof
    ) public returns (uint256 shares) {
        LiquidityPool storage pool = pools[_poolId];
        require(pool.tokenA != address(0), "Pool not found");
        
        // Verify quantum-safe authorization
        require(
            verifyQuantumSignature(msg.sender, _poolId, _quantumProof),
            "Invalid quantum proof"
        );
        
        // Calculate shares
        if (pool.totalShares == 0) {
            shares = sqrt(_amountA * _amountB);
        } else {
            uint256 sharesA = (_amountA * pool.totalShares) / pool.reserveA;
            uint256 sharesB = (_amountB * pool.totalShares) / pool.reserveB;
            shares = min(sharesA, sharesB);
        }
        
        require(shares > 0, "Insufficient liquidity");
        
        // Update pool
        pool.reserveA += _amountA;
        pool.reserveB += _amountB;
        pool.totalShares += shares;
        liquidityShares[msg.sender][_poolId] += shares;
        
        emit LiquidityAdded(_poolId, msg.sender, _amountA, _amountB, shares);
    }
    
    // Quantum-safe swap
    function quantumSwap(
        bytes32 _poolId,
        address _tokenIn,
        uint256 _amountIn,
        uint256 _minAmountOut,
        bytes memory _quantumProof
    ) public returns (uint256 amountOut) {
        LiquidityPool storage pool = pools[_poolId];
        require(pool.tokenA != address(0), "Pool not found");
        
        // Verify quantum signature
        bytes32 swapHash = keccak256(
            abi.encodePacked(_poolId, msg.sender, _amountIn, block.timestamp)
        );
        require(
            verifyQuantumSignature(msg.sender, swapHash, _quantumProof),
            "Invalid quantum proof"
        );
        
        // Calculate output using constant product formula
        bool isTokenA = (_tokenIn == pool.tokenA);
        (uint256 reserveIn, uint256 reserveOut) = isTokenA 
            ? (pool.reserveA, pool.reserveB)
            : (pool.reserveB, pool.reserveA);
        
        amountOut = getAmountOut(_amountIn, reserveIn, reserveOut);
        require(amountOut >= _minAmountOut, "Slippage exceeded");
        
        // Update reserves
        if (isTokenA) {
            pool.reserveA += _amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += _amountIn;
            pool.reserveA -= amountOut;
        }
        
        emit QuantumSwapExecuted(
            _poolId,
            msg.sender,
            _tokenIn,
            _amountIn,
            amountOut,
            swapHash
        );
    }
    
    // Helper functions
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) private pure returns (uint256) {
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }
    
    function sqrt(uint256 x) private pure returns (uint256) {
        if (x == 0) return 0;
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
}`
  },
  {
    id: 'nft01',
    name: 'QuantumNFT',
    description: 'NFT collection with quantum-safe minting and earthquake entropy traits',
    language: 'areslang',
    category: 'nft',
    addressFormat: 'zk13str',
    gasEstimate: 0,
    features: ['ERC721', 'Quantum-safe minting', 'Earthquake-generated traits', 'ZK proofs'],
    code: `// Native SourceLess Quantum NFT Contract
nft_contract QuantumNFT {
    name: string = "Quantum Earthquake NFT";
    symbol: string = "QNFT";
    max_supply: uint256 = 10000;
    next_token_id: uint256 = 1;
    
    # Native ZK13STR address mappings
    owners: mapping<uint256, zk13str_address>;
    token_uris: mapping<uint256, string>;
    str_domains: mapping<uint256, str_domain>;
    
    # SourceLess native events
    event QuantumNFTMinted(zk13str_address indexed to, uint256 indexed tokenId, str_domain domain);
    event QuantumNFTTransfer(zk13str_address indexed from, zk13str_address indexed to, uint256 indexed tokenId);
    uint256 public mintPrice = 0.05 ether;
    
    struct NFTTraits {
        uint8 rarity; // 1-5 (from earthquake magnitude)
        uint8 power; // 0-100 (from seismic depth)
        bytes32 earthquakeId; // Provenance
        uint256 earthquakeTimestamp;
        string region; // Geographic region of earthquake
    }
    
    mapping(uint256 => NFTTraits) public tokenTraits;
    mapping(bytes32 => bool) private usedEarthquakes;
    
    event QuantumMinted(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 earthquakeId,
        uint8 rarity,
        uint8 power
    );
    
    constructor() QuantumERC721("Quantum Earthquake NFT", "QNFT") {}
    
    // Mint NFT with traits derived from real earthquake data
    function mintQuantum(
        bytes32 _earthquakeId,
        uint256 _magnitude, // e.g., 4500 = 4.5 magnitude
        uint256 _depth,     // in kilometers
        uint256 _timestamp,
        string memory _region,
        bytes memory _oracleProof,
        bytes memory _quantumSignature
    ) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(nextTokenId <= maxSupply, "Max supply reached");
        require(!usedEarthquakes[_earthquakeId], "Earthquake already used");
        
        // Verify earthquake data from oracle
        require(
            verifyEarthquakeData(_earthquakeId, _magnitude, _timestamp, _oracleProof),
            "Invalid earthquake data"
        );
        
        // Verify quantum-safe minting authorization
        bytes32 mintHash = keccak256(
            abi.encodePacked(msg.sender, _earthquakeId, block.timestamp)
        );
        require(
            verifyQuantumSignature(msg.sender, mintHash, _quantumSignature),
            "Invalid quantum signature"
        );
        
        // Mark earthquake as used
        usedEarthquakes[_earthquakeId] = true;
        
        // Calculate traits from earthquake properties
        uint8 rarity = calculateRarity(_magnitude);
        uint8 power = calculatePower(_depth);
        
        uint256 tokenId = nextTokenId++;
        
        // Store traits
        tokenTraits[tokenId] = NFTTraits({
            rarity: rarity,
            power: power,
            earthquakeId: _earthquakeId,
            earthquakeTimestamp: _timestamp,
            region: _region
        });
        
        // Mint NFT
        _safeMint(msg.sender, tokenId);
        
        emit QuantumMinted(tokenId, msg.sender, _earthquakeId, rarity, power);
        
        return tokenId;
    }
    
    // Calculate rarity from earthquake magnitude
    // 1-2.9 = Common, 3-3.9 = Uncommon, 4-4.9 = Rare, 5-5.9 = Epic, 6+ = Legendary
    function calculateRarity(uint256 _magnitude) private pure returns (uint8) {
        if (_magnitude >= 6000) return 5; // Legendary
        if (_magnitude >= 5000) return 4; // Epic
        if (_magnitude >= 4000) return 3; // Rare
        if (_magnitude >= 3000) return 2; // Uncommon
        return 1; // Common
    }
    
    // Calculate power from earthquake depth (deeper = more power)
    function calculatePower(uint256 _depth) private pure returns (uint8) {
        if (_depth >= 500) return 100;
        return uint8((_depth * 100) / 500);
    }
    
    // Get NFT metadata URI with earthquake provenance
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        NFTTraits memory traits = tokenTraits[tokenId];
        
        return string(abi.encodePacked(
            "https://api.sourceless.io/nft/",
            toString(tokenId),
            "?earthquake=", bytes32ToString(traits.earthquakeId),
            "&rarity=", toString(traits.rarity),
            "&power=", toString(traits.power)
        ));
    }
    
    // Helper to convert bytes32 to string
    function bytes32ToString(bytes32 _bytes) private pure returns (string memory) {
        bytes memory bytesArray = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i*2] = _hexChar(uint8(_bytes[i] >> 4));
            bytesArray[i*2+1] = _hexChar(uint8(_bytes[i] & 0x0f));
        }
        return string(bytesArray);
    }
    
    function _hexChar(uint8 _nibble) private pure returns (bytes1) {
        if (_nibble < 10) return bytes1(_nibble + 48);
        return bytes1(_nibble + 87);
    }
    
    function toString(uint256 value) private pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // Withdraw funds
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}`
  }
];

// Export combined catalog for UI
export function getAllAresForgeExamples(): AresForgeExample[] {
  return ARES_FORGE_QUANTUM_EXAMPLES;
}

export function getExamplesByCategory(category: 'quantum' | 'entropy' | 'defi' | 'nft'): AresForgeExample[] {
  return ARES_FORGE_QUANTUM_EXAMPLES.filter(ex => ex.category === category);
}
