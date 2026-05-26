# ── OnixFrame Next.js – Multi-stage Dockerfile ───────────────────────────────
#
# Stage 1: Install ALL dependencies (dev + prod needed for prisma generate + build)
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the Next.js app
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (reads prisma/schema.prisma + prisma.config.ts)
RUN npx prisma generate

# Build production Next.js bundle
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Lean production runtime image
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# curl is needed for the HEALTHCHECK
RUN apk add --no-cache curl

# Non-root user (security best practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy only what the runtime needs
COPY --from=builder --chown=nextjs:nodejs /app/.next            ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules     ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma           ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json     ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs  ./next.config.mjs

USER nextjs
EXPOSE 3000

# Health check — polls the home page
HEALTHCHECK --interval=15s --timeout=5s --retries=5 --start-period=30s \
  CMD curl -f http://localhost:3000/ || exit 1

# Run DB migrations (idempotent) then start Next.js
CMD ["sh", "-c", "npx prisma migrate deploy && node_modules/.bin/next start -p 3000"]
