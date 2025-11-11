# 🌐 STRATUS BLOCKCHAIN - API & INTEGRATION DOCUMENTATION

**Version:** 1.0.0  
**API Version:** v1  
**Base URL:** `http://localhost:3002`  
**Date:** November 10, 2025

---

## 📋 TABLE OF CONTENTS

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [REST API Endpoints](#rest-api-endpoints)
4. [WebSocket API](#websocket-api)
5. [SDK Integration](#sdk-integration)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Code Examples](#code-examples)

---

## 🔍 API OVERVIEW

### Base URLs

```
Production:   https://api.stratus.network
Development:  http://localhost:3002
Testnet:      https://testnet-api.stratus.network
```

### Supported Protocols

- **HTTP/HTTPS**: REST API for queries and transactions
- **WebSocket**: Real-time event subscriptions
- **GraphQL**: Advanced queries (planned)

### Response Format

All API responses follow this structure:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
}
```

**Success Response Example:**
```json
{
  "success": true,
  "data": {
    "blockNumber": 1001,
    "hash": "0x1234..."
  },
  "timestamp": 1731258000000
}
```

**Error Response Example:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Account balance too low",
    "details": {
      "required": "100.5",
      "available": "50.0"
    }
  },
  "timestamp": 1731258000000
}
```

---

## 🔐 AUTHENTICATION

### API Key Authentication

**Header Format:**
```
Authorization: Bearer <API_KEY>
```

**Obtaining an API Key:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "developer@example.com",
  "organization": "My Company"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "sk_live_abcd1234...",
    "expiresAt": 1762794000000
  }
}
```

### Wallet Signature Authentication

For transaction submission, sign requests with wallet private key:

```typescript
const signature = signMessage(requestBody, privateKey);

headers: {
  'X-Signature': signature,
  'X-Address': walletAddress
}
```

---

## 🔌 REST API ENDPOINTS

### Blockchain Information

#### Get Blockchain Stats

```http
GET /api/blockchain/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "network": "Sourceless Mainnet",
    "chainId": 1313,
    "genesisHash": "0x796aa237...",
    "totalBlocks": 6006,
    "totalTransactions": 60060,
    "strSupply": "63000000000",
    "ccosSupply": "63000000",
    "activePeers": 4,
    "ledgers": {
      "main": {
        "name": "Main Ledger",
        "blocks": 1001,
        "transactions": 15015
      },
      "asset": {
        "name": "Asset Ledger",
        "blocks": 1001,
        "transactions": 8008
      },
      "contract": {
        "name": "Contract Ledger",
        "blocks": 1001,
        "transactions": 12012
      },
      "governance": {
        "name": "Governance Ledger",
        "blocks": 1001,
        "transactions": 5005
      },
      "ccoin": {
        "name": "CCOIN Ledger",
        "blocks": 1001,
        "transactions": 9009
      },
      "ccos": {
        "name": "CCOS Ledger",
        "blocks": 1001,
        "transactions": 11011
      }
    }
  }
}
```

#### Get Block by Number

```http
GET /api/block/:number
```

**Parameters:**
- `number` (path) - Block number (integer)

**Query Options:**
- `ledger` (optional) - Ledger name (main, asset, contract, etc.)

**Example:**
```http
GET /api/block/1000?ledger=main
```

**Response:**
```json
{
  "success": true,
  "data": {
    "number": 1000,
    "hash": "0x0000ae6fed706618...",
    "previousHash": "0x00002e48299c022f...",
    "merkleRoot": "0x7a3b2c1d...",
    "timestamp": 1731257000000,
    "nonce": 45892,
    "difficulty": 4,
    "miner": "zk13str_748dcb4d83e60f5ab0f7ab...",
    "ledger": "main",
    "transactions": [
      {
        "hash": "0xabc123...",
        "from": "zk13str_...",
        "to": "zk13str_...",
        "value": "100.5",
        "token": "STR"
      }
    ],
    "txCount": 15
  }
}
```

#### Get Block by Hash

```http
GET /api/block/hash/:hash
```

**Parameters:**
- `hash` (path) - Block hash (hex string)

---

### Wallet Operations

#### Create New Wallet

```http
POST /api/wallet/create
Content-Type: application/json

