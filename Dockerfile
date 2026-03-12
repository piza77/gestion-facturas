# Use Node.js 22 Alpine image as base
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY backend/package.json ./backend/

# Install dependencies  
RUN npm install && cd backend && npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "backend/server.js"]
