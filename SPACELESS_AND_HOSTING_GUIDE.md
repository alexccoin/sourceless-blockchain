# Sourceless Blockchain - Advanced Features

## 🌐 Spaceless: Web2 Mirror for Web3

**Spaceless** is a Supabase-powered Web2 gateway to the Sourceless blockchain, enabling offchain operations and providing a familiar Web2 interface for Web3 features.

### Features

1. **Cold Wallet Management**
   - Create and sign transactions offline
   - Broadcast pre-signed transactions securely
   - Full transaction history and status tracking

2. **STR.Domains Registry Mirror**
   - Web2 database of all STR.Domains
   - Fast lookup and search
   - Automatic blockchain sync
   - Email-to-wallet linking

3. **Asset Registry**
   - Mirror of all blockchain assets (NFTs, tokens)
   - Rich metadata storage
   - Web2-friendly asset browsing

4. **Blockchain Bridge**
   - Automatic bidirectional sync (Web2 ↔ Web3)
   - Batch sync for efficiency
   - Conflict resolution
   - Real-time sync status

### API Usage

```javascript
// Get Spaceless health status
const health = await window.sourcelessAPI.getSpacelessHealth();
console.log(health); // { supabaseOnline, blockchainOnline, bridgeActive, lastSync }

// Create cold wallet transaction
const result = await window.sourcelessAPI.createColdWalletTx({
  to: 'STR.alice',
  amount: 100,
  memo: 'Payment for services'
});
console.log(result.operationId); // Used to broadcast later

// Broadcast cold wallet transaction
await window.sourcelessAPI.broadcastColdWalletTx(operationId);

// Link email to wallet
await window.sourcelessAPI.linkEmail('user@example.com');

// Import blockchain domain to Spaceless
await window.sourcelessAPI.importDomain('STR.mybusiness');
```

### Configuration

Set environment variables for Supabase:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🖥️ STARW Personal Machine Hosting

**STARW Hosting** allows users to share their disk space with the network and earn **ARSS tokens** (1 ARSS per GB per day).

### How It Works

1. **Create Commitment**
   - Choose storage amount (GB)
   - Set duration (minimum 30 days)
   - Commitment is validated hourly

2. **Earn ARSS Tokens**
   - 1 ARSS token per GB per day
   - Automatic daily distribution
   - Rewards accumulate in your wallet

3. **Storage Validation**
   - Automated hourly checks
   - Ensure storage availability
   - Pause if validation fails

4. **Network Benefits**
   - Decentralized file storage
   - Redundant copies across nodes
   - P2P file distribution

### Reward Calculation

```
Daily Reward = Storage (GB) × 1 ARSS
Monthly Reward = Storage (GB) × 30 ARSS
Yearly Reward = Storage (GB) × 365 ARSS

Example:
- 10 GB = 10 ARSS/day = 300 ARSS/month = 3,650 ARSS/year
- 100 GB = 100 ARSS/day = 3,000 ARSS/month = 36,500 ARSS/year
- 1 TB (1024 GB) = 1,024 ARSS/day = 30,720 ARSS/month = 373,760 ARSS/year
```

### API Usage

```javascript
// Create storage commitment
const result = await window.sourcelessAPI.createHostingCommitment({
  storageGB: 100,
  durationDays: 90 // 90 days (3 months)
});

console.log(result.commitment);
// {
//   id: 'commitment_...',
//   storageGB: 100,
//   dailyReward: 100, // ARSS
//   totalPotential: 9000 // ARSS (100 × 90)
// }

// Get your hosting stats
const stats = await window.sourcelessAPI.getHostingStats();
console.log(stats);
// {
//   totalShared: 100, // GB
//   totalUsed: 25, // GB
//   totalAvailable: 75, // GB
//   dailyReward: 100, // ARSS/day
//   totalEarned: 1500 // Total ARSS earned
// }

// Get network-wide stats
const networkStats = await window.sourcelessAPI.getHostingNetworkStats();
console.log(networkStats);
// {
//   totalNodes: 150,
//   totalStorageGB: 5000,
//   totalFilesHosted: 10000,
//   totalARSSDistributed: 500000
// }

// Cancel commitment (penalty if before 30 days)
await window.sourcelessAPI.cancelHostingCommitment(commitmentId);
```

### Real-time Notifications

```javascript
// Listen for reward distribution
window.sourcelessAPI.onHostingReward((data) => {
  console.log(`Earned ${data.amount} ARSS!`);
  console.log(`Total earned: ${data.totalEarned} ARSS`);
});

// Listen for new commitments
window.sourcelessAPI.onHostingCommitment((commitment) => {
  console.log(`New commitment: ${commitment.storageGB}GB`);
});
```

