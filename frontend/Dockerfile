# =========================================================
# FRONTEND DOCKERFILE
# =========================================================

# ---------------------------------------------------------
# STAGE 1: BUILD
# ---------------------------------------------------------

FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build


# ---------------------------------------------------------
# STAGE 2: SERVE
# ---------------------------------------------------------

FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
