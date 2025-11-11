#!/bin/bash
# Deployment Package Creator for Sourceless Stratus Blockchain
# Created with love by AM Stratulat and Sourceless Team
# Copyright (c) 2024-2025 Alexandru Marius Stratulat

echo "🚀 Creating Sourceless Stratus Blockchain Deployment Package..."

VERSION="1.0.0"
PACKAGE_NAME="sourceless-stratus-v${VERSION}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FULL_NAME="${PACKAGE_NAME}-${TIMESTAMP}"

# Create deployment directory
mkdir -p "dist/${FULL_NAME}"

echo "📦 Copying production files..."

# Copy essential files
cp -r genesis-nodes "dist/${FULL_NAME}/"
cp -r public "dist/${FULL_NAME}/"
cp -r src "dist/${FULL_NAME}/"
cp -r scripts "dist/${FULL_NAME}/"
cp -r wallet-core "dist/${FULL_NAME}/"

# Copy server files
cp server-production-hardened.js "dist/${FULL_NAME}/"
cp server-production.js "dist/${FULL_NAME}/"
cp server.js "dist/${FULL_NAME}/"

# Copy configuration
cp package.json "dist/${FULL_NAME}/"
cp .env.example "dist/${FULL_NAME}/"
cp .gitignore "dist/${FULL_NAME}/"
cp ecosystem.config.js "dist/${FULL_NAME}/"

# Copy Docker files
cp Dockerfile "dist/${FULL_NAME}/"
cp docker-compose.yml "dist/${FULL_NAME}/"
cp docker-compose.production.yml "dist/${FULL_NAME}/"
cp Dockerfile.genesis "dist/${FULL_NAME}/"
cp Dockerfile.production "dist/${FULL_NAME}/"

# Copy deployment scripts
cp deploy.sh "dist/${FULL_NAME}/"

# Copy documentation
cp README_GITHUB.md "dist/${FULL_NAME}/README.md"
cp LICENSE "dist/${FULL_NAME}/"
cp CHANGELOG.md "dist/${FULL_NAME}/"
cp CONTRIBUTING.md "dist/${FULL_NAME}/"
cp QUICK_START_GUIDE.md "dist/${FULL_NAME}/"
cp PRODUCTION_SETUP_GUIDE.md "dist/${FULL_NAME}/"
cp API_INTEGRATION_DOCUMENTATION.md "dist/${FULL_NAME}/"
cp SECURITY_IMPLEMENTATION.md "dist/${FULL_NAME}/"

# Copy all other markdown docs
cp *.md "dist/${FULL_NAME}/" 2>/dev/null || true

echo "📝 Creating deployment instructions..."

cat > "dist/${FULL_NAME}/DEPLOY.md" << 'EOF'
# Sourceless Stratus Blockchain - Deployment Instructions

**Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team**

## 🚀 Quick Deployment

### Option 1: PM2 (Recommended for Production)

```bash
# Install dependencies
npm install --production

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start with PM2
npm run pm2:hardened

# Check status
pm2 status

# View logs
pm2 logs sourceless-stratus
```

### Option 2: Docker

```bash
# Build and start
docker-compose up -d

# Check status
docker ps

# View logs
docker logs sourceless-stratus-blockchain

# Stop
docker-compose down
```

### Option 3: Direct Node.js

```bash
# Install dependencies
npm install --production

# Copy environment template
cp .env.example .env

# Start production server
npm run production:hardened
```

## 📊 Verify Deployment

```bash
# Health check
curl http://localhost:3002/health

# Check stats
curl http://localhost:3002/api/stats

# Access STRXplorer
# Open browser: http://localhost:3002
```

## 🔒 Security Checklist

- [ ] Change default PORT if needed (.env)
- [ ] Configure ALLOWED_ORIGINS for production
- [ ] Set appropriate RATE_LIMIT
- [ ] Review firewall rules
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set up monitoring (PM2 or external)
- [ ] Configure log rotation
- [ ] Backup .hostless directory regularly

## 📚 Documentation

- README.md - Complete system overview
- QUICK_START_GUIDE.md - Getting started
- PRODUCTION_SETUP_GUIDE.md - Production deployment
- API_INTEGRATION_DOCUMENTATION.md - API reference
- SECURITY_IMPLEMENTATION.md - Security features

## 🆘 Support

- GitHub: https://github.com/alexccoin/sourceless-stratus-blockchain
- Email: team@sourceless.io

---

**Copyright © 2024-2025 Alexandru Marius Stratulat**  
**Licensed under MIT License**

Made with ❤️ by Alexandru Marius Stratulat and Sourceless Team
EOF

echo "🗜️  Creating archive..."

# Create tar.gz archive
cd dist
tar -czf "${FULL_NAME}.tar.gz" "${FULL_NAME}"
cd ..

# Create zip archive
cd dist
zip -r "${FULL_NAME}.zip" "${FULL_NAME}" -q
cd ..

echo "✅ Deployment package created successfully!"
echo ""
echo "📦 Package location:"
echo "   - dist/${FULL_NAME}.tar.gz"
echo "   - dist/${FULL_NAME}.zip"
echo ""
echo "📏 Package size:"
du -h "dist/${FULL_NAME}.tar.gz"
du -h "dist/${FULL_NAME}.zip"
echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team"
