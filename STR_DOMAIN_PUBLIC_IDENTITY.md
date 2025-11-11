# 🆔 STR.DOMAIN PUBLIC IDENTITY SYSTEM

**Wallet Masking • Public Discovery • STARW Website Hosting**

---

## 🎯 OVERVIEW

The **STR.DOMAIN Public Identity System** revolutionizes blockchain identity by replacing complex wallet addresses with human-readable domains. Every wallet can have a public identity that:

1. **Masks Private Addresses** - Replace `zk13str_fe9cc876f250756e8ba51a109ac4070811262af9_551d` with `alice.str`
2. **Public Discovery** - Searchable identity ledger for finding users
3. **STARW Website Hosting** - Each domain can host a public website
4. **Identity Verification** - On-chain proof of domain ownership

---

## 🏗️ ARCHITECTURE

### Components

```
┌─────────────────────────────────────────────────────────┐
│           STR.DOMAIN IDENTITY SYSTEM                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. Public Identities (.hostless/public-identities/)     │
│     alice.str.json →  Wallet: zk13str_abc123...         │
│     bob.str.json   →  Wallet: zk13str_def456...         │
│                                                           │
│  2. Domain Websites (.hostless/domain-websites/)         │
│     alice.str/ → HTML, CSS, JS files                     │
│     bob.str/   → Hosted on STARW network                 │
│                                                           │
│  3. Identity Ledger (.hostless/identity-ledger/)         │
│     ledger.json → Public discovery log                   │
│                                                           │
│  4. STARW Nodes → Distribute and serve websites          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 DIRECTORY STRUCTURE

```
.hostless/
├── public-identities/        # ← PUBLIC IDENTITY MAPPING
│   ├── alice.str.json        # Domain → Wallet mapping
│   ├── bob.str.json
│   ├── company.str.json
│   └── ...
│
├── domain-websites/          # ← STARW HOSTED WEBSITES
│   ├── alice.str.json        # Website metadata
│   ├── alice.str/            # Actual website files
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── script.js
│   ├── bob.str/
│   └── ...
│
├── identity-ledger/          # ← PUBLIC DISCOVERY LEDGER
│   └── ledger.json           # All domain registrations
│
└── starw-storage/            # STARW node distribution
    └── state.json