{
  "password": "SecurePassword123!",
  "label": "My Wallet" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "zk13str_354410dec43b4bea203aa25cd23c594a42e14790_2578",
    "mnemonic": "abandon ability able about above absent absorb abstract absurd abuse access accident",
    "encryptedWallet": {
      "version": "1.0",
      "crypto": {
        "cipher": "aes-256-gcm",
        "ciphertext": "...",
        "iv": "...",
        "salt": "...",
        "authTag": "..."
      }
    }
  }
}
```

⚠️ **Security Note:** Store the mnemonic securely. It cannot be recovered if lost.

#### Import Wallet from Mnemonic

```http
POST /api/wallet/import
Content-Type: application/json

{
  "mnemonic": "abandon ability able about above...",
  "password": "SecurePassword123!",
  "index": 0 // optional, default: 0
}
```

#### Import Wallet from Private Key

```http
POST /api/wallet/import/private-key
Content-Type: application/json

{
  "privateKey": "0x1234567890abcdef...",
  "password": "SecurePassword123!"
}
```

#### Get Wallet Info

```http
GET /api/wallet/:address
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "zk13str_354410dec43b4bea...",
    "balances": {
      "STR": "1000.5",
      "CCOS": "50.25",
      "ARSS": "100.0",
      "wSTR": "1050.5",
      "eSTR": "0",
      "$TR": "0"
    },
    "nonce": 42,
    "domain": "STR.system",
    "kycStatus": "Verified",
    "createdAt": 1731257000000
  }
}
```

#### Get Balance

```http
GET /api/balance/:address
```

**Query Options:**
- `token` (optional) - Specific token (STR, CCOS, etc.)

**Example:**
```http
GET /api/balance/zk13str_354410dec43b4bea...?token=STR
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "zk13str_354410dec43b4bea...",
    "token": "STR",
    "balance": "1000.5",
    "locked": "0",
    "available": "1000.5"
  }
}
```

---

### Transaction Operations

#### Submit Transaction

```http
POST /api/transaction/submit
Content-Type: application/json
X-Signature: <transaction_signature>
X-Address: <sender_address>

{
  "from": "zk13str_354410dec43b4bea...",
  "to": "zk13str_796dedf3ebe2ceb5...",
  "value": "100.5",
  "token": "STR",
  "nonce": 42,
  "gasPrice": "1000000000",
  "gasLimit": "21000",
  "data": "0x" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123def456...",
    "status": "pending",
    "estimatedConfirmation": 1731258060000
  }
}
```

#### Get Transaction by Hash

```http
GET /api/transaction/:hash
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hash": "0xabc123def456...",
    "from": "zk13str_354410dec43b4bea...",
    "to": "zk13str_796dedf3ebe2ceb5...",
    "value": "100.5",
    "token": "STR",
    "nonce": 42,
    "gasPrice": "1000000000",
    "gasUsed": "21000",
    "blockNumber": 1001,
    "timestamp": 1731258000000,
    "status": "confirmed",
    "confirmations": 6
  }
}
```

#### Get Transaction History

```http
GET /api/transactions/:address
```

**Query Options:**
- `limit` (default: 50, max: 100) - Number of transactions
- `offset` (default: 0) - Pagination offset
- `token` (optional) - Filter by token
- `startDate` (optional) - ISO timestamp
- `endDate` (optional) - ISO timestamp

**Example:**
```http
GET /api/transactions/zk13str_354410dec43b4bea...?limit=20&token=STR
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "hash": "0xabc123...",
        "from": "zk13str_...",
        "to": "zk13str_...",
        "value": "100.5",
        "timestamp": 1731258000000
      }
    ],
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

