# Dockerfile for Sourceless Stratus Blockchain
# Created with love by AM Stratulat and Sourceless Team
# Copyright (c) 2024-2025 Alexandru Marius Stratulat

FROM node:18-alpine

# Set metadata
LABEL maintainer="Alexandru Marius Stratulat <alexandru.stratulat@sourceless.io>"
LABEL description="Sourceless Stratus Blockchain - Enterprise-grade decentralized blockchain"
LABEL version="1.0.0"

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p logs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set environment
ENV NODE_ENV=production
ENV PORT=3002

# Start application
CMD ["node", "server-production-hardened.js"]
