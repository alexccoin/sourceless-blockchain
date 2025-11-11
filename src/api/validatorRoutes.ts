/**
 * Validator API Routes
 * RESTful API endpoints for personal validator management
 * 
 * Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team
 * Copyright (c) 2024-2025 Alexandru Marius Stratulat
 */

import express, { Request, Response, Router } from 'express';
import { ValidatorRegistry } from '../validators/ValidatorRegistry';
import { ValidatorRewards } from '../validators/ValidatorRewards';

const router: Router = express.Router();
const validatorRegistry = new ValidatorRegistry();

/**
 * POST /api/validator/register
 * Register a new personal validator
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      domain,
      wallet,
      signature,
      message,
      stake,
      resources
    } = req.body;

    // Validate required fields
    if (!domain || !wallet || !signature || !message || !stake || !resources) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['domain', 'wallet', 'signature', 'message', 'stake', 'resources']
      });
    }

    // Validate resources structure
    if (!resources.storage || !resources.cpu || !resources.bandwidth || !resources.uptime) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resources structure',
        required: {
          storage: 'number (GB)',
          cpu: 'number (cores)',
          bandwidth: { upload: 'number (Mbps)', download: 'number (Mbps)' },
          uptime: 'number (percentage)'
        }
      });
    }

    // Register validator
    const result = await validatorRegistry.register({
      domain,
      wallet,
      signature,
      message,
      stake,
      resources
    });

    if (result.success) {
      return res.status(201).json({
        success: true,
        validatorId: result.validatorId,
        message: result.message,
        monthlyReward: result.monthlyReward,
        nextSteps: [
          'Keep your node online 24/7 for maximum rewards',
          'Monitor your rewards at /api/validator/' + result.validatorId + '/rewards',
          'Check node status at /api/validator/' + result.validatorId
        ]
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Validator registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during registration'
    });
  }
});

/**
 * GET /api/validator/:validatorId
 * Get validator information
 */