#### Estimate Gas

```http
POST /api/transaction/estimate-gas
Content-Type: application/json

{
  "from": "zk13str_354410dec43b4bea...",
  "to": "zk13str_796dedf3ebe2ceb5...",
  "value": "100.5",
  "token": "STR",
  "data": "0x" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "estimatedGas": "21000",
    "gasPrice": "1000000000",
    "totalCost": "0.000021" // in STR
  }
}
```

---

### Smart Contract Operations

#### Deploy Contract

```http
POST /api/contract/deploy
Content-Type: application/json
X-Signature: <signature>
X-Address: <deployer_address>

{
  "bytecode": "0x608060405234801561001057600080fd5b50...",
  "abi": [...],
  "constructorArgs": [],
  "gasLimit": "5000000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "zk13str_9c8b7a6d5e4f3c2b...",
    "txHash": "0xdef456abc123...",
    "deployer": "zk13str_354410dec43b4bea...",
    "blockNumber": 1002
  }
}
```

#### Call Contract Function (Read)

```http
POST /api/contract/call
Content-Type: application/json

{
  "contractAddress": "zk13str_9c8b7a6d5e4f3c2b...",
  "method": "balanceOf",
  "params": ["zk13str_354410dec43b4bea..."],
  "abi": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": "1000500000000000000000",
    "decoded": "1000.5"
  }
}
```

#### Execute Contract Function (Write)

```http
POST /api/contract/execute
Content-Type: application/json
X-Signature: <signature>
X-Address: <caller_address>

{
  "contractAddress": "zk13str_9c8b7a6d5e4f3c2b...",
  "method": "transfer",
  "params": ["zk13str_796dedf3ebe2ceb5...", "100500000000000000000"],
  "abi": [...],
  "gasLimit": "100000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0xghi789jkl012...",
    "gasUsed": "52341",
    "events": [
      {
        "name": "Transfer",
        "args": {
          "from": "zk13str_354410dec43b4bea...",
          "to": "zk13str_796dedf3ebe2ceb5...",
          "value": "100.5"
        }
      }
    ]
  }
}
```

---

### Domain Operations (STR.Domain)

#### Register Domain

```http
POST /api/domain/register
Content-Type: application/json
X-Signature: <signature>
X-Address: <owner_address>

{
  "name": "my-company",
  "owner": "zk13str_354410dec43b4bea...",
  "duration": 365, // days
  "metadata": {
    "description": "My Company Official Domain",
    "website": "https://mycompany.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "domain": "my-company.str",
    "owner": "zk13str_354410dec43b4bea...",
    "registeredAt": 1731258000000,
    "expiresAt": 1762794000000,
    "txHash": "0xmno345pqr678..."
  }
}
```

#### Query Domain

```http
GET /api/domain/:name
```

**Example:**
```http
GET /api/domain/my-company.str
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "my-company.str",
    "owner": "zk13str_354410dec43b4bea...",
    "registeredAt": 1731258000000,
    "expiresAt": 1762794000000,
    "metadata": {
      "description": "My Company Official Domain",
      "website": "https://mycompany.com"
    },
    "marketPrice": "1000.0"
  }
}
```

#### Transfer Domain

```http
POST /api/domain/transfer
Content-Type: application/json
X-Signature: <signature>
X-Address: <current_owner>

{
  "domain": "my-company.str",
  "newOwner": "zk13str_796dedf3ebe2ceb5..."
}
```

---

### Network Information

#### Get Peer List

```http
GET /api/network/peers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connectedPeers": 4,
    "peers": [
      {
        "id": "peer_abc123",
        "address": "192.168.1.100:1313",
        "latency": 45,
        "version": "v0.14"
      }
    ]
  }
}
```

#### Get Mining Info

