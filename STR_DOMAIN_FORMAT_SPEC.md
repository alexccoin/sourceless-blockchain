# STR.DOMAIN Format Specification

## Official Format

**REQUIRED FORMAT**: `STR.<identifier>`

**Examples**:
- ✅ `STR.alice`
- ✅ `STR.bob-wallet`
- ✅ `STR.company`
- ✅ `STR.developer_portfolio`
- ✅ `STR.alice.personal`
- ✅ `STR.123test`
- ✅ `STR.a`
- ✅ `STR.very-long-identifier-name-with-many-words-1234567890`

**Invalid Examples**:
- ❌ `alice.str` (wrong order - not supported)
- ❌ `alice` (missing STR prefix)
- ❌ `STR alice` (space not allowed)
- ❌ `STR.` (no identifier)
- ❌ `STR.alice smith` (space in identifier)
- ❌ `str.alice` (lowercase prefix - will be normalized)

## Format Rules

### 1. Prefix (REQUIRED)
- **MUST** start with `STR.`
- Prefix is case-insensitive (normalized to uppercase)
- The dot (.) is REQUIRED separator

### 2. Identifier (REQUIRED)
- **Length**: 1-64 characters
- **Allowed characters**:
  - Letters: `a-z`, `A-Z`
  - Numbers: `0-9`
  - Hyphen: `-`
  - Underscore: `_`
  - Dot: `.` (for sub-identifiers)
- **Forbidden**:
  - Spaces: ` ` (not allowed)
  - Special characters: `@`, `#`, `$`, `%`, `&`, `*`, `(`, `)`, etc.

### 3. Case Sensitivity
- **Prefix**: Case-insensitive (`str.`, `STR.`, `Str.` all normalize to `STR.`)
- **Identifier**: Case-preserving (stored as provided)
  - `STR.Alice` and `STR.alice` are DIFFERENT domains

## Validation Regex

```javascript
/^STR\.[a-zA-Z0-9\-_\.]{1,64}$/i
```

**Breakdown**:
- `^STR\.` - Must start with "STR."
- `[a-zA-Z0-9\-_\.]{1,64}` - 1-64 characters from allowed set
- `$` - Must end (no trailing characters)
- `i` - Case-insensitive flag (for STR prefix)

## Examples by Use Case

### Personal Identity
```
STR.alice
STR.bob
STR.john-smith
STR.jane_doe
```

### Business/Organization
```
STR.company
STR.acme-corp
STR.startup_inc
STR.organization
```

### Project/Portfolio
```
STR.my-portfolio
STR.developer-site
STR.crypto-project
STR.nft_collection
```

### Sub-Identifiers
```
STR.alice.personal
STR.alice.business
STR.company.support
STR.company.sales
```

### Numbered/Versioned
```
STR.user123
STR.wallet-v2
STR.test_1
STR.deployment-2024
```

## Storage Format

### Filename Sanitization
Dots in identifiers are replaced with underscores for filenames:

**Domain**: `STR.alice` → **File**: `STR_alice.json`
**Domain**: `STR.alice.personal` → **File**: `STR_alice_personal.json`

### Directory Structure
```
.hostless/
├── public-identities/
│   ├── STR_alice.json
│   ├── STR_bob-wallet.json
│   ├── STR_company.json
│   └── STR_alice_personal.json
└── domain-websites/
    ├── STR_alice.json
    ├── STR_alice/
    │   ├── index.html
    │   ├── styles.css
    │   └── script.js
    └── STR_company.json
```

## API Usage

### Registration
```javascript
// Correct format
await db.registerPublicIdentity(
  'STR.alice',  // ✅ Correct
  'zk13str_...',
  { displayName: 'Alice' }
);

// Will throw error
await db.registerPublicIdentity(
  'alice.str',  // ❌ Wrong format
  'zk13str_...',
  { displayName: 'Alice' }
);
// Error: Domain must be format: STR.{identifier}
```

### Resolution
```javascript
// Resolve domain to wallet
const wallet = await db.resolveDomainToWallet('STR.alice');
// Returns: zk13str_fe9cc876f250756e8ba51a109ac4070811262af9_551d
```

### Website Hosting
```javascript
// Host website
await db.hostDomainWebsite('STR.alice', {
  html: '<h1>Hello</h1>',
  css: 'body { ... }'
});

// Accessible at: https://STR.alice.stratus.network
```

## Migration Notes

### Old Format → New Format

If you have existing `<name>.str` format domains, they need migration:

```javascript
// Old format (deprecated)
'alice.str'
'bob.str'
'company.str'

// New format (required)
'STR.alice'
'STR.bob'
'STR.company'
```

**Migration Script**:
```javascript
async function migrateToNewFormat(oldDomain) {
  // Extract name from old format
  const name = oldDomain.replace('.str', '');
  
  // Create new format
  const newDomain = `STR.${name}`;
  
  // Re-register with new format
  const oldIdentity = await db.getPublicProfile(oldDomain);
  await db.registerPublicIdentity(
    newDomain,
    oldIdentity.walletAddress,
    oldIdentity.publicProfile
  );
  
  return newDomain;
}
```

## Why STR. Prefix?

### Benefits
1. **Namespace Clarity**: Immediately identifies Stratus domains
2. **Forward Compatibility**: Can add more prefixes (e.g., `CCOIN.`, `CCOS.`)
3. **DNS Compatibility**: Follows subdomain pattern
4. **Brand Recognition**: STR prefix reinforces Stratus brand
5. **Search Optimization**: Easy to filter/search STR. domains

### Comparison with Other Systems
- **ENS**: `name.eth` (suffix)
- **Unstoppable**: `name.crypto` (suffix)
- **Stratus**: `STR.name` (prefix) ✅

## Security Considerations

### Domain Squatting Prevention
- First-come, first-served registration
- On-chain ledger prevents double registration
- Case-sensitivity allows variations (STR.Alice vs STR.alice)

### Validation
Always validate format before registration:
```javascript
function isValidStrDomain(domain) {
  return /^STR\.[a-zA-Z0-9\-_\.]{1,64}$/i.test(domain);
}

// Usage
if (!isValidStrDomain(domain)) {
  throw new Error('Invalid STR.DOMAIN format');
}
```

## Future Enhancements

### Planned Features
- **Sub-domain delegation**: `STR.company` owner can create `STR.company.support`
- **Domain trading**: NFT-based ownership transfer
- **Premium domains**: Auction system for 1-3 character identifiers
- **Expiration/Renewal**: Time-based domain registration
- **Verification badges**: Blue check for verified identities

### Reserved Domains
System-reserved domains (not available for public registration):
```
STR.system
STR.admin
STR.root
STR.official
STR.genesis
```

## Support

For issues with STR.DOMAIN format:
- Check regex validation: `/^STR\.[a-zA-Z0-9\-_\.]{1,64}$/i`
- Ensure no spaces in identifier
- Verify length (1-64 characters)
- Use only allowed characters

---

**Version**: 1.0.0  
**Last Updated**: November 10, 2025  
**Specification**: STR.DOMAIN Format  
**Status**: ✅ ACTIVE
