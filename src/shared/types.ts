// Sourceless Blockchain v0.13 - Shared TypeScript Types
// Multi-Ledger Blockchain System
// Reference: https://sourceless.net | https://github.com/alexccoin/SourceLess

// ==================== BLOCKCHAIN CORE TYPES ====================

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  miner: string;
  difficulty: number;
	ledgerType: LedgerType;
	zkProof?: string; // zk-SNARK proof for blockchain compression (enables 1MB nodes)
  snarkData?: any; // SNARK execution data for AppLess verification
}

export interface Transaction {
  id: string;
  from: string; // STR.domain address format (e.g., STR.alexccoin)
  to: string; // STR.domain address format
  amount: number;
  fee: number;
  timestamp: number;
  signature: string;
  type: 'transfer' | 'stake' | 'unstake' | 'mint' | 'contract' | 'governance' | 'cross-chain' | 'appless';
  data?: any; // Additional data for specific transaction types
  zkProof?: string; // zk-SNARK proof for privacy
	crossChainData?: {
		sourceChain: string; // Bitcoin, Ethereum, Cardano, etc.
		destinationChain: string;
		bridgeAddress: string;
	};
}

export type TransactionType = 'transfer' | 'stake' | 'unstake' | 'mint' | 'contract' | 'governance' | 'cross-chain';
export type LedgerType = 'main' | 'asset' | 'contract' | 'governance' | 'ccoin' | 'ccos';

// ==================== TOKEN TYPES ====================

export type TokenSymbol = 'STR' | 'CCOIN' | 'ARSS' | 'CCOS' | 'ESTR' | 'wSTR' | 'STR$';

export interface TokenBalance {
  STR: number;      // Main fuel token
  CCOIN: number;    // Cross-chain bridge token
  ARSS: number;     // VM computation & storage rewards
  CCOS: number;     // IgniteHex platform token
  ESTR: number;     // Energy token for network operations
  wSTR: number;     // Wrapped STR for DeFi
  'STR$': number;   // Stablecoin ($STR or $TR)
}

// ==================== APPLESS & ARES AI ====================

// AppLess - Applications running on Sourceless (not Dapps like Ethereum)
export interface AppLess {
  id: string;
  name: string;
  owner: string; // STR.domain of creator
  strDomain: string; // STR.domain where AppLess is hosted
  code: string; // Source code (multi-language support via ARES AI)
  zkProof: string; // zk-SNARK proof of execution
  snarkExecution: {
    sourceCode: string;
    snarkFunction: string;
    dataInput: any;
    blockchainCalculation: any;
    proofOutput: string;
  };
  aresAIConfig?: { // ARES AI programming language integration
    useGPT3: boolean; // GPT-3 for construction
    useFormwelt: boolean; // Formwelt for communication/integration
    aiGovernance: boolean; // AI-governed execution
  };
  resources: {
    storage: number; // MB allocated
    bandwidth: number; // MB/month
    cpu: number; // Processing power
  };
  p2pHosting: {
    enabled: boolean;
    nodes: string[]; // BitTorrent-style P2P hosting nodes
    sharedSpace: number; // GB contributed to network
    rewardRate: number; // 90% of space rental value goes to contributor
  };
  status: 'active' | 'suspended' | 'deploying';
  version: string;
  createdAt: number;
  updatedAt: number;
}

// ==================== CROSS-CHAIN INTEGRATION ====================

// Ccoin Network - Cross-blockchain transaction support
export interface CrossChainBridge {
  id: string;
  sourceChain: 'Bitcoin' | 'Ethereum' | 'Cardano' | 'Stellar' | 'Ripple' | 'SourceLess';
  destinationChain: string;
  bridgeAddress: string;
  strFuel: boolean; // Use STR as fuel for zero-cost transactions
  supportedAssets: string[];
  transactionFee: number; // Minimal cost or zero with STR
  tpms: number; // Transactions per millisecond capacity
  tps: number;  // Transactions per second (tpms * 1000)
  status: 'active' | 'maintenance' | 'offline';
}

// ==================== HYBRID BLOCKCHAIN ====================

export interface HybridNode {
  id: string;
  type: 'public' | 'private' | 'hybrid'; // Public (Bitcoin/Ethereum) + Private (DLT)
  strDomain: string;
  zkCompressed: boolean; // zk-SNARK compression (1MB node size)
  tpmsCapacity: number; // Transactions per millisecond (1 TPMS = 1000 TPS)
  tpsCapacity: number; // Transactions per second (derived from TPMS)
  delegatedNodes: string[]; // Affiliated nodes for exponential TPMS scaling
  storage: {
    totalSpace: number; // GB
    usedSpace: number;
    efficiency: number; // Target: 90% (vs 52% traditional web)
    standbyReserve: number; // 10% instant accessible reserve
  };
  p2pConfig: {
    torrentStyle: boolean; // BitTorrent-like communication
    uploadSpeed: number; // 10X faster than traditional web
    downloadSpeed: number;
    peers: number;
  };
  kycAML: boolean; // KYC & AML compliance
  isValidator: boolean;
  reputation: number;
  uptime: number;

