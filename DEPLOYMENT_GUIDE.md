# Stratus Blockchain - Genesis Deployment Guide

Complete guide for deploying the **Stratus Genesis Blockchain** to production.

## Overview

This deployment creates a **production-ready genesis blockchain** with:
- ✅ **3 Genesis Validator Nodes** (high availability)
- ✅ **All 6 Multi-Ledgers** (Main, Asset, Contract, Governance, CCOIN, CCOS)
- ✅ **Initial Token Supply** (21B STR, 1B CCOIN, 10M ARSS, 100M CCOS)
- ✅ **P2P Network** (BitTorrent-style discovery)
- ✅ **Monitoring Stack** (Prometheus + Grafana)
- ✅ **Customer Client Support**

## Prerequisites

### Required Software
- **Docker** 20.10+ and **Docker Compose** 1.29+
- **Node.js** 16+ (for local builds)
- **Git** (for version control)
- **jq** (for JSON processing in scripts)

### System Requirements

**Per Genesis Node:**
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 50GB SSD (grows over time)
- **Network**: 100Mbps+ with public IP

**Total for 3-Node Setup:**
- **CPU**: 6+ cores
- **RAM**: 12-24GB
- **Disk**: 150GB+
- **Bandwidth**: Unlimited or high limit

## Quick Deployment (Docker)

### 1. Generate Genesis State

```bash
# Build and generate genesis
npm install
npm run genesis
```

This creates `genesis-export.json` with:
```json
{
  "genesisHash": "abc123...",
  "chainId": 1313,
  "timestamp": 1234567890000,
  "wallets": [...],
  "ledgers": {
    "main": "hash1",
    "ccoin": "hash2",
    ...
  }
}
```

### 2. Run Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
1. ✅ Generate/validate genesis state
2. ✅ Build Docker images
3. ✅ Create monitoring configs
4. ✅ Deploy 3 genesis nodes
5. ✅ Wait for health checks
6. ✅ Display network status

### 3. Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f genesis-node-1

# Test API
curl http://localhost:3000/health
curl http://localhost:3000/api/blockchain/stats
```

## Manual Deployment

### Build from Source

```bash
# Clone repository
git clone https://github.com/stratus-network/stratus-electron-app
cd stratus-electron-app

# Install dependencies
npm install

# Build TypeScript
npm run build

# Generate genesis
npm run genesis
```

### Run Genesis Node

```bash
# Set environment
export NODE_ENV=production
export GENESIS_MODE=true
export VALIDATOR=true
export SKIP_HEAVY_HISTORY=true

# Start HTTP server
node server.js &

# Start main process
node dist/main/main.js
```

### Custom Configuration

Create `.env` file:

```env
# Network
NODE_ENV=production
GENESIS_MODE=true
VALIDATOR=true
CHAIN_ID=1313

# Performance
SKIP_HEAVY_HISTORY=true
MAX_BLOCK_SIZE=10485760
TARGET_TPMS=1000000

# P2P
P2P_PORT=6333
SEED_NODES=seed1.stratus.network:6333

# Storage
DATA_DIR=./blockchain-data
```

## Docker Deployment Details

### Architecture

```
┌─────────────────────────────────────────────────┐
│                Stratus Network                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────┐ │
│  │ Genesis      │  │ Genesis      │  │Grafana│ │
│  │ Node 1       │  │ Node 2       │  │  UI   │ │
│  │ (Foundation) │  │ (Backup)     │  └───┬───┘ │
│  │              │  │              │      │     │
│  │ HTTP: 3000   │  │ HTTP: 3001   │  ┌───┴───┐ │
│  │ P2P:  6333   │  │ P2P:  6334   │  │Prom-  │ │
│  └───────┬──────┘  └──────┬───────┘  │etheus │ │
│          │                │          └───────┘ │
│          └────────┬───────┘                    │
│                   │                            │
│          ┌────────┴────────┐                   │
│          │ Genesis Node 3  │                   │
│          │ (Geo-Diverse)   │                   │
│          │ HTTP: 3002      │                   │
│          │ P2P:  6335      │                   │
│          └─────────────────┘                   │
└─────────────────────────────────────────────────┘
```

### Services

**genesis-node-1** (Primary)
- Port 3000: HTTP API
- Port 6333: P2P networking
- Role: Foundation genesis validator
- Validator: Yes

**genesis-node-2** (Secondary)
- Port 3001: HTTP API
- Port 6334: P2P networking
- Role: Backup validator
- Seed: genesis-node-1

**genesis-node-3** (Tertiary)
- Port 3002: HTTP API
- Port 6335: P2P networking
- Role: Geographic diversity
- Seed: genesis-node-1, genesis-node-2

**prometheus** (Monitoring)
- Port 9090: Metrics UI
- Scrapes all 3 nodes

**grafana** (Dashboards)
- Port 3003: Dashboard UI
- Default: admin/stratus2024

### Volumes

All data persists in Docker volumes:
- `genesis-1-data`: Node 1 blockchain data
- `genesis-2-data`: Node 2 blockchain data
- `genesis-3-data`: Node 3 blockchain data
- `prometheus-data`: Metrics history
- `grafana-data`: Dashboard configs

## Production Deployment

### Cloud Providers

#### AWS Deployment

```bash
# Launch EC2 instances (t3.medium or larger)
# Ubuntu 22.04 LTS
# Security groups: 3000, 6333 open

