(function(){
  /* SourceLess Configuration
     © Alexandru Marius Stratulat & SourceLess Team. Trademark: "SourceLess". */
  // Global configuration for SourceLess client features
  const GLOBAL = window.SourceLess || (window.SourceLess = {});
  GLOBAL.config = Object.assign({
    strictProofs: true,
    requirePoE: true,
    requireGodCypher: true,
    minEncryptionIntegrity: 97.0,
    publicRedaction: true,
    proofIntervalMs: 4000,
    maxProofs: 250,
    // Cryptographic hardening
    enableSignatures: true,
    enableMerkleAnchoring: true,
    merkleBatchSize: 50,
    merkleAutoAnchorInterval: 30000 // 30 seconds
  }, GLOBAL.config || {});
})();