router.get('/:validatorId', (req: Request, res: Response) => {
  try {
    const { validatorId } = req.params;

    const validator = validatorRegistry.getValidator(validatorId);
    
    if (!validator) {
      return res.status(404).json({
        success: false,
        error: 'Validator not found'
      });
    }

    const status = validator.validator.getStatus();
    const stats = validator.validator.getStatistics();

    return res.json({
      success: true,
      validator: {
        id: validator.validatorId,
        domain: validator.domain,
        wallet: validator.wallet,
        status: validator.status,
        registrationDate: validator.registrationDate,
        lastActive: validator.lastActive,
        stake: status.stake,
        resources: status.resources,
        reputation: status.reputation,
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Get validator error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/validator/:validatorId/rewards
 * Get validator rewards information
 */
router.get('/:validatorId/rewards', (req: Request, res: Response) => {
  try {
    const { validatorId } = req.params;
    const { period = 'monthly' } = req.query;

    const validator = validatorRegistry.getValidator(validatorId);
    
    if (!validator) {
      return res.status(404).json({
        success: false,
        error: 'Validator not found'
      });
    }

    const status = validator.validator.getStatus();
    
    // Build metrics for reward calculation
    const metrics = {
      storageGB: status.resources.storage.allocated,
      cpuCores: status.resources.cpu.cores,
      cpuUsagePercent: status.resources.cpu.currentUsage,
      bandwidthMbps: {
        upload: status.resources.bandwidth.upload,
        download: status.resources.bandwidth.download
      },
      uptimePercent: status.resources.uptime.current,
      contractsHosted: status.reputation.contractsHosted,
      contractGasEarnings: 0 // TODO: Track actual gas earnings
    };

    // Calculate rewards based on period
    let calculation;
    if (period === 'daily') {
      calculation = ValidatorRewards.calculateDailyRewards(metrics);
    } else if (period === 'yearly') {
      calculation = ValidatorRewards.calculateAnnualRewards(metrics);
    } else {
      calculation = ValidatorRewards.calculateMonthlyRewards(metrics);
    }

    return res.json({
      success: true,
      validatorId,
      period,
      rewards: {
        ...calculation,
        accumulated: status.rewards.accumulated,
        lastPayout: status.rewards.lastPayout,
        breakdown: status.rewards.breakdown
      },
      metrics,
      summary: ValidatorRewards.generateRewardSummary(metrics, period as any)
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/validators/active
 * Get list of all active validators
 */
router.get('/active', (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const activeValidators = validatorRegistry.getActiveValidators();
    const total = activeValidators.length;
    
    // Pagination
    const paginatedValidators = activeValidators
      .slice(Number(offset), Number(offset) + Number(limit))
      .map(v => ({
        validatorId: v.validatorId,
        domain: v.domain,
        status: v.status,
        registrationDate: v.registrationDate,
        statistics: v.validator.getStatistics()
      }));

    return res.json({
      success: true,
      total,
      limit: Number(limit),
      offset: Number(offset),
      validators: paginatedValidators
    });
  } catch (error) {
    console.error('Get active validators error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/validators/stats
 * Get network-wide validator statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const networkStats = validatorRegistry.getNetworkStats();

    return res.json({
      success: true,
      network: networkStats,
      breakdown: {
        genesisValidators: {
          count: 1313,
          type: 'Immutable foundation nodes',
          status: 'Always active'
        },
        personalValidators: {
          count: networkStats.activeValidators,
          type: 'Community-contributed nodes',
          status: 'Dynamic'
        }
      }
    });
  } catch (error) {
    console.error('Get network stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/validator/domain/:domain
 * Get validator by STR.DOMAIN
 */
router.get('/domain/:domain', (req: Request, res: Response) => {
  try {
    const { domain } = req.params;

    const validator = validatorRegistry.getValidatorByDomain(domain);
    
    if (!validator) {
      return res.status(404).json({
        success: false,
        error: `No validator found for domain: ${domain}`
      });
    }

    const status = validator.validator.getStatus();
    const stats = validator.validator.getStatistics();

    return res.json({
      success: true,
      validator: {
        id: validator.validatorId,
        domain: validator.domain,
        wallet: validator.wallet,
        status: validator.status,
        registrationDate: validator.registrationDate,
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Get validator by domain error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/validator/wallet/:wallet
 * Get all validators owned by a wallet
 */
router.get('/wallet/:wallet', (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    const validators = validatorRegistry.getValidatorsByWallet(wallet);

    return res.json({
      success: true,
      wallet,
      count: validators.length,
      validators: validators.map(v => ({
        validatorId: v.validatorId,
        domain: v.domain,
        status: v.status,
        registrationDate: v.registrationDate,
        statistics: v.validator.getStatistics()
      }))
    });
  } catch (error) {
    console.error('Get validators by wallet error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/validator/:validatorId
 * Deregister a validator
 */
router.delete('/:validatorId', async (req: Request, res: Response) => {
  try {
    const { validatorId } = req.params;
    const { signature } = req.body;

    // TODO: Verify signature from wallet owner

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Signature required to deregister validator'
      });
    }

    const result = await validatorRegistry.deregister(validatorId);

    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        validatorId
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Deregister validator error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/validator/:validatorId/test-resources
 * Test validator resource capabilities
 */
router.post('/:validatorId/test-resources', async (req: Request, res: Response) => {
  try {
    const { validatorId } = req.params;

    const validator = validatorRegistry.getValidator(validatorId);
    
    if (!validator) {
      return res.status(404).json({
        success: false,
        error: 'Validator not found'
      });
    }

    // Test resources
    const resourceTests = await validator.validator['verifyResources']();

    return res.json({
      success: resourceTests.success,
      validatorId,
      tests: resourceTests.tests,
      message: resourceTests.success 
        ? 'All resource tests passed' 
        : 'Some resource tests failed'
    });
  } catch (error) {
    console.error('Test resources error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