```http
GET /api/mining/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "difficulty": 4,
    "hashRate": "1.5 MH/s",
    "nextDifficultyAdjustment": 1001,
    "estimatedBlockTime": 45,
    "pendingTransactions": 23
  }
}
```

---

## 🔌 WEBSOCKET API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3002/ws');

ws.on('open', () => {
  console.log('Connected to Stratus WebSocket');
  
  // Subscribe to events
  ws.send(JSON.stringify({
    action: 'subscribe',
    events: ['newBlock', 'newTransaction', 'balanceUpdate']
  }));
});
```

### Event Types

#### New Block Event

```json
{
  "event": "newBlock",
  "data": {
    "number": 1002,
    "hash": "0x0000ae6fed706618...",
    "ledger": "main",
    "timestamp": 1731258060000,
    "txCount": 15
  }
}
```

#### New Transaction Event

```json
{
  "event": "newTransaction",
  "data": {
    "hash": "0xabc123def456...",
    "from": "zk13str_354410dec43b4bea...",
    "to": "zk13str_796dedf3ebe2ceb5...",
    "value": "100.5",
    "token": "STR"
  }
}
```

#### Balance Update Event

```json
{
  "event": "balanceUpdate",
  "data": {
    "address": "zk13str_354410dec43b4bea...",
    "token": "STR",
    "oldBalance": "1000.5",
    "newBalance": "900.0",
    "change": "-100.5"
  }
}
```

#### CCOS Reward Event

```json
{
  "event": "ccosReward",
  "data": {
    "recipient": "zk13str_354410dec43b4bea...",
    "amount": "5.25",
    "percentage": 5.25,
    "txHash": "0xstu901vwx234..."
  }
}
```

### Subscription Management

```javascript
// Subscribe to specific address
ws.send(JSON.stringify({
  action: 'subscribe',
  address: 'zk13str_354410dec43b4bea...',
  events: ['balanceUpdate', 'newTransaction']
}));

// Unsubscribe
ws.send(JSON.stringify({
  action: 'unsubscribe',
  address: 'zk13str_354410dec43b4bea...'
}));
```

---

## 📦 SDK INTEGRATION

### JavaScript/TypeScript SDK

#### Installation

```bash
npm install @stratus/wallet-core
npm install @stratus/blockchain-sdk
```

#### Usage Example

```typescript
import { SecureWalletCore } from '@stratus/wallet-core';
import { StratusAPIClient } from '@stratus/wallet-core';

// Initialize API client
const client = new StratusAPIClient('http://localhost:3002');

// Create wallet
const walletCore = new SecureWalletCore();
const wallet = await walletCore.createWallet('MySecurePassword123!');

console.log('Address:', wallet.address);
console.log('Mnemonic:', wallet.mnemonic);

// Unlock wallet
await walletCore.unlock('MySecurePassword123!');

// Get balances
const balances = await client.getBalances(wallet.address);
console.log('STR Balance:', balances.STR);

// Create and sign transaction
const tx = await walletCore.createTransaction({
  to: 'zk13str_796dedf3ebe2ceb5...',
  value: 100.5,
  token: 'STR'
});

const signedTx = await walletCore.signTransaction(tx);

// Submit transaction
const result = await client.submitTransaction(signedTx);
console.log('Transaction Hash:', result.txHash);
```

### Python SDK (Planned)

```python
from stratus import StratusClient, Wallet

# Initialize client
client = StratusClient('http://localhost:3002')

# Create wallet
wallet = Wallet.create('MySecurePassword123!')
print(f'Address: {wallet.address}')

# Get balances
balances = client.get_balances(wallet.address)
print(f'STR Balance: {balances["STR"]}')

