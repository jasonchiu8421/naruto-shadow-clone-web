# Multi-stage: build not needed (static files), just serve with nginx
FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html

# Custom nginx config for SPA-like behavior (optional, but handles refresh)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]