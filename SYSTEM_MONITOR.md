# System Monitor CLI Utility

A comprehensive command-line tool to monitor and manage all services in the social media posting platform.

## 🎯 Features

- **Real-time Status Monitoring**: Check the health status of all services
- **Service Management**: Start, stop, and restart individual services or all services at once
- **Docker Container Support**: Manage Docker containers (PostgreSQL, Redis, pgAdmin)
- **Health Checks**: HTTP health endpoints for Node.js services
- **Process Management**: Track and manage Node.js processes by PID
- **Interactive CLI**: User-friendly menu-driven interface
- **Color-coded Output**: Visual indicators for service status

## 📦 Monitored Services

| Service | Type | Default Port | Health Check |
|---------|------|--------------|--------------|
| Frontend | React Dev Server | 3000 | HTTP (/) |
| Backend API | Express.js | 3002 | HTTP (/health) |
| WebSocket Server | Socket.io | 3002 | HTTP (/health) |
| PostgreSQL | Docker Container | 5432 | Docker health |
| Redis | Service | 6379 | Redis PING |
| pgAdmin | Docker Container | 8080 | Docker health |

## 🚀 Quick Start

### Prerequisites

1. Node.js installed (v16+)
2. Docker and Docker Compose installed
3. `.env` file configured (copy from `.env.example`)

### Installation

```bash
# Install dependencies for all services (if not already done)
npm run install:all

# Or run the system monitor directly
npm run monitor

# Alternative: Run directly with node
node system-monitor.js

# Or if made executable
./system-monitor.js
```

## 📖 Usage

### Interactive Menu

When you run the system monitor, you'll see an interactive menu:

```
═══════════════════════════════════════════════════════════
              SYSTEM MONITOR - SERVICE DASHBOARD
═══════════════════════════════════════════════════════════

📊 SERVICE STATUS:
─────────────────────────────────────────────────────────
✅ Frontend         : RUNNING (45s uptime)
   └─ PID: 12345, Port: 3000
✅ Backend API      : RUNNING (60s uptime)
   └─ PID: 12346, Port: 3002
✅ WebSocket Server : RUNNING
   └─ PID: 12346, Port: 3002
✅ PostgreSQL       : RUNNING
   └─ Up 2 minutes (healthy)
✅ Redis Cache      : RUNNING
   └─ localhost:6379
✅ pgAdmin          : RUNNING
   └─ Up 2 minutes
─────────────────────────────────────────────────────────

📋 COMMANDS:
  [1] Check Status      [5] Start Service
  [2] Start All         [6] Stop Service
  [3] Stop All          [7] Restart Service
  [4] Restart All       [0] Exit

Enter your choice:
```

### Menu Options

1. **Check Status** - Refresh and display current status of all services
2. **Start All** - Start all services in the correct order
3. **Stop All** - Stop all running services
4. **Restart All** - Restart all services
5. **Start Service** - Select and start a specific service
6. **Stop Service** - Select and stop a specific service
7. **Restart Service** - Select and restart a specific service
0. **Exit** - Close the system monitor

### Service Management

#### Start Individual Services

The monitor will show you a list of services to choose from:

```
📝 Select a service:
  [1] Frontend
  [2] Backend API
  [3] WebSocket Server
  [4] PostgreSQL
  [5] Redis
  [6] pgAdmin
  [0] Cancel
```

#### Service Start Order

When starting all services, they are started in this order:
1. PostgreSQL (Docker)
2. Redis (Docker)
3. pgAdmin (Docker)
4. Backend API (Node.js)
5. Frontend (React)

#### Service Stop Order

When stopping all services, they are stopped in reverse order:
1. Frontend
2. Backend API
3. WebSocket Server
4. PostgreSQL
5. Redis
6. pgAdmin

## ⚙️ Configuration

The system monitor reads configuration from your `.env` file. Key variables:

```bash
# Frontend
FRONTEND_PORT=3000
FRONTEND_HOST=localhost

# Backend API
API_PORT=3002
API_HOST=localhost

# WebSocket
WS_PORT=3002

# Database
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🔧 Manual Service Management

### Docker Services

```bash
# Start all Docker services
docker-compose up -d

# Stop all Docker services
docker-compose down

# Start individual services
docker start posting_system_db
docker start posting_system_pgadmin

# Stop individual services
docker stop posting_system_db
docker stop posting_system_pgadmin

# Check Docker container status
docker ps
```

### Node.js Services

```bash
# Frontend
cd frontend && npm start

# Backend API
cd backend && npm start

# WebSocket Server
cd backend && node src/websocket-server.js
```

## 🐛 Troubleshooting

### Port Already in Use

If a service fails to start because the port is in use:

```bash
# Find process using the port
lsof -ti:3000  # Replace 3000 with your port

# Kill the process
lsof -ti:3000 | xargs kill -9
```

The system monitor can do this automatically via the "Stop Service" option.

### Docker Container Not Starting

```bash
# Check Docker logs
docker logs posting_system_db
docker logs posting_system_pgadmin

# Remove and recreate container
docker-compose down
docker-compose up -d
```

### Health Check Failing

If a service shows as running but health check fails:

1. Check the service logs
2. Verify the health endpoint is accessible: `curl http://localhost:3002/health`
3. Ensure `.env` configuration is correct
4. Restart the service

### Redis Connection Issues

```bash
# Test Redis connection manually
redis-cli -h localhost -p 6379 ping

# Should respond with: PONG

# If Redis is not running, start it:
docker-compose up -d
# Or if using local Redis:
redis-server
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
PGPASSWORD=dev_password psql -h localhost -U dev_user -d posting_system

# Check if database container is healthy
docker ps --filter "name=posting_system_db"

# View database logs
docker logs posting_system_db
```

## 🎨 Status Indicators

- ✅ **Green** - Service is running and healthy
- ❌ **Red** - Service is stopped or unhealthy
- ⚠️  **Yellow** - Warning or partial functionality
- ℹ️  **Blue** - Informational messages
- ⏳ **Loading** - Operation in progress

## 📝 Programmatic Usage

You can also import the system monitor functions in your own scripts:

```javascript
const { checkAllServices, startService, stopService, restartService } = require('./system-monitor');

// Check all services programmatically
async function checkStatus() {
  const statuses = await checkAllServices();
  console.log(statuses);
}

// Start a specific service
async function start() {
  await startService('backend');
}

// Stop a specific service
async function stop() {
  await stopService('frontend');
}

// Restart a service
async function restart() {
  await restartService('postgres');
}
```

## 🔐 Security Notes

- The system monitor requires permissions to:
  - Check port usage (`lsof`)
  - Start/stop processes
  - Manage Docker containers
- Never commit `.env` files with sensitive credentials
- Use strong passwords in production environments

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Node.js Process Management](https://nodejs.org/api/process.html)
- [Express.js Health Checks](https://expressjs.com/)
- [Redis CLI Commands](https://redis.io/docs/ui/cli/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

## 🤝 Contributing

To add a new service to monitor:

1. Add service configuration to `CONFIG` object in `system-monitor.js`
2. Implement appropriate health check function
3. Add service to the menu display
4. Update this documentation

## 📄 License

MIT

---

**Need Help?** If you encounter issues, check the logs for each service or open an issue in the repository.
