# Use Node.js 22 Alpine image as base
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy ALL files from the repository
COPY . .

# Clean npm cache to force fresh install
RUN npm cache clean --force

# Install root dependencies if package.json exists
RUN if [ -f "package.json" ]; then npm install || true; fi

# Install backend dependencies
RUN npm install --prefix backend

# Expose the port
EXPOSE 3000

# Log that we're about to start
RUN echo "Backend build complete - ready to start"

# Start the application
CMD ["node", "backend/server.js"]
