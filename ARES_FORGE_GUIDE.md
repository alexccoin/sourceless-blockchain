# ARES Forge - Smart Contract Engine & IDE

## 🔥 Overview

**ARES Forge** is a complete smart contract development platform for the Sourceless blockchain, featuring a powerful contract engine and a full-featured IDE.

---

## 🚀 Features

### ARES Forge Engine

**Multi-Language Support**
- ✅ ARES (native language)
- ✅ JavaScript
- ✅ TypeScript

**Contract Lifecycle**
- ✅ Compilation pipeline
- ✅ Deployment with constructor arguments
- ✅ Sandboxed execution
- ✅ State management (active/paused/destroyed)
- ✅ Gas metering and calculation

**Built-in Capabilities**
- ✅ Event emission system
- ✅ Storage operations (key-value store)
- ✅ Fund transfers
- ✅ Assertions (require)
- ✅ Block/timestamp access
- ✅ Caller identification

**Contract Templates**
- ✅ ERC20 Token
- ✅ NFT (ERC721-like)
- ✅ More templates coming soon

### Contract IDE

**Project Management**
- ✅ Create/open/delete projects
- ✅ Multi-file support
- ✅ File organization
- ✅ Dirty tracking (unsaved changes)
- ✅ Project import/export

**Code Editor**
- ✅ Syntax validation
- ✅ Real-time compilation
- ✅ Compilation caching
- ✅ Error highlighting
- ✅ Warning system

**Analysis Tools**
- ✅ Security analysis
- ✅ Code optimization suggestions
- ✅ Cyclomatic complexity calculation
- ✅ Lines of code metrics
- ✅ Gas estimation

**Debugging**
- ✅ Breakpoint support
- ✅ Step-through execution
- ✅ Variable inspection
- ✅ Stack trace

**Deployment**
- ✅ Network selection (mainnet/testnet/local)
- ✅ Constructor argument input
- ✅ Initial balance setting
- ✅ Gas limit configuration

---

## 📖 Usage Guide

### Basic Contract (ARES Language)

```ares
contract SimpleStorage {
    uint256 public value;
    address public owner;
    
    event ValueChanged(uint256 newValue);
    
    constructor() {
        owner = msg.sender;
        value = 0;
    }
    
    function setValue(uint256 newValue) public {
        require(msg.sender == owner, "Only owner can set value");
        value = newValue;
        emit ValueChanged(newValue);
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}
```

### JavaScript Contract

```javascript
// JavaScript Smart Contract
class TokenContract {
    constructor() {
        this.balances = new Map();
        this.totalSupply = 1000000;
        this.balances.set(contract.caller, this.totalSupply);
    }
    
    transfer(to, amount) {
        const balance = this.balances.get(contract.caller) || 0;
        contract.require(balance >= amount, "Insufficient balance");
        
        this.balances.set(contract.caller, balance - amount);
        this.balances.set(to, (this.balances.get(to) || 0) + amount);
        
        contract.emit('Transfer', {
            from: contract.caller,
            to: to,
            amount: amount
        });
        
        return true;
    }
    
    balanceOf(address) {
        return this.balances.get(address) || 0;
    }
}
```

### TypeScript Contract

```typescript
// TypeScript Smart Contract
interface IVotingContract {
    proposals: Map<number, Proposal>;
    voters: Map<string, boolean>;
}

class VotingContract implements IVotingContract {
    proposals = new Map<number, Proposal>();
    voters = new Map<string, boolean>();
    
    createProposal(description: string): number {
        const id = this.proposals.size;
        this.proposals.set(id, {
            id,
            description,
            votes: 0,
            executed: false
        });
        return id;
    }
    
    vote(proposalId: number): void {
        const hasVoted = this.voters.get(contract.caller);
        contract.require(!hasVoted, "Already voted");
        
        const proposal = this.proposals.get(proposalId);
        contract.require(proposal !== undefined, "Proposal not found");
        
        proposal!.votes++;
        this.voters.set(contract.caller, true);
        
        contract.emit('Voted', {
            voter: contract.caller,
            proposalId: proposalId
        });
    }
}
```

---

## 🔧 API Reference

### AresForgeEngine

#### Compilation

```typescript
const engine = new AresForgeEngine();

// Compile contract
const compiled = engine.compile({
    name: 'MyContract',
    version: '1.0.0',
    language: 'ares',
    code: contractCode
});
```

#### Deployment

```typescript
// Deploy contract
const deployed = engine.deploy(
    compiled,
    deployerAddress,
    constructorArgs,  // Array of arguments
    initialBalance    // Initial STR balance
);

console.log('Contract deployed at:', deployed.address);
```

#### Execution

