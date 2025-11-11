# Arguable Tokens Specification - wSTR, eSTR, and $TR

## Overview

This document defines the three arguable tokens in the Stratus ecosystem that will be minted after genesis: **wSTR** (Wrapped STR), **eSTR** (Energy Sourceless), and **$TR** (Dollar Sourceless).

---

## 1. wSTR (Wrapped STR)

### Token Details

- **Name**: Wrapped Sourceless
- **Ticker**: wSTR
- **Type**: Wrapped token with enhanced value
- **Initial Supply**: 0 (minted on demand)
- **Standard**: ERC-20 compatible

### Value Formula

```
wSTR Value = STR Value + (Number of STR.domains × Domain Selling Price Multiplier x)
```

Where:
- **STR Value**: Base value of STR tokens held
- **Number of STR.domains**: Count of domains owned by the holder
- **Domain Selling Price Multiplier (x)**: Variable multiplier based on domain marketplace activity (to be defined)

### Example Calculation

**Scenario 1: Basic Holder**
```
Holdings:
- 10,000 STR
- 0 STR.domains

STR Price: $1.50
Domain Multiplier (x): $100

wSTR Value = (10,000 × $1.50) + (0 × $100)
wSTR Value = $15,000 + $0
wSTR Value = $15,000

Result: 10,000 wSTR = $15,000 (same as STR)
```

**Scenario 2: Domain Holder**
```
Holdings:
- 10,000 STR
- 10 STR.domains

STR Price: $1.50
Domain Multiplier (x): $100

wSTR Value = (10,000 × $1.50) + (10 × $100)
wSTR Value = $15,000 + $1,000
wSTR Value = $16,000

Result: 10,000 wSTR = $16,000 (+6.67% premium)
```

**Scenario 3: Heavy Domain Investor**
```
Holdings:
- 50,000 STR
- 100 STR.domains

STR Price: $2.00
Domain Multiplier (x): $150

wSTR Value = (50,000 × $2.00) + (100 × $150)
wSTR Value = $100,000 + $15,000
wSTR Value = $115,000

Result: 50,000 wSTR = $115,000 (+15% premium)
```

### Minting Mechanics

1. **Wrapping Process**:
   ```typescript
   // User locks STR + domains
   wSTRContract.wrap(strAmount, domainIds[]);
   
   // Contract calculates value
   const baseValue = strAmount * strPrice;
   const domainValue = domainIds.length * domainMultiplier;
   const totalValue = baseValue + domainValue;
   
   // Mint wSTR
   wSTRContract.mint(user, strAmount, totalValue);
   ```

2. **Unwrapping Process**:
   ```typescript
   // User burns wSTR
   wSTRContract.unwrap(wstrAmount);
   
   // Contract returns STR + releases domains
   wSTRContract.releaseAssets(user, strAmount, domainIds[]);
   ```

3. **Dynamic Revaluation**:
   - wSTR value updates as domain multiplier changes
   - Oracle system tracks domain marketplace prices
   - Rebalancing occurs during wrap/unwrap events

### Use Cases

1. **Enhanced Collateral**:
   - Use wSTR as higher-value collateral in lending protocols
   - Premium value from domain holdings increases borrowing capacity

2. **Domain-Backed Trading**:
   - Trade domain value without selling individual domains
   - Liquidity for illiquid domain assets

3. **Yield Optimization**:
   - Earn yield on both STR holdings and domain appreciation
   - Staking rewards + domain value growth

4. **Unified Asset**:
   - Single token representing diverse holdings (STR + domains)
   - Simplified portfolio management

### Smart Contract Interface

```typescript
interface IWrappedSTR {
    // Wrap STR + domains into wSTR
    wrap(strAmount: number, domainIds: string[]): Promise<number>;
    
    // Unwrap wSTR back to STR + domains
    unwrap(wstrAmount: number): Promise<{ str: number; domains: string[] }>;
    
    // Get current value of wSTR holdings
    getValue(holder: string): Promise<number>;
    
    // Get domain multiplier
    getDomainMultiplier(): Promise<number>;
    
    // Update domain multiplier (governance)
    setDomainMultiplier(newMultiplier: number): Promise<void>;
    
    // Get domain count for holder
    getDomainCount(holder: string): Promise<number>;
}
```

