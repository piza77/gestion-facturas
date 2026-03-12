# Use Node.js 22 Alpine image as base
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy ALL files from the repository
COPY . .

# Install root dependencies  
RUN npm install || true

# Install backend dependencies
RUN npm install --prefix backend || true

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "backend/server.js"]
