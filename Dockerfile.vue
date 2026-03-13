FROM node:22-alpine

WORKDIR /app

# Copy everything including server.js
COPY . .

# Navigate to frontend and build
WORKDIR /app/frontend

# Set production environment
ENV NODE_ENV=production

# Install dependencies
RUN npm install --legacy-peer-deps
RUN echo "Building Vue frontend..." && npm run build
RUN ls -la dist || (echo "ERROR: dist directory was not created!" && exit 1)
RUN echo "Build complete. dist contains:" && ls -la dist/

# Go back to root for execution
WORKDIR /app

EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run the server
CMD ["node", "/app/frontend/server.js"]
