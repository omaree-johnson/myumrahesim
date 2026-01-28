# Docker Setup Guide

This guide explains how to run the My Umrah eSIM application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)
- `.env.local` file with all required environment variables

## Quick Start

### Development Mode

Run the application in development mode with hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

The application will be available at `http://localhost:3000`

### Production Mode

Build and run the production container:

```bash
docker-compose up --build
```

Or build the image separately:

```bash
docker build -t myumrahesim:latest .
docker run -p 3000:3000 --env-file .env.local myumrahesim:latest
```

## Environment Variables

Make sure your `.env.local` file contains all required environment variables:

- Supabase configuration
- Stripe keys
- Clerk authentication
- eSIM Access API credentials
- Email service configuration
- And other required variables

## Docker Commands

### Build the image
```bash
docker-compose build
```

### Start containers
```bash
docker-compose up
```

### Start in detached mode (background)
```bash
docker-compose up -d
```

### Stop containers
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild without cache
```bash
docker-compose build --no-cache
```

### Remove containers and volumes
```bash
docker-compose down -v
```

## Development vs Production

### Development (`docker-compose.dev.yml`)
- Uses `Dockerfile.dev`
- Hot-reload enabled
- Volume mounts for live code changes
- Faster startup
- Includes dev dependencies

### Production (`docker-compose.yml`)
- Uses optimized `Dockerfile`
- Multi-stage build
- Smaller image size
- Production optimizations
- Security best practices (non-root user)

## Troubleshooting

### Port already in use
If port 3000 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use port 3001 on host
```

### Environment variables not loading
- Ensure `.env.local` exists in the project root
- Check that `env_file` is correctly specified in docker-compose.yml
- Verify environment variable names match what the app expects

### Build fails
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`
- Check Docker logs: `docker-compose logs`

### Container exits immediately
- Check logs: `docker-compose logs app`
- Verify environment variables are set
- Ensure `.env.local` file exists and is valid

## Health Check

The production setup includes a health check endpoint. You can verify the container is healthy:

```bash
docker-compose ps
```

## Security Notes

- The production Dockerfile runs as a non-root user (`nextjs`)
- Environment variables should never be committed to git
- Use Docker secrets or environment files for sensitive data
- Regularly update base images for security patches

## Image Size Optimization

The production Dockerfile uses:
- Multi-stage builds to reduce final image size
- Alpine Linux base image (smaller footprint)
- Standalone Next.js output (minimal dependencies)
- Only production dependencies in final image

## Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
