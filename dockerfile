# Use Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /frontend

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
