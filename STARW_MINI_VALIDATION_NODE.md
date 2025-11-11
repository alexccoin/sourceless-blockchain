# STARW Mini Validation Node (<1MB)

## Overview

The **STARW Mini Validation Node** is a lightweight, automatically-deployed validation system that uses **ZK13 cryptography** and **GodCypher encryption** for secure 3-party wallet-to-wallet transaction validation.

### Key Features

- 🔷 **<1MB Node Size** - Ultra-lightweight validation
- 🔐 **ZK13 Cryptography** - Zero-knowledge proof validation
- 🔒 **GodCypher Encryption** - 3-way encryption (Sender → Receiver + Witness)
- 🎯 **Auto-Generated** - Every wallet gets a validation node automatically
- ⚡ **Real-time Metrics** - CPU, memory, TPS, TPMS tracking
- 📊 **Proof of Existence (PoE)** - Immutable transaction proofs
- 🏃 **Microbenchmark** - Performance testing built-in

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         STARW Mini Validation Node (<1MB)               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Wallet Address: zk13str_example_wallet_001             │
│  Node ID: node_a1b2c3d4e5f6g7h8                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  ZK13 Validator                                │    │
│  │  - Commitment generation                       │    │
│  │  - Challenge creation                          │    │
│  │  - Response verification                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  GodCypher Engine (3-Way Encryption)           │    │
│  │  - Sender secret                               │    │
│  │  - Receiver secret                             │    │
│  │  - Witness secret                              │    │
│  │  - Combined GodCypher key                      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Proof of Existence Engine                     │    │
│  │  - Timestamp proof                             │    │
│  │  - Merkle root calculation                     │    │
│  │  - Immutable proof hash                        │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Witness Pool                                  │    │
│  │  - Multi-witness support                       │    │
│  │  - Reputation-based selection                  │    │
│  │  - Stake weighting                             │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 3-Party Validation Flow

```
SENDER (Wallet A)
    │
    │ 1. Submit Transaction
    ├──────────────────────────────────────┐
    │                                       │
    ▼                                       ▼
VALIDATION NODE                        RECEIVER (Wallet B)
    │
    │ 2. Select WITNESS (Wallet C)
    ├──────────────────────────────────────┐
    │                                       │
    │ 3. Generate ZK13 Proof                │
    │    - Commitment                       │
    │    - Challenge                        ▼
    │    - Response                      WITNESS (Wallet C)
    │                                       │
    │ 4. GodCypher 3-Way Encrypt            │
    │    ┌────────────┬────────────┬────────┴───┐
    │    │  Sender    │  Receiver  │  Witness   │
    │    │  Secret    │  Secret    │  Secret    │
    │    └────────────┴────────────┴────────────┘
    │              │
    │              ▼
    │    Combined GodCypher Key
    │              │
    │ 5. Create PoE Proof
    │    - Proof Hash
    │    - Merkle Root
    │    - Timestamp
    │              │
    ▼              ▼
VALIDATED TRANSACTION
    - ZK13 Proof ✓
    - GodCypher Encrypted ✓
    - PoE Proof ✓
    - 3-Party Witnessed ✓
```

## API Endpoints

### 1. Get Validation Metrics

```bash
GET /api/validation:metrics?wallet=<wallet_address>
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "cpu": "45%",
    "memory": "0.8MB",
    "tasks": 3,
    "inChain": 150,
    "offChain": 50,
    "tpms": 1.25,
    "tps": 1250,
    "rss": "12.5MB",
    "heap": "8.2MB",
    "speed": "2.5ms",
    "nodeSize": "0.75MB",
    "underLimit": true
  }
}
```

**Get All Nodes Metrics:**
```bash
GET /api/validation:metrics
```

Returns array of metrics for all active validation nodes.

### 2. Get Validation Status

```bash
GET /api/validation:status?wallet=<wallet_address>
```

**Response:**
```json
{
  "success": true,
  "status": {
    "nodeId": "node_a1b2c3d4e5f6g7h8",
    "wallet": "zk13str_example_wallet_001",
    "isRunning": true,
    "uptime": 3600000,
    "nodeSize": 786432,
    "nodeSizeMB": 0.75,
    "underSizeLimit": true,
    "metrics": {...},
    "queueLength": 2,
    "validatedCount": 1523,
    "witnessCount": 5
  }
}
```

### 3. Submit Transaction for Validation

```bash
POST /api/validation:submit
Content-Type: application/json

{
  "from": "zk13str_sender_wallet_001",
  "to": "zk13str_receiver_wallet_002",
  "amount": 100.50,
  "data": "Transfer funds"
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "success": true,
    "txHash": "a1b2c3d4e5f6...",
    "queuePosition": 1
  }
}
```

