const fs = require('fs');

function loadEnvFile(path) {
  const env = {};

  if (!fs.existsSync(path)) {
    throw new Error(`Environment file not found: ${path}`);
  }

  const lines = fs.readFileSync(path, 'utf8').split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    env[key] = value;
  }

  return env;
}

module.exports = {
  apps: [
    {
      name: 'sveltekit_modern_school_profile_production',
      script: 'build/index.js',
      cwd: '/var/www/sveltekit_modern_school_profile',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: loadEnvFile('/etc/sveltekit_modern_school_profile/production.env'),
      error_file: '/var/www/sveltekit_modern_school_profile/shared/logs/pm2-error.log',
      out_file: '/var/www/sveltekit_modern_school_profile/shared/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false
    }
  ]
};