```typescript
// Execute contract function
const result = engine.execute(
    contractAddress,
    'functionName',
    [arg1, arg2, arg3],
    {
        caller: userAddress,
        value: 100,           // STR sent with call
        blockNumber: 12345,
        timestamp: Date.now(),
        gasLimit: 1000000
    }
);
```

#### Queries

```typescript
// Get contract
const contract = engine.getContract(address);

// Get contracts by deployer
const contracts = engine.getContractsByDeployer(deployerAddress);

// Get events
const events = engine.getEvents(contractAddress, 'Transfer');

// Get statistics
const stats = engine.getStats();
// { totalContracts, activeContracts, totalEvents, totalTemplates }
```

#### Contract Management

```typescript
// Pause contract
engine.pauseContract(address);

// Resume contract
engine.resumeContract(address);

// Destroy contract (irreversible)
engine.destroyContract(address);
```

#### Templates

```typescript
// Get template
const erc20 = engine.getTemplate('ERC20');

// List all templates
const templates = engine.listTemplates();
// ['ERC20', 'NFT']
```

### ContractIDE

#### Project Management

```typescript
const ide = new ContractIDE(engine);

// Create project
const project = ide.createProject('My Token', 'ERC20 token project');

// Open project
ide.openProject(projectId);

// List projects
const projects = ide.listProjects();

// Delete project
ide.deleteProject(projectId);
```

#### File Management

```typescript
// Create file
const file = ide.createFile('token.ares', 'ares', contractCode);

// Open file
const file = ide.openFile('token.ares');

// Update file content
ide.updateFile('token.ares', newCode);

// Save file
ide.saveFile('token.ares');

// Delete file
ide.deleteFile('token.ares');
```

#### Compilation

```typescript
// Compile active file
const result = ide.compile();

if (result.success) {
    console.log('Compilation successful!');
    console.log('Gas estimate:', result.gasEstimate);
    console.log('Warnings:', result.warnings);
} else {
    console.log('Compilation failed:');
    result.errors.forEach(error => {
        console.log(`Line ${error.line}: ${error.message}`);
    });
}
```

#### Deployment

```typescript
const deploymentConfig = {
    network: 'testnet',
    gasLimit: 3000000,
    gasPrice: 100,
    constructorArgs: ['MyToken', 'MTK', 1000000],
    initialBalance: 0
};

const deployed = ide.deploy(compilationResult, deployerAddress, deploymentConfig);

console.log('Deployed at:', deployed.address);
```

#### Code Analysis

```typescript
const analysis = ide.analyzeCode('token.ares');

console.log('Complexity:', analysis.complexity);
console.log('Lines of code:', analysis.loc);
console.log('Security issues:', analysis.security);
console.log('Optimizations:', analysis.optimization);
```

#### Debugging

```typescript
// Start debug session
const session = ide.startDebugSession(contractAddress, 'transfer', [toAddress, 100]);

// Set breakpoint
ide.setBreakpoint(contractAddress, 42);

// Step through
ide.step(contractAddress);

// Remove breakpoint
ide.removeBreakpoint(contractAddress, 42);
```

#### Import/Export

```typescript
// Export project as JSON
const json = ide.exportProject(projectId);

// Import project
const imported = ide.importProject(json);
```

---

## 🎯 Contract Sandbox

The contract execution environment provides:

### Available Objects

```javascript
// Contract object
contract.address         // Contract address
contract.balance        // Contract balance
contract.storage        // Storage map
contract.caller         // Transaction sender
contract.value          // STR sent with call

// Block information
contract.block.number   // Current block number
contract.block.timestamp // Block timestamp

// Utility functions
contract.emit(eventName, data)           // Emit event
contract.require(condition, message)     // Assert condition
contract.transfer(to, amount)           // Transfer STR
contract.get(key)                       // Get storage value
contract.set(key, value)                // Set storage value
contract.delete(key)                    // Delete storage key
```

### Example Usage

```javascript
class MyContract {
    constructor() {
        // Initialize storage
        contract.set('owner', contract.caller);
        contract.set('createdAt', contract.block.timestamp);
    }
    
    doSomething() {
        // Check authorization
        const owner = contract.get('owner');
        contract.require(
            contract.caller === owner,
            "Only owner can call this"
        );
        
        // Emit event
        contract.emit('SomethingDone', {
            caller: contract.caller,
            timestamp: contract.block.timestamp
        });
        
        // Transfer funds
        if (contract.value > 0) {
            contract.transfer(someAddress, contract.value);
        }
    }
}
```

---

## 📊 Gas Calculation

Gas is calculated based on:

