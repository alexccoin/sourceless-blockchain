// PM2 Ecosystem Configuration
// Created with love by AM Stratulat and Sourceless Team
// Copyright (c) 2024-2025 Alexandru Marius Stratulat

module.exports = {
  apps: [
    {
      name: 'sourceless-blockchain',
      script: 'server-production-hardened.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        DATABASE_MODE: true,
        SKIP_HEAVY_HISTORY: true
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true
    }
  ]
};
