# 🚀 SOURCELESS BLOCKCHAIN - QUICK START GUIDE

## ✅ Server is Running!

Your Sourceless Blockchain production server is now live at:
**http://localhost:3002**

---

## 📊 Explore the Blockchain

### 1. **Health Check**
```
http://localhost:3002/health
```
Verify server status, database connection, and blockchain initialization.

### 2. **Blockchain Statistics**
```
http://localhost:3002/api/blockchain/stats
```
View complete blockchain stats:
- Genesis hash
- Total blocks across all 6 ledgers
- STR & CCOS token supply
- Network metrics (TPS, TPMS)
- Active peers

### 3. **Network Stats**
```
http://localhost:3002/api/network:stats
```
See network-wide statistics and token distribution.

### 4. **Ledger Stats**
```
http://localhost:3002/api/ledger:stats
```
Get detailed stats for all 6 multi-ledgers:
- Main (STR Transfers)
- Asset (STR.Domains & NFTs)
- Contract (Smart Contracts)
- Governance (DAO & Voting)
- CCOIN (Cross-Chain Bridge)
- CCOS (IgniteHex Platform)

---

## 🔷 STARW Mini Validation Node (NEW!)

### Auto-Create Validation Node
Submit a transaction to automatically create a <1MB validation node:

```powershell
$tx = @{
    from = "zk13str_alice_wallet_001"
    to = "zk13str_bob_wallet_002"
    amount = 100.50
    data = "My first validated transaction"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3002/api/validation:submit" `
    -Method POST `
    -Body $tx `
    -ContentType "application/json" `
    -UseBasicParsing
```

### Check Validation Node Status
```
http://localhost:3002/api/validation:status?wallet=zk13str_alice_wallet_001
```

### Get Validation Metrics
```
http://localhost:3002/api/validation:metrics?wallet=zk13str_alice_wallet_001
```

Shows:
- CPU usage
- Memory (node size <1MB!)
- TPS/TPMS (transactions per second/millisecond)
- Validation speed
- Queue length

### Run Microbenchmark
```powershell
$bench = @{
    wallet = "zk13str_alice_wallet_001"
    iterations = 50
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3002/api/validation:benchmark" `
    -Method POST `
    -Body $bench `
    -ContentType "application/json" `
    -UseBasicParsing
```

### Add Witness to Pool
```powershell
$witness = @{
    wallet = "zk13str_alice_wallet_001"
    witness = "zk13str_trusted_witness_001"
    stake = 50000
    reputation = 0.98
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3002/api/validation:addwitness" `
    -Method POST `
    -Body $witness `
    -ContentType "application/json" `
    -UseBasicParsing
```

---

## 🆔 STR.DOMAIN Identity System

### Register Public Identity
```powershell
$identity = @{
    domain = "STR.alice"
    walletAddress = "zk13str_alice_wallet_001"
    publicProfile = @{
        displayName = "Alice Smith"
        bio = "Blockchain developer"
        avatar = "https://example.com/alice.png"
        website = "https://alice.example.com"
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3002/api/identity:register" `
    -Method POST `
    -Body $identity `
    -ContentType "application/json" `
    -UseBasicParsing
```

### Resolve Domain
```
http://localhost:3002/api/identity:resolve?domain=STR.alice
```

### List All Public Identities
```
http://localhost:3002/api/identity:list
```

---

## 💰 Wallet Operations

### Get Wallet Info
```
http://localhost:3002/api/wallet:get
```

### Get Balances
```
http://localhost:3002/api/wallet:balances
```

### Create New Wallet
```powershell
Invoke-WebRequest -Uri "http://localhost:3002/api/wallet:create" `
    -Method POST `
    -UseBasicParsing
```

---

## 🌐 STARW Website Hosting

### Host a Website on Blockchain
```powershell
$website = @{
    domain = "STR.alice"
    htmlContent = "<html><body><h1>Hello from the blockchain!</h1></body></html>"
    title = "Alice's Blockchain Site"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3002/api/website:host" `
    -Method POST `
    -Body $website `
    -ContentType "application/json" `
    -UseBasicParsing
```

### Access Hosted Website
```
http://localhost:3002/api/website:view?domain=STR.alice
```

---

## 📈 Block Explorer

### Recent Blocks
```
http://localhost:3002/api/explorer:blocks?limit=10
```

### Recent Transactions
```
http://localhost:3002/api/explorer:transactions?limit=20
```

### Search
```
http://localhost:3002/api/explorer:search?query=zk13str
```

---

## 🔧 All Available Endpoints

### Health & Stats
- `GET /health` - Server health check
- `GET /api/blockchain/stats` - Complete blockchain statistics
- `GET /api/network:stats` - Network statistics
- `GET /api/ledger:stats` - Multi-ledger statistics

