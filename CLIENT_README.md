# Stratus Lightweight Client

Official lightweight client for joining the **Stratus Blockchain Network**.

## What is This?

The Stratus Lightweight Client allows anyone to:
- ✅ Create a personal blockchain wallet
- ✅ Get a unique STR.domain identity
- ✅ Connect to the global Stratus P2P network
- ✅ Send and receive STR tokens
- ✅ Participate in the decentralized ecosystem

**No mining required** - just download, run, and connect!

## Quick Start

### Requirements
- Node.js 16+ or standalone binary (coming soon)
- ~50MB disk space
- Internet connection

### Installation from Source

```bash
# Clone repository
git clone https://github.com/stratus-network/stratus-electron-app
cd stratus-electron-app

# Install dependencies
npm install

# Run client
npm run client
```

### First Run

On first launch, the client will:
1. **Create a new wallet** with public/private keys
2. **Assign a unique STR.domain** (e.g., `node-a3f8b2c1.str`)
3. **Generate a node identity** for P2P networking
4. **Connect to genesis seed nodes**
5. **Save your identity** to `./stratus-client-data/node-identity.json`

**⚠️ IMPORTANT**: Back up your `node-identity.json` file! This contains your wallet keys.

### Interactive Menu

Once running, you'll see:

```
═══════════════════════════════════════════════════════
     STRATUS BLOCKCHAIN - LIGHTWEIGHT CLIENT v1.0
═══════════════════════════════════════════════════════

[1] Send STR
[2] Check Balance
[3] View Node Info
[4] Export Identity
[5] Exit
```

### Sending Tokens

```
Select option: 1
  Recipient address: STR1abc...
  Amount (STR): 10
  ✅ Transaction sent! Hash: e3f8b2c1...
```

### Checking Balance

```
Select option: 2
  💰 Balance: 0 STR
```

### Exporting Identity (Backup)

```
Select option: 4
  📋 Identity Export:
  {
    "nodeId": "a3f8b2c1...",
    "publicKey": "04f3e8...",
    "strDomain": "node-a3f8b2c1.str",
    "walletAddress": "STR1abc..."
  }

  ⚠️  Keep this safe! Anyone with this data can access your wallet.
```

## Configuration

You can customize the client on startup:

- **Data Directory**: Where identity and blockchain data is stored
  - Default: `./stratus-client-data`
  
- **Seed Nodes**: Genesis nodes to connect to
  - Default: `localhost:6333` (for local testing)
  - Mainnet: `seed1.stratus.network:6333,seed2.stratus.network:6333`

## Node Identity

Your node identity includes:

```json
{
  "nodeId": "64-char hex ID",
  "publicKey": "Your wallet public key",
  "strDomain": "Your unique .str domain",
  "walletAddress": "STR address for receiving tokens",
  "kycVerified": false,
  "joinedAt": 1234567890000,
  "reputation": 0,
  "version": "1.0.0"
}
```

### Node Reputation

Reputation increases by:
- ✅ Uptime (staying connected)
- ✅ Successful transactions
- ✅ Hosting STARW services
- ✅ Participating in governance

## Security

### Best Practices

1. **Backup your identity file** immediately after creation
2. **Never share** your `node-identity.json` publicly
3. **Use strong passwords** if encrypting identity
4. **Run on trusted networks** (avoid public WiFi for transactions)

### What's Stored

- `node-identity.json`: Wallet keys and node config
- `blockchain-cache/`: Lightweight blockchain headers
- `p2p-peers.json`: Known peer nodes

**Total disk usage**: ~10-50MB depending on network activity

## Network Connectivity

The client connects to:
- **Seed nodes** (provided genesis validators)
- **Peer nodes** (other lightweight clients)
- **Full nodes** (miners and validators)

You'll see P2P stats in the node info:

```
P2P Running: true
Peers: 8
```

More peers = faster transaction propagation!

## Troubleshooting

### "Failed to connect to network"

- Check seed nodes are correct
- Verify firewall allows outbound connections
- Try different seed node addresses

### "Insufficient balance"

- Check your balance with option [2]
- Request STR tokens from faucet or exchange
- Verify transaction hasn't already been sent

### "Node identity corrupted"

- Restore from backup if available
- Delete `./stratus-client-data` to start fresh (⚠️ loses wallet!)

## Upgrading

To upgrade to a new version:

```bash
git pull origin main
npm install
npm run client
```

Your existing identity will be preserved.

## Advanced Usage

### Importing Existing Identity

Place your `node-identity.json` in the data directory before first run:

```bash
mkdir -p ./stratus-client-data
cp my-backup-identity.json ./stratus-client-data/node-identity.json
npm run client
```

### Custom Seed Nodes

Edit at startup or modify client code:

```typescript
const client = new LightweightClient({
  dataDir: './my-data',
  seedNodes: [
    'seed1.stratus.network:6333',
    'seed2.stratus.network:6333'
  ],
  autoConnect: true
});
```

### Running as a Service

On Linux (systemd):

```ini
[Unit]
Description=Stratus Lightweight Client
After=network.target

[Service]
Type=simple
User=stratus
WorkingDirectory=/home/stratus/stratus-electron-app
ExecStart=/usr/bin/npm run client
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable stratus-client
sudo systemctl start stratus-client
```

## Roadmap

- [ ] **Standalone binaries** (Windows/Mac/Linux)
- [ ] **GUI desktop app** (Electron-based)
- [ ] **Mobile clients** (iOS/Android)
- [ ] **Web wallet** (browser extension)
- [ ] **Hardware wallet support** (Ledger/Trezor)
- [ ] **Multi-signature wallets**
- [ ] **Token swap integration**

## Support

- **Documentation**: https://docs.stratus.network
- **Discord**: https://discord.gg/stratus
- **GitHub Issues**: https://github.com/stratus-network/stratus-electron-app/issues

## License

MIT License - See LICENSE file for details

---

**Welcome to the Stratus Network! 🚀**
