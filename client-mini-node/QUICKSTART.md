# 🚀 QUICK START GUIDE

## Option 1: Direct Browser Access (Simplest)

1. Navigate to the `client-mini-node` folder
2. Double-click `index.html` to open in your browser
3. Done! The client will load immediately

**Note**: Some features may require a local server (see Option 2)

## Option 2: Local Server (Recommended)

### Windows
1. Double-click `start.bat`
2. Wait for "Starting server on http://localhost:8000"
3. Open browser to: http://localhost:8000/index.html

### Mac/Linux
1. Make script executable: `chmod +x start.sh`
2. Run: `./start.sh`
3. Open browser to: http://localhost:8000/index.html

## 📝 First Time Setup

### 1. Create Your Wallet
- Click the "Wallet" tab
- Click "Create New Wallet"
- Set a strong password (min 8 characters)
- **SAVE YOUR SEED PHRASE!** Write it down on paper
- Check the confirmation box
- Click "Generate Wallet"

### 2. Connect to Network
- Click the "Settings" tab
- Default: http://localhost:3002 (if running main server)
- Or use public mainnet URL
- Click "Save Settings"

### 3. Get Some Tokens
- You'll need STR tokens to start
- Use the faucet or transfer from another wallet
- Your address format: `zk13str_...`

## 🔐 Important Security Notes

### ⚠️ CRITICAL - BACKUP YOUR SEED PHRASE!
```
Your 12-word seed phrase is the ONLY way to recover your wallet!
- Write it down on paper
- Store it in a safe place
- NEVER share it with anyone
- NEVER store it digitally (no photos, no cloud)
```

### Password Protection
- Use a strong, unique password
- Never reuse passwords from other sites
- Password is needed for transactions

## 🎯 What You Can Do

### Wallet Features
✅ Create and manage ZK13STR wallets
✅ Send STR, CCOS, ARSS tokens
✅ View transaction history
✅ Import/export wallets

### Validator Features
✅ Stake tokens (min 1,000 STR)
✅ Earn rewards (5-15% APY)
✅ Validate blocks
✅ Track performance

### Explorer Features
✅ View recent blocks
✅ Monitor network stats
✅ Check transaction volume
✅ See active validators

## 💰 Staking Guide

### Requirements
- Minimum: 1,000 STR tokens
- Choose lock period: 7, 30, or 90 days
- Higher lock = Higher rewards

### APY Rates
- 7 days → 5% APY
- 30 days → 10% APY
- 90 days → 15% APY

### How to Stake
1. Go to "Validator" tab
2. Enter stake amount (≥1,000 STR)
3. Select lock period
4. Click "Start Validator"
5. Confirm transaction
6. Watch rewards accumulate!

## 🐛 Troubleshooting

### Can't Connect to Network
```
Problem: "Network: Disconnected" in header
Solution:
1. Check your internet connection
2. Verify network endpoint in Settings
3. Make sure main server is running (if using localhost)
4. Try public mainnet URL instead
```

### Transaction Failed
```
Problem: "Transaction failed" error
Solution:
1. Check you have enough balance
2. Verify recipient address format
3. Ensure wallet is unlocked
4. Try smaller amount (might be insufficient balance)
```

### Validator Won't Start
```
Problem: Can't start validator
Solution:
1. Confirm you have ≥1,000 STR
2. Check wallet is connected
3. Verify network connection
4. Make sure not already staking
```

### Page Loads Blank
```
Problem: White/blank page
Solution:
1. Try using local server (start.bat/start.sh)
2. Check browser console (F12) for errors
3. Clear browser cache
4. Try different browser
```

## 📊 Network Endpoints

### Local Development
```
http://localhost:3002
Use when running your own node
```

### Public Mainnet
```
https://mainnet.sourceless.io
Production network with real tokens
```

### Public Testnet
```
https://testnet.sourceless.io
Test network with free tokens
```

## 🔄 Daily Usage

### Morning Routine
1. Open client
2. Check validator status
3. Claim rewards if available
4. Review transaction history

### Sending Tokens
1. Click "Wallet" tab
2. Enter recipient address
3. Enter amount and select token
4. Click "Send Transaction"
5. Wait for confirmation

### Checking Rewards
1. Click "Validator" tab
2. View "Total Rewards" card
3. Click "Claim Rewards" when ready
4. Rewards go to your wallet

## 📱 Mobile Usage

The client works on mobile browsers but desktop is recommended for:
- Better performance
- Easier seed phrase backup
- More screen space
- Keyboard shortcuts

## 🆘 Need Help?

### Resources
- Full documentation: README.md
- Configuration: config.json
- Community: Discord/Telegram
- Issues: GitHub Issues

### Common Questions
**Q: Is this safe?**
A: Yes, your keys never leave your device

**Q: Can I use this without the main server?**
A: Yes, connect to public mainnet

**Q: What if I lose my password?**
A: Use seed phrase to restore

**Q: Can I stake more later?**
A: Yes, unstake and restake with more

## ✅ Quick Checklist

Before you start:
- [ ] Seed phrase written down on paper
- [ ] Seed phrase stored safely
- [ ] Strong password chosen
- [ ] Network endpoint configured
- [ ] Browser updated to latest version

You're ready to go! 🎉

---

**Need more help? Read the full README.md**
