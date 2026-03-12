# Use Node.js 22 Alpine image as base
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy backend directory with its package.json
COPY backend/ ./backend/

# Install dependencies  
RUN npm install && \
    cd backend && \
    npm install

# Copy the rest of the application (excluding what we already copied)
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "backend/server.js"]
