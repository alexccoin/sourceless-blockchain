# PowerShell Deployment Package Creator for Sourceless Stratus Blockchain
# Created with love by AM Stratulat and Sourceless Team
# Copyright (c) 2024-2025 Alexandru Marius Stratulat

Write-Host "🚀 Creating Sourceless Stratus Blockchain Deployment Package..." -ForegroundColor Green

$VERSION = "1.0.0"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$PACKAGE_NAME = "sourceless-stratus-v$VERSION"
$FULL_NAME = "$PACKAGE_NAME-$TIMESTAMP"

# Create deployment directory
New-Item -Path "dist\$FULL_NAME" -ItemType Directory -Force | Out-Null

Write-Host "📦 Copying production files..." -ForegroundColor Yellow

# Copy essential directories
Copy-Item -Path "genesis-nodes" -Destination "dist\$FULL_NAME\" -Recurse -Force
Copy-Item -Path "public" -Destination "dist\$FULL_NAME\" -Recurse -Force
Copy-Item -Path "src" -Destination "dist\$FULL_NAME\" -Recurse -Force
Copy-Item -Path "scripts" -Destination "dist\$FULL_NAME\" -Recurse -Force
Copy-Item -Path "wallet-core" -Destination "dist\$FULL_NAME\" -Recurse -Force

# Copy server files
Copy-Item -Path "server-production-hardened.js" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "server-production.js" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "server.js" -Destination "dist\$FULL_NAME\" -Force

# Copy configuration
Copy-Item -Path "package.json" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path ".env.example" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path ".gitignore" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "ecosystem.config.js" -Destination "dist\$FULL_NAME\" -Force

# Copy Docker files
Copy-Item -Path "Dockerfile" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "docker-compose.yml" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "docker-compose.production.yml" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "Dockerfile.genesis" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "Dockerfile.production" -Destination "dist\$FULL_NAME\" -Force

# Copy deployment scripts
Copy-Item -Path "deploy.sh" -Destination "dist\$FULL_NAME\" -Force

# Copy documentation
Copy-Item -Path "README_GITHUB.md" -Destination "dist\$FULL_NAME\README.md" -Force
Copy-Item -Path "LICENSE" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "CHANGELOG.md" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "CONTRIBUTING.md" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "QUICK_START_GUIDE.md" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "PRODUCTION_SETUP_GUIDE.md" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "API_INTEGRATION_DOCUMENTATION.md" -Destination "dist\$FULL_NAME\" -Force
Copy-Item -Path "SECURITY_IMPLEMENTATION.md" -Destination "dist\$FULL_NAME\" -Force

# Copy all markdown files
Get-ChildItem -Path "." -Filter "*.md" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination "dist\$FULL_NAME\" -Force -ErrorAction SilentlyContinue
}

Write-Host "📝 Creating deployment instructions..." -ForegroundColor Yellow

$DEPLOY_CONTENT = @"
# Sourceless Stratus Blockchain - Deployment Instructions

**Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team**

## 🚀 Quick Deployment

### Option 1: PM2 (Recommended for Production)

``````bash
# Install dependencies
npm install --production

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
notepad .env

# Start with PM2
npm run pm2:hardened

# Check status
pm2 status

# View logs
pm2 logs sourceless-stratus
``````

### Option 2: Docker

``````bash
# Build and start
docker-compose up -d

# Check status
docker ps

# View logs
docker logs sourceless-stratus-blockchain

# Stop
docker-compose down
``````

### Option 3: Direct Node.js

``````bash
# Install dependencies
npm install --production

# Copy environment template
cp .env.example .env

# Start production server
npm run production:hardened
``````

## 📊 Verify Deployment

``````bash
# Health check
curl http://localhost:3002/health

# Check stats
curl http://localhost:3002/api/stats

# Access STRXplorer
# Open browser: http://localhost:3002
``````

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
"@

Set-Content -Path "dist\$FULL_NAME\DEPLOY.md" -Value $DEPLOY_CONTENT -Encoding UTF8

Write-Host "🗜️  Creating archive..." -ForegroundColor Yellow

# Create zip archive
Compress-Archive -Path "dist\$FULL_NAME" -DestinationPath "dist\$FULL_NAME.zip" -Force

Write-Host "✅ Deployment package created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Package location:" -ForegroundColor Cyan
Write-Host "   - dist\$FULL_NAME.zip" -ForegroundColor White
Write-Host ""
Write-Host "📏 Package size:" -ForegroundColor Cyan
$size = (Get-Item "dist\$FULL_NAME.zip").Length / 1MB
Write-Host "   - $([math]::Round($size, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team" -ForegroundColor Magenta
