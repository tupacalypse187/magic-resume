# syntax=docker.io/docker/dockerfile:1

ARG BASE_IMAGE=magic-resume-base:latest
FROM ${BASE_IMAGE} AS builder
WORKDIR /app
COPY . .
RUN pnpm run build && pnpm prune --prod

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeapp

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.mjs ./server.mjs

USER nodeapp

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.mjs"]