---

## 2. eSTR (Energy Sourceless)

### Token Details

- **Name**: Energy Sourceless
- **Ticker**: eSTR
- **Type**: Energy/utility token
- **Initial Supply**: 0 (minted based on energy metrics)
- **Purpose**: Represents computational and energy resources in the network

### Minting Mechanics (To Be Defined)

**Potential Approaches**:

1. **Proof of Computation**:
   - Mint eSTR for validators based on block production
   - Reward computational work (STARW VM execution)
   - Energy consumption tracking

2. **Green Energy Incentives**:
   - Bonus eSTR for renewable energy usage
   - Carbon offset certificates redeemable for eSTR
   - Environmental impact scoring

3. **Network Resource Pricing**:
   - Gas fees paid in eSTR for heavy computations
   - Storage costs denominated in eSTR
   - Bandwidth consumption tracking

### Example Use Cases

```typescript
// Example 1: Mining Rewards
const miningReward = calculateMiningReward({
    blocksProduced: 100,
    energySource: 'renewable', // 20% bonus
    hashrate: 1000000
});
// Result: Mint 120 eSTR (100 base + 20 green bonus)

// Example 2: Contract Execution
const executionCost = calculateExecutionCost({
    gasUsed: 500000,
    computeTime: 5.5, // seconds
    memoryUsed: 256   // MB
});
// Result: Charge 25 eSTR

// Example 3: Storage Commitment
const storageCost = calculateStorageCost({
    sizeGB: 100,
    duration: 30, // days
    redundancy: 3 // copies
});
// Result: Charge 150 eSTR/month
```

### Smart Contract Interface (Proposed)

```typescript
interface IEnergySTR {
    // Mint eSTR for energy contribution
    mintForEnergy(recipient: string, amount: number, energyType: string): Promise<void>;
    
    // Burn eSTR for resource consumption
    burnForResources(amount: number, resourceType: string): Promise<void>;
    
    // Get energy metrics for address
    getEnergyMetrics(address: string): Promise<EnergyMetrics>;
    
    // Calculate cost for operation
    calculateCost(operation: Operation): Promise<number>;
}
```

---

## 3. $TR (Dollar Sourceless)

### Token Details

- **Name**: Dollar Sourceless
- **Ticker**: $TR
- **Type**: Stablecoin
- **Peg**: 1 $TR = 1 USD (1:1 parity)
- **Initial Supply**: 0 (minted based on collateral)
- **Standard**: ERC-20 stablecoin

### Stability Mechanism (To Be Defined)

**Option 1: Collateralized Stablecoin**

```typescript
// Mint $TR by depositing collateral
const collateralRequired = {
    STR: 1.5,    // 150% collateralization
    ETH: 1.5,
    BTC: 1.3,
    USDC: 1.05   // Lower for stable assets
};

// Example: Mint 1000 $TR
const collateral = {
    STR: 1500,  // $1,500 in STR
    // Or
    USDC: 1050  // $1,050 in USDC
};

mint$TR(collateral, 1000);
```

**Option 2: Algorithmic Stablecoin**

```typescript
// Expand supply when price > $1
if ($TRPrice > 1.00) {
    const mintAmount = calculateExpansion($TRPrice);
    mint$TR(treasuryAddress, mintAmount);
}

// Contract supply when price < $1
if ($TRPrice < 1.00) {
    const burnAmount = calculateContraction($TRPrice);
    buyback$TR(burnAmount);
}
```

**Option 3: Hybrid Model**

- Base collateral (60% USDC, 30% STR, 10% other)
- Algorithmic adjustment for fine-tuning
- Emergency reserves for crisis management

### Liquidation System

```typescript
interface Vault {
    collateralAmount: number;
    collateralType: string;
    $TRDebt: number;
    collateralizationRatio: number;
}

// Liquidation trigger
if (vault.collateralizationRatio < 1.3) {
    liquidateVault(vault);
    // Sell collateral, burn $TR, penalty to user
}
```

