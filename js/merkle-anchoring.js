/**
 * Merkle Tree Anchoring System
 * 
 * © 2025 Sourceless Blockchain
 * Trademark & Patents: Alexander Horn (Str4tus)
 * Licensed under Sourceless Blockchain Custom License
 * 
 * Provides cryptographic anchoring of proof batches via Merkle trees
 * Enables efficient verification and batch integrity validation
 * Version: 1.0.0
 */

(function(global) {
  'use strict';

  /**
   * Merkle Tree implementation for proof anchoring
   */
  class MerkleTree {
    constructor(leaves) {
      this.leaves = leaves || [];
      this.layers = [];
      this.root = null;
      
      if (leaves.length > 0) {
        this.build();
      }
    }

    /**
     * Build the Merkle tree from leaves
     */
    build() {
      if (this.leaves.length === 0) {
        throw new Error('Cannot build tree with no leaves');
      }

      // Hash all leaves
      const leafHashes = this.leaves.map(leaf => this._hash(leaf));
      this.layers = [leafHashes];

      // Build tree layers
      let currentLayer = leafHashes;
      while (currentLayer.length > 1) {
        currentLayer = this._buildLayer(currentLayer);
        this.layers.push(currentLayer);
      }

      this.root = currentLayer[0];
      return this.root;
    }

    /**
     * Get Merkle proof for a specific leaf
     * @param {number} index - Index of the leaf
     * @returns {Array} Proof path (array of {hash, position})
     */
    getProof(index) {
      if (index < 0 || index >= this.leaves.length) {
        throw new Error('Invalid leaf index');
      }

      const proof = [];
      let currentIndex = index;

      // Traverse from leaf to root
      for (let i = 0; i < this.layers.length - 1; i++) {
        const layer = this.layers[i];
        const isRightNode = currentIndex % 2 === 1;
        const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

        if (siblingIndex < layer.length) {
          proof.push({
            hash: layer[siblingIndex],
            position: isRightNode ? 'left' : 'right'
          });
        }

        currentIndex = Math.floor(currentIndex / 2);
      }

      return proof;
    }

    /**
     * Verify a Merkle proof
     * @param {*} leaf - Original leaf data
     * @param {Array} proof - Merkle proof path
     * @param {string} root - Expected root hash
     * @returns {boolean} Valid proof
     */
    static verify(leaf, proof, root) {
      let hash = MerkleTree._staticHash(leaf);

      for (const step of proof) {
        if (step.position === 'left') {
          hash = MerkleTree._staticHash(step.hash + hash);
        } else {
          hash = MerkleTree._staticHash(hash + step.hash);
        }
      }

      return hash === root;
    }

    /**
     * Get the Merkle root
     * @returns {string} Root hash
     */
    getRoot() {
      return this.root;
    }

    /**
     * Get tree depth
     * @returns {number} Depth
     */
    getDepth() {
      return this.layers.length;
    }

    // ===== PRIVATE METHODS =====

    _buildLayer(nodes) {
      const layer = [];
      
      for (let i = 0; i < nodes.length; i += 2) {
        if (i + 1 < nodes.length) {
          // Hash pair
          layer.push(this._hash(nodes[i] + nodes[i + 1]));
        } else {
          // Odd number of nodes - promote last node
          layer.push(nodes[i]);
        }
      }
      
      return layer;
    }

    async _hash(data) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(String(data));
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static async _staticHash(data) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(String(data));
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  }

  /**
   * Proof Anchoring Manager
   * Manages batch anchoring of proofs using Merkle trees
   */
  class ProofAnchoringManager {
    constructor(options = {}) {
      this.batchSize = options.batchSize || 100;
      this.autoAnchorInterval = options.autoAnchorInterval || 30000; // 30 seconds
      this.currentBatch = [];
      this.anchoredBatches = [];
      this.proofIndex = new Map(); // proof ID -> anchor info
      this.autoAnchorTimer = null;
      
      if (options.autoAnchor !== false) {
        this.startAutoAnchoring();
      }
    }

    /**
     * Add proof to current batch
     * @param {Object} proof - Proof object
     * @returns {boolean} True if batch was anchored
     */
    addProof(proof) {
      this.currentBatch.push(proof);
      
      if (this.currentBatch.length >= this.batchSize) {
        this.anchorCurrentBatch();
        return true;
      }
      
      return false;
    }

    /**
     * Anchor current batch to Merkle tree
     * @returns {Promise<Object>} Anchor result
     */
    async anchorCurrentBatch() {
      if (this.currentBatch.length === 0) {
        return null;
      }

      const batch = [...this.currentBatch];
      this.currentBatch = [];

      // Create leaf data from proofs
      const leaves = batch.map(proof => this._serializeProof(proof));
      
      // Build Merkle tree
      const tree = new MerkleTree(leaves);
      
      const anchorData = {
        id: `anchor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        proofCount: batch.length,
        merkleRoot: tree.getRoot(),
        depth: tree.getDepth(),
        tree: tree
      };

      // Index all proofs in this batch
      batch.forEach((proof, index) => {
        const merkleProof = tree.getProof(index);
        this.proofIndex.set(proof.id, {
          anchorId: anchorData.id,
          batchIndex: index,
          merkleRoot: anchorData.merkleRoot,
          merkleProof: merkleProof,
          anchored: true
        });
      });

      this.anchoredBatches.push(anchorData);
      
      // Keep only last 100 batches in memory
      if (this.anchoredBatches.length > 100) {
        const oldBatch = this.anchoredBatches.shift();
        // Remove old proof indexes
        for (const [proofId, anchorInfo] of this.proofIndex.entries()) {
          if (anchorInfo.anchorId === oldBatch.id) {
            this.proofIndex.delete(proofId);
          }
        }
      }

      console.log(`[MerkleAnchoring] Anchored batch: ${anchorData.id}, ${batch.length} proofs, root: ${anchorData.merkleRoot.substring(0, 16)}...`);
      
      return anchorData;
    }

    /**
     * Verify a proof's Merkle anchor
     * @param {string} proofId - Proof ID
     * @param {Object} proof - Original proof object
     * @returns {boolean} Valid anchor
     */
    verifyProofAnchor(proofId, proof) {
      const anchorInfo = this.proofIndex.get(proofId);
      
      if (!anchorInfo || !anchorInfo.anchored) {
        return false;
      }

      const leaf = this._serializeProof(proof);
      return MerkleTree.verify(leaf, anchorInfo.merkleProof, anchorInfo.merkleRoot);
    }

    /**
     * Get anchor information for a proof
     * @param {string} proofId - Proof ID
     * @returns {Object|null} Anchor info
     */
    getProofAnchorInfo(proofId) {
      return this.proofIndex.get(proofId) || null;
    }

    /**
     * Get statistics
     * @returns {Object} Statistics
     */
    getStats() {
      return {
        currentBatchSize: this.currentBatch.length,
        totalBatches: this.anchoredBatches.length,
        totalAnchored: this.proofIndex.size,
        lastAnchor: this.anchoredBatches.length > 0 
          ? this.anchoredBatches[this.anchoredBatches.length - 1] 
          : null
      };
    }

    /**
     * Start automatic batch anchoring
     */
    startAutoAnchoring() {
      if (this.autoAnchorTimer) return;
      
      this.autoAnchorTimer = setInterval(() => {
        if (this.currentBatch.length > 0) {
          this.anchorCurrentBatch();
        }
      }, this.autoAnchorInterval);
    }

    /**
     * Stop automatic batch anchoring
     */
    stopAutoAnchoring() {
      if (this.autoAnchorTimer) {
        clearInterval(this.autoAnchorTimer);
        this.autoAnchorTimer = null;
      }
    }

    /**
     * Force anchor current batch immediately
     * @returns {Promise<Object>} Anchor result
     */
    forceAnchor() {
      return this.anchorCurrentBatch();
    }

    // ===== PRIVATE METHODS =====

    _serializeProof(proof) {
      // Create deterministic string representation
      const keys = Object.keys(proof).sort();
      const parts = keys.map(key => `${key}:${JSON.stringify(proof[key])}`);
      return parts.join('|');
    }
  }

  // Singleton instance
  const anchoringManager = new ProofAnchoringManager({
    batchSize: 50,
    autoAnchorInterval: 30000,
    autoAnchor: true
  });

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MerkleTree, ProofAnchoringManager, anchoringManager };
  } else {
    global.MerkleTree = MerkleTree;
    global.ProofAnchoringManager = ProofAnchoringManager;
    global.anchoringManager = anchoringManager;
  }

})(typeof window !== 'undefined' ? window : global);
