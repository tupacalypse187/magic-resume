# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeapp

# The runtime only needs node itself. npm stays out: its bundled node-tar is
# the image's last Trivy critical (CVE-2026-59873), and nothing at runtime
# shells out to npm or npx.
RUN rm -rf /usr/lib/node_modules/npm /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/bin/npm /usr/bin/npx

COPY --from=builder /app/.output ./.output

USER nodeapp

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
