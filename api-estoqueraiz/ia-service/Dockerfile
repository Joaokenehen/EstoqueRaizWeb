FROM node:18-alpine
WORKDIR /app
COPY ./ia-service/package*.json ./
RUN npm install
COPY ./ia-service/ ./

EXPOSE 3009
CMD ["npm", "run", "dev"]