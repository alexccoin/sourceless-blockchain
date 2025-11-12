/**
 * AresLang Smart Contract Visual Builder
 * Drag-and-drop interface for creating and deploying smart contracts
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Launch as LaunchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Types
interface ContractTemplate {
  id: string;
  name: string;
  category: 'defi' | 'nft' | 'dao' | 'token' | 'identity' | 'gaming' | 'oracle' | 'bridge' | 'custom';
  description: string;
  parameters: TemplateParameter[];
  aresLangCode: string;
  gasEstimate: number;
  securityScore: number;
  auditStatus: 'audited' | 'pending' | 'failed';
  icon: string;
}

interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'address' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: any;
  validation?: RegExp;
  description: string;
  placeholder?: string;
}

interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed: number;
  deploymentCost: number;
  ccoinIntegration: boolean;
  strDomainsIntegration: boolean;
  securityScore: number;
}

// Main Component
export const AresLangContractBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [parameters, setParameters] = useState<Map<string, any>>(new Map());
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [securityScore, setSecurityScore] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load templates on component mount
  useEffect(() => {
    loadContractTemplates();
  }, []);

  // Update generated code when parameters change
  useEffect(() => {
    if (selectedTemplate) {
      updateSecurityScore();
      validateParameters();
    }
  }, [selectedTemplate, parameters]);

  const loadContractTemplates = async () => {
    try {
      const response = await fetch('/api/v1/contracts/templates');
      const templateData = await response.json();
      setTemplates(templateData);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setParameters(new Map());
    setDeploymentResult(null);
    
    // Initialize parameters with default values
    const initialParams = new Map();
    template.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        initialParams.set(param.name, param.defaultValue);
      }
    });
    setParameters(initialParams);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => new Map(prev.set(paramName, value)));
  };

  const generateAresLangCode = useCallback((): string => {
    if (!selectedTemplate) return '';
    
    let code = selectedTemplate.aresLangCode;
    
    // Replace template variables with actual values
    parameters.forEach((value, key) => {
      const placeholder = `{{${key}}}`;
      code = code.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return code;
  }, [selectedTemplate, parameters]);

  const validateParameters = () => {
    const errors: string[] = [];
    
    if (!selectedTemplate) return;
    
    selectedTemplate.parameters.forEach(param => {
      const value = parameters.get(param.name);
      
      if (param.required && (!value || value === '')) {
        errors.push(`${param.name} is required`);
      }
      
      if (value && param.validation && !param.validation.test(value.toString())) {
        errors.push(`${param.name} format is invalid`);
      }
    });
    
    setValidationErrors(errors);
  };

  const updateSecurityScore = async () => {
    if (!selectedTemplate) return;
    
    try {
      const code = generateAresLangCode();
      const response = await fetch('/api/v1/contracts/security-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const result = await response.json();
      setSecurityScore(result.score);
    } catch (error) {
      console.error('Security check failed:', error);
    }
  };

  const handleDeploy = async () => {
    if (!selectedTemplate || validationErrors.length > 0) return;
    
    setIsDeploying(true);
    
    try {
      const deploymentConfig = {
        templateId: selectedTemplate.id,
        parameters: Object.fromEntries(parameters),
        aresLangCode: generateAresLangCode(),
        deployer: await getCurrentUserAddress()
      };
      
      const response = await fetch('/api/v1/contracts/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deploymentConfig)
      });
      
      const result = await response.json();
      setDeploymentResult(result);
      
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const getCurrentUserAddress = async (): Promise<string> => {
    // Mock implementation - replace with actual wallet integration
    return '0x742d35Cc6bC24B2E4C65e4d7A1a8F40b84f8b5A3';
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#0a0e13', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          🔥 AresLang Smart Contract Builder
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.8 }}>
          Deploy enterprise-grade smart contracts with zero gas fees
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Template Library */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1a1f2e', height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <CodeIcon sx={{ mr: 1 }} />
                Contract Templates
              </Typography>
              
              <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={selectedTemplate?.id === template.id}
                    onClick={() => handleTemplateSelect(template)}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuration Panel */}
        <Grid item xs={12} md={8}>
          {selectedTemplate ? (
            <Card sx={{ backgroundColor: '#1a1f2e', mb: 3 }}>
              <CardContent>
                <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
                  <Tab label="Configure" />
                  <Tab label="Preview" />
                  <Tab label="Security" />
                  <Tab label="Deploy" />
                </Tabs>

                {/* Configure Tab */}
                {currentTab === 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Configure {selectedTemplate.name}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {selectedTemplate.parameters.map((param) => (
                        <Grid item xs={12} sm={6} key={param.name}>
                          <ParameterInput
                            parameter={param}
                            value={parameters.get(param.name) || ''}
                            onChange={(value) => handleParameterChange(param.name, value)}
                          />
                        </Grid>
                      ))}
                    </Grid>

                    {validationErrors.length > 0 && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Preview Tab */}
                {currentTab === 1 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Contract Preview
                    </Typography>
                    
                    <SyntaxHighlighter
                      language="javascript"
                      style={vscDarkPlus}
                      customStyle={{
                        maxHeight: '500px',
                        fontSize: '14px',
                        borderRadius: '8px'
                      }}
                    >
                      {generateAresLangCode()}
                    </SyntaxHighlighter>
                  </Box>
                )}

                {/* Security Tab */}
                {currentTab === 2 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Security Analysis
                    </Typography>
                    
                    <SecurityScoreDisplay score={securityScore} />
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Security Features
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item>
                          <Chip
                            icon={<SecurityIcon />}
                            label="ZK-SNARK Integration"
                            color="success"
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Automated Auditing"
                            color="success"
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item>
                          <Chip
                            icon={<SecurityIcon />}
                            label="Reentrancy Protection"
                            color="success"
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}

                {/* Deploy Tab */}
                {currentTab === 3 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Deploy Contract
                    </Typography>
                    
                    <DeploymentPanel
                      template={selectedTemplate}
                      isDeploying={isDeploying}
                      deploymentResult={deploymentResult}
                      validationErrors={validationErrors}
                      onDeploy={handleDeploy}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ backgroundColor: '#1a1f2e', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CodeIcon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" sx={{ opacity: 0.6 }}>
                  Select a contract template to get started
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// Template Card Component
const TemplateCard: React.FC<{
  template: ContractTemplate;
  selected: boolean;
  onClick: () => void;
}> = ({ template, selected, onClick }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'defi': return '#4caf50';
      case 'nft': return '#ff9800';
      case 'dao': return '#2196f3';
      case 'token': return '#9c27b0';
      case 'identity': return '#e91e63'; // Pink for identity
      case 'gaming': return '#00bcd4'; // Cyan for gaming
      case 'oracle': return '#8bc34a'; // Light green for oracle
      case 'bridge': return '#ff5722'; // Deep orange for bridge
      case 'custom': return '#607d8b';
      default: return '#757575';
    }
  };

  const getSecurityColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  return (
    <Card
      sx={{
        mb: 2,
        backgroundColor: selected ? '#2d3748' : '#1a202c',
        border: selected ? '2px solid #4299e1' : '1px solid #2d3748',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          backgroundColor: '#2d3748',
          transform: 'translateY(-2px)'
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
            {template.name}
          </Typography>
          <Chip
            label={template.category.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: getCategoryColor(template.category),
              color: 'white',
              fontSize: '10px'
            }}
          />
        </Box>
        
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
          {template.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<SecurityIcon />}
            label={`Security: ${template.securityScore}%`}
            size="small"
            color={getSecurityColor(template.securityScore) as any}
            variant="outlined"
          />
          <Chip
            label="$0 Gas"
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Parameter Input Component
const ParameterInput: React.FC<{
  parameter: TemplateParameter;
  value: any;
  onChange: (value: any) => void;
}> = ({ parameter, value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;
    
    if (parameter.type === 'number') {
      newValue = parseInt(newValue) || 0;
    } else if (parameter.type === 'boolean') {
      newValue = event.target.checked;
    }
    
    onChange(newValue);
  };

  if (parameter.type === 'boolean') {
    return (
      <FormControl fullWidth>
        <label>
          <input
            type="checkbox"
            checked={value || false}
            onChange={handleChange}
          />
          {parameter.name}
        </label>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {parameter.description}
        </Typography>
      </FormControl>
    );
  }

  return (
    <TextField
      fullWidth
      label={parameter.name}
      type={parameter.type === 'number' ? 'number' : 'text'}
      value={value || ''}
      onChange={handleChange}
      placeholder={parameter.placeholder}
      required={parameter.required}
      helperText={parameter.description}
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#0a0e13',
          color: 'white'
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }}
    />
  );
};

// Security Score Display
const SecurityScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  const getScoreText = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#0a0e13', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Security Score: {score}% - {getScoreText(score)}
      </Typography>
      
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: '#1a1f2e',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getScoreColor(score)
          }
        }}
      />
    </Box>
  );
};

