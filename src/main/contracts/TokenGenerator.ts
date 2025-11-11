/**
 * Token Contract Generator
 * Generates ARESLang token contracts from user-friendly inputs
 */

export interface TokenConfig {
    tokenName: string;
    ticker: string;
    totalSupply: number;
    decimals: number;
    website?: string;
    description?: string;
}

export interface BusinessTokenConfig extends TokenConfig {
    companyName: string;
    personInCharge: string;
}

export class TokenGenerator {
    
    /**
     * Generate a personal token contract
     */
    static generatePersonalToken(config: TokenConfig): string {
        const { tokenName, ticker, totalSupply, decimals, website, description } = config;
        
        return `# ${tokenName} Token Contract
# Ticker: ${ticker}
# Type: Personal Token
# Generated: ${new Date().toISOString()}

contract ${ticker}Token {
    # Token Metadata
    state tokenName: string = "${tokenName}";
    state symbol: string = "${ticker}";
    state decimals: uint = ${decimals};
    state totalSupply: uint = ${totalSupply};
    ${website ? `state website: string = "${website}";` : ''}
    ${description ? `state description: string = "${description}";` : ''}
    
    # Balances and Allowances
    state balances: mapping<address, uint>;
    state allowances: mapping<address, mapping<address, uint>>;
    
    # Owner
    state owner: address;
    
    # Events (logged for tracking)
    event Transfer(from: address, to: address, amount: uint);
    event Approval(owner: address, spender: address, amount: uint);
    event Mint(to: address, amount: uint);
    event Burn(from: address, amount: uint);
    
    # Constructor - Initialize token
    constructor(initialOwner: address) {
        owner = initialOwner;
        balances[initialOwner] = totalSupply;
        emit Transfer(address(0), initialOwner, totalSupply);
    }
    
    # Get balance of an address
    function balanceOf(account: address) -> uint {
        return balances[account];
    }
    
    # Transfer tokens
    function transfer(to: address, amount: uint) -> bool {
        require(to != address(0), "Cannot transfer to zero address");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] = balances[msg.sender] - amount;
        balances[to] = balances[to] + amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    # Approve spending
    function approve(spender: address, amount: uint) -> bool {
        require(spender != address(0), "Cannot approve zero address");
        
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    # Get allowance
    function allowance(owner: address, spender: address) -> uint {
        return allowances[owner][spender];
    }
    
    # Transfer from (with allowance)
    function transferFrom(from: address, to: address, amount: uint) -> bool {
        require(to != address(0), "Cannot transfer to zero address");
        require(balances[from] >= amount, "Insufficient balance");
        require(allowances[from][msg.sender] >= amount, "Insufficient allowance");
        
        balances[from] = balances[from] - amount;
        balances[to] = balances[to] + amount;
        allowances[from][msg.sender] = allowances[from][msg.sender] - amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    # Mint new tokens (owner only)
    function mint(to: address, amount: uint) -> bool {
        require(msg.sender == owner, "Only owner can mint");
        require(to != address(0), "Cannot mint to zero address");
        
        totalSupply = totalSupply + amount;
        balances[to] = balances[to] + amount;
        
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
        return true;
    }
    
    # Burn tokens
    function burn(amount: uint) -> bool {
        require(balances[msg.sender] >= amount, "Insufficient balance to burn");
        
        balances[msg.sender] = balances[msg.sender] - amount;
        totalSupply = totalSupply - amount;
        
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
        return true;
    }
    
    # Get token information
    function getTokenInfo() -> (string, string, uint, uint) {
        return (tokenName, symbol, decimals, totalSupply);
    }
}
`;
    }
    