```

---

## 🆔 PUBLIC IDENTITY FORMAT

### Identity Structure

```json
{
  "domain": "alice.str",
  "walletAddress": "zk13str_fe9cc876f250756e8ba51a109ac4070811262af9_551d",
  "publicProfile": {
    "displayName": "Alice Smith",
    "bio": "Blockchain developer and crypto enthusiast",
    "avatar": "https://alice.str/avatar.png",
    "website": "https://alice.str",
    "social": {
      "twitter": "@alice",
      "github": "alice-dev",
      "linkedin": "alice-smith"
    },
    "verified": true,
    "createdAt": 1762800209435,
    "updatedAt": 1762800209435
  },
  "metadata": {
    "registrationBlock": 1001,
    "registrationTx": "0x abc123...",
    "expiresAt": null,
    "renewable": true
  }
}
```

**Stored in**: `.hostless/public-identities/alice.str.json`

---

## 🌍 DOMAIN WEBSITE FORMAT

### Website Structure

```json
{
  "domain": "alice.str",
  "content": {
    "html": "<!DOCTYPE html><html>...</html>",
    "css": "body { background: #000; }",
    "js": "console.log('Hello from alice.str');",
    "assets": {
      "avatar.png": "base64_encoded_image",
      "logo.svg": "base64_encoded_svg"
    }
  },
  "metadata": {
    "title": "Alice's Portfolio",
    "description": "Blockchain developer portfolio",
    "keywords": ["blockchain", "crypto", "developer"],
    "author": "alice.str",
    "version": "1.0.0",
    "updatedAt": 1762800209435,
    "size": 5432,
    "starwNodes": [
      "node_abc123",
      "node_def456",
      "node_ghi789"
    ]
  },
  "hosting": {
    "enabled": true,
    "starwStorage": true,
    "distributedNodes": 3,
    "bandwidth": 1024000,
    "hits": 1543
  }
}
```

**Stored in**: `.hostless/domain-websites/alice.str.json`

---

## 🔗 IDENTITY LEDGER (Public Discovery)

### Ledger Entry Format

```json
[
  {
    "type": "register",
    "domain": "alice.str",
    "timestamp": 1762800209435,
    "block": 1001
  },
  {
    "type": "register",
    "domain": "bob.str",
    "timestamp": 1762800210000,
    "block": 1002
  },
  {
    "type": "update",
    "domain": "alice.str",
    "timestamp": 1762800215000,
    "block": 1005
  }
]
```

**Purpose**: Public ledger for discovering all registered domains

**Stored in**: `.hostless/identity-ledger/ledger.json`

---

## 🚀 API ENDPOINTS

### 1. Register Public Identity

**POST** `/api/identity:register`

Register a new STR.DOMAIN public identity.

**Request Body**:
```json
{
  "domain": "alice.str",
  "walletAddress": "zk13str_fe9cc876f250756e8ba51a109ac4070811262af9_551d",
  "publicProfile": {
    "displayName": "Alice Smith",
    "bio": "Blockchain developer",
    "avatar": "https://alice.str/avatar.png",
    "social": {
      "twitter": "@alice"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "identity": {
    "domain": "alice.str",
    "walletAddress": "zk13str_...",
    "publicProfile": { ... }
  },
  "message": "Public identity registered: alice.str"
}
```

---

### 2. Resolve Domain to Wallet

**GET** `/api/identity:resolve?domain=alice.str`

Resolve a STR.DOMAIN to its private wallet address (unmask).

**Response**:
```json
{
  "domain": "alice.str",
  "walletAddress": "zk13str_fe9cc876f250756e8ba51a109ac4070811262af9_551d",
  "resolved": true
}
```

**Use Case**: Send tokens to `alice.str` instead of complex address

---

### 3. Get Public Profile

**GET** `/api/identity:profile?domain=alice.str`

Get the public profile for a domain (discoverable information).

**Response**:
```json
{
  "domain": "alice.str",
  "profile": {
    "displayName": "Alice Smith",
    "bio": "Blockchain developer and crypto enthusiast",
    "avatar": "https://alice.str/avatar.png",
    "website": "https://alice.str",
    "social": {
      "twitter": "@alice",
      "github": "alice-dev"
    },
    "verified": true,
    "createdAt": 1762800209435
  }
}
```

---

### 4. Search Public Identities

**GET** `/api/identity:search?q=alice`

Search for public identities (discovery).

**Response**:
```json
{
  "query": "alice",
  "results": [
    {
      "domain": "alice.str",
      "profile": {
        "displayName": "Alice Smith",
        "bio": "Blockchain developer..."
      }
    },
    {
      "domain": "alice-crypto.str",
      "profile": {
        "displayName": "Alice Crypto",
        "bio": "Crypto trader..."
      }
    }
  ],
  "count": 2
}
```

---

### 5. List All Domains

**GET** `/api/identity:list`

Get all registered STR.DOMAIN identities.

**Response**:
```json
{
  "domains": [
    "alice.str",
    "bob.str",
    "company.str",
    "crypto-trader.str"
  ],
  "count": 4
}
```

---

### 6. Host Website on STARW

**POST** `/api/website:host`

Host a website on STARW for a domain.

**Request Body**:
```json
{
  "domain": "alice.str",
  "websiteData": {
    "title": "Alice's Portfolio",
    "description": "My blockchain portfolio",
    "html": "<!DOCTYPE html><html>...</html>",
    "css": "body { background: #000; }",
    "js": "console.log('Hello!');"
  }
}
```

**Response**:
```json
{
  "success": true,
  "website": {
    "domain": "alice.str",
    "metadata": {
      "title": "Alice's Portfolio",
      "size": 5432
    }
  },
  "url": "https://alice.str.stratus.network",
  "message": "Website hosted on STARW for alice.str"
}
```

---

### 7. Get Domain Website

**GET** `/api/website:get?domain=alice.str`

Get the website content for a domain.

**Response**:
```json
{
  "domain": "alice.str",
  "content": {
    "html": "<!DOCTYPE html>...",
    "css": "body { background: #000; }",
    "js": "console.log('Hello!');"
  },
  "metadata": {
    "title": "Alice's Portfolio",
    "size": 5432,
    "updatedAt": 1762800209435
  },
  "hosting": {
    "enabled": true,
    "distributedNodes": 3,
    "hits": 1543
  }
}
```

---

### 8. Get Identity Ledger

**GET** `/api/identity:ledger`

Get the public discovery ledger (all domain registrations).

**Response**:
```json
{
  "ledger": [
    {
      "type": "register",
      "domain": "alice.str",
      "timestamp": 1762800209435,
      "block": 1001
    },
    {
      "type": "register",
      "domain": "bob.str",
      "timestamp": 1762800210000,
      "block": 1002
    }
  ],
  "count": 2
}
```

---

## 💡 USE CASES

### 1. **Simple Transfers** (Wallet Masking)

**Before** (Complex):
```
Send 100 STR to: zk13str_fe9cc876f250756e8ba51a109ac4070811262af9_551d
```

**After** (Simple):
```
Send 100 STR to: alice.str
```

The system automatically resolves `alice.str` → wallet address.

---

### 2. **Public Discovery**

```javascript
// Search for developers
const results = await fetch('/api/identity:search?q=developer');

// Returns all profiles with "developer" in bio or name
```

---

### 3. **Personal Website Hosting**

```javascript
// Host your portfolio on STARW
await fetch('/api/website:host', {
  method: 'POST',
  body: JSON.stringify({
    domain: 'alice.str',
    websiteData: {
      html: '<h1>Welcome to my portfolio</h1>',
      css: 'body { background: #000; color: #fff; }'
    }
  })
});

// Now accessible at: https://alice.str.stratus.network
```

---

### 4. **Identity Verification**

```javascript
// Check if domain is registered
const profile = await fetch('/api/identity:profile?domain=alice.str');

if (profile.verified) {
  console.log('✅ Verified identity');
} else {
  console.log('⚠️ Unverified domain');
}
```

---

## 🔐 PRIVACY & SECURITY

### Wallet Masking
- **Private Address**: Hidden behind domain
- **Public Profile**: Only shows what you choose
- **Selective Disclosure**: Control what information is public

### On-Chain Verification
- Domain registration recorded on blockchain
- Ownership provable with digital signature
- Immutable registration history

### STARW Distribution
- Websites distributed across network
- No single point of failure
- Censorship-resistant hosting

---

## 🌐 STARW WEBSITE HOSTING

### How It Works

```
1. Create website content (HTML/CSS/JS)
   ↓
2. Register with domain (alice.str)
   ↓
3. Host on STARW nodes
   ↓
4. Distributed across 1313 nodes
   ↓
5. Accessible at https://alice.str.stratus.network
```

### Benefits

✅ **Decentralized** - No single hosting provider  
✅ **Censorship-Resistant** - Cannot be taken down  
✅ **Fast** - Distributed CDN-like performance  
✅ **Free** - Included with domain registration  
✅ **HTTPS** - Automatic SSL certificates  
✅ **Version Control** - On-chain update history  

---

## 📊 STATISTICS

### Domain Registration Growth

```javascript
// Get total domains
const { count } = await fetch('/api/identity:list').then(r => r.json());

// Get registration timeline
const { ledger } = await fetch('/api/identity:ledger').then(r => r.json());

const registrationsPerDay = ledger.reduce((acc, entry) => {
  const date = new Date(entry.timestamp).toDateString();
  acc[date] = (acc[date] || 0) + 1;
  return acc;
}, {});
```

### Popular Domains

```javascript
// Most searched domains
const topSearches = [
  'satoshi.str',
  'bitcoin.str',
  'ethereum.str',
  'crypto.str'
];
```

---

## 🛠️ INTEGRATION EXAMPLES

### JavaScript/TypeScript

```typescript
// Register identity
async function registerIdentity(domain: string, walletAddress: string) {
  const response = await fetch('http://localhost:3002/api/identity:register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain,
      walletAddress,
      publicProfile: {
        displayName: domain.split('.')[0],
        bio: 'New user on Stratus Network'
      }
    })
  });
  
  return response.json();
}

