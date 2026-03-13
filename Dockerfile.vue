FROM node:22-alpine

WORKDIR /app
COPY . .
WORKDIR frontend
RUN npm install --legacy-peer-deps
RUN npm run build
WORKDIR /app
EXPOSE 3000
CMD ["node", "frontend/server.js"]
