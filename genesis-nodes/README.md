# 🌌 GENESIS NODES - 1313 STARW Mini Validation Nodes

## Overview

The Genesis Nodes system creates and manages **1313 real STARW Mini Validation Nodes** with special domain assignments and wallet generation.

## Special Domains

The first 21 nodes are assigned special STR.DOMAIN identities with unique roles and token allocations:

| # | Domain | Abbreviation | Role | Power | STR | CCOS | WSTR | ARSS | ESTR |
|---|--------|--------------|------|-------|-----|------|------|------|------|
| 1 | **STR.TREASURY** | TRS | Treasury | 100 | 20B | 20M | 3B | 1.5B | 500M |
| 2 | **STR.SOURCELESS** | SRC | Genesis | 100 | 10B | 10M | 2B | 1B | 200M |
| 3 | **STR.ALEX** | ALX | Founder | 100 | 5B | 5M | 1B | 500M | 100M |
| 4 | **STR.OBI** | OBI | Master | 95 | 1B | 1M | 200M | 100M | 50M |
| 5 | **STR.GROK** | GRK | Oracle | 95 | 1B | 1M | 200M | 100M | 50M |
| 6 | **STR.STAR** | STR | Core | 90 | 800M | 800K | 150M | 80M | 30M |
| 7 | **STR.DARTH** | DTH | Enforcer | 90 | 800M | 800K | 150M | 80M | 30M |
| 8 | **STR.STARWARS** | SWS | Guardian | 85 | 500M | 500K | 100M | 50M | 20M |
| 9 | **STR.YODA** | YDA | Sage | 85 | 500M | 500K | 100M | 50M | 20M |
| 10 | **STR.LUKE** | LKE | Knight | 80 | 300M | 300K | 60M | 30M | 10M |
| 11 | **STR.LEIA** | LEI | Diplomat | 80 | 300M | 300K | 60M | 30M | 10M |
| 12 | **STR.HAN** | HAN | Pilot | 75 | 200M | 200K | 40M | 20M | 5M |
| 13 | **STR.CHEWIE** | CHW | Warrior | 75 | 200M | 200K | 40M | 20M | 5M |
| 14 | **STR.R2D2** | R2D | Tech | 70 | 100M | 100K | 20M | 10M | 2M |
| 15 | **STR.C3PO** | C3P | Protocol | 70 | 100M | 100K | 20M | 10M | 2M |
| 16 | **STR.VADER** | VDR | Sentinel | 85 | 500M | 500K | 100M | 50M | 20M |
| 17 | **STR.PALPATINE** | PLP | Overseer | 80 | 300M | 300K | 60M | 30M | 10M |
| 18 | **STR.ANAKIN** | ANK | Protector | 75 | 200M | 200K | 40M | 20M | 5M |
| 19 | **STR.PADME** | PDM | Mediator | 75 | 200M | 200K | 40M | 20M | 5M |
| 20 | **STR.AHSOKA** | AHK | Guardian | 80 | 300M | 300K | 60M | 30M | 10M |
| 21 | **STR.MANDO** | MND | Bounty | 75 | 200M | 200K | 40M | 20M | 5M |

### Token Distribution

**Total Supply:**
- **STR**: 63 Billion
- **CCOS**: 63 Million
- **WSTR**: 10 Billion (Wrapped STR)
- **ARSS**: 5 Billion (Ares Token)
- **ESTR**: 1 Billion (Escrowed STR)

**Treasury Node (STR.TREASURY)** holds ~31.7% of STR and CCOS for ecosystem development and rewards.

## Features

✅ **1313 Real Validation Nodes** - Each with unique wallet address  
✅ **Auto-Generated Wallets** - ZK13STR format addresses for all nodes  
✅ **Special Domain Registration** - 21 elite nodes with custom domains (including STR.TREASURY)  
✅ **Token Allocation** - All 5 tokens (STR, CCOS, WSTR, ARSS, ESTR) distributed to wallets  
✅ **Sequential Naming** - Remaining nodes: `STR.GENESIS0022` through `STR.GENESIS1313`  
✅ **Abbreviation System** - All nodes have short identifiers  
✅ **Live Network** - All nodes run active validation  
✅ **Cross-Node Transactions** - Simulated P2P transaction flow  
✅ **Monitoring Dashboard** - Real-time visualization  

