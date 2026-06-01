FROM node:18-alpine

WORKDIR /app

COPY fornecedores-service/package*.json ./
RUN npm install

COPY fornecedores-service/ .
RUN npm run build

EXPOSE 3008

CMD ["npm", "start"]