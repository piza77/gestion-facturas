# Use Node.js 22 Alpine image as base
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/

# Install root dependencies
RUN npm install

# Install backend dependencies
RUN npm install --prefix backend

# Copy rest of application
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "backend/server.js"]