  // Hybrid partial hosting: database/data can be split between master, personal, and shared nodes
  partialHosting: {
    enabled: boolean;
    masterNodeShare: number; // % of data on master node
    personalNodeShare: number; // % of data on user's personal node
    sharedNodeShare: number; // % of data on shared/worker nodes
    redundancy: number; // Number of replicas for fault tolerance
    autoBalance: boolean; // Auto-balance data between nodes
  };

  // STARW VM and worker node integration
  starwVM?: StarwVMConfig;
  starwWorkerNode?: StarwWorkerNodeConfig;
  autoRunPersonalNode?: boolean; // If true, user's node auto-runs on login
}

// STARW VM configuration for ARESLang smart contract execution
export interface StarwVMConfig {
  enabled: boolean;
  version: string;
  vmType: 'wasm' | 'native' | 'docker';
  maxMemory: number; // MB
  maxCPU: number; // %
  autoScale: boolean;
  contractsLoaded: string[]; // List of contract IDs loaded in VM
  lastSync: number;
}

// STARW Worker Node for validation and complex ARESLang contract execution
export interface StarwWorkerNodeConfig {
  id: string;
  isActive: boolean;
  supportedLanguages: string[]; // e.g., ['areslang', 'wasm', 'js']
  maxConcurrentTasks: number;
  currentTasks: number;
  lastHeartbeat: number;
  autoValidateContracts: boolean; // Auto-validate all complex contracts
  autoExecutePoints: boolean; // Auto-execute all workflow points
  validationLog: string[];
}

// ==================== WALLET TYPES ====================

export interface Wallet {
  address: string; // STR.domain format (STR.{username}, max 128 chars after STR.)
  publicKey: string;
  balances: TokenBalance; // All token balances
  stakedAmount: number;
  nonce: number;
  domains: string[]; // List of owned STR.domains
  strDomain: string; // Primary STR.domain identifier (e.g., STR.alexccoin)
  kycVerified: boolean; // KYC & AML verification status
  crossChainAssets?: { // Cross-chain asset tracking
    [blockchain: string]: number; // e.g., { "Bitcoin": 0.5, "Ethereum": 2.3 }
  };
}

// ==================== NETWORK TYPES ====================

export interface PeerNode {
  id: string;
  address: string;
  port: number;
  lastSeen: number;
  reputation: number;
}

export interface NetworkStats {
  connectedPeers: number;
  totalNodes: number;
  syncProgress: number;
  networkHashRate: number;
  blockHeight: number;
}

// ==================== LEDGER TYPES ====================

export interface Ledger {
  type: LedgerType;
  chain: Block[];
  pendingTransactions: Transaction[];
  difficulty: number;
  miningReward: number;
}

// ==================== PROOF OF EXISTENCE ====================

export interface ProofOfExistence {
  address: string;
  lastActivity: number;
  isLive: boolean;
  zk13Score: number;
  reputation: number;
}

// ==================== DOMAIN/ASSET TYPES ====================

export interface Domain {
  id: string;
  name: string; // STR.domain format (e.g., "STR.alexccoin", max 128 chars)
  owner: string; // STR.domain of owner
  metadata: {
    description?: string;
    avatar?: string;
    social?: Record<string, string>;
    websiteType?: 'personal' | 'business' | 'appless'; // Personal, Business, or AppLess application
    hostingSpace?: number; // GB allocated for P2P hosting
  };
  createdAt: number;
  expiresAt: number; // Lifetime ownership (no expiration if purchased)
  tokenId: string; // NFT token ID
  isNFT: boolean;
  status: 'active' | 'expired' | 'suspended';
  p2pNodes?: string[]; // BitTorrent-style P2P nodes hosting this domain
  sharedHosting?: boolean; // Participating in shared hosting network
}

// ==================== CONSENSUS TYPES ====================

export interface ValidatorNode {
  address: string;
  stake: number;
  reputation: number;
  uptime: number;
  lastBlock: number;
  isActive: boolean;
}

// ==================== SMART CONTRACT TYPES ====================

export interface SmartContract {
  id: string;
  address: string;
  creator: string;
  code: string;
  state: any;
  balance: number;
  createdAt: number;
}

// ==================== GOVERNANCE TYPES ====================

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  votes: {
    yes: number;
    no: number;
    abstain: number;
  };
  status: 'pending' | 'active' | 'passed' | 'rejected';
  createdAt: number;
  expiresAt: number;
}

// ==================== APP-SPECIFIC TYPES ====================

export interface User {
  id: string;
  name: string;
  email: string;
  wallet?: Wallet;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  networkType: 'mainnet' | 'testnet';
  autoSync: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export type Nullable<T> = T | null;
