/**
 * Deployment History Manager
 * Tracks all contract deployments (dev examples, personal tokens, business tokens)
 */

export interface DeploymentRecord {
    id: string;
    timestamp: number;
    contractName: string;
    contractAddress: string;
    deployer: string;
    deploymentType: 'dev-example' | 'personal-token' | 'business-token';
    status: 'success' | 'failed';
    cost: number; // in CCOS
    metadata?: {
        tokenName?: string;
        ticker?: string;
        totalSupply?: number;
        decimals?: number;
        website?: string;
        description?: string;
        companyName?: string;
        personInCharge?: string;
    };
    compilationOutput?: {
        bytecode: string;
        abi: string;
        warnings?: string[];
    };
    error?: string;
}

export class DeploymentHistory {
    private deployments: DeploymentRecord[] = [];
    
    constructor() {
        console.log('📜 Deployment History initialized');
    }
    
    /**
     * Add a new deployment record
     */
    addDeployment(record: Omit<DeploymentRecord, 'id' | 'timestamp'>): DeploymentRecord {
        const deployment: DeploymentRecord = {
            id: `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            ...record
        };
        
        this.deployments.unshift(deployment); // Add to beginning for newest-first
        
        console.log(`📜 Deployment recorded: ${deployment.contractName} at ${deployment.contractAddress}`);
        return deployment;
    }
    
    /**
     * Get all deployments
     */
    getAllDeployments(): DeploymentRecord[] {
        return [...this.deployments];
    }
    
    /**
     * Get deployments by type
     */
    getDeploymentsByType(type: DeploymentRecord['deploymentType']): DeploymentRecord[] {
        return this.deployments.filter(d => d.deploymentType === type);
    }
    
    /**
     * Get deployments by deployer address
     */
    getDeploymentsByDeployer(deployer: string): DeploymentRecord[] {
        return this.deployments.filter(d => d.deployer === deployer);
    }
    
    /**
     * Get recent deployments (last N)
     */
    getRecentDeployments(limit: number = 10): DeploymentRecord[] {
        return this.deployments.slice(0, limit);
    }
    
    /**
     * Get deployment by ID
     */
    getDeploymentById(id: string): DeploymentRecord | undefined {
        return this.deployments.find(d => d.id === id);
    }
    
    /**
     * Get deployment by contract address
     */
    getDeploymentByAddress(address: string): DeploymentRecord | undefined {
        return this.deployments.find(d => d.contractAddress === address);
    }
    
    /**
     * Get deployment statistics
     */
    getStats() {
        const total = this.deployments.length;
        const successful = this.deployments.filter(d => d.status === 'success').length;
        const failed = this.deployments.filter(d => d.status === 'failed').length;
        const totalCost = this.deployments.reduce((sum, d) => sum + d.cost, 0);
        
        const byType = {
            'dev-example': this.deployments.filter(d => d.deploymentType === 'dev-example').length,
            'personal-token': this.deployments.filter(d => d.deploymentType === 'personal-token').length,
            'business-token': this.deployments.filter(d => d.deploymentType === 'business-token').length
        };
        
        return {
            total,
            successful,
            failed,
            totalCost,
            byType
        };
    }
}