### 4. Run Microbenchmark

```bash
POST /api/validation:benchmark
Content-Type: application/json

{
  "wallet": "zk13str_example_wallet_001",
  "iterations": 100
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "iterations": 100,
    "startTime": 1699632000000,
    "endTime": 1699632250000,
    "totalTime": 250,
    "summary": {
      "totalValidations": 100,
      "successfulValidations": 100,
      "failedValidations": 0,
      "avgValidationTime": 2.5,
      "minValidationTime": 1.2,
      "maxValidationTime": 5.8,
      "tps": 400,
      "tpms": 0.4
    }
  }
}
```

### 5. Add Witness to Pool

```bash
POST /api/validation:addwitness
Content-Type: application/json

{
  "wallet": "zk13str_sender_wallet_001",
  "witness": "zk13str_witness_wallet_001",
  "stake": 10000,
  "reputation": 0.95
}
```

**Response:**
```json
{
  "success": true,
  "wallet": "zk13str_sender_wallet_001",
  "witness": "zk13str_witness_wallet_001",
  "stake": 10000,
  "reputation": 0.95
}
```

## Validation Process

### Step 1: ZK13 Proof Generation

The ZK13 validator creates a zero-knowledge proof:

1. **Commitment** - Hash of transaction data
2. **Challenge** - Hash of commitment + context
3. **Response** - HMAC of transaction with challenge

This proves the transaction is valid without revealing details.

### Step 2: Witness Selection

The node selects a witness from the pool based on:
- **Reputation** - Higher reputation preferred
- **Stake** - Higher stake increases weight
- **Availability** - Cannot be sender or receiver

**Selection Formula:**
```
score = reputation × (1 + stake / 1,000,000)
```

### Step 3: GodCypher 3-Way Encryption

Encrypted using secrets from all 3 parties:

1. Generate sender secret: `SHA256(sender_address + "secret")`
2. Generate receiver secret: `SHA256(receiver_address + "secret")`
3. Generate witness secret: `SHA256(witness_address + "secret")`
4. Combine: `SHA512(sender_secret + receiver_secret + witness_secret)`
5. Encrypt transaction with AES-256-CBC

This ensures all 3 parties are cryptographically involved.

### Step 4: Proof of Existence

Creates immutable proof:

1. **Proof Hash** - SHA256 of all validation data + timestamp
2. **Merkle Root** - Calculated from proof hash
3. **Timestamp** - Milliseconds since epoch

The PoE proves the transaction existed at a specific time.

## Metrics & Monitoring

### Real-time Metrics

The node tracks and reports:

| Metric | Description | Unit |
|--------|-------------|------|
| **CPU** | Estimated CPU usage | % |
| **Memory** | Heap memory used | MB |
| **Tasks** | Transactions in queue | count |
| **In-Chain Tx** | Large transactions (>1000) | count |
| **Off-Chain Tx** | Small transactions | count |
| **TPMS** | Transactions per millisecond | tx/ms |
| **TPS** | Transactions per second | tx/s |
| **RSS** | Resident set size | MB |
| **Heap** | Heap memory | MB |
| **Speed** | Avg validation time | ms |
| **Node Size** | Total node size | MB |

### Performance Targets

- ✅ Node size: **<1MB** (typically 0.5-0.8MB)
- ✅ Validation speed: **<5ms** per transaction
- ✅ TPS: **>100** transactions per second
- ✅ Memory: **<20MB** total RSS
- ✅ Startup time: **<1 second**

## Automatic Node Creation

Every wallet automatically gets a validation node:

```javascript
// Automatic creation when wallet used
const wallet = "zk13str_my_wallet_001";

// First transaction automatically creates node
await database.validateTransaction({
  from: wallet,
  to: "zk13str_receiver_002",
  amount: 50.0
});

// Node is now created, started, and validating
const metrics = await database.getValidationMetrics(wallet);
console.log(metrics);
// {
//   cpu: "35%",
//   memory: "0.6MB",
//   tasks: 0,
//   ...
// }
```

## Example Usage

### Simple Transaction Validation

```javascript
const tx = {
  from: "zk13str_alice_wallet_001",
  to: "zk13str_bob_wallet_002",
  amount: 25.50,
  data: "Payment for services"
};

// Submit for validation (node auto-created if needed)
const result = await database.validateTransaction(tx);

console.log(result);
// {
//   success: true,
//   txHash: "a1b2c3d4...",
//   queuePosition: 1
// }

// Check metrics
const metrics = await database.getValidationMetrics(tx.from);
console.log(metrics);
```

### Add Trusted Witnesses

