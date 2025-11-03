/**
 * ARES Forge IDE - Integrated Development Environment for Smart Contracts
 * Full-featured IDE with editor, compiler, debugger, and deployment tools
 */

import AresForgeEngine, { ContractSource, CompiledContract, DeployedContract } from './AresForgeEngine';

export interface IDEProject {
    id: string;
    name: string;
    description: string;
    files: Map<string, IDEFile>;
    activeFile?: string;
    createdAt: number;
    updatedAt: number;
}

export interface IDEFile {
    name: string;
    path: string;
    content: string;
    language: 'ares' | 'javascript' | 'typescript' | 'json';
    savedContent?: string;
    isDirty: boolean;
}

export interface CompilationResult {
    success: boolean;
    compiled?: CompiledContract;
    errors: CompilationError[];
    warnings: string[];
    gasEstimate?: number;
}

export interface CompilationError {
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning';
}

export interface DeploymentConfig {
    network: 'mainnet' | 'testnet' | 'local';
    gasLimit: number;
    gasPrice: number;
    constructorArgs: any[];
    initialBalance: number;
}

export interface DebugSession {
    contractAddress: string;
    functionName: string;
    args: any[];
    breakpoints: number[];
    currentLine?: number;
    stack: any[];
    variables: Map<string, any>;
}

export class ContractIDE {
    private engine: AresForgeEngine;
    private projects: Map<string, IDEProject> = new Map();
    private activeProject?: IDEProject;
    private compilationCache: Map<string, CompilationResult> = new Map();
    private debugSessions: Map<string, DebugSession> = new Map();

    constructor(engine: AresForgeEngine) {
        this.engine = engine;
        console.log('💻 Contract IDE initializing...');
        this.loadSampleProjects();
    }

    // ==================== PROJECT MANAGEMENT ====================

