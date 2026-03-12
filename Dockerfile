# Use Node.js 22 Alpine image as base
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy entire project structure
COPY . .

# Install root dependencies
RUN npm install

# Install backend dependencies
RUN cd backend && npm install

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "backend/server.js"]