1. **Base Gas**: 21,000 (transaction base cost)
2. **Code Gas**: Code length × 200
3. **Arguments Gas**: Argument size × 68
4. **Storage Operations**: 20,000 per write, 5,000 per read
5. **Deployment Gas**: Bytecode size × 200

### Gas Estimation Example

```typescript
const analysis = ide.analyzeCode('myContract.ares');
console.log('Estimated deployment gas:', analysis.gasEstimate);

// Typical values:
// Simple contract: ~100,000 gas
// Token contract: ~500,000 gas
// Complex DeFi: ~2,000,000+ gas
```

---

## 🔐 Security Best Practices

### 1. Always Validate Inputs

```javascript
function transfer(to, amount) {
    contract.require(to !== '', "Invalid recipient");
    contract.require(amount > 0, "Amount must be positive");
    contract.require(to !== contract.caller, "Cannot transfer to self");
    // ... rest of logic
}
```

### 2. Check Balance Before Transfer

```javascript
const balance = contract.get('balance_' + contract.caller);
contract.require(balance >= amount, "Insufficient balance");
```

### 3. Emit Events for Important Actions

```javascript
contract.emit('Transfer', {
    from: contract.caller,
    to: to,
    amount: amount,
    timestamp: contract.block.timestamp
});
```

### 4. Use Ownership Pattern

```javascript
constructor() {
    contract.set('owner', contract.caller);
}

function onlyOwner() {
    const owner = contract.get('owner');
    contract.require(contract.caller === owner, "Not owner");
}
```

### 5. Avoid Reentrancy

```javascript
// Set state BEFORE external calls
contract.set('balance_' + contract.caller, newBalance);
contract.transfer(recipient, amount);  // External call AFTER state change
```

---

## 🎨 IDE Workflow

### Step 1: Create Project

```typescript
const project = ide.createProject('DEX', 'Decentralized exchange');
```

### Step 2: Write Contract

```typescript
ide.createFile('exchange.ares', 'ares', `
contract Exchange {
    // Your contract code here
}
`);
```

### Step 3: Compile

```typescript
const result = ide.compile('exchange.ares');
if (!result.success) {
    result.errors.forEach(e => console.error(e.message));
}
```

### Step 4: Analyze

```typescript
const analysis = ide.analyzeCode('exchange.ares');
console.log('Security issues:', analysis.security);
console.log('Optimizations:', analysis.optimization);
```

### Step 5: Deploy

```typescript
const deployed = ide.deploy(result, deployerAddress, {
    network: 'mainnet',
    gasLimit: 5000000,
    gasPrice: 100,
    constructorArgs: [],
    initialBalance: 1000
});
```

### Step 6: Test

```typescript
// Execute functions
engine.execute(deployed.address, 'swap', [tokenA, tokenB, 100], {
    caller: userAddress,
    value: 100
});

// Check events
const events = engine.getEvents(deployed.address);
console.log('Contract events:', events);
```

---

## 📈 Statistics

```typescript
// Engine stats
const engineStats = engine.getStats();
console.log({
    totalContracts: engineStats.totalContracts,
    activeContracts: engineStats.activeContracts,
    totalEvents: engineStats.totalEvents,
    totalTemplates: engineStats.totalTemplates
});

// IDE stats
const ideStats = ide.getStats();
console.log({
    totalProjects: ideStats.totalProjects,
    totalFiles: ideStats.totalFiles,
    totalLinesOfCode: ideStats.totalLinesOfCode,
    compiledContracts: ideStats.compiledContracts
});
```

---

## 🔧 Integration with Sourceless

ARES Forge is fully integrated into the Sourceless blockchain:

- **Step 13**: ARES Forge Engine initialization
- **Step 14**: Contract IDE with sample project
- Available in `systems.contractEngine`
- Available in `systems.contractIDE`
- Automatic startup with blockchain

Access via IPC (coming soon):
```javascript
window.sourcelessAPI.compileContract(code);
window.sourcelessAPI.deployContract(compiled, args);
window.sourcelessAPI.executeContract(address, method, args);
```

---

## 🚀 Future Enhancements

- [ ] Solidity compatibility layer
- [ ] Visual contract builder (drag-and-drop)
- [ ] Contract verification service
- [ ] Gas profiler
- [ ] Contract upgrade patterns
- [ ] Formal verification tools
- [ ] Library/module system
- [ ] Contract inheritance
- [ ] Multi-sig wallets built-in
- [ ] Time-locked contracts

---

## 📞 Support

For questions or issues with ARES Forge:
- Documentation: `ARES_FORGE_GUIDE.md`
- Examples: `src/main/contracts/`
- Community: [discord.gg/sourceless](https://discord.gg/sourceless)

---

**ARES Forge** - *Powering the next generation of smart contracts on Sourceless*