// Deployment Panel Component
const DeploymentPanel: React.FC<{
  template: ContractTemplate;
  isDeploying: boolean;
  deploymentResult: DeploymentResult | null;
  validationErrors: string[];
  onDeploy: () => void;
}> = ({ template, isDeploying, deploymentResult, validationErrors, onDeploy }) => {
  const canDeploy = validationErrors.length === 0 && !isDeploying;

  if (deploymentResult) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6">🎉 Contract Deployed Successfully!</Typography>
        </Alert>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Contract Address
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {deploymentResult.contractAddress}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Transaction Hash
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {deploymentResult.transactionHash}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<WalletIcon />}
                label={`Gas Used: ${deploymentResult.gasUsed} (FREE)`}
                color="success"
              />
              <Chip
                icon={<CheckCircleIcon />}
                label="CCOIN Integration: Active"
                color="success"
              />
              <Chip
                icon={<TrendingUpIcon />}
                label="STR.domains Integration: Active"
                color="success"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, p: 3, backgroundColor: '#0a0e13', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Deployment Summary
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">Template</Typography>
            <Typography variant="body1">{template.name}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">Gas Fee</Typography>
            <Typography variant="body1" color="success.main">$0.00 (Feeless)</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">Security Score</Typography>
            <Typography variant="body1">{template.securityScore}%</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">Integrations</Typography>
            <Typography variant="body1">CCOIN + STR.domains</Typography>
          </Grid>
        </Grid>
      </Box>

      <Button
        variant="contained"
        size="large"
        startIcon={isDeploying ? null : <LaunchIcon />}
        onClick={onDeploy}
        disabled={!canDeploy}
        sx={{
          backgroundColor: '#4299e1',
          color: 'white',
          py: 2,
          px: 4,
          fontSize: '16px',
          '&:hover': {
            backgroundColor: '#3182ce'
          },
          '&:disabled': {
            backgroundColor: '#2d3748'
          }
        }}
        fullWidth
      >
        {isDeploying ? (
          <>
            <LinearProgress sx={{ width: '100px', mr: 2 }} />
            Deploying Contract...
          </>
        ) : (
          '🚀 Deploy Contract (FREE)'
        )}
      </Button>

      {!canDeploy && validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fix the following errors:
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
    </Box>
  );
};

export default AresLangContractBuilder;