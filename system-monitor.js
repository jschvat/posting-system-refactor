#!/usr/bin/env node
/**
 * System Monitor CLI Utility
 * Monitors and manages all services for the social media platform
 *
 * Services monitored:
 * - Frontend (React dev server)
 * - Backend API (Express server)
 * - WebSocket Server (Socket.io)
 * - PostgreSQL Database (Docker container)
 * - Redis Cache (Docker container or local)
 * - pgAdmin (Docker container)
 */

const { exec, spawn } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Load environment variables
require('dotenv').config();

// Configuration from .env
const CONFIG = {
  frontend: {
    name: 'Frontend',
    port: parseInt(process.env.FRONTEND_PORT) || 3000,
    host: process.env.FRONTEND_HOST || 'localhost',
    healthPath: '/',
    startCommand: 'cd frontend && npm start',
    cwd: path.join(__dirname, 'frontend')
  },
  backend: {
    name: 'Backend API',
    port: parseInt(process.env.API_PORT) || 3002,
    host: process.env.API_HOST || 'localhost',
    healthPath: '/health',
    startCommand: 'cd backend && npm start',
    cwd: path.join(__dirname, 'backend')
  },
  websocket: {
    name: 'WebSocket Server',
    port: parseInt(process.env.WS_PORT) || 3002,
    host: process.env.API_HOST || 'localhost',
    healthPath: '/health',
    startCommand: 'cd backend && node src/websocket-server.js',
    cwd: path.join(__dirname, 'backend')
  },
  postgres: {
    name: 'PostgreSQL',
    container: 'posting_system_db',
    port: parseInt(process.env.DB_PORT) || 5432,
    host: process.env.DB_HOST || 'localhost'
  },
  redis: {
    name: 'Redis',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    host: process.env.REDIS_HOST || 'localhost'
  },
  pgadmin: {
    name: 'pgAdmin',
    container: 'posting_system_pgadmin',
    port: 8080,
    host: 'localhost'
  }
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Status icons
const icons = {
  running: '✅',
  stopped: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  loading: '⏳'
};

/**
 * Clear console screen
 */
function clearScreen() {
  console.clear();
}

/**
 * Print colored text
 */
function print(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

/**
 * Print header
 */
function printHeader() {
  clearScreen();
  print('═══════════════════════════════════════════════════════════', 'cyan');
  print('              SYSTEM MONITOR - SERVICE DASHBOARD            ', 'bright');
  print('═══════════════════════════════════════════════════════════', 'cyan');
  print('');
}

/**
 * Check if a port is in use
 */
async function isPortInUse(port, host = 'localhost') {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Check HTTP health endpoint
 */
async function checkHttpHealth(host, port, path = '/health') {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            healthy: res.statusCode === 200,
            status: json.status || 'OK',
            uptime: json.uptime || 0
          });
        } catch {
          resolve({
            healthy: res.statusCode === 200,
            status: 'OK',
            uptime: 0
          });
        }
      });
    });

    req.on('error', () => {
      resolve({ healthy: false, status: 'ERROR', uptime: 0 });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ healthy: false, status: 'TIMEOUT', uptime: 0 });
    });

    req.end();
  });
}

/**
 * Check Docker container status
 */
async function checkDockerContainer(containerName) {
  try {
    const { stdout } = await execAsync(`docker ps --filter "name=${containerName}" --format "{{.Status}}"`);
    const status = stdout.trim();

    if (status) {
      // Container is running
      const isHealthy = status.includes('healthy') || !status.includes('unhealthy');
      return {
        running: true,
        healthy: isHealthy,
        status: status
      };
    } else {
      // Check if container exists but is stopped
      const { stdout: existsOutput } = await execAsync(`docker ps -a --filter "name=${containerName}" --format "{{.Status}}"`);
      if (existsOutput.trim()) {
        return {
          running: false,
          healthy: false,
          status: existsOutput.trim()
        };
      }
      return {
        running: false,
        healthy: false,
        status: 'Not found'
      };
    }
  } catch (error) {
    return {
      running: false,
      healthy: false,
      status: 'Error checking status'
    };
  }
}

/**
 * Check Redis connection
 */
async function checkRedis(host, port) {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec(`redis-cli -h ${host} -p ${port} ping`, (error, stdout) => {
      if (error || !stdout.includes('PONG')) {
        resolve({ healthy: false, status: 'DOWN' });
      } else {
        resolve({ healthy: true, status: 'UP' });
      }
    });
  });
}

