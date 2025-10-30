# Multi-stage build: build with Node, serve with nginx
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first (cache)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source
COPY . .

# Expose build-time VITE_ envs as build ARGs so you can inject them during docker build.
# Example: docker build --build-arg VITE_FIREBASE_API_KEY=... --build-arg VITE_AUTH_DOMAIN=... -t llm-shop-frontend .
ARG VITE_FIREBASE_API_KEY
ARG VITE_AUTH_DOMAIN
ARG VITE_PROJECT_ID
ARG VITE_STORAGE_BUCKET
ARG VITE_GEMINI_API_KEY
ARG VITE_MESSAGING_SENDER_ID
ARG VITE_APP_ID

# Make them available to the build process (Vite reads import.meta.env at build time)
ENV VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
ENV VITE_AUTH_DOMAIN=${VITE_AUTH_DOMAIN}
ENV VITE_PROJECT_ID=${VITE_PROJECT_ID}
ENV VITE_STORAGE_BUCKET=${VITE_STORAGE_BUCKET}
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
ENV VITE_MESSAGING_SENDER_ID=${VITE_MESSAGING_SENDER_ID}
ENV VITE_APP_ID=${VITE_APP_ID}

# Build the app
RUN npm run build

# Serve with nginx in a small runtime image
FROM nginx:stable-alpine AS runtime

# Remove default nginx index
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Add SPA fallback to serve index.html for client-side routes
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]