## Directory Structure

```
genesis-nodes/
├── GenesisNodeManager.js    # Core manager (creates/runs all 1313 nodes)
├── start-genesis.js          # Startup script
├── dashboard.html            # Monitoring dashboard
├── config/
│   └── genesis-nodes.json    # All nodes configuration
├── domains/
│   └── special-domains.json  # Special domain details
├── wallets/
│   └── genesis-wallets.json  # All wallet addresses + private keys
└── node-pool/                # Runtime node instances
```

## Quick Start

### 1. Start the Genesis Network

```bash
node genesis-nodes/start-genesis.js
```

This will:
- Initialize HOSTLESS database
- Create 21 special domain nodes (STR.TREASURY, STR.SOURCELESS, STR.ALEX, etc.)
- Allocate tokens to all special domain wallets
- Create 1292 additional genesis validator nodes with token allocations
- Register all domains and wallets
- Start all 1313 nodes in validation mode
- Run a 30-second network simulation
- Keep nodes running live

### 2. View the Dashboard

Open `genesis-nodes/dashboard.html` in your browser to see:
- Network statistics (Total nodes, TPS, TPMS)
- Special domain node cards
- Full node registry table
- Real-time validation metrics
- Witness pool statistics

### 3. Access Configuration

All generated data is saved to:
- **`config/genesis-nodes.json`** - Complete network configuration
- **`domains/special-domains.json`** - Special domain details
- **`wallets/genesis-wallets.json`** - All wallet addresses

## Network Statistics

- **Total Nodes**: 1,313
- **Network TPS**: ~131,300 (100 TPS per node)
- **Network TPMS**: ~131 (131,300 / 1000)
- **Average Node Size**: ~0.7 MB per node
- **Total Network Size**: ~918 MB (1313 × 0.7 MB)

## Special Domain Nodes

### STR.TREASURY (TRS)
- **Role**: Treasury
- **Power**: 100
- **Description**: The network treasury - holds ecosystem funds for development and rewards
- **Token Holdings**: 20B STR, 20M CCOS, 3B WSTR, 1.5B ARSS, 500M ESTR (31.7% of total supply)
- **Capabilities**: Ecosystem funding, staking rewards, development grants

### STR.SOURCELESS (SRC)
- **Role**: Genesis
- **Power**: 100
- **Description**: The genesis node - origin of the entire Sourceless network
- **Token Holdings**: 10B STR, 10M CCOS, 2B WSTR, 1B ARSS, 200M ESTR
- **Capabilities**: Network initialization, genesis block authority

### STR.ALEX (ALX)
- **Role**: Founder
- **Power**: 100
- **Description**: Founder node - network architect and visionary
- **Token Holdings**: 5B STR, 5M CCOS, 1B WSTR, 500M ARSS, 100M ESTR
- **Capabilities**: Network governance, architectural decisions

### STR.OBI (OBI) & STR.GROK (GRK)
- **Role**: Master & Oracle
- **Power**: 95
- **Description**: High authority nodes for validation and insights
- **Token Holdings**: 1B STR, 1M CCOS, 200M WSTR, 100M ARSS, 50M ESTR (each)

### And 16 more special domains...
(STR.STAR, STR.DARTH, STR.STARWARS, STR.YODA, STR.LUKE, STR.LEIA, STR.HAN, STR.CHEWIE, STR.R2D2, STR.C3PO, STR.VADER, STR.PALPATINE, STR.ANAKIN, STR.PADME, STR.AHSOKA, STR.MANDO)

## Node Naming Convention

