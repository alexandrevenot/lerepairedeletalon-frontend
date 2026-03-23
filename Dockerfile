# Builder
FROM node:18-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime
FROM nginx:alpine AS runtime

COPY --from=builder /app/dist/client/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80