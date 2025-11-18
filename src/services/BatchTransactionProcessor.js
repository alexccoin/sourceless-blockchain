
/**
 * ⚡ BATCH TRANSACTION PROCESSOR
 * Process multiple transactions efficiently
 */
class BatchTransactionProcessor {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.batchQueue = [];
        this.batchSize = 1000;
        this.processingInterval = 100; // ms
        
        setInterval(() => this.processBatch(), this.processingInterval);
    }

    addTransaction(transaction) {
        this.batchQueue.push(transaction);
        
        if (this.batchQueue.length >= this.batchSize) {
            this.processBatch();
        }
    }

    async processBatch() {
        if (this.batchQueue.length === 0) return;

        const batch = this.batchQueue.splice(0, this.batchSize);
        const startTime = Date.now();

        try {
            // Process transactions in parallel across multiple ledgers
            const ledgerBatches = this.groupByLedger(batch);
            const results = await Promise.all(
                Object.entries(ledgerBatches).map(([ledger, transactions]) =>
                    this.blockchain.getLedger(ledger).processBatch(transactions)
                )
            );

            const processingTime = Date.now() - startTime;
            console.log(`⚡ Processed ${batch.length} transactions in ${processingTime}ms`);
            
            return results.flat();
        } catch (error) {
            console.error('❌ Batch processing error:', error);
            // Re-queue failed transactions
            this.batchQueue.unshift(...batch);
        }
    }

    groupByLedger(transactions) {
        return transactions.reduce((groups, tx) => {
            const ledger = this.determineLedger(tx);
            if (!groups[ledger]) groups[ledger] = [];
            groups[ledger].push(tx);
            return groups;
        }, {});
    }

    determineLedger(transaction) {
        if (transaction.type === 'domain') return 'asset';
        if (transaction.type === 'contract') return 'contract';
        if (transaction.type === 'governance') return 'governance';
        if (transaction.type === 'ccoin') return 'ccoin';
        if (transaction.type === 'ccos') return 'ccos';
        return 'main';
    }
}

module.exports = BatchTransactionProcessor;