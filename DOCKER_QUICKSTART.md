# Docker Quick Start

## 🚀 Quick Commands

### Development
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Production
```bash
docker-compose up --build
```

### Stop
```bash
docker-compose down
```

## 📋 Prerequisites

1. **Docker installed** - [Get Docker](https://www.docker.com/get-started)
2. **Environment file** - Copy `.env.example` to `.env.local` and fill in your values

## 🔧 Setup Steps

1. **Copy environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your actual credentials

3. **Run in development:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access the app:**
   Open http://localhost:3000 in your browser

## 🐛 Troubleshooting

### Port 3000 already in use?
Change the port in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use 3001 instead
```

### Build fails?
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Check logs
```bash
docker-compose logs -f app
```

## 📚 More Info

See [DOCKER_README.md](./DOCKER_README.md) for detailed documentation.
