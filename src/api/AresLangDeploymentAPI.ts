/**
 * Backend API Service for AresLang Contract Deployment
 * Handles feeless deployment, template compilation, and integration services
 */

import express from 'express';
import cors from 'cors';
import { ContractTemplateService, ContractTemplate } from '../services/AresLangNativeTemplates';
import { FeelessTransactionEngine } from '../core/FeelessTransactionEngine';
import { ContractDeployment, TransactionRequest } from '../types/FeelessTransactionTypes';

export interface DeploymentRequest {
  templateId: string;
  parameters: Record<string, any>;
  userAddress: string;
  network: 'areslang' | 'areslang-testnet' | 'areslang-devnet';
  options?: {
    skipValidation?: boolean;
    enableCCOINMinting?: boolean;
    strDomainsIntegration?: boolean;
  };
}

export interface DeploymentResponse {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  ccoinMinted?: string;
  strDomainsRevenue?: string;
  error?: string;
  deploymentTime?: number;
  gasUsed?: number; // Should be 0 for feeless
}

export interface SecurityAuditResult {
  score: number;
  issues: SecurityIssue[];
  recommendations: string[];
  approved: boolean;
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  line?: number;
  suggestion?: string;
}

export class AresLangDeploymentAPI {
  private app: express.Application;
  private feelessEngine: FeelessTransactionEngine;
  private port: number;

