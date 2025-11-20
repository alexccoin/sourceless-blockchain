/**
 * Identity & GodCypher Proof Stream (Non-invasive Add-On)
 * Adds unified proof schema + public/private identity resolution + subscription API.
 * Does not remove or modify existing globals; only augments window.SourceLess.
 */
/* SourceLess Identity & Proof Stream
   © Alexandru Marius Stratulat & SourceLess Team. Trademark: "SourceLess".
   Unauthorized removal of ownership notice prohibited. */
(function(){
  const GLOBAL = window.SourceLess || (window.SourceLess = {});
  const CFG = GLOBAL.config || {};
  const IDENT_VERSION = '1.2.0'; // Updated with signatures & Merkle anchoring

  // Import signature engine and anchoring manager (loaded before this script)
  const signatureEngine = window.signatureEngine;
  const anchoringManager = window.anchoringManager;

  // Simple in-memory ring buffer for last N proofs
  const MAX_PROOFS = typeof CFG.maxProofs === 'number' ? CFG.maxProofs : 250;
  const proofsBuffer = [];

  // Helper: pseudo-random hex
  function randHex(bytes){
    const arr = new Uint8Array(bytes);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  // Domain resolution shim (public vs private)
  function resolveDomain(address){
    // If address already looks like STR.domain, return as-is
    if(/^STR\.[a-z0-9]{3,32}$/i.test(address)) return address;
    // Simulate mapping (could later hook real HostlessDatabase resolver)
    return 'STR.' + address.slice(0,8).replace(/[^a-z0-9]/gi,'').toLowerCase();
  }

  // Unified proof schema generator
  function generateProof(){
    const sender = 'zk13str_' + randHex(6);
    const receiver = 'zk13str_' + randHex(6);
    const witness = 'zk13str_' + randHex(4);

    const strDomainSender = resolveDomain(sender);
    const strDomainReceiver = resolveDomain(receiver);
    const strDomainWitness = resolveDomain(witness);

    const zk13Score = Math.floor(Math.random()*50)+50; // 50-99
    const encryptionIntegrity = (Math.random()*10 + 90).toFixed(2); // 90-100%
    const poeValid = Math.random() > 0.03; // 97% success
    const godCypherValid = Math.random() > 0.05; // 95% success

    const proofHash = randHex(16); // 128-bit compact hash
    const merkleRoot = randHex(32); // 256-bit root

    // Compact flags (bitmask) similar to Compact PoE guide
    // bit0: poeValid, bit1: godCypherValid, bit2: highIntegrity (>95), bit3: reserved
    let compactFlags = 0;
    if(poeValid) compactFlags |= 0b0001;
    if(godCypherValid) compactFlags |= 0b0010;
    if(parseFloat(encryptionIntegrity) > 95) compactFlags |= 0b0100;

    return {
      id: 'proof_' + randHex(8),
      version: IDENT_VERSION,
      timestamp: Date.now(),
      participants: {
        sender: { address: sender, domain: strDomainSender },
        receiver: { address: receiver, domain: strDomainReceiver },
        witness: { address: witness, domain: strDomainWitness }
      },
      strDomainSender,
      strDomainReceiver,
      strDomainWitness,
      zk13Score,
      encryptionIntegrity: parseFloat(encryptionIntegrity),
      poeValid,
      godCypherValid,
      proofHash,
      merkleRoot,
      compactFlags,
      integrityBits: {
        poe: poeValid ? 1:0,
        godCypher: godCypherValid ? 1:0,
        highIntegrity: parseFloat(encryptionIntegrity) > 95 ? 1:0
      }
    };
  }

  // Subscription management
  const subscribers = new Set();
  function emit(proof){
    subscribers.forEach(sub => {
      try {
        const mode = sub.mode || 'private';
        if(mode === 'public') {
          // Redact domains -> hash prefix
          sub.cb({
            ...proof,
            participants: undefined,
            strDomainSender: proof.strDomainSender.slice(0,6) + '…',
            strDomainReceiver: proof.strDomainReceiver.slice(0,6) + '…',
            strDomainWitness: proof.strDomainWitness.slice(0,6) + '…'
          });
        } else {
          sub.cb(proof);
        }
      } catch(e){ /* swallow */ }
    });
  }

  function addProof(){
    let proof = generateProof();
    const strict = !!CFG.strictProofs;
    const minEnc = typeof CFG.minEncryptionIntegrity === 'number' ? CFG.minEncryptionIntegrity : 0;
    const needPoE = CFG.requirePoE !== false; // default true
    const needGod = CFG.requireGodCypher !== false; // default true
    let attempts = 0;
    if(strict){
      while(attempts < 5 && (
        (needPoE && !proof.poeValid) ||
        (needGod && !proof.godCypherValid) ||
        (proof.encryptionIntegrity < minEnc)
      )){
        proof = generateProof();
        attempts++;
      }
      if((needPoE && !proof.poeValid) || (needGod && !proof.godCypherValid) || (proof.encryptionIntegrity < minEnc)){
        return; // drop emission if constraints not met
      }
    }

    // Add cryptographic signature if enabled
    if(CFG.enableSignatures && signatureEngine){
      try {
        const identityId = proof.participants.sender.address;
        signatureEngine.addSignatureToProof(proof, identityId);
      } catch(e){
        console.warn('[IdentityProofs] Signature failed:', e);
      }
    }

    // Add to Merkle anchoring batch
    if(CFG.enableMerkleAnchoring && anchoringManager){
      try {
        anchoringManager.addProof(proof);
      } catch(e){
        console.warn('[IdentityProofs] Merkle anchoring failed:', e);
      }
    }

    proofsBuffer.push(proof);
    if(proofsBuffer.length > MAX_PROOFS) proofsBuffer.shift();
    emit(proof);
  }

  // Start generation loop (configurable)
  const interval = typeof CFG.proofIntervalMs === 'number' ? CFG.proofIntervalMs : 4000;
  setInterval(addProof, Math.max(1000, interval));

  const IdentityProofAPI = {
    getLatest(limit=25, mode='private'){
      const slice = proofsBuffer.slice(-limit);
      if(mode==='public') {
        return slice.map(p=>({
          id: p.id,
          timestamp: p.timestamp,
            strDomainSender: p.strDomainSender.slice(0,6)+'…',
            strDomainReceiver: p.strDomainReceiver.slice(0,6)+'…',
            strDomainWitness: p.strDomainWitness.slice(0,6)+'…',
            zk13Score: p.zk13Score,
            encryptionIntegrity: p.encryptionIntegrity,
            poeValid: p.poeValid,
            godCypherValid: p.godCypherValid,
            proofHash: p.proofHash,
            merkleRoot: p.merkleRoot,
            compactFlags: p.compactFlags
        }));
      }
      return slice;
    },
    subscribe(cb, options={}){
      const sub = { cb, mode: options.mode || 'private'};
      subscribers.add(sub);
      return () => subscribers.delete(sub);
    },
    resolve(addressOrDomain){
      return resolveDomain(addressOrDomain);
    },
    getPrimaryIdentity(){
      // Heuristic: take first recent proof sender domain
      const latest = proofsBuffer[proofsBuffer.length-1];
      return latest ? latest.strDomainSender : 'STR.unknown';
    },
    verifySignature(proof){
      if(!signatureEngine || !proof.signature) return false;
      try {
        return signatureEngine.verifySignature(proof, proof.publicKey);
      } catch(e){
        console.warn('[IdentityProofs] Verification error:', e);
        return false;
      }
    },
    verifyMerkleAnchor(proofId, proof){
      if(!anchoringManager) return false;
      try {
        return anchoringManager.verifyProofAnchor(proofId, proof);
      } catch(e){
        console.warn('[IdentityProofs] Merkle verification error:', e);
        return false;
      }
    },
    getAnchorInfo(proofId){
      if(!anchoringManager) return null;
      return anchoringManager.getProofAnchorInfo(proofId);
    },
    getAnchorStats(){
      if(!anchoringManager) return null;
      return anchoringManager.getStats();
    },
    version: IDENT_VERSION
  };

  GLOBAL.identityProofs = IdentityProofAPI;
})();
