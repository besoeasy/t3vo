# ===== Stage 1: Build Vite app (multi-arch) =====
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build production assets
RUN npm run build

# ===== Stage 2: Serve with Nginx (multi-arch) =====
FROM nginx:alpine

# Remove default site
RUN rm -rf /usr/share/nginx/html/*

# Copy built Vite assets
COPY --from=builder /app/dist /usr/share/nginx/html


# Copy custom nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