// Resolve domain
async function resolveToWallet(domain: string): Promise<string> {
  const response = await fetch(
    `http://localhost:3002/api/identity:resolve?domain=${domain}`
  );
  const { walletAddress } = await response.json();
  return walletAddress;
}

// Send to domain instead of address
async function sendTokens(toDomain: string, amount: number) {
  const toAddress = await resolveToWallet(toDomain);
  // Use toAddress for transaction
  console.log(`Sending ${amount} STR to ${toDomain} (${toAddress})`);
}

// Search users
async function searchUsers(query: string) {
  const response = await fetch(
    `http://localhost:3002/api/identity:search?q=${query}`
  );
  const { results } = await response.json();
  return results;
}
```

---

## 🎨 FRONTEND EXAMPLE

### Domain Lookup Component

```tsx
import React, { useState } from 'react';

function DomainLookup() {
  const [domain, setDomain] = useState('');
  const [profile, setProfile] = useState(null);

  const handleLookup = async () => {
    const res = await fetch(
      `http://localhost:3002/api/identity:profile?domain=${domain}`
    );
    const data = await res.json();
    setProfile(data.profile);
  };

  return (
    <div>
      <input 
        value={domain} 
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Enter STR.DOMAIN..."
      />
      <button onClick={handleLookup}>Lookup</button>

      {profile && (
        <div className="profile-card">
          <h2>{profile.displayName}</h2>
          <p>{profile.bio}</p>
          {profile.avatar && <img src={profile.avatar} />}
          <a href={profile.website}>Visit Website</a>
        </div>
      )}
    </div>
  );
}
```

---

## 📈 FUTURE ENHANCEMENTS

### 1. **ENS Integration**
- Bridge with Ethereum Name Service
- Cross-chain domain resolution
- Unified identity across chains

### 2. **IPFS Storage**
- Store large assets on IPFS
- Reference IPFS hashes in domain
- Decentralized asset hosting

### 3. **NFT Domains**
- Domains as tradeable NFTs
- Marketplace for premium domains
- Domain leasing and rentals

### 4. **Verified Badges**
- On-chain verification system
- KYC integration
- Trust score algorithm

### 5. **Custom TLDs**
- .str (default)
- .crypto, .web3, .dao
- User-created TLD system

---

## 🎓 CONCLUSION

The **STR.DOMAIN Public Identity System** transforms blockchain UX:

✅ **Human-Readable** - Replace complex addresses with names  
✅ **Public Discovery** - Find users easily  
✅ **STARW Hosting** - Free website hosting  
✅ **Privacy Control** - Choose what's public  
✅ **Decentralized** - No central authority  
✅ **Blockchain-Verified** - On-chain proof of ownership  

**The future of blockchain identity is here. Simple. Discoverable. Decentralized.**

---

**System Version**: 1.0.0  
**Compatible with**: Sourceless Blockchain v0.14  
**Storage**: HOSTLESS Database  
**Hosting**: STARW Network  
**Created**: November 10, 2025