    /**
     * Create new project
     */
    createProject(name: string, description: string = ''): IDEProject {
        const project: IDEProject = {
            id: this.generateId(),
            name,
            description,
            files: new Map(),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Create default contract file
        project.files.set('main.ares', {
            name: 'main.ares',
            path: 'main.ares',
            content: this.getDefaultContractTemplate(),
            language: 'ares',
            isDirty: false
        });

        this.projects.set(project.id, project);
        this.activeProject = project;

        console.log(`✅ Project created: ${name}`);
        return project;
    }

    /**
     * Open existing project
     */
    openProject(projectId: string): IDEProject | null {
        const project = this.projects.get(projectId);
        if (project) {
            this.activeProject = project;
            console.log(`📂 Project opened: ${project.name}`);
        }
        return project || null;
    }

    /**
     * Get active project
     */
    getActiveProject(): IDEProject | undefined {
        return this.activeProject;
    }

    /**
     * List all projects
     */
    listProjects(): IDEProject[] {
        return Array.from(this.projects.values());
    }

    /**
     * Delete project
     */
    deleteProject(projectId: string): boolean {
        const deleted = this.projects.delete(projectId);
        if (deleted && this.activeProject?.id === projectId) {
            this.activeProject = undefined;
        }
        return deleted;
    }

    // ==================== FILE MANAGEMENT ====================

    /**
     * Create new file in active project
     */
    createFile(name: string, language: IDEFile['language'], content: string = ''): IDEFile | null {
        if (!this.activeProject) return null;

        const file: IDEFile = {
            name,
            path: name,
            content,
            language,
            isDirty: false
        };

        this.activeProject.files.set(name, file);
        this.activeProject.activeFile = name;
        this.activeProject.updatedAt = Date.now();

        console.log(`📄 File created: ${name}`);
        return file;
    }

    /**
     * Open file
     */
    openFile(fileName: string): IDEFile | null {
        if (!this.activeProject) return null;

        const file = this.activeProject.files.get(fileName);
        if (file) {
            this.activeProject.activeFile = fileName;
        }
        return file || null;
    }

    /**
     * Update file content
     */
    updateFile(fileName: string, content: string): boolean {
        if (!this.activeProject) return false;

        const file = this.activeProject.files.get(fileName);
        if (file) {
            file.content = content;
            file.isDirty = file.savedContent !== content;
            this.activeProject.updatedAt = Date.now();
            
            // Clear compilation cache for this file
            this.compilationCache.delete(fileName);
            
            return true;
        }
        return false;
    }

    /**
     * Save file
     */
    saveFile(fileName: string): boolean {
        if (!this.activeProject) return false;

        const file = this.activeProject.files.get(fileName);
        if (file) {
            file.savedContent = file.content;
            file.isDirty = false;
            console.log(`💾 File saved: ${fileName}`);
            return true;
        }
        return false;
    }

    /**
     * Delete file
     */
    deleteFile(fileName: string): boolean {
        if (!this.activeProject) return false;

        const deleted = this.activeProject.files.delete(fileName);
        if (deleted && this.activeProject.activeFile === fileName) {
            this.activeProject.activeFile = undefined;
        }
        return deleted;
    }

    // ==================== COMPILATION ====================

    /**
     * Compile active file
     */
    compile(fileName?: string): CompilationResult {
        if (!this.activeProject) {
            return {
                success: false,
                errors: [{ line: 0, column: 0, message: 'No active project', severity: 'error' }],
                warnings: []
            };
        }

        const targetFile = fileName || this.activeProject.activeFile;
        if (!targetFile) {
            return {
                success: false,
                errors: [{ line: 0, column: 0, message: 'No file selected', severity: 'error' }],
                warnings: []
            };
        }

        // Check compilation cache
        const cached = this.compilationCache.get(targetFile);
        if (cached) {
            console.log('📦 Using cached compilation');
            return cached;
        }

        const file = this.activeProject.files.get(targetFile);
        if (!file) {
            return {
                success: false,
                errors: [{ line: 0, column: 0, message: 'File not found', severity: 'error' }],
                warnings: []
            };
        }

        console.log(`🔨 Compiling ${file.name}...`);

        try {
            // Validate syntax first
            const validationErrors = this.validateSyntax(file);
            if (validationErrors.length > 0) {
                const result: CompilationResult = {
                    success: false,
                    errors: validationErrors,
                    warnings: []
                };
                this.compilationCache.set(targetFile, result);
                return result;
            }

            // Compile with engine
            const source: ContractSource = {
                name: file.name.replace(/\.[^.]+$/, ''),
                version: '1.0.0',
                language: file.language === 'ares' ? 'ares' : file.language as any,
                code: file.content
            };

            const compiled = this.engine.compile(source);

            // Estimate gas
            const gasEstimate = this.estimateGas(compiled);

            const result: CompilationResult = {
                success: true,
                compiled,
                errors: [],
                warnings: this.generateWarnings(file),
                gasEstimate
            };

            this.compilationCache.set(targetFile, result);
            console.log('✅ Compilation successful');
            return result;

        } catch (error: any) {
            const result: CompilationResult = {
                success: false,
                errors: [{
                    line: 0,
                    column: 0,
                    message: error.message || 'Unknown error',
                    severity: 'error'
                }],
                warnings: []
            };
            this.compilationCache.set(targetFile, result);
            return result;
        }
    }

    /**
     * Validate syntax
     */
    private validateSyntax(file: IDEFile): CompilationError[] {
        const errors: CompilationError[] = [];
        const lines = file.content.split('\n');

        // Basic syntax validation
        lines.forEach((line, index) => {
            // Check for common syntax errors
            if (line.includes('function') && !line.includes('{') && !line.includes(';')) {
                errors.push({
                    line: index + 1,
                    column: 0,
                    message: 'Missing opening brace or semicolon',
                    severity: 'error'
                });
            }
        });

        return errors;
    }

    /**
     * Generate warnings
     */
    private generateWarnings(file: IDEFile): string[] {
        const warnings: string[] = [];
        const content = file.content;

        // Check for potential issues
        if (content.includes('eval(')) {
            warnings.push('Use of eval() is discouraged for security reasons');
        }
        if (content.length > 100000) {
            warnings.push('Contract size is very large, consider splitting into modules');
        }

        return warnings;
    }

    /**
     * Estimate gas cost
     */
    private estimateGas(compiled: CompiledContract): number {
        const bytecodeSize = compiled.bytecode.length;
        const deploymentGas = bytecodeSize * 200;
        const storageGas = compiled.abi.functions.length * 20000;
        
        return 53000 + deploymentGas + storageGas;
    }

    // ==================== DEPLOYMENT ====================

    /**
     * Deploy compiled contract
     */
    deploy(
        compilationResult: CompilationResult,
        deployer: string,
        config: DeploymentConfig
    ): DeployedContract | null {
        if (!compilationResult.success || !compilationResult.compiled) {
            console.error('❌ Cannot deploy: compilation failed');
            return null;
        }

        console.log(`🚀 Deploying to ${config.network}...`);

        try {
            const deployed = this.engine.deploy(
                compilationResult.compiled,
                deployer,
                config.constructorArgs,
                config.initialBalance
            );

            console.log(`✅ Deployed at: ${deployed.address}`);
            console.log(`   Gas used: ${config.gasLimit}`);
            console.log(`   Network: ${config.network}`);

            return deployed;

        } catch (error) {
            console.error('❌ Deployment failed:', error);
            return null;
        }
    }

    // ==================== DEBUGGING ====================

    /**
     * Start debug session
     */
    startDebugSession(
        contractAddress: string,
        functionName: string,
        args: any[]
    ): DebugSession {
        const session: DebugSession = {
            contractAddress,
            functionName,
            args,
            breakpoints: [],
            stack: [],
            variables: new Map()
        };

        this.debugSessions.set(contractAddress, session);
        console.log(`🐛 Debug session started for ${contractAddress}`);

        return session;
    }

    /**
     * Set breakpoint
     */
    setBreakpoint(contractAddress: string, line: number): boolean {
        const session = this.debugSessions.get(contractAddress);
        if (session && !session.breakpoints.includes(line)) {
            session.breakpoints.push(line);
            console.log(`🔴 Breakpoint set at line ${line}`);
            return true;
        }
        return false;
    }

    /**
     * Remove breakpoint
     */
    removeBreakpoint(contractAddress: string, line: number): boolean {
        const session = this.debugSessions.get(contractAddress);
        if (session) {
            const index = session.breakpoints.indexOf(line);
            if (index > -1) {
                session.breakpoints.splice(index, 1);
                console.log(`⚪ Breakpoint removed from line ${line}`);
                return true;
            }
        }
        return false;
    }

    /**
     * Step through execution
     */
    step(contractAddress: string): any {
        const session = this.debugSessions.get(contractAddress);
        if (!session) return null;

        console.log(`👣 Stepping through ${session.functionName}...`);
        
        // Execute one step
        // In production, this would step through bytecode
        
        return session;
    }

    // ==================== CODE TEMPLATES ====================

    /**
     * Get default contract template
     */
    private getDefaultContractTemplate(): string {
        return `// ARES Smart Contract
contract MyContract {
    // State variables
    address public owner;
    uint256 public value;
    
    // Events
    event ValueChanged(uint256 newValue);
    
    // Constructor
    constructor() {
        owner = msg.sender;
        value = 0;
    }
    
    // Functions
    function setValue(uint256 newValue) public {
        require(msg.sender == owner, "Only owner can set value");
        value = newValue;
        emit ValueChanged(newValue);
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}`;
    }

    /**
     * Get template by name
     */
    getTemplate(templateName: string): string | null {
        const template = this.engine.getTemplate(templateName);
        return template?.code || null;
    }

    /**
     * List available templates
     */
    listTemplates(): string[] {
        return this.engine.listTemplates();
    }

    // ==================== CODE ANALYSIS ====================

    /**
     * Analyze code for issues
     */
    analyzeCode(fileName: string): {
        complexity: number;
        loc: number;
        security: { issue: string; severity: string }[];
        optimization: string[];
    } {
        if (!this.activeProject) {
            return { complexity: 0, loc: 0, security: [], optimization: [] };
        }

        const file = this.activeProject.files.get(fileName);
        if (!file) {
            return { complexity: 0, loc: 0, security: [], optimization: [] };
        }

        const lines = file.content.split('\n');
        const loc = lines.filter(l => l.trim().length > 0).length;
        
        // Calculate cyclomatic complexity
        const complexity = this.calculateComplexity(file.content);
        
        // Security analysis
        const security = this.analyzeSecurityIssues(file.content);
        
        // Optimization suggestions
        const optimization = this.suggestOptimizations(file.content);

        return { complexity, loc, security, optimization };
    }

    private calculateComplexity(code: string): number {
        // Simple complexity calculation
        const conditions = (code.match(/if|while|for|switch|case|\?/g) || []).length;
        return conditions + 1;
    }

    private analyzeSecurityIssues(code: string): { issue: string; severity: string }[] {
        const issues: { issue: string; severity: string }[] = [];

        if (code.includes('tx.origin')) {
            issues.push({
                issue: 'Use of tx.origin for authorization is unsafe',
                severity: 'high'
            });
        }

        if (code.includes('call.value')) {
            issues.push({
                issue: 'Potential reentrancy vulnerability',
                severity: 'high'
            });
        }

        return issues;
    }

    private suggestOptimizations(code: string): string[] {
        const suggestions: string[] = [];

        if (code.includes('++i')) {
            suggestions.push('Consider using unchecked increment for gas savings');
        }

        if ((code.match(/storage/g) || []).length > 5) {
            suggestions.push('Multiple storage operations detected, consider using memory');
        }

        return suggestions;
    }

    // ==================== UTILITIES ====================

    private generateId(): string {
        return 'project_' + Date.now() + '_' + Math.random().toString(36).substring(7);
    }

    private loadSampleProjects(): void {
        // Load sample projects
        const sample = this.createProject('Sample Token', 'ERC20-like token contract');
        const tokenTemplate = this.engine.getTemplate('ERC20');
        if (tokenTemplate && sample.files.has('main.ares')) {
            const file = sample.files.get('main.ares')!;
            file.content = tokenTemplate.code;
        }

        console.log('✅ Sample projects loaded');
    }

    /**
     * Export project
     */
    exportProject(projectId: string): string {
        const project = this.projects.get(projectId);
        if (!project) return '';

        const exported = {
            name: project.name,
            description: project.description,
            files: Array.from(project.files.entries())
        };

        return JSON.stringify(exported, null, 2);
    }

    /**
     * Import project
     */
    importProject(data: string): IDEProject | null {
        try {
            const parsed = JSON.parse(data);
            const project = this.createProject(parsed.name, parsed.description);
            
            parsed.files.forEach(([name, file]: [string, any]) => {
                this.createFile(name, file.language, file.content);
            });

            return project;
        } catch (error) {
            console.error('Import failed:', error);
            return null;
        }
    }

    /**
     * Get IDE statistics
     */
    getStats(): {
        totalProjects: number;
        totalFiles: number;
        totalLinesOfCode: number;
        compiledContracts: number;
    } {
        let totalFiles = 0;
        let totalLinesOfCode = 0;

        this.projects.forEach(project => {
            totalFiles += project.files.size;
            project.files.forEach(file => {
                totalLinesOfCode += file.content.split('\n').length;
            });
        });

        return {
            totalProjects: this.projects.size,
            totalFiles,
            totalLinesOfCode,
            compiledContracts: this.compilationCache.size
        };
    }
}

export default ContractIDE;