# On each instance:
sudo apt update
sudo apt install docker.io docker-compose
git clone <repo>
cd stratus-electron-app
sudo ./deploy.sh
```

#### DigitalOcean

```bash
# Create 3 Droplets (4GB RAM, 2vCPU)
# Ubuntu 22.04

# Install Docker
curl -fsSL https://get.docker.com | sh

# Deploy
./deploy.sh
```

#### Google Cloud Platform

```bash
# Create 3 Compute Engine instances
# e2-medium (4GB, 2vCPU)
# Ubuntu 22.04

gcloud compute instances create stratus-genesis-{1..3} \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB

# SSH and deploy
gcloud compute ssh stratus-genesis-1
./deploy.sh
```

### DNS Configuration

Point seed domains to genesis nodes:

```
seed1.stratus.network  → [Genesis-1 IP]:6333
seed2.stratus.network  → [Genesis-2 IP]:6334
seed3.stratus.network  → [Genesis-3 IP]:6335
```

### SSL/TLS (Optional)

For HTTPS API access:

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d api.stratus.network

# Configure nginx reverse proxy
sudo apt install nginx
```

Nginx config:

```nginx
server {
    listen 443 ssl;
    server_name api.stratus.network;
    
    ssl_certificate /etc/letsencrypt/live/api.stratus.network/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.stratus.network/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

## Monitoring

### Prometheus Metrics

Access: `http://localhost:9090`

**Key Metrics:**
- `blockchain_height`: Current block count
- `blockchain_transactions_total`: Total transactions
- `p2p_peers`: Connected peer count
- `wallet_count`: Active wallets
- `ledger_supply`: Token supply per ledger

### Grafana Dashboards

Access: `http://localhost:3003`
Login: `admin` / `stratus2024`

**Pre-built Dashboards:**
1. **Network Overview**: Block height, TPS, peer count
2. **Ledger Stats**: Supply, transactions, balances
3. **Node Health**: CPU, RAM, disk, uptime
4. **P2P Network**: Peer distribution, bandwidth

## Client Connection

Once genesis is deployed, clients can connect:

```bash
npm run client
```

When prompted:
- **Seed nodes**: `localhost:6333,localhost:6334,localhost:6335`
- Or production: `seed1.stratus.network:6333,seed2.stratus.network:6333`

## Maintenance

### Backup Genesis State

```bash
# Backup volumes
docker run --rm \
  -v genesis-1-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/genesis-1-$(date +%Y%m%d).tar.gz /data
```

### View Logs

```bash
# All nodes
docker-compose logs -f

# Specific node
docker-compose logs -f genesis-node-1

# Last 100 lines
docker-compose logs --tail=100 genesis-node-2
```

### Update Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Scale Nodes

Add more validators in `docker-compose.yml`:

```yaml
  genesis-node-4:
    # ... same config as node-3
    ports:
      - "6336:6333"
      - "3003:3000"
    environment:
      - SEED_NODES=genesis-1:6333,genesis-2:6333,genesis-3:6333
```

## Troubleshooting

### "Container keeps restarting"

```bash
# Check logs
docker logs stratus-genesis-1

# Common issues:
# - Genesis file missing
# - Port already in use
# - Insufficient memory
```

### "Nodes can't connect to each other"

```bash
# Test P2P connectivity
docker exec -it stratus-genesis-1 nc -zv genesis-2.stratus.network 6333

# Check network
docker network inspect stratus-network
```

### "High memory usage"

```bash
# Enable lightweight history mode
docker-compose down
# Add to environment:
# - SKIP_HEAVY_HISTORY=true
docker-compose up -d
```

## Security Checklist

- [ ] Change default Grafana password
- [ ] Enable firewall (ufw/iptables)
- [ ] Restrict API access (nginx auth)
- [ ] Backup genesis wallets securely
- [ ] Enable Docker security scanning
- [ ] Use private Docker registry
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Rotate validator keys regularly

## Performance Tuning

### Linux System Tweaks

```bash
# Increase file descriptors
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# TCP optimization
sysctl -w net.core.rmem_max=134217728
sysctl -w net.core.wmem_max=134217728
sysctl -w net.ipv4.tcp_rmem="4096 87380 134217728"
sysctl -w net.ipv4.tcp_wmem="4096 65536 134217728"
```

### Docker Resource Limits

```yaml
services:
  genesis-node-1:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 8G
        reservations:
          cpus: '1'
          memory: 4G
```

## Support

- **Documentation**: https://docs.stratus.network
- **Discord**: https://discord.gg/stratus
- **Email**: support@stratus.network
- **GitHub**: https://github.com/stratus-network

---

**Genesis Deployment Ready! 🚀**
