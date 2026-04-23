FROM node:18-alpine as builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
# We don't need to inject env vars at build time if we use relative paths, 
# but let's build it with the EC2 IP for safety.
RUN npm run build

# Serve with Nginx
FROM nginx:alpine
# Copy the built React app to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy a custom nginx config to handle React routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
