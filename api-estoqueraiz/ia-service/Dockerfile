FROM node:18-alpine AS builder

WORKDIR /build

COPY shared ./shared
WORKDIR /build/shared
RUN npm install
RUN npm run build || true

WORKDIR /build
COPY ia-service/package*.json ./ia-service/
COPY ia-service/tsconfig.json ./ia-service/
COPY ia-service/src ./ia-service/src

WORKDIR /build/ia-service
RUN npm install
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /build/shared/package*.json ./shared/
COPY --from=builder /build/shared/node_modules ./shared/node_modules
COPY --from=builder /build/shared/dist ./shared/dist

COPY --from=builder /build/ia-service/dist ./dist
COPY --from=builder /build/ia-service/package*.json ./
COPY --from=builder /build/ia-service/node_modules ./node_modules

ENV NODE_PATH=/app/shared/node_modules

EXPOSE 3009

CMD ["node", "dist/index.js"]