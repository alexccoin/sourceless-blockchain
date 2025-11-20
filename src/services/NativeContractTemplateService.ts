/**
 * Native SourceLess Contract Template Service
 * Pure ZK13STR addresses, AresLang contracts, STR.domain integration
 */

import { SourceLessContractExample, getNativeSourceLessExamples, getNativeExamplesByCategory, getNativeExampleById } from '../contracts/examples/sourceless-native-examples';

export class NativeContractTemplateService {
  private templates: SourceLessContractExample[] = getNativeSourceLessExamples();

  /**
   * Get all native SourceLess contract templates
   */
  getAllTemplates(): SourceLessContractExample[] {
    return this.templates;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: 'token' | 'nft' | 'defi' | 'dao' | 'utility'): SourceLessContractExample[] {
    return getNativeExamplesByCategory(category);
  }

  /**
   * Get specific template by ID
   */
  getTemplateById(id: string): SourceLessContractExample | undefined {
    return getNativeExampleById(id);
  }

  /**
   * Get featured templates for dashboard
   */
  getFeaturedTemplates(): SourceLessContractExample[] {
    return [
      this.getTemplateById('str-token-native')!,
      this.getTemplateById('sourceless-nft')!,
      this.getTemplateById('sourceless-defi')!,
      this.getTemplateById('sourceless-dao')!
    ].filter(Boolean);
  }

  /**
   * Get templates with gas-free transactions
   */
  getHostlessTemplates(): SourceLessContractExample[] {
    return this.templates.filter(template => template.gasEstimate === 0);
  }

  /**
   * Get templates with CCOIN integration
   */
  getCCOINIntegratedTemplates(): SourceLessContractExample[] {
    return this.templates.filter(template => 
      template.integration.includes('CCOIN System') || 
      template.features.some(feature => feature.includes('CCOIN'))
    );
  }

  /**
   * Get templates with STR.domain integration
   */
  getSTRDomainTemplates(): SourceLessContractExample[] {
    return this.templates.filter(template => 
      template.integration.includes('STR.domains') ||
      template.features.some(feature => feature.includes('STR.domain'))
    );
  }

  /**
   * Search templates by feature
   */
  searchTemplates(query: string): SourceLessContractExample[] {
    const searchTerm = query.toLowerCase();
    return this.templates.filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.features.some(feature => feature.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get template statistics
   */
  getTemplateStats() {
    const stats = {
      total: this.templates.length,
      byCategory: {} as Record<string, number>,
      gasFreeCount: this.getHostlessTemplates().length,
      ccoinIntegratedCount: this.getCCOINIntegratedTemplates().length,
      strDomainIntegratedCount: this.getSTRDomainTemplates().length
    };

    // Count by category
    this.templates.forEach(template => {
      stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Generate contract code with parameters
   */
  generateContract(templateId: string, parameters: Record<string, any>): string {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let code = template.code;

    // Replace parameter placeholders
    Object.entries(parameters).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      code = code.replace(placeholder, String(value));
    });

    return code;
  }

  /**
   * Validate ZK13STR address format
   */
  validateZK13STRAddress(address: string): boolean {
    const zk13strPattern = /^zk13str_[a-fA-F0-9]{40}_[a-fA-F0-9]{4}$/;
    return zk13strPattern.test(address);
  }

  /**
   * Generate random ZK13STR address for testing
   */
  generateTestZK13STRAddress(): string {
    const randomHex40 = Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const randomHex4 = Array.from({length: 4}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    return `zk13str_${randomHex40}_${randomHex4}`;
  }

  /**
   * Get contract deployment instructions
   */
  getDeploymentInstructions(templateId: string): string {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    return `
# ${template.name} Deployment Instructions

## Prerequisites
- SourceLess blockchain access
- ZK13STR address: ${this.generateTestZK13STRAddress()}
- STR tokens for deployment (if required)
- CCOS tokens for gas-free transactions (optional)

## Features
${template.features.map(feature => `- ${feature}`).join('\n')}

## Integration
${template.integration.map(integration => `- ${integration}`).join('\n')}

## Gas Estimate
${template.gasEstimate === 0 ? '✅ Gas-free (HOSTLESS mode)' : `⛽ ${template.gasEstimate} units`}

## Deployment Steps
1. Configure your SourceLess development environment
2. Ensure you have sufficient STR tokens
3. Copy the contract code from the template
4. Customize the parameters as needed
5. Deploy using AresLang compiler
6. Verify contract on SourceLess explorer

## Post-Deployment
- Test all contract functions
- Verify ZK13STR address resolution
- Check CCOIN reward mechanisms (if applicable)
- Test gas-free transactions (if enabled)
`;
  }
}

// Export singleton instance
export const nativeContractTemplateService = new NativeContractTemplateService();