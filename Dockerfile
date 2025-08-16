# Build stage
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm rebuild esbuild && npm install esbuild --force

# ✅ ให้สิทธิ์รันกับทั้ง tsc และ vite
RUN chmod +x ./node_modules/.bin/tsc ./node_modules/.bin/vite

RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
