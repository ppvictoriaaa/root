FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG SERVICE
RUN npx nest build ${SERVICE}
RUN [ -d "apps/${SERVICE}/public" ] && cp -r "apps/${SERVICE}/public" "dist/apps/${SERVICE}/" || true

FROM node:20-alpine AS runner
WORKDIR /app
ARG SERVICE
ENV SERVICE_NAME=${SERVICE}
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
CMD ["sh", "-c", "node dist/apps/${SERVICE_NAME}/main"]
