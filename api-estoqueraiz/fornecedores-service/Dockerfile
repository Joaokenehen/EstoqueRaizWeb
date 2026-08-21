FROM node:18-alpine AS builder

WORKDIR /build

COPY shared ./shared
WORKDIR /build/shared
RUN npm install
RUN npm run build || true

WORKDIR /build
COPY fornecedores-service/package*.json ./fornecedores-service/
COPY fornecedores-service/tsconfig.json ./fornecedores-service/
COPY fornecedores-service/src ./fornecedores-service/src

WORKDIR /build/fornecedores-service
RUN npm install

# Desativa a trava do rootDir para que o compilador possa incluir a pasta shared externa!
RUN sed -i '/"rootDir"/d' tsconfig.json || true
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /build/shared/package*.json ./shared/
COPY --from=builder /build/shared/node_modules ./shared/node_modules
COPY --from=builder /build/shared/dist ./shared/dist

COPY --from=builder /build/fornecedores-service/dist ./dist
COPY --from=builder /build/fornecedores-service/package*.json ./
COPY --from=builder /build/fornecedores-service/node_modules ./node_modules

ENV NODE_PATH=/app/shared/node_modules

EXPOSE 3008

CMD ["node", "dist/fornecedores-service/src/index.js"]