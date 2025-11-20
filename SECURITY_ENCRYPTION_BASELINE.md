# Security & Encryption Baseline

## Objectives
Provide foundational hardening around GodCypher, PoE validation, and identity proofs to ensure integrity, confidentiality, and resilience.

## Layers
1. Transport: Local static serve (upgrade path → HTTPS reverse proxy + HSTS).
2. Proof Integrity: PoE + GodCypher + encryptionIntegrity threshold (strict mode).
3. Identity Abstraction: STR domain mapping with redaction in public mode.
4. Buffer Protection: Limited ring size (maxProofs) + planned signature verification.

## GodCypher
- Purpose: Hybrid encryption + integrity flagging.
- Current: Randomized validity flags & integrity score simulation.
- Baseline Upgrade Plan:
  - Deterministic encryptionIntegrity derived from hash of (sender|receiver|timestamp|merkleRoot).
  - Add signature field `sig` (Ed25519) signed over core proof payload.
  - Validate signature before emission; drop invalid proofs.

## Proof of Existence (PoE)
- High priority: Must succeed for emission when strict mode enabled.
- Plan: Replace random `poeValid` with deterministic check of inclusion in rolling Merkle tree.
- Anchor Strategy: Emit merkleRoot every N proofs (e.g., 10) and optionally persist anchor for audit.

## Threat Model Highlights
| Threat | Mitigation |
|--------|-----------|
| Replay of old proofs | Bloom filter of recent proofHash values |
| Tampered domains | Strict regex validation + authoritative resolver microservice |
| Integrity downgrade | Enforced minEncryptionIntegrity threshold |
| Buffer overflow | Hard cap + O(1) eviction (future deque) |
| Signature forgery | Ed25519 robust verification + secure key storage |

## Data Fields (Extended Plan)
| Field | Purpose |
|-------|---------|
| id | Unique proof identifier |
| timestamp | Chronological ordering |
| participants | Identity triad (private mode) |
| poeValid | Existence guarantee flag |
| godCypherValid | Encryption/integrity check flag |
| encryptionIntegrity | Numeric integrity score (≥97 strict) |
| proofHash | Content hash (input to Merkle tree) |
| merkleRoot | Batch root reference |
| compactFlags | Bitmask summarizing critical statuses |
| sig | Signature over canonical payload (planned) |

## Implementation Roadmap
1. Canonical serialization format (stable field order).
2. Add deterministic hash → Merkle insertion → root update.
3. Integrate Ed25519 keypair (client or server signing strategy).
4. Bloom filter for replay detection.
5. Anchor endpoint to publish periodic merkleRoot externally.

## Performance Considerations
- Avoid expensive crypto for every proof: Pre-generate key & use fast Ed25519 libs.
- Batch Merkle updates to reduce recomputation overhead.
- Use typed arrays for hash and signature processing.

## Ownership
All methods and specifications © Alexandru Marius Stratulat & SourceLess Team. “SourceLess” is a registered trademark.
