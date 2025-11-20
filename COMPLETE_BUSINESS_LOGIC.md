# 🧠 STRATUS BLOCKCHAIN - COMPLETE BUSINESS LOGIC & ALGORITHMS

**Version:** 1.0.0  
**Date:** November 10, 2025  
**Classification:** Technical Specification

---

## 📋 TABLE OF CONTENTS

1. [Core Algorithms](#core-algorithms)
2. [Consensus Mechanism](#consensus-mechanism)
3. [Transaction Processing](#transaction-processing)
4. [Wallet Operations](#wallet-operations)
5. [Smart Contract Execution](#smart-contract-execution)
6. [Token Economics Logic](#token-economics-logic)
7. [Network Protocols](#network-protocols)
8. [Security Mechanisms](#security-mechanisms)
9. [Data Structures](#data-structures)
10. [Business Rules](#business-rules)

---

## 🔧 CORE ALGORITHMS

### 1. Block Mining Algorithm

**Proof of Work (PoW) Implementation:**

```typescript
/**
 * Mine a new block with proof-of-work consensus
 * @param {Block} block - Block to mine
 * @param {number} difficulty - Mining difficulty (number of leading zeros)
 * @returns {Block} - Mined block with valid nonce
 */
function mineBlock(block: Block, difficulty: number): Block {
  // Algorithm:
  // 1. Start with nonce = 0
  // 2. Calculate block hash
  // 3. Check if hash meets difficulty target
  // 4. If not, increment nonce and repeat
  // 5. Return block when valid hash found
  
  const target = '0'.repeat(difficulty);
  let nonce = 0;
  
  while (true) {
    block.nonce = nonce;
    const hash = calculateBlockHash(block);
    
    if (hash.startsWith(target)) {
      block.hash = hash;
      return block;
    }
    
    nonce++;
    
    // Performance optimization: check every 1000 iterations
    if (nonce % 1000 === 0) {
      // Allow event loop to process other tasks
      await sleep(0);
    }
  }
}

/**
 * Calculate block hash using SHA-256
 */
function calculateBlockHash(block: Block): string {
  const data = [
    block.previousHash,
    block.timestamp,
    block.merkleRoot,
    block.nonce,
    block.difficulty,
    block.miner
  ].join('');
  
  return sha256(data).toString('hex');
}
```

**Difficulty Adjustment Logic:**

```typescript
/**
 * Adjust mining difficulty based on block time
 * Target: 30-60 seconds per block
 */
function adjustDifficulty(ledger: Ledger): number {
  const currentDifficulty = ledger.getDifficulty();
  const recentBlocks = ledger.getLastNBlocks(100);
  
  if (recentBlocks.length < 100) {
    return currentDifficulty; // Not enough data
  }
  
  const averageBlockTime = calculateAverageBlockTime(recentBlocks);
  const targetBlockTime = 45; // seconds
  
  // Adjust difficulty
  if (averageBlockTime < targetBlockTime * 0.8) {
    // Blocks too fast, increase difficulty
    return Math.min(currentDifficulty + 1, 8);
  } else if (averageBlockTime > targetBlockTime * 1.2) {
    // Blocks too slow, decrease difficulty
    return Math.max(currentDifficulty - 1, 2);
  }
  
  return currentDifficulty; // Maintain current
}

function calculateAverageBlockTime(blocks: Block[]): number {
  const times = blocks.map((b, i) => {
    if (i === 0) return 0;
    return b.timestamp - blocks[i - 1].timestamp;
  });
  
  return times.reduce((a, b) => a + b, 0) / (times.length - 1);
}
```

### 2. Merkle Tree Construction

**Purpose:** Efficiently verify transactions in a block

```typescript
/**
 * Build Merkle tree from transactions
 * @param {Transaction[]} transactions
 * @returns {string} Merkle root hash
 */
function buildMerkleTree(transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return sha256('').toString('hex');
  }
  
  // Leaf nodes: transaction hashes
  let hashes = transactions.map(tx => tx.hash);
  
  // Build tree bottom-up
  while (hashes.length > 1) {
    const newLevel: string[] = [];
    
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = i + 1 < hashes.length ? hashes[i + 1] : left;
      
      // Combine and hash
      const combined = sha256(left + right).toString('hex');
      newLevel.push(combined);
    }
    
    hashes = newLevel;
  }
  
  return hashes[0];
}

/**
 * Verify transaction is in block (Merkle proof)
 * @param {Transaction} tx - Transaction to verify
 * @param {string[]} proof - Merkle proof path
 * @param {string} root - Merkle root
 */
function verifyMerkleProof(
  tx: Transaction,
  proof: string[],
  root: string
): boolean {
  let hash = tx.hash;
  
  for (const sibling of proof) {
    // Combine with sibling and rehash
    const combined = hash < sibling 
      ? hash + sibling 
      : sibling + hash;
    hash = sha256(combined).toString('hex');
  }
  
  return hash === root;
}
```

### 3. Address Generation (ZK13STR)

**Algorithm:**

```typescript
/**
 * Generate ZK13STR address from public key
 * Format: zk13str_<40-hex>_<4-hex-checksum>
 */
function generateAddress(publicKey: Buffer): string {
  // Step 1: Hash public key (SHA-256)
  const hash = sha256(publicKey);
  
  // Step 2: Take first 40 hex characters
  const addressCore = hash.toString('hex').slice(0, 40);
  
  // Step 3: Calculate checksum (SHA-256 of core, first 4 hex)
  const checksum = sha256(Buffer.from(addressCore, 'hex'))
    .toString('hex')
    .slice(0, 4);
  
  // Step 4: Format as ZK13STR address
  return `zk13str_${addressCore}_${checksum}`;
}

/**
 * Validate ZK13STR address format and checksum
 */
function validateAddress(address: string): boolean {
  // Check format
  const regex = /^zk13str_([a-f0-9]{40})_([a-f0-9]{4})$/;
  const match = address.match(regex);
  
  if (!match) return false;
  
  const [_, core, checksum] = match;
  
  // Verify checksum
  const expectedChecksum = sha256(Buffer.from(core, 'hex'))
    .toString('hex')
    .slice(0, 4);
  
  return checksum === expectedChecksum;
}
```

### 4. Nonce Management

**Purpose:** Prevent transaction replay attacks

```typescript
/**
 * Get next nonce for address
 * Nonce = number of confirmed transactions from this address
 */
function getNextNonce(address: string, ledger: Ledger): number {
  // Count confirmed transactions
  const confirmedTxs = ledger.getTransactionsByAddress(address)
    .filter(tx => tx.status === 'confirmed');
  
  return confirmedTxs.length;
}

/**
 * Validate transaction nonce
 */
function validateNonce(tx: Transaction, ledger: Ledger): boolean {
  const expectedNonce = getNextNonce(tx.from, ledger);
  const pendingTxs = ledger.getPendingTransactions(tx.from);
  
  // Check if nonce is expected or in pending sequence
  if (tx.nonce === expectedNonce) {
    return true; // Next expected nonce
  }
  
  // Check if fills gap in pending transactions
  const pendingNonces = pendingTxs.map(t => t.nonce).sort((a, b) => a - b);
  
  for (let i = 0; i < pendingNonces.length; i++) {
    if (pendingNonces[i] !== expectedNonce + i) {
      return false; // Gap in sequence
    }
  }
  
  return tx.nonce === expectedNonce + pendingNonces.length;
}
```

---

## ⚖️ CONSENSUS MECHANISM

### Proof of Work (PoW) Rules

**Block Validity Criteria:**

```typescript
/**
 * Validate block according to consensus rules
 */
function validateBlock(block: Block, ledger: Ledger): ValidationResult {
  const errors: string[] = [];
  
  // Rule 1: Valid block hash (meets difficulty)
  const difficulty = ledger.getDifficulty();
  const target = '0'.repeat(difficulty);
  
  if (!block.hash.startsWith(target)) {
    errors.push('Block hash does not meet difficulty target');
  }
  
  // Rule 2: Hash matches block content
  const calculatedHash = calculateBlockHash(block);
  if (block.hash !== calculatedHash) {
    errors.push('Block hash mismatch');
  }
  
  // Rule 3: Previous hash links to chain
  const previousBlock = ledger.getBlockByNumber(block.number - 1);
  if (previousBlock && block.previousHash !== previousBlock.hash) {
    errors.push('Previous hash mismatch');
  }
  
  // Rule 4: Merkle root matches transactions
  const merkleRoot = buildMerkleTree(block.transactions);
  if (block.merkleRoot !== merkleRoot) {
    errors.push('Merkle root mismatch');
  }
  
  // Rule 5: Timestamp within acceptable range
  const now = Date.now();
  if (block.timestamp > now + 7200000) { // 2 hours in future
    errors.push('Block timestamp too far in future');
  }
  
  if (previousBlock && block.timestamp < previousBlock.timestamp) {
    errors.push('Block timestamp before previous block');
  }
  
  // Rule 6: All transactions valid
  for (const tx of block.transactions) {
    const txValidation = validateTransaction(tx, ledger);
    if (!txValidation.valid) {
      errors.push(`Invalid transaction: ${tx.hash}`);
    }
  }
  
  // Rule 7: Block reward valid
  const reward = calculateBlockReward(block.number);
  const coinbaseTx = block.transactions.find(tx => tx.type === 'coinbase');
  
  if (coinbaseTx && coinbaseTx.value > reward) {
    errors.push('Block reward exceeds allowed amount');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Fork Resolution (Longest Chain Rule):**

```typescript
/**
 * Resolve fork by selecting longest valid chain
 */
function resolveFork(chains: Block[][]): Block[] {
  let longestChain = chains[0];
  let maxDifficulty = 0;
  
  for (const chain of chains) {
    // Calculate total difficulty
    const totalDifficulty = chain.reduce((sum, block) => {
      return sum + Math.pow(2, block.difficulty);
    }, 0);
    
    if (totalDifficulty > maxDifficulty) {
      maxDifficulty = totalDifficulty;
      longestChain = chain;
    }
  }
  
  return longestChain;
}
```

---

## 💸 TRANSACTION PROCESSING

### Transaction Validation

**Complete Validation Logic:**

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate transaction before adding to pool
 */
function validateTransaction(
  tx: Transaction,
  ledger: Ledger
): ValidationResult {
  const errors: string[] = [];
  
  // 1. Format validation
  if (!validateAddress(tx.from)) {
    errors.push('Invalid sender address');
  }
  
  if (tx.to && !validateAddress(tx.to)) {
    errors.push('Invalid recipient address');
  }
  
  if (tx.value < 0) {
    errors.push('Negative transaction value');
  }
  
  // 2. Signature verification
  if (!verifySignature(tx)) {
    errors.push('Invalid signature');
  }
  
  // 3. Nonce validation
  if (!validateNonce(tx, ledger)) {
    errors.push('Invalid nonce');
  }
  
  // 4. Balance check
  const balance = ledger.getBalance(tx.from, tx.token);
  const totalCost = tx.value + (tx.gasPrice * tx.gasLimit);
  
  if (balance < totalCost) {
    errors.push('Insufficient balance');
  }
  
  // 5. Gas validation
  if (tx.gasPrice < ledger.getMinGasPrice()) {
    errors.push('Gas price too low');
  }
  
  const estimatedGas = estimateGas(tx);
  if (tx.gasLimit < estimatedGas) {
    errors.push('Gas limit too low');
  }
  
  // 6. Token-specific validation
  if (tx.token === 'CCOS') {
    // CCOS can only be transferred after earning
    const ccosBalance = ledger.getBalance(tx.from, 'CCOS');
    if (tx.value > ccosBalance) {
      errors.push('Insufficient CCOS balance');
    }
  }
  
  // 7. Transaction size limit
  const txSize = JSON.stringify(tx).length;
  if (txSize > 100000) { // 100KB limit
    errors.push('Transaction too large');
  }
  
  // 8. Rate limiting check
  if (isRateLimited(tx.from)) {
    errors.push('Rate limit exceeded');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Transaction Execution

**State Transition Logic:**

```typescript
/**
 * Execute transaction and update ledger state
 */
function executeTransaction(
  tx: Transaction,
  ledger: Ledger
): ExecutionResult {
  const state = ledger.getState();
  
  try {
    // 1. Deduct value + gas from sender
    state.balances[tx.from][tx.token] -= tx.value;
    state.balances[tx.from]['STR'] -= tx.gasPrice * tx.gasUsed;
    
    // 2. Credit recipient
    if (tx.to) {
      if (!state.balances[tx.to]) {
        state.balances[tx.to] = {};
      }
      state.balances[tx.to][tx.token] = 
        (state.balances[tx.to][tx.token] || 0) + tx.value;
    }
    
    // 3. Increment nonce
    state.nonces[tx.from] = (state.nonces[tx.from] || 0) + 1;
    
    // 4. Execute transaction type-specific logic
    switch (tx.type) {
      case 'transfer':
        // Already handled above
        break;
        
      case 'contract_deploy':
        deployContract(tx, state);
        break;
        
      case 'contract_call':
        executeContract(tx, state);
        break;
        
      case 'domain_register':
        registerDomain(tx, state);
        break;
        
      case 'financial-public-transaction':
        // Trigger CCOS reward
        if (tx.value >= 100) {
          distributeCCOSReward(tx, state);
        }
        break;
    }
    
    // 5. Commit state changes
    ledger.setState(state);
    
    return {
      success: true,
      gasUsed: tx.gasUsed,
      newState: state
    };
    
  } catch (error) {
    // Revert state on error
    return {
      success: false,
      error: error.message,
      gasUsed: tx.gasLimit // Burn all gas on error
    };
  }
}
```

### Gas Estimation

```typescript
/**
 * Estimate gas required for transaction
 */
function estimateGas(tx: Transaction): number {
  let gas = 21000; // Base transaction cost
  
  // Add data cost (68 gas per non-zero byte, 4 per zero byte)
  if (tx.data) {
    const data = Buffer.from(tx.data, 'hex');
    for (const byte of data) {
      gas += byte === 0 ? 4 : 68;
    }
  }
  
  // Contract deployment
  if (tx.type === 'contract_deploy') {
    gas += 32000; // Contract creation cost
    gas += tx.data.length * 200; // Code storage
  }
  
  // Contract call
  if (tx.type === 'contract_call') {
    gas += 2000; // Call cost
    // Add estimated execution cost from contract
    gas += estimateContractGas(tx.to, tx.data);
  }
  
  // Domain registration
  if (tx.type === 'domain_register') {
    gas += 50000; // Domain registration cost
  }
  
  // Safety margin
  gas = Math.ceil(gas * 1.1);
  
  return gas;
}
```

---

## 👛 WALLET OPERATIONS

### HD Wallet Derivation (BIP32)

```typescript
/**
 * Derive child wallet from master seed
 * Path format: m/44'/1313'/0'/0/index
 */
function deriveWallet(
  masterSeed: Buffer,
  index: number = 0
): WalletKeyPair {
  // BIP44 path for Stratus (coin type: 1313)
  const path = `m/44'/1313'/0'/0/${index}`;
  
  // Derive key using BIP32
  const root = bip32.fromSeed(masterSeed);
  const child = root.derivePath(path);
  
  // Generate key pair
  const privateKey = child.privateKey;
  const publicKey = child.publicKey;
  const address = generateAddress(publicKey);
  
  return {
    privateKey: privateKey.toString('hex'),
    publicKey: publicKey.toString('hex'),
    address,
    path
  };
}

/**
 * Create wallet from mnemonic phrase
 */
function createWalletFromMnemonic(
  mnemonic: string,
  password: string = ''
): Wallet {
  // Validate mnemonic
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }
  
  // Generate seed
  const seed = bip39.mnemonicToSeedSync(mnemonic, password);
  
  // Derive first wallet (index 0)
  const wallet = deriveWallet(seed, 0);
  
  return {
    ...wallet,
    mnemonic,
    seed: seed.toString('hex')
  };
}
```

### Transaction Signing (ECDSA)

```typescript
/**
 * Sign transaction with private key
 */
function signTransaction(
  tx: Transaction,
  privateKey: string
): Transaction {
  // Create transaction hash
  const txHash = createTransactionHash(tx);
  
  // Sign with ECDSA secp256k1
  const ec = new EC('secp256k1');
  const key = ec.keyFromPrivate(privateKey, 'hex');
  const signature = key.sign(txHash);
  
  // Encode signature (r, s, v format)
  const r = signature.r.toString('hex').padStart(64, '0');
  const s = signature.s.toString('hex').padStart(64, '0');
  const v = signature.recoveryParam.toString(16).padStart(2, '0');
  
  tx.signature = r + s + v;
  tx.hash = txHash;
  
  return tx;
}

/**
 * Verify transaction signature
 */
function verifySignature(tx: Transaction): boolean {
  const txHash = createTransactionHash(tx);
  
  // Extract signature components
  const r = tx.signature.slice(0, 64);
  const s = tx.signature.slice(64, 128);
  const v = parseInt(tx.signature.slice(128, 130), 16);
  
  // Recover public key from signature
  const ec = new EC('secp256k1');
  const signature = { r, s, recoveryParam: v };
  const publicKey = ec.recoverPubKey(
    Buffer.from(txHash, 'hex'),
    signature,
    v
  );
  
  // Verify address matches
  const recoveredAddress = generateAddress(
    Buffer.from(publicKey.encode('hex'), 'hex')
  );
  
  return recoveredAddress === tx.from;
}

/**
 * Create deterministic transaction hash
 */
function createTransactionHash(tx: Transaction): string {
  const data = [
    tx.from,
    tx.to || '',
    tx.value.toString(),
    tx.token,
    tx.nonce.toString(),
    tx.gasPrice.toString(),
    tx.gasLimit.toString(),
    tx.data || ''
  ].join('|');
  
  return sha256(data).toString('hex');
}
```

### Wallet Encryption

```typescript
/**
 * Encrypt wallet with password (AES-256-GCM)
 */
function encryptWallet(
  wallet: Wallet,
  password: string
): EncryptedWallet {
  // Generate salt for PBKDF2
  const salt = crypto.randomBytes(32);
  
  // Derive encryption key from password
  const key = crypto.pbkdf2Sync(
    password,
    salt,
    100000, // 100k iterations
    32, // 256 bits
    'sha256'
  );
  
  // Generate IV for AES-GCM
  const iv = crypto.randomBytes(12);
  
  // Encrypt private key
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(wallet.privateKey, 'hex'),
    cipher.final()
  ]);
  
  // Get authentication tag
  const authTag = cipher.getAuthTag();
  
  return {
    version: '1.0',
    crypto: {
      cipher: 'aes-256-gcm',
      ciphertext: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      authTag: authTag.toString('hex')
    },
    address: wallet.address,
    metadata: {
      createdAt: Date.now()
    }
  };
}

/**
 * Decrypt wallet with password
 */
function decryptWallet(
  encrypted: EncryptedWallet,
  password: string
): Wallet {
  // Derive key from password and salt
  const key = crypto.pbkdf2Sync(
    password,
    Buffer.from(encrypted.crypto.salt, 'hex'),
    100000,
    32,
    'sha256'
  );
  
  // Decrypt private key
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(encrypted.crypto.iv, 'hex')
  );
  
  decipher.setAuthTag(
    Buffer.from(encrypted.crypto.authTag, 'hex')
  );
  
  const decrypted = Buffer.concat([
    decipher.update(
      Buffer.from(encrypted.crypto.ciphertext, 'hex')
    ),
    decipher.final()
  ]);
  
  const privateKey = decrypted.toString('hex');
  
  // Reconstruct wallet
  return reconstructWallet(privateKey);
}
```

---

## 📜 SMART CONTRACT EXECUTION

### STARW VM Execution

```typescript
/**
 * Execute smart contract in STARW VM
 */
async function executeContract(
  contractAddress: string,
  method: string,
  params: any[],
  gas: number
): Promise<ExecutionResult> {
  // Load contract bytecode
  const contract = await loadContract(contractAddress);
  
  // Initialize WASM module
  const module = await WebAssembly.compile(contract.bytecode);
  const instance = await WebAssembly.instantiate(module, {
    env: {
      // Blockchain API
      getBalance: (addr: string) => getBalance(addr),
      transfer: (to: string, amount: number) => transfer(to, amount),
      emit: (event: string, data: any) => emitEvent(event, data),
      
      // Gas metering
      useGas: (amount: number) => {
        gas -= amount;
        if (gas < 0) throw new Error('Out of gas');
      }
    }
  });
  
  // Execute contract method
  try {
    const result = instance.exports[method](...params);
    
    return {
      success: true,
      result,
      gasUsed: initialGas - gas
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      gasUsed: initialGas // Burn all gas on error
    };
  }
}
```

### Gas Metering

```typescript
/**
 * Calculate gas cost for WASM instruction
 */
function getInstructionGasCost(opcode: number): number {
  const gasCosts = {
    // Arithmetic
    0x6a: 3,  // i32.add
    0x6b: 3,  // i32.sub
    0x6c: 5,  // i32.mul
    0x6d: 10, // i32.div
    
    // Memory
    0x28: 3,  // i32.load
    0x36: 3,  // i32.store
    0x3f: 1,  // memory.size
    0x40: 500, // memory.grow (expensive)
    
    // Control flow
    0x04: 1,  // if
    0x05: 1,  // else
    0x0c: 10, // br (jump)
    0x10: 100, // call
    
    // Default
    default: 1
  };
  
  return gasCosts[opcode] || gasCosts.default;
}
```

---

## 💎 TOKEN ECONOMICS LOGIC

### CCOS Reward Distribution

```typescript
/**
 * Distribute CCOS rewards for financial transactions
 */
function distributeCCOSReward(
  tx: Transaction,
  state: LedgerState
): void {
  // Only for financial-public-transaction type
  if (tx.type !== 'financial-public-transaction') return;
  
  // Minimum transaction value: 100 STR
  if (tx.value < 100) return;
  
  // Random reward percentage: 2.5% - 10%
  const rewardPercent = Math.random() * (10 - 2.5) + 2.5;
  const ccosAmount = tx.value * (rewardPercent / 100);
  
  // Mint CCOS to sender
  if (!state.balances[tx.from]) {
    state.balances[tx.from] = {};
  }
  state.balances[tx.from]['CCOS'] = 
    (state.balances[tx.from]['CCOS'] || 0) + ccosAmount;
  
  // Update total CCOS supply
  state.tokenSupply['CCOS'] += ccosAmount;
  
  // Log reward distribution
  console.log(`💰 CCOS Reward: ${ccosAmount} CCOS (${rewardPercent.toFixed(2)}%) to ${tx.from}`);
  
  // Emit event
  emitEvent('CCOSRewardDistributed', {
    recipient: tx.from,
    amount: ccosAmount,
    percentage: rewardPercent,
    txHash: tx.hash
  });
}
```

### ARSS Storage Rewards

```typescript
/**
 * Calculate and distribute ARSS rewards for storage
 */
function distributeARSSRewards(): void {
  const commitments = getStorageCommitments();
  
  for (const commitment of commitments) {
    // Verify storage is still active
    if (!validateStorageCommitment(commitment)) {
      continue;
    }
    
    // Calculate daily reward
    const dailyReward = (commitment.storageGB / 10) * 10; // 10 ARSS per 10GB
    
    // Mint ARSS
    mintToken(commitment.provider, 'ARSS', dailyReward);
    
    // Update commitment
    commitment.lastRewardDate = Date.now();
    commitment.totalRewarded += dailyReward;
  }
}

/**
 * Validate storage commitment is still active
 */
function validateStorageCommitment(
  commitment: StorageCommitment
): boolean {
  // Check if commitment expired
  if (Date.now() > commitment.expiresAt) {
    return false;
  }
  
  // Verify storage is still available (proof-of-storage)
  const proof = generateStorageProof(commitment.id);
  return verifyStorageProof(proof, commitment.merkleRoot);
}
```

### wSTR Wrapping Logic

```typescript
/**
 * Calculate wSTR value including domain holdings
 */
function calculateWSTRValue(address: string): number {
  // Base STR balance
  const strBalance = getBalance(address, 'STR');
  
  // Get user's domains
  const domains = getDomainsByOwner(address);
  
  // Calculate domain value
  const domainValue = domains.reduce((total, domain) => {
    return total + (domain.marketPrice || 0);
  }, 0);
  
  // wSTR = STR + domain_value
  return strBalance + domainValue;
}

/**
 * Wrap STR to wSTR
 */
function wrapSTR(address: string, amount: number): void {
  // Lock STR
  transfer(address, LOCK_CONTRACT, amount, 'STR');
  
  // Mint equivalent wSTR
  mintToken(address, 'wSTR', amount);
  
  // Update wrapping record
  recordWrapping(address, amount, 'wrap');
}

/**
 * Unwrap wSTR to STR
 */
function unwrapSTR(address: string, amount: number): void {
  // Burn wSTR
  burnToken(address, 'wSTR', amount);
  
  // Unlock and return STR
  transfer(LOCK_CONTRACT, address, amount, 'STR');
  
  // Update wrapping record
  recordWrapping(address, amount, 'unwrap');
}
```

---

## 🌐 NETWORK PROTOCOLS

### Peer Discovery

```typescript
/**
 * Discover peers via DHT (Distributed Hash Table)
 */
async function discoverPeers(): Promise<Peer[]> {
  const peers: Peer[] = [];
  
  // 1. Query bootstrap nodes
  const bootstrapNodes = [
    'node1.stratus.network:1313',
    'node2.stratus.network:1313',
    'node3.stratus.network:1313'
  ];
  
  for (const node of bootstrapNodes) {
    try {
      const response = await queryNode(node, 'getPeers');
      peers.push(...response.peers);
    } catch (error) {
      console.warn(`Bootstrap node ${node} unreachable`);
    }
  }
  
  // 2. Query existing peers for more peers
  for (const peer of peers.slice(0, 10)) {
    try {
      const response = await queryNode(peer.address, 'getPeers');
      peers.push(...response.peers);
    } catch (error) {
      // Ignore unreachable peers
    }
  }
  
  // 3. Deduplicate and validate
  return deduplicatePeers(peers);
}

/**
 * Gossip protocol for block propagation
 */
function propagateBlock(block: Block): void {
  const peers = getConnectedPeers();
  const targetPeers = Math.min(peers.length, 8); // Fanout: 8
  
  // Select random subset of peers
  const selectedPeers = shuffleArray(peers).slice(0, targetPeers);
  
  for (const peer of selectedPeers) {
    sendBlock(peer, block)
      .catch(error => {
        console.warn(`Failed to send block to ${peer.id}:`, error);
      });
  }
}
```

### Block Synchronization

```typescript
/**
 * Sync blockchain with peers
 */
async function syncBlockchain(): Promise<void> {
  const localHeight = getBlockchainHeight();
  const peers = getConnectedPeers();
  
  // Find peer with highest block
  let maxHeight = localHeight;
  let bestPeer = null;
  
  for (const peer of peers) {
    const peerHeight = await peer.getBlockchainHeight();
    if (peerHeight > maxHeight) {
      maxHeight = peerHeight;
      bestPeer = peer;
    }
  }
  
  if (!bestPeer) {
    console.log('Blockchain is up to date');
    return;
  }
  
  // Download missing blocks
  console.log(`Syncing ${maxHeight - localHeight} blocks from ${bestPeer.id}`);
  
  for (let i = localHeight + 1; i <= maxHeight; i++) {
    const block = await bestPeer.getBlock(i);
    
    // Validate block
    if (validateBlock(block, ledger).valid) {
      addBlock(block);
    } else {
      console.error(`Invalid block received: ${i}`);
      break;
    }
    
    // Progress update
    if (i % 100 === 0) {
      console.log(`Synced ${i}/${maxHeight} blocks`);
    }
  }
}
```

---

## 🔐 SECURITY MECHANISMS

### Rate Limiting

```typescript
/**
 * Token bucket rate limiter
 */
class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  
  isAllowed(key: string, limit: number, window: number): boolean {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, new TokenBucket(limit, window));
    }
    
    const bucket = this.buckets.get(key);
    return bucket.consume();
  }
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private capacity: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  
  consume(): boolean {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    
    return false;
  }
  
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
```

### Anti-Spam Mechanism

```typescript
/**
 * Detect and prevent spam transactions
 */
function detectSpam(address: string): boolean {
  const recentTxs = getRecentTransactions(address, 60000); // Last minute
  
  // Check transaction frequency
  if (recentTxs.length > 100) {
    return true; // Too many transactions
  }
  
  // Check for duplicate transactions
  const duplicates = recentTxs.filter((tx, index) => {
    return recentTxs.findIndex(t => 
      t.to === tx.to && t.value === tx.value
    ) !== index;
  });
  
  if (duplicates.length > 10) {
    return true; // Repetitive transactions
  }
  
  // Check for low-value spam
  const lowValueTxs = recentTxs.filter(tx => tx.value < 0.001);
  if (lowValueTxs.length > 50) {
    return true; // Dust spam
  }
  
  return false;
}
```

### TOTP 2FA

```typescript
/**
 * Generate TOTP secret for 2FA
 */
function generateTOTPSecret(): string {
  return crypto.randomBytes(20).toString('base32');
}

/**
 * Verify TOTP code
 */
function verifyTOTP(secret: string, code: string): boolean {
  const window = 1; // Allow ±30 seconds
  const step = 30; // 30-second intervals
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = -window; i <= window; i++) {
    const time = now + (i * step);
    const expectedCode = generateTOTPCode(secret, time);
    
    if (expectedCode === code) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate TOTP code for given time
 */
function generateTOTPCode(secret: string, time: number): string {
  const counter = Math.floor(time / 30);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));
  
  const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base32'));
  hmac.update(counterBuffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0x0f;
  const code = (
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
}
```

---

## 📊 DATA STRUCTURES

### Block Structure

```typescript
interface Block {
  number: number;              // Block height
  hash: string;                // Block hash (SHA-256)
  previousHash: string;        // Previous block hash
  merkleRoot: string;          // Merkle root of transactions
  timestamp: number;           // Unix timestamp (ms)
  nonce: number;               // Mining nonce
  difficulty: number;          // Mining difficulty
  miner: string;               // Miner address
  ledger: string;              // Ledger name (main, asset, etc.)
  transactions: Transaction[]; // Block transactions
}
```

### Transaction Structure

```typescript
interface Transaction {
  hash: string;          // Transaction hash
  from: string;          // Sender address (ZK13STR)
  to: string;            // Recipient address
  value: number;         // Transaction amount
  token: string;         // Token symbol (STR, CCOS, etc.)
  nonce: number;         // Sender nonce
  gasPrice: number;      // Gas price in wei
  gasLimit: number;      // Gas limit
  gasUsed: number;       // Actual gas used
  data: string;          // Transaction data (hex)
  signature: string;     // ECDSA signature (r+s+v)
  timestamp: number;     // Creation timestamp
  type: string;          // Transaction type
  status: string;        // Status (pending, confirmed, failed)
}
```

### Ledger State

```typescript
interface LedgerState {
  balances: {
    [address: string]: {
      [token: string]: number
    }
  };
  nonces: {
    [address: string]: number
  };
  contracts: {
    [address: string]: Contract
  };
  domains: {
    [name: string]: Domain
  };
  tokenSupply: {
    [token: string]: number
  };
}
```

---

## ⚙️ BUSINESS RULES

### Transaction Rules

1. **Minimum Transaction Value**: 0.000001 STR
2. **Maximum Transaction Size**: 100 KB
3. **Maximum Gas Limit**: 10,000,000
4. **Minimum Gas Price**: 1 gwei
5. **Transaction Expiry**: 24 hours in mempool
6. **Maximum Pending Transactions**: 1000 per address

### Token Rules

1. **STR**:
   - Total Supply: 63,000,000,000 (fixed)
   - Decimals: 18
   - Transferable: Yes
   - Burnable: No

2. **CCOS**:
   - Initial Supply: 63,000,000
   - Maximum Supply: Unlimited (dynamic minting)
   - Reward Range: 2.5% - 10%
   - Trigger: Financial public transactions ≥ 100 STR
   - Transferable: Yes

3. **CCOIN**:
   - Supply: Dynamic (PoE post mining based)
   - Generation: Proof of Existence validation
   - Rate: 0.1-2.0% based on PoE strength
   - Use: Financial core engine, gas optimization, premium features
   - Integration: All ecosystem components
   - Transferable: Yes

4. **ARSS**:
   - Supply: Dynamic (reward-based)
   - Reward Rate: 10 ARSS per 10GB per day
   - Use: Storage incentivization with CCOIN optimization
   - Transferable: Yes

### Wallet Rules

1. **Address Format**: `zk13str_<40-hex>_<4-hex-checksum>`
2. **Mnemonic**: 12 words (BIP39)
3. **Derivation Path**: `m/44'/1313'/0'/0/index`
4. **Auto-Lock Timeout**: 5 minutes (configurable)
5. **Password Requirements**: Minimum 8 characters

### Network Rules

1. **Block Time**: Target 30-60 seconds
2. **Block Size**: Maximum 1 MB
3. **Difficulty Adjustment**: Every 100 blocks
4. **Confirmation Required**: 6 blocks for finality
5. **Maximum Peers**: 50 connections
6. **Bootstrap Nodes**: 3 minimum

---

**Document Version:** 1.0.0  
**Last Updated:** November 10, 2025  
**Maintained By:** Stratus Development Team
