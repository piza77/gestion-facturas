FROM node:22-alpine

WORKDIR /app

# Copy everything including server.js
COPY . .

# Navigate to frontend and build
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps
RUN npm run build

# Go back to root for execution
WORKDIR /app

EXPOSE 3000

# Run the server - use the full path
CMD ["node", "/app/frontend/server.js"]