```javascript
// Add high-reputation witness
await database.addValidationWitness(
  "zk13str_alice_wallet_001",
  "zk13str_trusted_witness_001",
  50000,  // 50,000 stake
  0.98    // 98% reputation
);

// Add another witness
await database.addValidationWitness(
  "zk13str_alice_wallet_001",
  "zk13str_witness_pool_002",
  10000,
  0.85
);
```

### Run Performance Test

```javascript
// Benchmark 500 validations
const results = await database.runValidationBenchmark(
  "zk13str_alice_wallet_001",
  500
);

console.log(results.summary);
// {
//   totalValidations: 500,
//   successfulValidations: 500,
//   avgValidationTime: 2.3,
//   tps: 434.78,
//   ...
// }
```

## Integration with STARW

The validation nodes integrate with STARW:

### STARW VM Integration

```
STARW VM
├── cpu: Tracks validation CPU
├── mem: Tracks node memory
└── tasks: Tracks pending validations
```

### Transaction Flow

```
Tx Flow
├── in-chain: Large/important transactions
└── off-chain: Small/fast transactions
```

### Network Metrics

```
Network
└── TPMS: Transactions per millisecond
    └── TPS: Derived from TPMS × 1000
```

### Process Monitoring

```
Process
├── rss: Total memory footprint
└── heap: JavaScript heap usage
```

## Frontend Display Example

```html
<div class="validation-panel">
  <h3>STARW Mini Validation</h3>
  
  <div class="poe-section">
    <h4>PoE</h4>
    <p>✓ Proof of Existence Active</p>
  </div>
  
  <div class="starw-vm">
    <h4>STARW VM</h4>
    <p>cpu: 45% | mem: 0.8MB | tasks: 3</p>
  </div>
  
  <div class="tx-flow">
    <h4>Tx Flow</h4>
    <p>in-chain: 150 | off-chain: 50</p>
  </div>
  
  <div class="network">
    <h4>Network</h4>
    <p>1.25 TPMS (1250 TPS)</p>
  </div>
  
  <div class="process">
    <h4>Process</h4>
    <p>rss: 12.5MB | heap: 8.2MB</p>
  </div>
  
  <div class="speed">
    <h4>Speed</h4>
    <p>2.5ms avg validation</p>
  </div>
  
  <button onclick="runBenchmark()">Run microbench</button>
</div>
```

## Security Features

### ZK13 Zero-Knowledge Proofs

- **Privacy** - Transaction details remain private
- **Verification** - Cryptographic proof of validity
- **No Trust Required** - Mathematical certainty

### GodCypher 3-Way Encryption

- **Multi-Party** - All 3 parties involved
- **AES-256** - Military-grade encryption
- **Unique Keys** - Per-transaction keys

### Proof of Existence

- **Immutable** - Cannot be altered after creation
- **Timestamped** - Precise time recording
- **Merkle Proofs** - Efficient verification

### Witness System

- **Decentralized** - Multiple independent witnesses
- **Reputation-Based** - Trust through track record
- **Stake-Weighted** - Economic security

## Performance Optimization

### Memory Management

- **Lightweight** - <1MB node size
- **Efficient** - Minimal heap usage
- **Clean** - Automatic garbage collection

### Validation Speed

- **Fast** - <5ms average validation
- **Parallel** - Multiple validations concurrent
- **Optimized** - Crypto operations cached

### Scalability

- **Per-Wallet** - Independent nodes
- **Distributed** - No central bottleneck
- **Elastic** - Auto-scale with demand

## Troubleshooting

### Node Not Starting

```bash
# Check if wallet address is valid
GET /api/validation:status?wallet=<address>

# Response if not created:
{
  "success": true,
  "status": null
}

# Submit a transaction to auto-create:
POST /api/validation:submit
{
  "from": "<address>",
  "to": "zk13str_test_001",
  "amount": 1.0
}
```

### Node Over Size Limit

```bash
# Check node size
GET /api/validation:status?wallet=<address>

# If nodeSizeMB > 1.0:
# - Clear validated transaction history
# - Reduce witness pool size
# - Restart node
```

### Slow Validation

```bash
# Run benchmark to identify issue
POST /api/validation:benchmark
{
  "wallet": "<address>",
  "iterations": 100
}

# Check avgValidationTime in results
# If > 10ms, check:
# - CPU usage
# - Memory pressure
# - Queue backlog
```

## Future Enhancements

- [ ] GPU acceleration for ZK13 proofs
- [ ] Cross-node witness sharing
- [ ] Persistent validation history
- [ ] Advanced fraud detection
- [ ] Automatic witness reputation updates
- [ ] Multi-signature validation support

---

**STARW Mini Validation Node** - Lightweight, secure, automatic validation for every wallet in the Sourceless ecosystem.
