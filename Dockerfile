# Use official Node.js image
FROM node:20-alpine

RUN apk update && apk add nmap android-tools

# Set working directory
WORKDIR /app

# Install dependencies
COPY ./package.json ./package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY ./src .

# Expose the default Next.js port
EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]
