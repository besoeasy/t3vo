# syntax=docker/dockerfile:1

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

# === EMBEDDED nginx.conf using heredoc ===
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80 default_server;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback - fixes 404 on page refresh
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets (1 year)
    location ~* \.(?:jpg|?g|gif|png|ico|svg|webp|woff2?|ttf|eot|js|css)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Optional: Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Expose HTTP
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