### Use Cases

1. **Stable Transactions**:
   ```typescript
   // Pay for services in stable value
   payInvoice(merchant, 500); // Always $500 USD
   ```

2. **Savings and Yield**:
   ```typescript
   // Earn interest on $TR deposits
   stake$TR(10000); // 5% APY = $500/year
   ```

3. **Cross-Border Payments**:
   ```typescript
   // Send $TR globally without forex risk
   sendGlobal(recipient, 1000); // Exactly $1,000 arrives
   ```

4. **DeFi Integration**:
   ```typescript
   // Borrow against STR collateral
   borrow$TR(collateral_STR, 5000); // Borrow $5,000
   ```

### Smart Contract Interface (Proposed)

```typescript
interface IDollarSTR {
    // Mint $TR with collateral
    mint(collateralType: string, collateralAmount: number, $TRAmount: number): Promise<void>;
    
    // Redeem collateral by burning $TR
    redeem($TRAmount: number): Promise<Collateral>;
    
    // Get current $TR price (should always be ~1.00)
    getPrice(): Promise<number>;
    
    // Get collateralization ratio
    getCollateralizationRatio(vault: string): Promise<number>;
    
    // Liquidate undercollateralized vault
    liquidate(vault: string): Promise<void>;
    
    // Get stability reserves
    getReserves(): Promise<Reserves>;
}
```

---

## Implementation Roadmap

### Phase 1: wSTR (Q1 2026)

1. ✅ Define value formula
2. ⏳ Build oracle for domain prices
3. ⏳ Deploy wSTR smart contract
4. ⏳ Create wrap/unwrap UI
5. ⏳ Integrate with DEX for trading

### Phase 2: eSTR (Q2 2026)

1. ✅ Define energy metrics
2. ⏳ Build energy tracking system
3. ⏳ Deploy eSTR smart contract
4. ⏳ Integrate with STARW VM
5. ⏳ Launch green energy incentives

### Phase 3: $TR (Q3 2026)

1. ✅ Define stability mechanism
2. ⏳ Audit collateral reserves
3. ⏳ Deploy $TR smart contract
4. ⏳ Launch liquidation engine
5. ⏳ Integrate with DeFi protocols
6. ⏳ Obtain regulatory approval

---

## Governance

All three tokens will be governed by STR holders:

1. **wSTR Governance**:
   - Adjust domain multiplier (x)
   - Approve oracle changes
   - Modify wrap/unwrap fees

2. **eSTR Governance**:
   - Set energy pricing formulas
   - Approve green energy bonuses
   - Adjust minting/burning rates

3. **$TR Governance**:
   - Adjust collateralization ratios
   - Modify stability parameters
   - Manage reserve composition
   - Emergency interventions

---

## Risk Management

### wSTR Risks

- **Domain Value Volatility**: Mitigated by dynamic multiplier updates
- **Oracle Manipulation**: Prevented by multi-oracle consensus
- **Liquidity Risks**: Managed through unwrap time-locks

### eSTR Risks

- **Energy Price Volatility**: Smoothed by moving averages
- **Gaming Incentives**: Prevented by proof-of-work verification
- **Supply Inflation**: Controlled by governance caps

### $TR Risks

- **De-pegging**: Prevented by robust collateral and arbitrage
- **Bank Runs**: Mitigated by emergency reserves and circuit breakers
- **Regulatory**: Addressed through compliance and audits

---

## Summary

| Token | Purpose                  | Minting Trigger              | Key Feature                  |
|-------|--------------------------|------------------------------|------------------------------|
| wSTR  | Enhanced value wrapper   | User wraps STR + domains     | Domain-backed value formula  |
| eSTR  | Energy/compute credits   | Network energy contribution  | Green energy incentives      |
| $TR   | USD stablecoin           | Collateral deposit           | 1:1 USD peg                  |

**All three tokens expand the Stratus ecosystem utility and create new value capture mechanisms!** 🚀
