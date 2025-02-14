# Stage 1: Build stage
FROM node:18 AS build-stage

WORKDIR /app

# Copy all files from the root directory to the /app directory in the container
COPY ../.. .

RUN npm install

RUN npm install -g turbo

RUN turbo build

# Stage 2: Production image
FROM node:18-slim AS production-stage

WORKDIR /app

# Copy the necessary files from the build stage
COPY --from=build-stage /app /app

COPY --from=build-stage /app/backend/auth/dist /app/backend/auth/dist


# # Set environment variables properly
# ENV POSTGRES_IMAGE="postgres:latest" \
#     REDIS_IMAGE="redis:latest" \
#     JWT_SECRET="helloworld" \
#     DB_HOST="localhost" \
#     DB_PORT=5432 \
#     DB_USER="admin" \
#     DB_PASSWORD="password" \
#     DB_NAME="mydatabase" \
#     REDIS_HOST="localhost" \
#     REDIS_PORT=6379 \
#     REDIS_PASSWORD="password" \
#     PORT=5001

EXPOSE 5001

CMD ["node", "backend/auth/dist/index.js"]
