# Multi-stage Dockerfile for Acquisitions API

# Base dependencies (used by all stages)
FROM node:22-alpine AS base

WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source
COPY tsconfig.json ./
COPY eslint.config.ts ./
COPY src ./src
COPY drizzle.config.ts ./
COPY drizzle ./drizzle

# Development stage: run TypeScript directly with tsx watcher
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 4000
CMD ["npm", "run", "dev"]

# Build stage: compile TypeScript to dist/
FROM base AS builder
ENV NODE_ENV=production
RUN npm run build

# Production runtime stage: minimal image with compiled JS only
FROM node:22-alpine AS production

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the compiled app from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Optionally copy drizzle migrations if you run migrations from the container
COPY --from=builder /usr/src/app/drizzle ./drizzle

EXPOSE 4000

# Default command uses the compiled entrypoint (dist/index.js)
CMD ["npm", "start"]
