# Stratus Token Economics - Official Specification

## Overview

The Stratus blockchain uses a multi-token economy with specific distribution mechanics and reward systems.

---

## Pre-Minted Tokens

### 1. **STR (Sourceless)** - Main Network Token

- **Total Supply**: 63,000,000,000 STR (63 billion)
- **Ticker**: STR
- **Type**: Pre-minted at genesis
- **Distribution**:
  - **Market**: 20,790,000,000 STR (33%)
  - **Treasury Pool**: 42,210,000,000 STR (67%)

**Purpose**: Primary fuel for the Sourceless blockchain network.

**Use Cases**:
- Transaction fees
- Gas for smart contracts
- Staking for validators
- Network governance voting
- STR.domain registration

---

### 2. **CCOS (CCOIN Network)** - Financial Network Token

- **Total Supply**: 63,000,000 CCOS (63 million)
- **Ticker**: CCOS
- **Type**: Pre-minted at genesis + dynamic minting
- **Distribution**:
  - **Market**: 20,790,000 CCOS (33%)
  - **Treasury Pool**: 42,210,000 CCOS (67%)

**Purpose**: Powers the CCOIN financial network and IgniteHex platform.

**Use Cases**:
- Compute credits for STARW VM
- Contract deployment fees
- Personal/Business token creation (100 CCOS fee)
- Storage commitments
- Financial transaction rewards

---

## Arguable Tokens (Minted Later)

### 3. **ARSS (Asset Shares)**

- **Initial Supply**: 0 (not pre-minted)
- **Type**: Arguable - minted as needed
- **Purpose**: To be defined and minted after genesis

### 4. **wSTR (Wrapped STR)**

- **Initial Supply**: 0 (not pre-minted)
- **Ticker**: wSTR
- **Type**: Arguable - minted based on formula
- **Formula**: `wSTR Value = STR Value + (Number of STR.domains × Domain Selling Price x)`
- **Purpose**: Wrapped version of STR that captures additional value from domain ecosystem

**Mechanics**:
- Tracks base STR value
- Adds value based on STR.domains marketplace activity
- Domain selling price multiplier (x) to be defined
- Minted dynamically as domains are sold

### 5. **eSTR (Energy Sourceless)**

- **Initial Supply**: 0 (not pre-minted)
- **Ticker**: eSTR
- **Type**: Energy token
- **Purpose**: Energy-based token for network operations
- **Mechanics**: To be defined later

**Potential Use Cases**:
- Computational power credits
- Network energy consumption tracking
- Green energy incentives
- Carbon offset mechanisms

### 6. **$TR (Dollar Sourceless)**

- **Initial Supply**: 0 (not pre-minted)
- **Ticker**: $TR
- **Type**: Stablecoin
- **Peg**: 1:1 parity with USD
- **Purpose**: Stable value token for transactions and savings
- **Mechanics**: To be defined later

**Stablecoin Features**:
- Algorithmic or collateralized stability
- 1 $TR = 1 USD at all times
- Fiat on/off ramps
- DeFi integration for lending/borrowing

---

## CCOS Reward Mechanics

### Automatic Minting on Financial Transactions

**Trigger Event**: Financial public transactions

**Reward Range**:
- **Minimum**: 2.5% of transaction amount
- **Maximum**: 10% of transaction amount

### Calculation Logic

```typescript
// Base reward: 2.5%
let rewardPercent = 2.5;

// Size-based bonus:
// For every 1,000 STR transacted, add 0.5% bonus (up to 10% max)
const sizeBonusSteps = Math.floor(transactionAmount / 1000);
const sizeBonus = Math.min(sizeBonusSteps * 0.5, 7.5); // Max 7.5% bonus
rewardPercent += sizeBonus;

// Cap at maximum 10%
rewardPercent = Math.min(rewardPercent, 10);

// Calculate reward
const rewardAmount = (transactionAmount * rewardPercent) / 100;
```

### Example Rewards

| Transaction Amount | Reward % | CCOS Minted |
|-------------------|----------|-------------|
| 100 STR           | 2.5%     | 2.5 CCOS    |
| 1,000 STR         | 3.0%     | 30 CCOS     |
| 5,000 STR         | 5.0%     | 250 CCOS    |
| 10,000 STR        | 7.5%     | 750 CCOS    |
| 20,000+ STR       | 10.0%    | 2,000+ CCOS |

### Reward Distribution

Newly minted CCOS is distributed using the same ratio as genesis:

- **Treasury Pool**: 67%
- **Market**: 33%