# Send transaction
tx_hash = client.send_transaction(
    wallet=wallet,
    to='zk13str_796dedf3ebe2ceb5...',
    value=100.5,
    token='STR'
)
print(f'Transaction: {tx_hash}')
```

---

## ⚠️ ERROR HANDLING

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_ADDRESS` | Address format invalid | 400 |
| `INVALID_SIGNATURE` | Signature verification failed | 401 |
| `INSUFFICIENT_BALANCE` | Not enough tokens | 400 |
| `INVALID_NONCE` | Nonce mismatch | 400 |
| `GAS_TOO_LOW` | Gas limit insufficient | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `NETWORK_ERROR` | Blockchain network issue | 503 |
| `CONTRACT_EXECUTION_FAILED` | Smart contract error | 400 |
| `TRANSACTION_REVERTED` | Transaction failed | 400 |
| `INTERNAL_ERROR` | Server error | 500 |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Account balance too low for transaction",
    "details": {
      "required": "100.5 STR",
      "available": "50.0 STR",
      "shortfall": "50.5 STR"
    }
  },
  "timestamp": 1731258000000
}
```

### Retry Logic

Implement exponential backoff for transient errors:

```typescript
async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await sleep(delay);
    }
  }
}

// Usage
const result = await retryRequest(() => 
  client.submitTransaction(signedTx)
);
```

---

## 🚦 RATE LIMITING

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/blockchain/stats` | 100 requests | 1 minute |
| `/api/wallet/create` | 5 requests | 1 hour |
| `/api/transaction/submit` | 20 requests | 1 minute |
| `/api/contract/deploy` | 10 requests | 1 hour |
| `/api/balance/:address` | 60 requests | 1 minute |

### Rate Limit Headers

Response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1731258060
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 45 // seconds
    }
  },
  "timestamp": 1731258000000
}
```

---

## 💻 CODE EXAMPLES

### Complete Transaction Flow

```typescript
import { SecureWalletCore, StratusAPIClient } from '@stratus/wallet-core';

async function sendSTR(
  toAddress: string,
  amount: number
): Promise<string> {
  // 1. Initialize
  const walletCore = new SecureWalletCore();
  const apiClient = new StratusAPIClient('http://localhost:3002');
  
  // 2. Load encrypted wallet
  const encryptedWallet = loadFromStorage();
  await walletCore.loadEncryptedWallet(encryptedWallet);
  
  // 3. Unlock wallet
  const password = await promptPassword();
  await walletCore.unlock(password);
  
  // 4. Get current nonce
  const nonce = await apiClient.getNonce(walletCore.getAddress());
  
  // 5. Estimate gas
  const gasEstimate = await apiClient.estimateGas({
    from: walletCore.getAddress(),
    to: toAddress,
    value: amount,
    token: 'STR'
  });
  
  // 6. Create transaction
  const tx = {
    from: walletCore.getAddress(),
    to: toAddress,
    value: amount,
    token: 'STR',
    nonce,
    gasPrice: gasEstimate.gasPrice,
    gasLimit: gasEstimate.estimatedGas
  };
  
  // 7. Sign transaction
  const signedTx = await walletCore.signTransaction(tx);
  
  // 8. Submit transaction
  const result = await apiClient.submitTransaction(signedTx);
  
  // 9. Wait for confirmation
  const confirmed = await apiClient.waitForConfirmation(
    result.txHash,
    6 // confirmations
  );
  
  console.log('Transaction confirmed:', confirmed);
  
  return result.txHash;
}
```

### WebSocket Real-Time Balance Monitor

```typescript
import WebSocket from 'ws';

class BalanceMonitor {
  private ws: WebSocket;
  
  constructor(private address: string) {
    this.ws = new WebSocket('ws://localhost:3002/ws');
    this.setupListeners();
  }
  
