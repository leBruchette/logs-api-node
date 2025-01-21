# Use the official Node.js image as the base image
FROM node:23-alpine3.20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# build to transpile the TypeScript code to JavaScript
#RUN npm run build

# Expose the port the app runs on
EXPOSE 8080

# Copy the rest of the application code
COPY . .

# Start the application
CMD ["npm", "start"]