**Example**:
- Transaction: 10,000 STR
- Reward: 7.5% = 750 CCOS minted
  - Treasury receives: 502.5 CCOS (67%)
  - Market receives: 247.5 CCOS (33%)

---

## Smart Contract Implementation

**File**: `src/main/contracts/CCOSRewardContract.ts`

### Key Functions

```typescript
class CCOSRewardContract {
    // Process a financial transaction and calculate reward
    processTransaction(tx: FinancialTransaction): {
        success: boolean;
        rewardAmount: number;
        rewardPercent: number;
    }
    
    // Distribute minted CCOS
    distributeReward(rewardAmount: number): {
        toTreasury: number;  // 67%
        toMarket: number;    // 33%
    }
    
    // Get statistics
    getStats(): {
        totalRewarded: number;
        transactionsProcessed: number;
        averageReward: number;
    }
}
```

### Usage Example

```typescript
const rewardContract = new CCOSRewardContract({
    enabled: true,
    minRewardPercent: 2.5,
    maxRewardPercent: 10,
    treasuryAddress: 'STR.treasury',
    marketAddress: 'STR.market'
});

// On public financial transaction
const result = rewardContract.processTransaction({
    txId: 'tx_123',
    from: 'wallet_a',
    to: 'wallet_b',
    amount: 5000,
    isPublic: true,
    timestamp: Date.now()
});

if (result.success) {
    const distribution = rewardContract.distributeReward(result.rewardAmount);
    
    // Mint to treasury (67%)
    ledgerManager.ccosLedger.mint('STR.treasury', distribution.toTreasury);
    
    // Mint to market (33%)
    ledgerManager.ccosLedger.mint('STR.market', distribution.toMarket);
}
```

---

## Genesis Configuration

```typescript
const genesisConfig: GenesisConfig = {
    networkName: 'Sourceless Mainnet',
    chainId: 1313,
    
    initialSupply: {
        STR: 63_000_000_000,   // 63 billion
        CCOS: 63_000_000,      // 63 million
        ARSS: 0,               // Minted later
        CCOIN: 0,              // Minted later
    },
    
    distribution: {
        market: 0.33,          // 33%
        treasury: 0.67,        // 67%
    },
    
    ccosRewardMechanics: {
        enabled: true,
        minRewardPercent: 2.5,
        maxRewardPercent: 10,
        triggerEvent: 'financial-public-transaction',
    },
    
    networkParams: {
        blockTime: 1,          // 1 second blocks
        difficulty: 4,
        miningReward: 100,
        targetTPMS: 1_000_000, // 1M TPMS
        maxBlockSize: 10_000_000, // 10MB
    }
};
```

---

## Token Summary Table

| Token  | Ticker | Pre-Minted     | Market (33%)      | Treasury (67%)    | Dynamic Minting | Purpose                           |
|--------|--------|----------------|-------------------|-------------------|-----------------|-----------------------------------|
| STR    | STR    | 63,000,000,000 | 20,790,000,000    | 42,210,000,000    | No              | Main network fuel                 |
| CCOS   | CCOS   | 63,000,000     | 20,790,000        | 42,210,000        | Yes (2.5-10%)   | Financial network token           |
| ARSS   | ARSS   | 0              | TBD               | TBD               | TBD             | Asset shares                      |
| wSTR   | wSTR   | 0              | TBD               | TBD               | Formula-based   | Wrapped STR + domain value        |
| eSTR   | eSTR   | 0              | TBD               | TBD               | TBD             | Energy token                      |
| $TR    | $TR    | 0              | TBD               | TBD               | Algorithmic     | USD stablecoin (1:1 peg)          |

---

## Key Wallets

### Genesis Wallets

1. **STR.market**
   - Role: Market distribution wallet
   - Receives: 33% of all pre-minted tokens + 33% of rewards
   - Validator: No

2. **STR.treasury**
   - Role: Treasury pool wallet
   - Receives: 67% of all pre-minted tokens + 67% of rewards
   - Validator: Yes

3. **STR.foundation** (optional)
   - Role: Foundation operations
   - Validator: Yes

4. **STR.rewards** (optional)
   - Role: Staking and validator rewards
   - Validator: Yes

5. **STR.ecosystem** (optional)
   - Role: Ecosystem development fund
   - Validator: No

---

## Deflationary Mechanisms

### Transaction Fees

- Base fee: 0.01 STR per transaction
- Contract execution: Variable gas fees
- 50% of fees burned (deflationary)
- 50% to validator rewards

### Token Burns