/**
 * Get process status by port
 */
async function getProcessByPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    const pid = stdout.trim();
    if (pid) {
      return {
        running: true,
        pid: pid
      };
    }
    return { running: false, pid: null };
  } catch (error) {
    return { running: false, pid: null };
  }
}

/**
 * Kill process by port
 */
async function killProcessByPort(port) {
  try {
    await execAsync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Start a service
 */
async function startService(serviceName) {
  const service = CONFIG[serviceName];

  if (!service) {
    print(`${icons.warning} Unknown service: ${serviceName}`, 'yellow');
    return false;
  }

  // Handle Docker containers
  if (service.container) {
    try {
      print(`${icons.loading} Starting ${service.name}...`, 'blue');

      // Check if container exists
      const { stdout } = await execAsync(`docker ps -a --filter "name=${service.container}" --format "{{.Names}}"`);

      if (stdout.trim()) {
        // Container exists, start it
        await execAsync(`docker start ${service.container}`);
      } else {
        // Container doesn't exist, use docker-compose
        if (service.container.includes('db')) {
          await execAsync(`docker-compose up -d postgres`);
        } else if (service.container.includes('pgadmin')) {
          await execAsync(`docker-compose up -d pgadmin`);
        }
      }

      // Wait a bit for container to start
      await new Promise(resolve => setTimeout(resolve, 3000));

      print(`${icons.running} ${service.name} started successfully`, 'green');
      return true;
    } catch (error) {
      print(`${icons.stopped} Failed to start ${service.name}: ${error.message}`, 'red');
      return false;
    }
  }

  // Handle Node.js services
  if (service.startCommand) {
    try {
      print(`${icons.loading} Starting ${service.name}...`, 'blue');
      print(`${icons.info} Run command: ${service.startCommand}`, 'dim');
      print(`${icons.info} Note: This service will run in the background.`, 'yellow');
      print(`${icons.info} Use 'stop' command to stop it, or check logs in another terminal.`, 'yellow');

      // Start the process in detached mode
      const child = spawn(service.startCommand, {
        shell: true,
        detached: true,
        stdio: 'ignore',
        cwd: __dirname
      });

      child.unref();

      // Wait a bit for service to start
      await new Promise(resolve => setTimeout(resolve, 5000));

      print(`${icons.running} ${service.name} starting... Check status in a few seconds.`, 'green');
      return true;
    } catch (error) {
      print(`${icons.stopped} Failed to start ${service.name}: ${error.message}`, 'red');
      return false;
    }
  }

  return false;
}

/**
 * Stop a service
 */
async function stopService(serviceName) {
  const service = CONFIG[serviceName];

  if (!service) {
    print(`${icons.warning} Unknown service: ${serviceName}`, 'yellow');
    return false;
  }

  // Handle Docker containers
  if (service.container) {
    try {
      print(`${icons.loading} Stopping ${service.name}...`, 'blue');
      await execAsync(`docker stop ${service.container}`);
      print(`${icons.stopped} ${service.name} stopped successfully`, 'green');
      return true;
    } catch (error) {
      print(`${icons.warning} Failed to stop ${service.name}: ${error.message}`, 'yellow');
      return false;
    }
  }

  // Handle Node.js services (stop by port)
  if (service.port) {
    try {
      print(`${icons.loading} Stopping ${service.name}...`, 'blue');
      const success = await killProcessByPort(service.port);
      if (success) {
        print(`${icons.stopped} ${service.name} stopped successfully`, 'green');
        return true;
      } else {
        print(`${icons.info} ${service.name} is not running`, 'yellow');
        return false;
      }
    } catch (error) {
      print(`${icons.warning} Failed to stop ${service.name}: ${error.message}`, 'yellow');
      return false;
    }
  }

  return false;
}

/**
 * Restart a service
 */
async function restartService(serviceName) {
  print(`${icons.loading} Restarting ${serviceName}...`, 'blue');
  await stopService(serviceName);
  await new Promise(resolve => setTimeout(resolve, 2000));
  await startService(serviceName);
}

/**
 * Check all services status
 */
async function checkAllServices() {
  const statuses = {};

  // Check Frontend
  const frontendProcess = await getProcessByPort(CONFIG.frontend.port);
  if (frontendProcess.running) {
    const health = await checkHttpHealth(CONFIG.frontend.host, CONFIG.frontend.port, '/');
    statuses.frontend = {
      running: true,
      healthy: health.healthy,
      pid: frontendProcess.pid,
      uptime: health.uptime
    };
  } else {
    statuses.frontend = { running: false, healthy: false, pid: null, uptime: 0 };
  }

  // Check Backend API
  const backendProcess = await getProcessByPort(CONFIG.backend.port);
  if (backendProcess.running) {
    const health = await checkHttpHealth(CONFIG.backend.host, CONFIG.backend.port, CONFIG.backend.healthPath);
    statuses.backend = {
      running: true,
      healthy: health.healthy,
      pid: backendProcess.pid,
      uptime: health.uptime
    };
  } else {
    statuses.backend = { running: false, healthy: false, pid: null, uptime: 0 };
  }

  // Check WebSocket (usually same port as backend)
  statuses.websocket = {
    running: backendProcess.running,
    healthy: statuses.backend.healthy,
    pid: backendProcess.pid,
    uptime: statuses.backend.uptime
  };

  // Check PostgreSQL
  const postgres = await checkDockerContainer(CONFIG.postgres.container);
  statuses.postgres = postgres;

  // Check Redis
  const redis = await checkRedis(CONFIG.redis.host, CONFIG.redis.port);
  statuses.redis = redis;

  // Check pgAdmin
  const pgadmin = await checkDockerContainer(CONFIG.pgadmin.container);
  statuses.pgadmin = pgadmin;

  return statuses;
}

/**
 * Display service status table
 */
function displayStatus(statuses) {
  print('\n📊 SERVICE STATUS:', 'bright');
  print('─────────────────────────────────────────────────────────', 'dim');

  // Frontend
  const frontendIcon = statuses.frontend.running ? icons.running : icons.stopped;
  const frontendColor = statuses.frontend.running ? 'green' : 'red';
  const frontendUptime = statuses.frontend.uptime ? ` (${Math.floor(statuses.frontend.uptime)}s uptime)` : '';
  print(`${frontendIcon} Frontend         : ${statuses.frontend.running ? 'RUNNING' : 'STOPPED'}${frontendUptime}`, frontendColor);
  if (statuses.frontend.pid) print(`   └─ PID: ${statuses.frontend.pid}, Port: ${CONFIG.frontend.port}`, 'dim');

  // Backend API
  const backendIcon = statuses.backend.running ? icons.running : icons.stopped;
  const backendColor = statuses.backend.running ? 'green' : 'red';
  const backendUptime = statuses.backend.uptime ? ` (${Math.floor(statuses.backend.uptime)}s uptime)` : '';
  print(`${backendIcon} Backend API      : ${statuses.backend.running ? 'RUNNING' : 'STOPPED'}${backendUptime}`, backendColor);
  if (statuses.backend.pid) print(`   └─ PID: ${statuses.backend.pid}, Port: ${CONFIG.backend.port}`, 'dim');

  // WebSocket
  const wsIcon = statuses.websocket.running ? icons.running : icons.stopped;
  const wsColor = statuses.websocket.running ? 'green' : 'red';
  print(`${wsIcon} WebSocket Server : ${statuses.websocket.running ? 'RUNNING' : 'STOPPED'}`, wsColor);
  if (statuses.websocket.pid) print(`   └─ PID: ${statuses.websocket.pid}, Port: ${CONFIG.websocket.port}`, 'dim');

  // PostgreSQL
  const pgIcon = statuses.postgres.running ? icons.running : icons.stopped;
  const pgColor = statuses.postgres.running ? 'green' : 'red';
  print(`${pgIcon} PostgreSQL       : ${statuses.postgres.running ? 'RUNNING' : 'STOPPED'}`, pgColor);
  if (statuses.postgres.status) print(`   └─ ${statuses.postgres.status}`, 'dim');

  // Redis
  const redisIcon = statuses.redis.healthy ? icons.running : icons.stopped;
  const redisColor = statuses.redis.healthy ? 'green' : 'red';
  print(`${redisIcon} Redis Cache      : ${statuses.redis.healthy ? 'RUNNING' : 'STOPPED'}`, redisColor);
  print(`   └─ ${CONFIG.redis.host}:${CONFIG.redis.port}`, 'dim');

  // pgAdmin
  const pgadminIcon = statuses.pgadmin.running ? icons.running : icons.stopped;
  const pgadminColor = statuses.pgadmin.running ? 'green' : 'red';
  print(`${pgadminIcon} pgAdmin          : ${statuses.pgadmin.running ? 'RUNNING' : 'STOPPED'}`, pgadminColor);
  if (statuses.pgadmin.status) print(`   └─ ${statuses.pgadmin.status}`, 'dim');

  print('─────────────────────────────────────────────────────────', 'dim');
}

/**
 * Display menu options
 */
function displayMenu() {
  print('\n📋 COMMANDS:', 'bright');
  print('  [1] Check Status      [5] Start Service', 'cyan');
  print('  [2] Start All         [6] Stop Service', 'cyan');
  print('  [3] Stop All          [7] Restart Service', 'cyan');
  print('  [4] Restart All       [0] Exit', 'cyan');
  print('');
}

/**
 * Start all services
 */
async function startAllServices() {
  print('\n🚀 Starting all services...', 'blue');
  print('─────────────────────────────────────────────────────────', 'dim');

  // Start Docker services first
  await startService('postgres');
  await startService('redis');
  await startService('pgadmin');

  // Wait for databases to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Start application services
  await startService('backend');
  await new Promise(resolve => setTimeout(resolve, 3000));

  await startService('frontend');

  print('─────────────────────────────────────────────────────────', 'dim');
  print('✅ All services started!', 'green');
}

/**
 * Stop all services
 */
async function stopAllServices() {
  print('\n🛑 Stopping all services...', 'blue');
  print('─────────────────────────────────────────────────────────', 'dim');

  // Stop application services first
  await stopService('frontend');
  await stopService('backend');
  await stopService('websocket');

  // Stop Docker services
  await stopService('postgres');
  await stopService('redis');
  await stopService('pgadmin');

  print('─────────────────────────────────────────────────────────', 'dim');
  print('✅ All services stopped!', 'green');
}

/**
 * Restart all services
 */
async function restartAllServices() {
  await stopAllServices();
  await new Promise(resolve => setTimeout(resolve, 3000));
  await startAllServices();
}

/**
 * Interactive service selection
 */
async function selectService(action, rl) {
  return new Promise((resolve) => {
    print('\n📝 Select a service:', 'cyan');
    print('  [1] Frontend', 'white');
    print('  [2] Backend API', 'white');
    print('  [3] WebSocket Server', 'white');
    print('  [4] PostgreSQL', 'white');
    print('  [5] Redis', 'white');
    print('  [6] pgAdmin', 'white');
    print('  [0] Cancel', 'white');
    print('');

    rl.question('Enter your choice: ', async (choice) => {

      const serviceMap = {
        '1': 'frontend',
        '2': 'backend',
        '3': 'websocket',
        '4': 'postgres',
        '5': 'redis',
        '6': 'pgadmin'
      };

      const service = serviceMap[choice];

      if (service) {
        if (action === 'start') {
          await startService(service);
        } else if (action === 'stop') {
          await stopService(service);
        } else if (action === 'restart') {
          await restartService(service);
        }
      } else if (choice === '0') {
        print('Cancelled', 'yellow');
      } else {
        print('Invalid choice', 'red');
      }

      resolve();
    });
  });
}

/**
 * Main interactive loop
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let running = true;

  while (running) {
    printHeader();

    // Check and display status
    const statuses = await checkAllServices();
    displayStatus(statuses);
    displayMenu();

    await new Promise((resolve) => {
      rl.question('Enter your choice: ', async (choice) => {
        print('');

        switch (choice) {
          case '1':
            // Check status (will be shown on next loop)
            break;
          case '2':
            await startAllServices();
            break;
          case '3':
            await stopAllServices();
            break;
          case '4':
            await restartAllServices();
            break;
          case '5':
            await selectService('start', rl);
            break;
          case '6':
            await selectService('stop', rl);
            break;
          case '7':
            await selectService('restart', rl);
            break;
          case '0':
            running = false;
            rl.close();
            print('👋 Goodbye!', 'cyan');
            process.exit(0);
            break;
          default:
            print('❌ Invalid choice', 'red');
        }

        if (running && choice !== '1') {
          print('\nPress Enter to continue...', 'dim');
          rl.once('line', () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });

    // Small delay before refreshing
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  print('\n\n👋 Goodbye!', 'cyan');
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkAllServices,
  startService,
  stopService,
  restartService
};
