FROM node:18-alpine

WORKDIR /app

# Copy Backend files
COPY Backend/package.json Backend/
COPY Backend/*.js Backend/

# Install dependencies
WORKDIR /app/Backend
RUN npm install

# Start the server
CMD ["node", "server.js"]
