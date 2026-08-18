FROM node:22-alpine AS builder

WORKDIR /app
COPY frontend/ ./
RUN npm install -g pnpm && pnpm install && pnpm build

FROM nginx:1.30-alpine

COPY deploy/nginx/nginx.conf /etc/nginx/nginx.conf
COPY deploy/nginx/conf.d/ /etc/nginx/templates/
COPY --from=builder /app/dist /usr/share/nginx/html

COPY deploy/nginx/docker-entrypoint.d/40-select-site-config.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/40-select-site-config.sh

EXPOSE 80 443