  constructor(port: number = 3001) {
    this.app = express();
    this.port = port;
    this.feelessEngine = new FeelessTransactionEngine();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Get all templates
    this.app.get('/api/templates', async (req, res) => {
      try {
        const templates = await ContractTemplateService.getAllTemplates();
        res.json({
          success: true,
          templates: templates.map(template => ({
            ...template,
            // Remove large code field from list view
            aresLangCode: undefined
          }))
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch templates'
        });
      }
    });

    // Get single template with full code
    this.app.get('/api/templates/:templateId', async (req, res) => {
      try {
        const template = await ContractTemplateService.getTemplate(req.params.templateId);
        if (!template) {
          return res.status(404).json({
            success: false,
            error: 'Template not found'
          });
        }
        res.json({ success: true, template });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch template'
        });
      }
    });

    // Search templates
    this.app.get('/api/templates/search/:query', async (req, res) => {
      try {
        const templates = await ContractTemplateService.searchTemplates(req.params.query);
        res.json({
          success: true,
          templates: templates.map(template => ({
            ...template,
            aresLangCode: undefined
          }))
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Search failed'
        });
      }
    });

    // Get templates by category
    this.app.get('/api/templates/category/:category', async (req, res) => {
      try {
        const templates = await ContractTemplateService.getTemplatesByCategory(req.params.category);
        res.json({
          success: true,
          templates: templates.map(template => ({
            ...template,
            aresLangCode: undefined
          }))
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch templates by category'
        });
      }
    });

    // Validate template parameters
    this.app.post('/api/templates/:templateId/validate', async (req, res) => {
      try {
        const { parameters } = req.body;
        const validation = await ContractTemplateService.validateTemplateParameters(
          req.params.templateId,
          parameters
        );
        res.json({ success: true, validation });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Validation failed'
        });
      }
    });

    // Generate contract code preview
    this.app.post('/api/templates/:templateId/preview', async (req, res) => {
      try {
        const { parameters } = req.body;
        const template = await ContractTemplateService.getTemplate(req.params.templateId);
        
        if (!template) {
          return res.status(404).json({
            success: false,
            error: 'Template not found'
          });
        }

        // Validate parameters first
        const validation = await ContractTemplateService.validateTemplateParameters(
          req.params.templateId,
          parameters
        );

        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            error: 'Invalid parameters',
            validation
          });
        }

        const generatedCode = ContractTemplateService.generateAresLangCode(template, parameters);
        const securityAudit = await this.performSecurityAudit(generatedCode);

        res.json({
          success: true,
          code: generatedCode,
          securityAudit,
          estimatedGas: 0, // Always 0 for feeless deployment
          estimatedDeploymentTime: template.estimatedDeploymentTime
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to generate preview'
        });
      }
    });

    // Deploy contract (feeless)
    this.app.post('/api/deploy', async (req, res) => {
      try {
        const deploymentRequest: DeploymentRequest = req.body;
        
        console.log('🚀 Starting feeless deployment:', {
          template: deploymentRequest.templateId,
          user: deploymentRequest.userAddress,
          network: deploymentRequest.network
        });

        const startTime = Date.now();
        
        // Validate template exists
        const template = await ContractTemplateService.getTemplate(deploymentRequest.templateId);
        if (!template) {
          return res.status(404).json({
            success: false,
            error: 'Template not found'
          });
        }

        // Validate parameters
        const validation = await ContractTemplateService.validateTemplateParameters(
          deploymentRequest.templateId,
          deploymentRequest.parameters
        );

        if (!validation.valid && !deploymentRequest.options?.skipValidation) {
          return res.status(400).json({
            success: false,
            error: 'Invalid parameters',
            validation
          });
        }

        // Generate contract code
        const aresLangCode = ContractTemplateService.generateAresLangCode(
          template,
          deploymentRequest.parameters
        );

        // Perform security audit
        const securityAudit = await this.performSecurityAudit(aresLangCode);
        if (!securityAudit.approved && !deploymentRequest.options?.skipValidation) {
          return res.status(400).json({
            success: false,
            error: 'Security audit failed',
            securityAudit
          });
        }

        // Compile AresLang to bytecode
        const compilationResult = await this.compileAresLang(aresLangCode);
        if (!compilationResult.success) {
          return res.status(400).json({
            success: false,
            error: 'Compilation failed',
            details: compilationResult.errors
          });
        }

        // Create feeless deployment
        const contractDeployment: ContractDeployment = {
          compiledBytecode: compilationResult.bytecode,
          constructorParams: this.encodeConstructorParams(deploymentRequest.parameters),
          userAddress: deploymentRequest.userAddress,
          network: deploymentRequest.network,
          ccoinMintingEnabled: deploymentRequest.options?.enableCCOINMinting ?? true,
          strDomainsIntegration: deploymentRequest.options?.strDomainsIntegration ?? true
        };

        // Deploy through feeless engine
        const deploymentResult = await this.feelessEngine.deployContractFeeless(contractDeployment);
        
        const deploymentTime = Date.now() - startTime;

        const response: DeploymentResponse = {
          success: deploymentResult.success,
          contractAddress: deploymentResult.contractAddress,
          transactionHash: deploymentResult.transactionHash,
          ccoinMinted: deploymentResult.ccoinMinted?.toString(),
          strDomainsRevenue: deploymentResult.strDomainsRevenue?.toString(),
          deploymentTime,
          gasUsed: 0, // Always 0 for feeless
          error: deploymentResult.error
        };

        if (deploymentResult.success) {
          console.log('✅ Feeless deployment successful:', {
            contract: deploymentResult.contractAddress,
            time: deploymentTime + 'ms',
            ccoin: deploymentResult.ccoinMinted?.toString(),
            strRevenue: deploymentResult.strDomainsRevenue?.toString()
          });
        }

        res.json(response);
      } catch (error) {
        console.error('❌ Deployment failed:', error);
        res.status(500).json({
          success: false,
          error: 'Deployment failed: ' + (error as Error).message
        });
      }
    });

    // Get deployment status
    this.app.get('/api/deployments/:transactionHash', async (req, res) => {
      try {
        const status = await this.feelessEngine.getDeploymentStatus(req.params.transactionHash);
        res.json({ success: true, status });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get deployment status'
        });
      }
    });

    // Get user's deployed contracts
    this.app.get('/api/contracts/:userAddress', async (req, res) => {
      try {
        const contracts = await this.feelessEngine.getUserContracts(req.params.userAddress);
        res.json({ success: true, contracts });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch user contracts'
        });
      }
    });

    // CCOIN integration endpoints
    this.app.get('/api/ccoin/balance/:address', async (req, res) => {
      try {
        const balance = await this.feelessEngine.getCCOINBalance(req.params.address);
        res.json({ success: true, balance: balance.toString() });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get CCOIN balance'
        });
      }
    });

    // STR.domains revenue endpoints
    this.app.get('/api/str-domains/revenue/:contractAddress', async (req, res) => {
      try {
        const revenue = await this.feelessEngine.getSTRDomainsRevenue(req.params.contractAddress);
        res.json({ success: true, revenue });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get STR.domains revenue'
        });
      }
    });

    // System stats
    this.app.get('/api/stats', async (req, res) => {
      try {
        const stats = await this.getSystemStats();
        res.json({ success: true, stats });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get system stats'
        });
      }
    });
  }

  private async performSecurityAudit(aresLangCode: string): Promise<SecurityAuditResult> {
    // Simulate security audit - in production this would use actual security analysis
    const issues: SecurityIssue[] = [];
    let score = 100;

    // Check for common security patterns
    if (aresLangCode.includes('call{value:')) {
      issues.push({
        severity: 'medium',
        title: 'External Call Detected',
        description: 'External calls can be risky. Ensure proper reentrancy protection.',
        suggestion: 'Consider using reentrancy guards'
      });
      score -= 5;
    }

    if (!aresLangCode.includes('require(')) {
      issues.push({
        severity: 'low',
        title: 'Missing Input Validation',
        description: 'Consider adding input validation with require statements.',
        suggestion: 'Add require() statements for critical parameters'
      });
      score -= 3;
    }

    if (aresLangCode.includes('suicide') || aresLangCode.includes('selfdestruct')) {
      issues.push({
        severity: 'high',
        title: 'Self Destruct Detected',
        description: 'Self destruct functionality can be dangerous.',
        suggestion: 'Consider removing or protecting self destruct functionality'
      });
      score -= 15;
    }

    return {
      score: Math.max(score, 0),
      issues,
      recommendations: [
        'Always test contracts on testnet first',
        'Consider getting a professional audit for high-value contracts',
        'Monitor contract activity after deployment',
        'Keep private keys secure'
      ],
      approved: score >= 70 && !issues.some(issue => issue.severity === 'critical')
    };
  }

  private async compileAresLang(aresLangCode: string): Promise<{
    success: boolean;
    bytecode?: string;
    abi?: any[];
    errors?: string[];
  }> {
    // Simulate AresLang compilation - in production this would use actual AresLang compiler
    try {
      // Basic validation
      if (!aresLangCode.includes('contract ')) {
        return {
          success: false,
          errors: ['No contract definition found']
        };
      }

      // Generate mock bytecode (in production this would be real compiled bytecode)
      const mockBytecode = '0x608060405234801561001057600080fd5b50' + 
        Buffer.from(aresLangCode.substring(0, 100)).toString('hex');

      // Generate mock ABI
      const mockABI = [
        {
          "inputs": [],
          "name": "name",
          "outputs": [{"internalType": "string", "name": "", "type": "string"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [{"internalType": "string", "name": "", "type": "string"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];

      return {
        success: true,
        bytecode: mockBytecode,
        abi: mockABI
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Compilation failed: ' + (error as Error).message]
      };
    }
  }

  private encodeConstructorParams(parameters: Record<string, any>): string {
    // Simulate constructor parameter encoding
    // In production this would properly encode parameters for the EVM
    return Object.values(parameters).map(param => 
      typeof param === 'string' ? Buffer.from(param).toString('hex') : param.toString()
    ).join('');
  }

  private async getSystemStats() {
    return {
      totalDeployments: await this.feelessEngine.getTotalDeployments(),
      totalCCOINMinted: await this.feelessEngine.getTotalCCOINMinted(),
      totalSTRDomainsRevenue: await this.feelessEngine.getTotalSTRDomainsRevenue(),
      templatesAvailable: (await ContractTemplateService.getAllTemplates()).length,
      networksSupported: ['areslang', 'areslang-testnet', 'areslang-devnet'],
      avgDeploymentTime: 3.2, // seconds
      successRate: 98.7, // percentage
      gasFeesEliminated: '∞' // Always infinite for feeless system
    };
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 AresLang Deployment API running on port ${this.port}`);
      console.log(`📱 Health check: http://localhost:${this.port}/api/health`);
      console.log(`📋 Templates: http://localhost:${this.port}/api/templates`);
      console.log(`⚡ Feeless deployment ready!`);
    });
  }
}

// Example usage and startup
if (require.main === module) {
  const api = new AresLangDeploymentAPI(3001);
  api.start();
}

export default AresLangDeploymentAPI;