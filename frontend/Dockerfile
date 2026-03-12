# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy from frontend directory since Docker context is at project root
COPY frontend/package*.json ./

RUN npm install --legacy-peer-deps

COPY frontend . .

RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
