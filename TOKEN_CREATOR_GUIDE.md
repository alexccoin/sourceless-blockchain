# Token Creator - Quick Start Guide

## 🚀 How to Create Your Own Token in 5 Minutes

### Step 1: Check Your CCOS Balance
- Navigate to **Wallet** page
- Look at your token balances table
- Ensure you have at least **100 CCOS**
- If not, use the **Mint CCOS** form to mint some first

### Step 2: Choose Token Type
- Scroll to **🪙 Token Creator** section
- Choose between:
  - **Personal Token** - For individuals, communities, or projects
  - **Business Token** - For companies with governance features

### Step 3: Fill in Token Details

#### For Personal Tokens:
```
Token Name:      My Community Token
Ticker:          COMM
Total Supply:    1,000,000
Decimals:        18
Website:         https://mycommunity.com (optional)
Description:     Reward token for community members (optional)
```

#### For Business Tokens (additional fields):
```
Company Name:        Acme Corporation
Person in Charge:    John Doe, CEO
Token Name:          Acme Utility Token
Ticker:              ACME
Total Supply:        10,000,000
Decimals:            18
Website:             https://acme.com (optional)
Description:         Utility token for Acme ecosystem (optional)
```

### Step 4: Deploy Your Token
1. Click **🚀 Deploy Personal Token (100 CCOS)** or **🚀 Deploy Business Token (100 CCOS)**
2. Confirm deployment in the popup dialog
3. Wait for confirmation (usually < 1 second)
4. See success message with your contract address!

### Step 5: View Your Deployed Token
- Scroll down to **📜 Deployment History**
- Your token appears at the top
- Click to see full details:
  - Contract address
  - Deployment timestamp
  - Token information
  - Cost paid

---

## 🎯 What You Get

### Personal Token Features:
✅ Transfer tokens between addresses  
✅ Approve spending allowances  
✅ Check balances  
✅ Mint new tokens (owner only)  
✅ Burn tokens  
✅ Full event logging  

### Business Token Features (everything above plus):
✅ Pause/unpause transfers  
✅ Authorized minter management  
✅ Max transfer limits  
✅ Company information on-chain  
✅ Business metadata tracking  

---

## 💡 Common Use Cases

### Personal Tokens
- **Community Rewards:** Reward active members
- **Gaming Currency:** In-game points or items
- **Social Tokens:** Creator coins
- **Loyalty Points:** Customer rewards
- **Event Tickets:** NFT-style tickets

### Business Tokens
- **Utility Tokens:** Access to services
- **Governance Tokens:** Voting rights
- **Employee Stock:** Company shares
- **Product Credits:** Prepaid services
- **Partner Rewards:** B2B incentives

---

## 📊 Cost Breakdown

| Action | Cost | Notes |
|--------|------|-------|
| Personal Token Deploy | 100 CCOS | One-time fee |
| Business Token Deploy | 100 CCOS | One-time fee |
| Dev Example Deploy | FREE | For testing only |
| Compile Contract | FREE | Any time |
| View History | FREE | Unlimited access |

---

## ⚠️ Important Notes

1. **Contract Address:** Save your contract address! You'll need it to interact with your token.

2. **Owner Wallet:** The wallet that deploys the token is the owner. Only the owner can mint new tokens (in personal tokens) or manage minters (in business tokens).

3. **Supply is Final:** For personal tokens, total supply is set at deployment. Use the mint function carefully.

4. **Testnet Deployment:** Currently deploys to STR Testnet. Mainnet deployment coming soon.

5. **CCOS Fee:** The 100 CCOS fee goes to `system_treasury` to support network operations.

6. **Gas Costs:** Deployment gas is included in the 100 CCOS fee. No additional costs.

---

## 🔍 Example Token Contract

Here's what gets generated for "CommunityToken (COMM)":

