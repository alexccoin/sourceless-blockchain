#!/bin/bash
# deploy.sh - Deployment script for Stratus Genesis Blockchain

set -e

echo "════════════════════════════════════════════════════════"
echo "   STRATUS BLOCKCHAIN - GENESIS DEPLOYMENT SCRIPT"
echo "════════════════════════════════════════════════════════"
echo ""

# Configuration
GENESIS_FILE="genesis-export.json"
DOCKER_COMPOSE="docker-compose.yml"
DATA_BACKUP_DIR="./backups"

# Step 1: Generate genesis state
echo "📍 Step 1: Generating Genesis State..."
if [ ! -f "$GENESIS_FILE" ]; then
    echo "   Running genesis creation..."
    npm run genesis
    echo "   ✅ Genesis state created: $GENESIS_FILE"
else
    echo "   ℹ️  Genesis state already exists"
    read -p "   Regenerate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run genesis
        echo "   ✅ Genesis state regenerated"
    fi
fi
echo ""

# Step 2: Validate genesis file
echo "📍 Step 2: Validating Genesis File..."
if [ -f "$GENESIS_FILE" ]; then
    GENESIS_HASH=$(jq -r '.genesisHash' "$GENESIS_FILE")
    CHAIN_ID=$(jq -r '.chainId' "$GENESIS_FILE")
    WALLET_COUNT=$(jq '.wallets | length' "$GENESIS_FILE")
    
    echo "   Genesis Hash: $GENESIS_HASH"
    echo "   Chain ID: $CHAIN_ID"
    echo "   Genesis Wallets: $WALLET_COUNT"
    echo "   ✅ Genesis file valid"
else
    echo "   ❌ Genesis file not found!"
    exit 1
fi
echo ""

# Step 3: Build Docker images
echo "📍 Step 3: Building Docker Images..."
docker-compose -f "$DOCKER_COMPOSE" build
echo "   ✅ Docker images built"
echo ""

# Step 4: Create monitoring config
echo "📍 Step 4: Creating Monitoring Configuration..."
mkdir -p monitoring
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'stratus-nodes'
    static_configs:
      - targets:
        - 'genesis-1.stratus.network:3000'
        - 'genesis-2.stratus.network:3000'
        - 'genesis-3.stratus.network:3000'
EOF
echo "   ✅ Monitoring configured"
echo ""

# Step 5: Deploy genesis nodes
echo "📍 Step 5: Deploying Genesis Nodes..."
docker-compose -f "$DOCKER_COMPOSE" up -d
echo "   ✅ Genesis nodes starting..."
echo ""

# Step 6: Wait for nodes to be healthy
echo "📍 Step 6: Waiting for Nodes to be Healthy..."
sleep 10

for i in {1..3}; do
    PORT=$((3000 + i - 1))
    echo -n "   Checking genesis-$i (port $PORT)... "
    
    for attempt in {1..30}; do
        if curl -sf "http://localhost:$PORT/health" > /dev/null 2>&1; then
            echo "✅ Healthy"
            break
        fi
        
        if [ $attempt -eq 30 ]; then
            echo "⚠️  Timeout (may still be starting)"
        else
            sleep 2
        fi
    done
done
echo ""

# Step 7: Display network status
echo "════════════════════════════════════════════════════════"
echo "   ✅ GENESIS DEPLOYMENT COMPLETE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🌐 Network Endpoints:"
echo "   Genesis Node 1: http://localhost:3000"
echo "   Genesis Node 2: http://localhost:3001"
echo "   Genesis Node 3: http://localhost:3002"
echo "   Prometheus:     http://localhost:9090"
echo "   Grafana:        http://localhost:3003 (admin/stratus2024)"
echo ""
echo "📡 P2P Ports:"
echo "   Genesis Node 1: localhost:6333"
echo "   Genesis Node 2: localhost:6334"
echo "   Genesis Node 3: localhost:6335"
echo ""
echo "💾 Data Volumes:"
docker volume ls | grep stratus
echo ""
echo "📊 Container Status:"
docker-compose -f "$DOCKER_COMPOSE" ps
echo ""
echo "🔗 Seed Nodes for Clients:"
echo "   localhost:6333,localhost:6334,localhost:6335"
echo ""
echo "════════════════════════════════════════════════════════"
echo "Next Steps:"
echo "1. Test client connection: npm run client"
echo "2. View logs: docker-compose logs -f"
echo "3. Monitor metrics: http://localhost:9090"
echo "4. Backup genesis: ./scripts/backup-genesis.sh"
echo "════════════════════════════════════════════════════════"
