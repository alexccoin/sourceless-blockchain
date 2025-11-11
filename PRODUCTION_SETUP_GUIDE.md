# 🚀 Stratus Production Server Setup Guide

## Phase 1: Database Persistence - IMPLEMENTATION READY

This guide will help you set up the production-ready Stratus blockchain server with PostgreSQL database persistence, eliminating data loss and server restart issues.

## Quick Start (Local Development with Database)

### Prerequisites
- Node.js 16+ installed
- PostgreSQL 12+ installed and running
- Git

### 1. Install PostgreSQL (if not installed)

**Windows:**
```powershell
# Using chocolatey
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database
```bash
# Create database
createdb stratus_blockchain

# Or using psql
psql -U postgres
CREATE DATABASE stratus_blockchain;
\q
```

### 3. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database URL
DATABASE_URL=postgresql://postgres:password@localhost:5432/stratus_blockchain
NODE_ENV=development
PORT=3000
```

### 4. Install Dependencies
```bash
# Install production server dependencies
npm install --save pg express cors helmet express-rate-limit compression dotenv winston bcrypt jsonwebtoken joi

# Install development dependencies
npm install --save-dev nodemon jest supertest
```

### 5. Initialize Database
```bash
# Run database initialization
node scripts/init-database.js

# Optional: Migrate historical data
node scripts/migrate-database.js
```

### 6. Start Production Server
```bash
# Start with nodemon for development
npm run dev

# Or start production server directly
node server-production.js
```

## Expected Output
```
🗄️ Initializing blockchain database...
✅ Database tables created/verified
🌍 Creating new genesis blockchain state...
✅ Genesis blockchain state created
📋 Genesis Hash: a1b2c3d4e5f6...
✅ Database initialized successfully
🚀 Initializing Stratus Production Server...
✅ Database initialized successfully
✅ AutoRunAll module loaded
✅ AresLang module loaded
🚀 Starting full blockchain initialization (database-backed)...
✅ AresLang initialized
🔄 Syncing blockchain data to database...
✅ Database sync completed (genesis state)
✅ Full blockchain systems initialized with database backing
   🗄️ Database: 63000000000 STR, 63000000 CCOS
   📜 Ledgers: 6 active ledgers
      - main: 1001 blocks, 1501 transactions
      - asset: 1001 blocks, 1201 transactions
      - contract: 1001 blocks, 1801 transactions
      - governance: 1001 blocks, 751 transactions
      - ccoin: 1001 blocks, 1351 transactions
      - ccos: 1001 blocks, 1651 transactions
🌟 Stratus Production Server fully initialized

🌐 Stratus Production Server Running
📍 Access at: http://localhost:3000
🗄️ Database: Connected and initialized
⚡ Status: Production-ready with persistent storage
```

## API Endpoints

### Database-Backed Endpoints (NEW)
- `GET /health` - Server health with database status
- `GET /api/db:network:stats` - Network statistics from database
- `GET /api/db:ledger:stats` - All ledger statistics from database
- `GET /api/db:explorer:blocks?ledger=main&page=1&pageSize=20` - Paginated blocks from database

### Legacy Endpoints (Still Supported)
- `GET /api/wallet:get` - Wallet information
- `GET /api/ledger:stats` - Ledger statistics (with database fallback)
- `GET /api/network:stats` - Network statistics (with database fallback)
- `GET /api/explorer:blocks` - Block explorer data
- `GET /api/explorer:transactions` - Transaction data

## Features ✅

### ✅ Data Persistence
- PostgreSQL database with complete blockchain schema
- Genesis data automatically created and preserved
- Block and transaction history stored permanently
- Network state persistence across restarts

### ✅ Server Stability
- Graceful shutdown handling
- Database connection pooling
- Error recovery and fallback systems
- Health check endpoints

### ✅ Enhanced Frontend
- Automatic server detection (ports 3000, 3001, 3002)
- Database vs legacy server detection
- Enhanced API calls with fallback support
- Real-time status indicators

### ✅ Production Features
- Environment configuration with .env support
- Comprehensive logging with Winston
- Security headers with Helmet
- Rate limiting protection
- CORS configuration

## Database Schema

The database includes tables for:
- **blockchain_blocks**: All blocks across all ledgers
- **blockchain_transactions**: All transactions with full details
- **blockchain_wallets**: Genesis and user wallets with balances
- **blockchain_network_state**: Overall network statistics
- **blockchain_ledgers**: Ledger metadata and statistics
- **system_config**: System configuration storage

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
pg_isready -U postgres

# Test connection
psql -U postgres -h localhost -p 5432 -d stratus_blockchain
```

### Port Conflicts
The server automatically tries ports 3000, 3001, 3002. The frontend detects which port is available.

### Data Reset Issues
With the database backend, blockchain data persists across server restarts. The genesis hash ensures data consistency.

## Next Steps

### Phase 2: Application Stability (Ready to Implement)
- Enhanced error handling and logging
- Performance monitoring endpoints
- Automated backup systems
- Load balancing preparation

### Phase 3: Docker Deployment (Ready to Implement)
```bash
# Build Docker image
docker build -f Dockerfile.production -t stratus-blockchain .

# Run with Docker Compose
docker-compose -f docker-compose.production.yml up
```

### Phase 4: Public Deployment (Ready to Implement)
- SSL certificate setup
- Domain configuration
- Production database hosting
- CDN and security enhancements

## Success Metrics

- ✅ **Data Persistence**: Blockchain data survives server restarts
- ✅ **Server Stability**: HTTP server binds successfully and stays running  
- ✅ **Real Data**: Genesis wallets show 63B STR and 63M CCOS tokens
- ✅ **Block Explorer**: Shows real blocks with actual transaction data
- ✅ **API Consistency**: All endpoints return real blockchain data
- ✅ **Zero Data Loss**: No blockchain resets on server restart

## Support

If you encounter issues:
1. Check the logs in `logs/blockchain.log`
2. Verify database connection with `node scripts/init-database.js`
3. Test API endpoints with `curl http://localhost:3000/health`
4. Review the database tables with `psql -U postgres -d stratus_blockchain`

The production server is now ready for stable blockchain operations! 🎉