### Wallet
- `GET /api/wallet:get` - Get wallet info
- `GET /api/wallet:balances` - Get all balances
- `POST /api/wallet:create` - Create new wallet

### Identity (STR.DOMAIN)
- `POST /api/identity:register` - Register public identity
- `GET /api/identity:resolve?domain=STR.xxx` - Resolve domain
- `GET /api/identity:list` - List all identities

### Validation Node
- `POST /api/validation:submit` - Submit transaction (creates node)
- `GET /api/validation:status?wallet=xxx` - Node status
- `GET /api/validation:metrics?wallet=xxx` - Node metrics
- `POST /api/validation:benchmark` - Run benchmark
- `POST /api/validation:addwitness` - Add witness

### STARW Hosting
- `POST /api/website:host` - Host website on blockchain
- `GET /api/website:view?domain=STR.xxx` - View hosted site

### Explorer
- `GET /api/explorer:blocks?limit=10` - Recent blocks
- `GET /api/explorer:transactions?limit=20` - Recent transactions
- `GET /api/explorer:search?query=xxx` - Search blockchain

---

## 🎯 Quick Test Commands

### Test Everything in One Go:
```powershell
# 1. Check health
Write-Host "`n=== HEALTH CHECK ===" -ForegroundColor Cyan
(Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json

# 2. Get blockchain stats
Write-Host "`n=== BLOCKCHAIN STATS ===" -ForegroundColor Cyan
(Invoke-WebRequest -Uri "http://localhost:3002/api/blockchain/stats" -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# 3. Submit validation transaction
Write-Host "`n=== SUBMIT TRANSACTION ===" -ForegroundColor Cyan
$tx = @{ from = "zk13str_test_001"; to = "zk13str_test_002"; amount = 50 } | ConvertTo-Json
(Invoke-WebRequest -Uri "http://localhost:3002/api/validation:submit" -Method POST -Body $tx -ContentType "application/json" -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json

# 4. Check validation metrics
Write-Host "`n=== VALIDATION METRICS ===" -ForegroundColor Cyan
Start-Sleep -Seconds 1
(Invoke-WebRequest -Uri "http://localhost:3002/api/validation:metrics?wallet=zk13str_test_001" -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json

# 5. Get wallet info
Write-Host "`n=== WALLET INFO ===" -ForegroundColor Cyan
(Invoke-WebRequest -Uri "http://localhost:3002/api/wallet:get" -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json
```

---

## 📱 Open in Browser

Simply paste these URLs in your browser:

1. **Health**: http://localhost:3002/health
2. **Blockchain Stats**: http://localhost:3002/api/blockchain/stats
3. **Network Stats**: http://localhost:3002/api/network:stats
4. **Ledger Stats**: http://localhost:3002/api/ledger:stats
5. **Explorer Blocks**: http://localhost:3002/api/explorer:blocks?limit=10

---

## 🎨 Features Summary

✅ **6 Multi-Ledger Blockchain** (Main, Asset, Contract, Governance, CCOIN, CCOS)  
✅ **63B STR Tokens** pre-minted and distributed  
✅ **63M CCOS Tokens** for IgniteHex platform  
✅ **STR.DOMAIN** public identity system (STR.alice format)  
✅ **STARW Mini Validation** (<1MB nodes with ZK13 + GodCypher)  
✅ **STARW Website Hosting** on blockchain  
✅ **Block Explorer** with search  
✅ **Pure HOSTLESS** database (no PostgreSQL needed)  
✅ **P2P Network** with dynamic peer simulation  
✅ **1,000+ blocks** per ledger (6,000 total)  

---

## 🔥 NEW: STARW Mini Validation Features

- **<1MB Node Size** - Lightweight validation per wallet
- **ZK13 Cryptography** - Zero-knowledge proofs
- **GodCypher 3-Way** - Sender + Receiver + Witness encryption
- **Proof of Existence** - Immutable transaction proofs
- **Witness System** - Reputation & stake weighting
- **Real-time Metrics** - CPU, memory, TPS, TPMS
- **Auto-Creation** - Generated on first transaction
- **Microbenchmark** - Built-in performance testing

---

## 💡 Pro Tips

1. **All endpoints return JSON** - Use `| ConvertFrom-Json | ConvertTo-Json` for pretty output
2. **Validation nodes auto-create** - Just submit a transaction from any wallet
3. **STR.DOMAIN format** - Always use `STR.{identifier}` (prefix, not suffix)
4. **Check logs** - The server window shows all activity in real-time
5. **Explore freely** - All data is persistent in `.hostless/` directory

---

**Server Status**: 🟢 RUNNING  
**Port**: 3002  
**Database**: HOSTLESS (Pure Blockchain)  
**Documentation**: See `STARW_MINI_VALIDATION_NODE.md` for validation details

Enjoy exploring the Sourceless Blockchain! 🎉
