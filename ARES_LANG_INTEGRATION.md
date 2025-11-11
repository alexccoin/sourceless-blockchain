# AresLang Integration (Mock API)

This project now includes a **mock AresLang API layer** inspired by the `ares-forge-genesis-code` repository. It provides a stable interface for future integration of real quantum-safe cryptography, earthquake entropy, cross-chain support, and smart contract tooling.

## Modules Implemented

Located in `src/main/areslang/`:

- `QuantumCrypto` – key pair generation, encrypt/decrypt, sign/verify (placeholder AES-GCM + HMAC)
- `EarthquakeEntropy` – simulated entropy generation and quality scoring
- `CrossChainBridge` – returns supported chains
- `AresLangApp` – orchestrates the above modules and exposes a cleanup lifecycle

## IPC / Renderer API
The Electron preload exposes AresLang functions under `window.sourcelessAPI.ares`:

```ts
window.sourcelessAPI.ares.generateKeyPair();
window.sourcelessAPI.ares.encrypt(data, publicKey);
window.sourcelessAPI.ares.decrypt(payload, privateKey);
window.sourcelessAPI.ares.sign(message, privateKey);
window.sourcelessAPI.ares.verify(message, signature, publicKey);
window.sourcelessAPI.ares.entropyBytes(length);
window.sourcelessAPI.ares.entropyQuality();
window.sourcelessAPI.ares.chains();
window.sourcelessAPI.ares.cleanup();
```

## HTTP Endpoints (Browser Mode)
Available via `server.js` for non-Electron clients:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/areslang:crypto:keypair` | GET | Generate key pair |
| `/api/areslang:crypto:encrypt` | POST | Encrypt payload `{ data, publicKey }` |
| `/api/areslang:crypto:decrypt` | POST | Decrypt payload `{ payload, privateKey }` |
| `/api/areslang:entropy:bytes?length=32` | GET | Get base64 entropy bytes |
| `/api/areslang:entropy:quality` | GET | Entropy quality metrics |
| `/api/areslang:chains:supported` | GET | Supported cross-chain networks |

## Example Usage

```ts
// Generate keys
const kp = await window.sourcelessAPI.ares.generateKeyPair();

// Encrypt & decrypt
const encrypted = await window.sourcelessAPI.ares.encrypt('Hello Quantum', kp.publicKey);
const decrypted = await window.sourcelessAPI.ares.decrypt(encrypted, kp.privateKey);

// Entropy
const bytes = await window.sourcelessAPI.ares.entropyBytes(64);
const quality = await window.sourcelessAPI.ares.entropyQuality();

// Cross-chain
const chains = await window.sourcelessAPI.ares.chains();
```

## Roadmap to Real Implementation

| Feature | Mock Strategy | Upgrade Path |
|---------|---------------|--------------|
| Quantum KeyGen | Random bytes | Replace with CRYSTALS-Kyber/Dilithium libs via native/WASM bindings |
| Encryption | AES-GCM symmetric | Implement lattice-based PQ encryption (e.g., Kyber KEM + symmetric hybrid) |
| Signatures | HMAC-SHA256 placeholder | Integrate Dilithium/SPHINCS+ signature schemes |
| Entropy | `crypto.randomBytes` + static score | Aggregate real seismic feeds (USGS, EMSC, JMA) with oracle verification |
| Cross-Chain | Static list | Implement chain adapters and atomic swap protocols |

## Integration Points
- Smart contract examples extended (`aresforge-quantum.ts`) to demonstrate quantum-safe, entropy-driven, cross-chain patterns.
- IPC layer unified with existing deployment and contract IDE workflows.
- Server parity enables browser clients to experiment without Electron.

## Security Disclaimer
This is **not** production-grade cryptography. It is a scaffold for interface stability and UI flows. Do **not** use for real asset security, key management, or signature validation.

## Testing Commands

```powershell
# Restart full stack (Electron + Vite + Server)
npm run dev:all

# Query key pair (browser mode)
Invoke-WebRequest http://localhost:3000/api/areslang:crypto:keypair | Select-Object -ExpandProperty Content

# Entropy bytes
Invoke-WebRequest http://localhost:3000/api/areslang:entropy:bytes?length=48 | Select-Object -ExpandProperty Content
```

## Next Steps
1. Add UI panel for AresLang actions (generate keys, encrypt/decrypt, entropy preview).
2. Introduce persistence of generated keys (secure storage module).
3. Integrate real seismic data collection pipeline.
4. Replace mock crypto with post-quantum library bindings.
5. Add formal verification hooks for contract examples.

---
*Education Purpose Only – Aligns with Ares Forge Genesis conceptual model.*
