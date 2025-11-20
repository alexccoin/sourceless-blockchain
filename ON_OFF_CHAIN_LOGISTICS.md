# SourceLess On / Off-Chain Logistics

## Overview
This document defines separation, flows, and enhancement actions for on-chain and off-chain operations in the SourceLess ecosystem.

## On-Chain (Authoritative)
- Consensus Records: Blocks, validator attestations, PoE commitments.
- Identity Anchors: Hash commitments for GodCypher + ZK13 addresses.
- Token Ledgers: STR, CCOS, ARSS, ESTR, $TR, WSTR, WNFT balances and transfers.
- Smart Contract Logic (AresLang): Execution determinism & state transitions.

## Off-Chain (Supportive)
- Indexing Cache: Recent proof stream buffer, transaction lookups, pagination.
- Aggregated Metrics: TPMS scaling calculations, portfolio USD estimation.
- UI State: Session identity resolution, redacted public views.
- Analytics Derivatives: Integrity averages, success percentages, performance snapshots.

## Data Flow Mapping
1. User action (wallet / contract) → Off-chain preflight (fees, validation) → On-chain submission.
2. Identity proof generation loop → Off-chain ring buffer → Selective on-chain anchor (batched Merkle root every N proofs).
3. TPMS metric update → Off-chain computed → Display only (never overrides on-chain throughput counters).

## Integrity & Trust Layers
- Primary Trust Root: On-chain block & PoE evidence.
- Secondary: GodCypher validity flags + encryptionIntegrity threshold (strict mode).
- Tertiary: Off-chain buffer cross-check (dropped proofs if below policy thresholds).

## Performance Enhancements
| Area | Current | Enhancement |
|------|---------|------------|
| Proof Generation | fixed interval | adaptive interval based on node load |
| Buffer Handling | FIFO array | switch to deque structure for O(1) shift/pop |
| Identity Resolution | basic string map | integrate Hostless domain resolver microservice |
| Metrics | random jitter | replace with rolling window & EWMA smoothing |

## Security Hardening Actions
- Add signature per proof (Ed25519) referencing sender domain.
- Introduce replay protection: maintain short-lived hash Bloom filter.
- Encrypt witness metadata client-side when public mode enabled.
- Bind Merkle root emission to epoch boundaries (e.g., every 10 proofs).

## Future Work
- Formal spec (GodCypher v2) with deterministic verification pathway.
- WASM module for AresLang contract static validation pre-exec.
- Multi-region redundancy for off-chain caches.

## Actionable Checklist
- [ ] Implement adaptive proof interval logic.
- [ ] Integrate signature + verification path.
- [ ] Add Bloom filter replay protection.
- [ ] Merkle root periodic anchor endpoint.
- [ ] Replace buffer with deque structure.

## Ownership & Trademark
All content © Alexandru Marius Stratulat & SourceLess Team. “SourceLess” is a registered trademark.