  private setupListeners(): void {
    this.ws.on('open', () => {
      console.log('Connected to Stratus WebSocket');
      
      // Subscribe to balance updates
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        address: this.address,
        events: ['balanceUpdate', 'newTransaction']
      }));
    });
    
    this.ws.on('message', (data: string) => {
      const message = JSON.parse(data);
      
      if (message.event === 'balanceUpdate') {
        this.onBalanceUpdate(message.data);
      } else if (message.event === 'newTransaction') {
        this.onNewTransaction(message.data);
      }
    });
    
    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    this.ws.on('close', () => {
      console.log('WebSocket disconnected. Reconnecting...');
      setTimeout(() => this.reconnect(), 5000);
    });
  }
  
  private onBalanceUpdate(data: any): void {
    console.log(`Balance Update:
      Token: ${data.token}
      Old Balance: ${data.oldBalance}
      New Balance: ${data.newBalance}
      Change: ${data.change}
    `);
  }
  
  private onNewTransaction(data: any): void {
    console.log(`New Transaction:
      Hash: ${data.hash}
      From: ${data.from}
      To: ${data.to}
      Value: ${data.value} ${data.token}
    `);
  }
  
  private reconnect(): void {
    this.ws = new WebSocket('ws://localhost:3002/ws');
    this.setupListeners();
  }
  
  public close(): void {
    this.ws.close();
  }
}

// Usage
const monitor = new BalanceMonitor('zk13str_354410dec43b4bea...');
```

### Smart Contract Interaction

```typescript
import { StratusAPIClient } from '@stratus/wallet-core';

class TokenContract {
  constructor(
    private client: StratusAPIClient,
    private contractAddress: string,
    private abi: any[]
  ) {}
  
  // Read function (no gas required)
  async balanceOf(address: string): Promise<string> {
    const result = await this.client.callContract({
      contractAddress: this.contractAddress,
      method: 'balanceOf',
      params: [address],
      abi: this.abi
    });
    
    return result.decoded;
  }
  
  // Write function (requires gas)
  async transfer(
    wallet: SecureWalletCore,
    to: string,
    amount: string
  ): Promise<string> {
    const tx = await this.client.executeContract({
      contractAddress: this.contractAddress,
      method: 'transfer',
      params: [to, amount],
      abi: this.abi,
      gasLimit: '100000'
    });
    
    return tx.txHash;
  }
  
  // Listen for Transfer events
  onTransfer(callback: (from: string, to: string, amount: string) => void): void {
    const ws = new WebSocket('ws://localhost:3002/ws');
    
    ws.on('message', (data: string) => {
      const message = JSON.parse(data);
      
      if (message.event === 'contractEvent' && 
          message.data.contract === this.contractAddress &&
          message.data.eventName === 'Transfer') {
        
        const { from, to, value } = message.data.args;
        callback(from, to, value);
      }
    });
  }
}

// Usage
const tokenContract = new TokenContract(
  apiClient,
  'zk13str_9c8b7a6d5e4f3c2b...',
  tokenABI
);

const balance = await tokenContract.balanceOf('zk13str_354410dec43b4bea...');
console.log('Token Balance:', balance);

tokenContract.onTransfer((from, to, amount) => {
  console.log(`Transfer: ${from} -> ${to}: ${amount}`);
});
```

---

## 🔗 Additional Resources

### Documentation Links

- **Architecture Guide**: [FULL_SYSTEM_ARCHITECTURE.md](./FULL_SYSTEM_ARCHITECTURE.md)
- **Business Logic**: [COMPLETE_BUSINESS_LOGIC.md](./COMPLETE_BUSINESS_LOGIC.md)
- **Security Guide**: [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)
- **Deployment Guide**: [WALLET_DEPLOYMENT_GUIDE.md](./WALLET_DEPLOYMENT_GUIDE.md)

### Community & Support

- **GitHub**: https://github.com/stratus-blockchain
- **Documentation**: https://docs.stratus.network
- **Discord**: https://discord.gg/stratus
- **Twitter**: @StratusBlockchain

### API Status

Check real-time API status: https://status.stratus.network

---

**Document Version:** 1.0.0  
**Last Updated:** November 10, 2025  
**Maintained By:** Stratus Development Team

---

*For technical support or API questions, contact: api-support@stratus.network*
