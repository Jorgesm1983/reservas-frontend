# Construcción de la app
# Etapa 1: Build de React
FROM node:18-alpine as build
WORKDIR /app
COPY padel-reservation-frontend/package.json ./
RUN npm install --legacy-peer-deps
COPY padel-reservation-frontend/. .
RUN npm run build

# Etapa 2: Imagen final con Caddy
FROM caddy:2.6.4-alpine
COPY --from=build /app/build /usr/share/caddy
COPY /Caddyfile /etc/caddy/Caddyfile 