### Special Domains (1-21)
- `STR.TREASURY`, `STR.SOURCELESS`, `STR.ALEX`, `STR.OBI`, `STR.GROK`, `STR.STAR`, `STR.DARTH`, `STR.STARWARS`, `STR.YODA`, `STR.LUKE`, `STR.LEIA`, `STR.HAN`, `STR.CHEWIE`, `STR.R2D2`, `STR.C3PO`, `STR.VADER`, `STR.PALPATINE`, `STR.ANAKIN`, `STR.PADME`, `STR.AHSOKA`, `STR.MANDO`
- Abbreviations: `TRS`, `SRC`, `ALX`, `OBI`, `GRK`, `STR`, `DTH`, `SWS`, `YDA`, `LKE`, `LEI`, `HAN`, `CHW`, `R2D`, `C3P`, `VDR`, `PLP`, `ANK`, `PDM`, `AHK`, `MND`

### Genesis Validators (22-1313)
- Domain: `STR.GENESIS####` (e.g., `STR.GENESIS0022`)
- Abbreviation: `GN####` (e.g., `GN0022`)
- Power: Random 50-80
- Token Allocation: 1M-6M STR (randomized based on power)

## Wallet Format

All wallets use the ZK13STR format:

```
zk13str_<40-char-hash>_<4-char-checksum>

Example:
zk13str_a1b2c3d4e5f6789012345678901234567890abcd_ef12
```

## API Integration

The genesis nodes are integrated with the main server. Access via:

```javascript
// Get validation node for specific wallet
const node = await database.getValidationNode(walletAddress);

// Get all genesis nodes stats
const stats = genesisManager.getNetworkStats();

// Get specific special domain node
const obiNode = genesisManager.getNode('STR.OBI');
```

## Monitoring & Management

### Real-Time Stats
The dashboard shows live statistics every 10 seconds:
- Active node count
- Total validations processed
- Network TPMS capacity
- Witness pool size

### Node Filtering
Filter nodes by:
- All nodes (1313)
- Special domains only (5)
- Active nodes only
- Validators only

### Pagination
Browse through all 1313 nodes with 50 nodes per page.

## Graceful Shutdown

Press `Ctrl+C` to shutdown gracefully:
1. All 1313 nodes stop validation
2. Configurations are saved
3. Database connection closes
4. Clean exit

## Performance

- **Initialization Time**: ~30-60 seconds for all 1313 nodes
- **Memory Usage**: ~1-2 GB total
- **CPU Usage**: Moderate (distributed across nodes)
- **Disk Space**: ~918 MB for node instances + config files

## Configuration Files

### genesis-nodes.json
```json
{
  "totalNodes": 1313,
  "activeNodes": 1313,
  "specialDomains": [...],
  "allNodes": [...]
}
```

### special-domains.json
```json
{
  "domains": [
    {
      "nodeId": "genesis_node_0001",
      "domain": "STR.OBI",
      "abbreviation": "OBI",
      "role": "master",
      "power": 100
    }
  ]
}
```

### genesis-wallets.json
```json
{
  "wallets": [
    {
      "nodeId": "genesis_node_0001",
      "walletAddress": "zk13str_...",
      "domain": "STR.OBI",
      "privateKey": "0x..."
    }
  ]
}
```

## Troubleshooting

### Nodes not starting
- Check if port 3002 is available
- Ensure HOSTLESS database is initialized
- Check memory availability (need ~2GB)

### Dashboard not loading
- Open `dashboard.html` directly in browser
- Check if `config/genesis-nodes.json` exists
- Clear browser cache

### Performance issues
- Reduce simulation duration
- Run fewer nodes initially for testing
- Increase Node.js memory limit: `node --max-old-space-size=4096`

## Future Enhancements

- [ ] Cross-chain witness validation
- [ ] Dynamic node addition/removal
- [ ] Advanced consensus algorithms
- [ ] Inter-node P2P messaging
- [ ] Automated failover and redundancy
- [ ] Real-time transaction routing

## License

Part of the Sourceless Blockchain ecosystem.

---

**🌌 Genesis Network - 1313 Nodes Strong**