## 🔗 Integration with IgniteHex.com

The Sourceless blockchain integrates key features from IgniteHex.com:

1. **Web3 Authentication**
   - Wallet-based login
   - Email linking
   - KYC integration

2. **Token Economics**
   - ARSS token for VM hosting
   - STR token for transactions
   - CCOIN for cross-chain operations

3. **Smart Contract Platform**
   - Deploy contracts
   - Execute methods
   - Pay with ARSS for computation

4. **Domain System**
   - STR.Domains (like ENS)
   - Human-readable addresses
   - NFT-based ownership

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Sourceless Blockchain                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Fuel Ledger  │    │ STR.Domains  │    │  STARW VM    │  │
│  │  (STR Fuel)   │    │  (Identity)  │    │   (ARSS)     │  │
│  └───────────────┘    └──────────────┘    └──────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           STARW Personal Machine Hosting              │  │
│  │  • Share storage    • Earn ARSS tokens               │  │
│  │  • 1 ARSS/GB/day    • 30-day minimum                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Spaceless Bridge (Web2 ↔ Web3)           │  │
│  │  • Supabase backend  • Cold wallet                   │  │
│  │  • Auto-sync         • Email linking                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    P2P Network                        │  │
│  │  • BitTorrent-style  • Decentralized storage         │  │
│  │  • File distribution • Node discovery                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### 1. Setup Supabase (Spaceless)

Create tables in Supabase:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  str_domain TEXT,
  email TEXT UNIQUE,
  kyc_status TEXT DEFAULT 'none',
  created_at TIMESTAMP DEFAULT NOW(),
  last_sync TIMESTAMP DEFAULT NOW()
);

-- Domains table
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  owner TEXT NOT NULL,
  metadata JSONB,
  blockchain_tx_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id TEXT UNIQUE NOT NULL,
  owner TEXT NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB,
  blockchain_tx_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cold wallet operations table
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL,
  to_address TEXT,
  from_address TEXT,
  status TEXT DEFAULT 'pending',
  tx_data JSONB,
  blockchain_tx_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Configure Environment

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Storage path for STARW Hosting
STARW_STORAGE_PATH=/path/to/shared/storage
```

### 3. Start Hosting

```javascript
// UI example: Create hosting commitment
const createHosting = async () => {
  const storageGB = parseInt(prompt('Storage to share (GB):'));
  const durationDays = parseInt(prompt('Duration (days, min 30):'));
  
  const result = await window.sourcelessAPI.createHostingCommitment({
    storageGB,
    durationDays
  });
  
  if (result.success) {
    alert(`Commitment created! Daily reward: ${result.commitment.storageGB} ARSS`);
  } else {
    alert(`Error: ${result.error}`);
  }
};
```

## 📈 Monitoring

### Hosting Dashboard

```javascript
setInterval(async () => {
  const stats = await window.sourcelessAPI.getHostingStats();
  
  console.log('=== STARW Hosting Stats ===');
  console.log(`Storage Shared: ${stats.totalShared} GB`);
  console.log(`Storage Used: ${stats.totalUsed} GB`);
  console.log(`Storage Available: ${stats.totalAvailable} GB`);
  console.log(`Daily Reward: ${stats.dailyReward} ARSS`);
  console.log(`Total Earned: ${stats.totalEarned} ARSS`);
}, 60000); // Update every minute
```

### Spaceless Sync Status

```javascript
window.sourcelessAPI.onSpacelessSync((stats) => {
  console.log('=== Spaceless Sync Complete ===');
  console.log(`Domains Synced: ${stats.domainsSynced}`);
  console.log(`Assets Synced: ${stats.assetsSynced}`);
  console.log(`Last Sync: ${stats.lastSync}`);
});
```

## 🔐 Security

1. **Cold Wallet Operations**
   - Private keys never leave user device
   - Transactions signed offline
   - Broadcast only when ready

2. **Storage Validation**
   - Hourly integrity checks
   - Automatic pause on failures
   - Cryptographic proof-of-storage (future)

3. **Supabase Security**
   - Row-level security (RLS)
   - API key rotation
   - Encrypted connections

## 📞 Support

For issues or questions:
- GitHub Issues: [stratus-electron-app/issues](https://github.com/yourusername/stratus-electron-app/issues)
- Documentation: [docs.sourceless.net](https://docs.sourceless.net)
- Community: [discord.gg/sourceless](https://discord.gg/sourceless)
