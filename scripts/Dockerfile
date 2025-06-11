FROM node:18-alpine

WORKDIR /app

# Copy the scripts directory
COPY . /app/scripts/

# Install dependencies if needed
RUN npm init -y && \
    npm install fs path

# Set the working directory to scripts
WORKDIR /app/scripts

# Default command
CMD ["node", "docker_convert.js"]
