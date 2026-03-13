FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Set production environment
ENV NODE_ENV=production

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build Vue app
RUN echo "Building Vue frontend..." && npm run build
RUN ls -la dist || (echo "ERROR: dist directory was not created!" && exit 1)
RUN echo "Build complete. dist contains:" && ls -la dist/

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run server
CMD ["node", "server.js"]
