# Sourceless Mini-Node Client

A lightweight, standalone client for participating in the Sourceless blockchain network. This mini-node allows anyone to create wallets, stake tokens, validate blocks, and interact with the blockchain without running a full node.

## 🚀 Quick Start

1. **Open the Application**
   - Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge)
   - No installation or dependencies required!

2. **Create Your Wallet**
   - Click "Create New Wallet" on the Wallet tab
   - Set a strong password (minimum 8 characters)
   - **IMPORTANT**: Save your 12-word seed phrase securely
   - Confirm you've backed up the seed phrase

3. **Start Using Your Wallet**
   - View your balances (STR, CCOS, ARSS)
   - Send transactions to other addresses
   - Track your transaction history

## 📋 Features

### Wallet Management
- **Create Wallet**: Generate new ZK13STR address with secure seed phrase
- **Import Wallet**: Restore from 12-word seed phrase
- **Export Wallet**: Backup encrypted wallet data
- **Multi-Token Support**: STR, CCOS, ARSS, wSTR, eSTR, $TR
- **Transaction History**: View all incoming and outgoing transactions

### Validator Node
- **Stake Tokens**: Lock STR tokens to become a validator
- **Earn Rewards**: Receive CCOS rewards for validating blocks
- **Flexible Lock Periods**:
  - 7 days → 5% APY
  - 30 days → 10% APY
  - 90 days → 15% APY
- **Real-time Stats**: Track blocks validated, rewards earned, and uptime

### Block Explorer
- **Live Blockchain Data**: View latest blocks and transactions
- **Network Statistics**: Monitor network health and activity
- **Transaction Per Second (TPS)**: Real-time performance metrics
- **Recent Blocks**: Browse recently validated blocks

### Network Settings
- **Connect to Network**: Local node or public mainnet
- **Performance Tuning**: Adjust sync settings and peer limits
- **Security Options**: Auto-lock, password requirements

## 🔧 Configuration

Edit `config.json` to customize your mini-node:

```json
{
  "network": {
    "endpoint": "http://localhost:3002",  // Change to mainnet URL
    "chainId": 1313,
    "timeout": 30000
  },
  "validator": {
    "minStake": 1000,
    "lockPeriods": [7, 30, 90],
    "apyRates": [5, 10, 15]
  }
}
```

## 💻 System Requirements

### Minimum
- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 2GB
- **Storage**: 5GB free space
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+

### Recommended
- **RAM**: 4GB
- **Storage**: 10GB SSD
- **Internet**: 10 Mbps connection
- **Browser**: Latest version

## 🔐 Security

### Wallet Security
- **Private Keys**: Never leave your device
- **Encryption**: AES-256-GCM for all stored data
- **Password Protection**: Required for all sensitive operations
- **Seed Phrase**: 12-word BIP39 mnemonic for recovery

### Best Practices
1. **Backup Your Seed Phrase**: Write it down and store securely offline
2. **Strong Password**: Use 12+ characters with mixed case, numbers, symbols
3. **Secure Device**: Keep your computer malware-free
4. **Regular Backups**: Export wallet regularly
5. **Verify Addresses**: Always double-check recipient addresses

## 📊 Validator Guide

### Getting Started
1. **Minimum Stake**: You need at least 1,000 STR tokens
2. **Choose Lock Period**: 
   - Longer periods = Higher rewards
   - Tokens are locked and cannot be withdrawn early
3. **Start Validating**: Click "Start Validator" and confirm transaction

### Earning Rewards
- **Block Validation**: Earn CCOS for each validated block
- **Transaction Fees**: Receive 2.5-10% of transaction fees in CCOS
- **APY Rewards**: Automatic staking rewards based on lock period

### Claiming Rewards
- Click "Claim Rewards" to withdraw earned CCOS
- Rewards accumulate automatically while validator is active
- No minimum amount required to claim

### Unstaking
- Wait for lock period to expire
- Click "Unstake" to withdraw your STR tokens
- Validator will stop automatically when unstaked

## 🌐 Network Connection

### Local Node (Default)
```
Endpoint: http://localhost:3002
Use this if you're running a full node on your computer
```

### Public Mainnet
```
Endpoint: https://mainnet.sourceless.io
Use this to connect to the public network
```

### Testnet
```
Endpoint: https://testnet.sourceless.io
Use this for testing without real tokens
```

## 🛠️ Troubleshooting

### "Cannot connect to network"
- Check your internet connection
- Verify the network endpoint in Settings
- Ensure firewall allows browser connections

### "Transaction failed"
- Check you have sufficient balance
- Verify recipient address format (zk13str_...)
- Ensure wallet is unlocked

### "Validator won't start"
- Confirm you have at least 1,000 STR
- Check wallet is connected
- Verify network connection

### "Lost seed phrase"
- If you have the encrypted wallet backup, you can still access funds
- Without seed phrase or backup, funds cannot be recovered
- This is why backing up is critical!

## 📝 FAQ

**Q: Is my wallet stored on the blockchain?**
A: No, your wallet is stored locally in your browser. Always backup!

**Q: Can I use this on mobile?**
A: Yes, it works on mobile browsers, but desktop is recommended.

**Q: What happens if I close the browser?**
A: Your wallet data is saved locally and will load when you return.

**Q: Can I run multiple validators?**
A: One validator per wallet address. Create multiple wallets for multiple validators.

**Q: Is this a full node?**
A: No, it's a "mini-node" that connects to full nodes for blockchain data.

**Q: What are the fees?**
A: Transaction fees are minimal (typically 0.01-0.1 STR).

## 🔄 Updates

Check for updates regularly:
- Visit: https://github.com/sourceless/mini-node
- Current Version: 1.0.0
- Last Updated: 2024

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Support

- **Documentation**: https://docs.sourceless.io
- **Community**: https://discord.gg/sourceless
- **Issues**: https://github.com/sourceless/mini-node/issues

## ⚠️ Disclaimer

This software is provided "as-is" without warranty. Always backup your wallet and never share your seed phrase. Use at your own risk.

---

**Made with ❤️ by the Sourceless Community**