- Failed transactions: Partial fee burn
- Spam prevention: Escalating fees
- Governance-approved burns from treasury

---

## Inflationary Mechanisms

### CCOS Rewards

- **Primary Source**: Financial public transactions
- **Rate**: 2.5% - 10% per transaction
- **Cap**: No hard cap (dynamic supply)
- **Control**: Governance can disable/adjust mechanics

### Block Rewards (STR)

- **Per Block**: 100 STR (subject to governance)
- **Halvings**: Potential future implementation
- **Validator Distribution**: Proportional to stake

---

## Governance

### Token Holders Can Vote On:

1. **CCOS Reward Parameters**
   - Adjust min/max reward percentages
   - Enable/disable reward mechanics
   - Change distribution ratios

2. **Block Rewards**
   - Adjust mining rewards
   - Implement halvings
   - Change validator incentives

3. **Arguable Token Policies**
   - Define ARSS economics
   - Define CCOIN economics
   - Set minting schedules

4. **Treasury Management**
   - Allocate funds for development
   - Ecosystem grants
   - Strategic partnerships

---

## Future Considerations

### ARSS (Arguable Tokens)

**Potential Use Cases**:
- Staking derivative tokens
- Liquidity pool tokens
- Cross-chain wrapped assets
- Governance sub-tokens

### wSTR (Wrapped STR)

**Formula**: `wSTR Value = STR Value + (Number of STR.domains × Domain Selling Price x)`

**Use Cases**:
- Enhanced value capture from domain marketplace
- Trading instrument with domain-backed value
- Liquidity provision for domain markets
- Collateral for loans (higher value than pure STR)

**Example Calculation**:
```
Assumptions:
- STR price: $1.00
- User holds: 1,000 STR
- STR.domains owned: 5 domains
- Domain selling price multiplier (x): $50 per domain

wSTR Value = (1,000 × $1.00) + (5 × $50)
wSTR Value = $1,000 + $250 = $1,250

Therefore: 1,000 wSTR tokens worth $1,250
```

### eSTR (Energy Sourceless)

**Potential Use Cases**:
- Payment for computational resources
- STARW VM execution credits
- Mining/validation energy costs
- Green energy certificates
- Carbon offset trading

### $TR (Dollar Sourceless Stablecoin)

**Stability Mechanisms**:
- Collateralized reserve (STR, BTC, ETH, USDC)
- Algorithmic supply adjustment
- Arbitrage opportunities to maintain peg
- Liquidation engine for under-collateralized positions

**Use Cases**:
- Stable medium of exchange
- Savings and yield farming
- Cross-border payments
- DeFi protocols (lending, borrowing)
- Merchant payments and invoicing

---

## Compliance & Security

### KYC/AML

- Genesis wallets: KYC verified
- Public transactions: Optional KYC
- Large transactions: May require verification
- Exchange integration: Full KYC support

### Auditing

- All reward minting: On-chain verification
- Treasury movements: Multi-sig required
- Smart contract upgrades: Timelock + governance

### Transparency

- Real-time supply tracking
- Public treasury dashboard
- Reward mechanics open-source
- Blockchain explorer with token metrics

---

## Technical Implementation

### Files Modified/Created

1. **Genesis.ts** - Updated token economics
2. **CCOSRewardContract.ts** - Reward mechanics smart contract
3. **GENESIS_IMPLEMENTATION.md** - Updated documentation

### Generate Genesis with Correct Economics

```bash
npm run genesis
```

**Output**:
```
🌍 CREATING GENESIS BLOCKCHAIN STATE
=====================================

📋 Network: Sourceless Mainnet
🔗 Chain ID: 1313

💰 Pre-Minted Token Supply:
   STR (Sourceless): 63,000,000,000 tokens
   CCOS (CCOIN Network): 63,000,000 tokens

📊 Distribution Model:
   Market: 33%
   Treasury Pool: 67%

⚙️  CCOS Reward Mechanics:
   Enabled: true
   Min Reward: 2.5%
   Max Reward: 10%
   Trigger: financial-public-transaction
```

---

## Summary

✅ **Pre-Minted**: 63B STR + 63M CCOS  
✅ **Distribution**: 33% market, 67% treasury  
✅ **Dynamic Minting**: CCOS rewards (2.5-10%)  
✅ **Arguable Tokens**: ARSS & CCOIN (TBD)  
✅ **Smart Contract**: CCOSRewardContract implemented  
✅ **Governance**: Full control over parameters  

**The Stratus token economy is now correctly configured for mainnet launch!** 🚀