```areslang
// Native SourceLess Community Token
token_contract COMMToken {
    # Native SourceLess Token Metadata
    name: string = "CommunityToken";
    symbol: string = "COMM";
    decimals: uint8 = 13;  # All SourceLess tokens use 13 decimals
    total_supply: uint256 = 1000000;
    
    # Native ZK13STR address balances
    balances: mapping<zk13str_address, uint256>;
    allowances: mapping<zk13str_address, mapping<zk13str_address, uint256>>;
    owner: zk13str_address;
    str_domain: str_domain;  # Associated STR.domain
    
    # Constructor with native SourceLess features
    constructor(str_domain domain) {
        owner = msg.sender;
        str_domain = domain;
        balances[msg.sender] = total_supply;
        
        # Enable HOSTLESS gas-free transactions
        enable_hostless_mode();
        
        # Setup CCOIN reward system (2.5-10% dynamic)
        setup_ccoin_integration();
    }
    
    # Native STR transfer with gas-free support
    function transfer(zk13str_address to, uint256 amount) -> bool hostless {
        require(validate_zk13str(to), "Invalid ZK13STR address");
        require(balances[msg.sender] >= amount, "Insufficient COMM balance");
        
        balances[msg.sender] = balances[msg.sender] - amount;
        balances[to] = balances[to] + amount;
        
        # Auto-mint CCOIN rewards based on transaction amount
        ccoin.mint_reward(msg.sender, calculate_ccoin_reward(amount));
        
        emit STRTransfer(msg.sender, to, amount);
        return true;
    }
    
    # ... (more native functions: approve, mint, burn with CCOIN integration)
}
```

---

## 🛠️ Advanced: Using Dev Examples

Want to test before deploying your token?

1. Go to **Contracts** page
2. Find **Dev Mode Examples (ARESLang)**
3. Try **TokenMinimal** example:
   - Click **Compile** to see bytecode and ABI
   - Click **Deploy** to deploy to testnet (FREE!)
   - Check output below the buttons
4. View deployment in Wallet > Deployment History

---

## ❓ FAQ

**Q: Can I deploy multiple tokens?**  
A: Yes! Deploy as many as you need. Each costs 100 CCOS.

**Q: Can I change token details after deployment?**  
A: No, token name, ticker, and initial supply are immutable. Plan carefully!

**Q: What if I don't have 100 CCOS?**  
A: Use the "Mint CCOS" form in the Wallet page to mint CCOS tokens first.

**Q: Can I delete or pause my token?**  
A: Personal tokens can't be paused. Business tokens have a pause function (owner only).

**Q: Where is my token stored?**  
A: On the Sourceless blockchain Contract Ledger. Your wallet owns it.

**Q: Can others buy/trade my token?**  
A: Yes! Anyone with the contract address can interact with your token using standard transfer functions.

**Q: Is my token ERC20 compatible?**  
A: Yes! The generated contracts follow ERC20 standard (adapted for ARESLang).

**Q: Can I add custom functions later?**  
A: Not to deployed contracts. You'll need to deploy a new version with additional functions.

---

## 🎓 Tips for Success

1. **Test First:** Try a dev example deployment before creating your real token
2. **Choose Wisely:** Pick a memorable ticker (3-10 characters)
3. **Set Realistic Supply:** Consider total supply carefully (can't change later!)
4. **Use Decimals 18:** Standard for most tokens (allows fractional amounts)
5. **Add Website:** Helps users learn about your token
6. **Write Good Descriptions:** Explain your token's purpose clearly
7. **Save Contract Address:** You'll need it to manage your token
8. **Document Everything:** Keep records of deployment details

---

## 📞 Support

- **View Logs:** Check console for detailed error messages
- **Deployment History:** Review all past deployments in Wallet page
- **Check Balance:** Ensure sufficient CCOS before deployment
- **Read Errors:** Error messages explain what went wrong

---

## 🎉 Congratulations!

You're now ready to create your own tokens on the Sourceless blockchain! 

**Remember:**
- ✅ 100 CCOS per deployment
- ✅ Contract address saved in history
- ✅ Full ERC20 functionality
- ✅ Instant deployment
- ✅ Complete ownership

Happy token creating! 🚀