    /**
     * Generate a business token contract
     */
    static generateBusinessToken(config: BusinessTokenConfig): string {
        const { tokenName, ticker, totalSupply, decimals, website, description, companyName, personInCharge } = config;
        
        return `# ${tokenName} Token Contract
# Ticker: ${ticker}
# Type: Business Token
# Company: ${companyName}
# Person in Charge: ${personInCharge}
# Generated: ${new Date().toISOString()}

contract ${ticker}BusinessToken {
    # Token Metadata
    state tokenName: string = "${tokenName}";
    state symbol: string = "${ticker}";
    state decimals: uint = ${decimals};
    state totalSupply: uint = ${totalSupply};
    ${website ? `state website: string = "${website}";` : ''}
    ${description ? `state description: string = "${description}";` : ''}
    
    # Business Information
    state companyName: string = "${companyName}";
    state personInCharge: string = "${personInCharge}";
    state registrationDate: uint = ${Date.now()};
    
    # Balances and Allowances
    state balances: mapping<address, uint>;
    state allowances: mapping<address, mapping<address, uint>>;
    
    # Owner and Authorized Addresses
    state owner: address;
    state authorizedMinters: mapping<address, bool>;
    
    # Business Features
    state isPaused: bool = false;
    state maxTransferAmount: uint = 0; # 0 means no limit
    
    # Events
    event Transfer(from: address, to: address, amount: uint);
    event Approval(owner: address, spender: address, amount: uint);
    event Mint(to: address, amount: uint);
    event Burn(from: address, amount: uint);
    event Paused();
    event Unpaused();
    event MinterAdded(minter: address);
    event MinterRemoved(minter: address);
    
    # Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
    }
    
    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
    }
    
    # Constructor
    constructor(initialOwner: address) {
        owner = initialOwner;
        balances[initialOwner] = totalSupply;
        authorizedMinters[initialOwner] = true;
        emit Transfer(address(0), initialOwner, totalSupply);
    }
    
    # Get balance
    function balanceOf(account: address) -> uint {
        return balances[account];
    }
    
    # Transfer tokens
    function transfer(to: address, amount: uint) -> bool whenNotPaused {
        require(to != address(0), "Cannot transfer to zero address");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        if (maxTransferAmount > 0) {
            require(amount <= maxTransferAmount, "Amount exceeds max transfer limit");
        }
        
        balances[msg.sender] = balances[msg.sender] - amount;
        balances[to] = balances[to] + amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    # Approve spending
    function approve(spender: address, amount: uint) -> bool whenNotPaused {
        require(spender != address(0), "Cannot approve zero address");
        
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    # Get allowance
    function allowance(owner: address, spender: address) -> uint {
        return allowances[owner][spender];
    }
    
    # Transfer from
    function transferFrom(from: address, to: address, amount: uint) -> bool whenNotPaused {
        require(to != address(0), "Cannot transfer to zero address");
        require(balances[from] >= amount, "Insufficient balance");
        require(allowances[from][msg.sender] >= amount, "Insufficient allowance");
        
        if (maxTransferAmount > 0) {
            require(amount <= maxTransferAmount, "Amount exceeds max transfer limit");
        }
        
        balances[from] = balances[from] - amount;
        balances[to] = balances[to] + amount;
        allowances[from][msg.sender] = allowances[from][msg.sender] - amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    # Mint tokens (authorized minters only)
    function mint(to: address, amount: uint) -> bool {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(to != address(0), "Cannot mint to zero address");
        
        totalSupply = totalSupply + amount;
        balances[to] = balances[to] + amount;
        
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
        return true;
    }
    
    # Burn tokens
    function burn(amount: uint) -> bool {
        require(balances[msg.sender] >= amount, "Insufficient balance to burn");
        
        balances[msg.sender] = balances[msg.sender] - amount;
        totalSupply = totalSupply - amount;
        
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
        return true;
    }
    
    # Add authorized minter (owner only)
    function addMinter(minter: address) -> bool onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
        return true;
    }
    
    # Remove authorized minter (owner only)
    function removeMinter(minter: address) -> bool onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
        return true;
    }
    
    # Pause contract (owner only)
    function pause() -> bool onlyOwner {
        isPaused = true;
        emit Paused();
        return true;
    }
    
    # Unpause contract (owner only)
    function unpause() -> bool onlyOwner {
        isPaused = false;
        emit Unpaused();
        return true;
    }
    
    # Set max transfer amount (owner only, 0 = no limit)
    function setMaxTransferAmount(amount: uint) -> bool onlyOwner {
        maxTransferAmount = amount;
        return true;
    }
    
    # Get token information
    function getTokenInfo() -> (string, string, uint, uint) {
        return (tokenName, symbol, decimals, totalSupply);
    }
    
    # Get business information
    function getBusinessInfo() -> (string, string, uint) {
        return (companyName, personInCharge, registrationDate);
    }
}
`;
    }
}
