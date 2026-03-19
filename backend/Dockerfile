# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Create and define the application directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Create the uploads directory inside the container
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["node", "server.js"]
